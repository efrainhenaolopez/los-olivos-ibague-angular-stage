<?php
/**
 * Proxy de login contra la pasarela pública de pagos (Olivos Web Gateway).
 *
 * Expone POST /wp-json/serfuncoop/v1/payment-login
 *
 * El frontend Angular se publica estático, así que NO puede guardar las
 * credenciales de la pasarela. Este endpoint las mantiene server-side
 * (Ajustes · Los Olivos, o constantes en wp-config.php) y proxyea el login
 * contra la pasarela Azure, devolviendo su JSON tal cual: en éxito trae
 * `response.url` (enlace firmado con JWT temporal) que el navegador abre en
 * una pestaña nueva; en error reenvía el cuerpo de la pasarela.
 *
 * Reutiliza `allow_public_post` del base: valida el Origin contra la
 * allowlist `olvibg_allowed_origins` y aplica el rate-limit por IP.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Rest_Pagos extends OlvIbg_Rest_Base {

	/** URL de la pasarela usada si no hay ninguna guardada (sandbox de Ibagué). */
	const DEFAULT_GATEWAY_URL = 'https://olivoswebgatewaysandbox.azurewebsites.net/PublicPaymentsLogin?sede=ibague&test=true';

	public function register_routes() {
		register_rest_route( $this->ns(), '/payment-login', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'submit' ),
			'permission_callback' => array( $this, 'allow_public_post' ),
		) );
	}

	/**
	 * Credenciales de la pasarela. Prioridad:
	 *   1) Constantes OLVIBG_PAYMENT_USERNAME / OLVIBG_PAYMENT_PASSWORD (wp-config).
	 *   2) Opciones guardadas en Ajustes · Los Olivos.
	 *
	 * @return array{0:string,1:string} [usuario, password]
	 */
	protected function credentials() {
		$user = defined( 'OLVIBG_PAYMENT_USERNAME' )
			? OLVIBG_PAYMENT_USERNAME
			: (string) get_option( 'olvibg_payment_username', '' );
		$pass = defined( 'OLVIBG_PAYMENT_PASSWORD' )
			? OLVIBG_PAYMENT_PASSWORD
			: (string) get_option( 'olvibg_payment_password', '' );

		return array( trim( $user ), trim( $pass ) );
	}

	protected function gateway_url() {
		$url = (string) get_option( 'olvibg_payment_gateway_url', self::DEFAULT_GATEWAY_URL );
		return '' !== trim( $url ) ? trim( $url ) : self::DEFAULT_GATEWAY_URL;
	}

	/**
	 * Llama a la pasarela con un reintento ante cold-start de Azure (la app
	 * se "duerme" tras inactividad y el primer hit tarda 5-15 s). Reintenta
	 * solo ante WP_Error (red) o 5xx; un 4xx se devuelve tal cual.
	 *
	 * @return array|WP_Error Respuesta de wp_remote_post o WP_Error.
	 */
	protected function gateway_request( $url, $user, $pass ) {
		$args = array(
			'method'  => 'POST',
			'timeout' => 25,
			'headers' => array( 'Content-Type' => 'application/json' ),
			'body'    => wp_json_encode( array(
				'userName' => $user,
				'password' => $pass,
			) ),
		);

		$ultima = null;

		for ( $i = 0; $i < 2; $i++ ) {
			$resp = wp_remote_post( $url, $args );
			if ( is_wp_error( $resp ) ) {
				$ultima = $resp;
				continue;
			}
			$code = (int) wp_remote_retrieve_response_code( $resp );
			if ( $code < 500 ) {
				return $resp; // 2xx/4xx → definitivo.
			}
			$ultima = $resp; // 5xx → reintentar si quedan intentos.
		}

		return $ultima;
	}

	/**
	 * Handler. Reenvía el JSON de la pasarela con su status, o un error
	 * homogéneo (`success/status/errors`) ante fallo o falta de config.
	 *
	 * @return WP_REST_Response
	 */
	public function submit( $request ) {
		list( $user, $pass ) = $this->credentials();

		if ( '' === $user || '' === $pass ) {
			return new WP_REST_Response( array(
				'success' => false,
				'status'  => 500,
				'errors'  => array( __( 'Credenciales de la pasarela no configuradas en WordPress.', 'los-olivos-ibague' ) ),
			), 500 );
		}

		$resp = $this->gateway_request( $this->gateway_url(), $user, $pass );

		if ( is_wp_error( $resp ) ) {
			return new WP_REST_Response( array(
				'success' => false,
				'status'  => 502,
				'errors'  => array( __( 'Error de comunicación con la pasarela de pagos.', 'los-olivos-ibague' ) ),
			), 502 );
		}

		$code = (int) wp_remote_retrieve_response_code( $resp );
		$body = json_decode( wp_remote_retrieve_body( $resp ), true );

		if ( null === $body ) {
			return new WP_REST_Response( array(
				'success' => false,
				'status'  => 502,
				'errors'  => array( __( 'Respuesta inválida de la pasarela de pagos.', 'los-olivos-ibague' ) ),
			), 502 );
		}

		return new WP_REST_Response( $body, $code );
	}
}
