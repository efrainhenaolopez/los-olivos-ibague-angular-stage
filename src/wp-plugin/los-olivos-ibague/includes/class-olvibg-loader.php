<?php
/**
 * Registra los hooks de REST y de Admin del plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Loader {

	public function register() {
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		add_action( 'rest_api_init', array( $this, 'register_cors' ), 15 );

		if ( is_admin() ) {
			$this->register_admin();
		}
	}

	public function register_rest_routes() {
		( new OlvIbg_Rest_Obituarios() )->register_routes();
		( new OlvIbg_Rest_Registros() )->register_routes();
		( new OlvIbg_Rest_Contacto() )->register_routes();
		( new OlvIbg_Rest_Condolencias() )->register_routes();
		( new OlvIbg_Rest_Pagos() )->register_routes();
	}

	/**
	 * Emite los headers CORS solo para rutas de este plugin
	 * (namespace serfuncoop/v1). Echoea el origen si está en la
	 * allowlist `olvibg_allowed_origins`, y maneja el preflight OPTIONS
	 * para que el browser permita POST con Content-Type: application/json.
	 *
	 * Quitamos primero el handler por defecto de WP para evitar duplicación
	 * de cabeceras y conflictos con Cloudflare.
	 */
	public function register_cors() {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter( 'rest_pre_serve_request', array( $this, 'send_cors_headers' ), 10, 4 );
	}

	public function send_cors_headers( $served, $result, $request, $server ) {
		$route = $request->get_route();
		if ( strpos( $route, '/' . OLVIBG_REST_NAMESPACE ) !== 0 ) {
			return $served;
		}

		// Echoeamos ACAO incondicionalmente para CUALQUIER origin que
		// venga en la request. La validación de seguridad del POST se
		// hace en `allow_public_post` (en class-olvibg-rest-base.php),
		// que sí rechaza orígenes fuera de la allowlist. Aquí solo
		// abrimos CORS para que el browser no bloquee la respuesta
		// antes de que el endpoint pueda contestar (incluyendo errores
		// como 403 origin_forbidden, que el cliente necesita leer).
		$origin = get_http_origin();
		if ( $origin ) {
			header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
			header( 'Vary: Origin', false );
			header( 'Access-Control-Allow-Credentials: false' );
			header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-WP-Nonce' );
			header( 'Access-Control-Max-Age: 600' );
		}

		// Preflight: el browser hace OPTIONS antes de un POST con
		// Content-Type JSON. Respondemos 204 con los headers ya emitidos.
		if ( 'OPTIONS' === $request->get_method() ) {
			status_header( 204 );
			exit;
		}

		return $served;
	}

	private function register_admin() {
		( new OlvIbg_Admin_Menu() )->register();
		( new OlvIbg_Admin_Obituarios() )->register();
		( new OlvIbg_Admin_Sedes() )->register();
		( new OlvIbg_Admin_Salas() )->register();
		( new OlvIbg_Admin_Registros() )->register();
		( new OlvIbg_Admin_Condolencias() )->register();
		( new OlvIbg_Admin_Contacto() )->register();
		( new OlvIbg_Admin_Ajustes() )->register();
		( new OlvIbg_Csv_Exporter() )->register();
	}
}
