<?php
/**
 * Base de los controllers REST con utilidades compartidas:
 * - Validación de Origin contra allowlist (option `olvibg_allowed_origins`).
 * - Rate-limit por IP basado en transients (5 submits / 10 min).
 * - Honeypot anti-bot (campo oculto `website`).
 * - Extracción de IP/UA.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class OlvIbg_Rest_Base {

	abstract public function register_routes();

	protected function ns() {
		return OLVIBG_REST_NAMESPACE;
	}

	public function allow_public() {
		return true;
	}

	public function allow_public_post( $request ) {
		$origin = $request->get_header( 'origin' );
		if ( $origin && ! $this->origin_allowed( $origin ) ) {
			return new WP_Error( 'olvibg_origin_forbidden', __( 'Origen no permitido', 'los-olivos-ibague' ), array( 'status' => 403 ) );
		}

		$ip = $this->client_ip();
		if ( $this->rate_limited( $ip ) ) {
			return new WP_Error( 'olvibg_rate_limited', __( 'Demasiadas peticiones, intenta más tarde', 'los-olivos-ibague' ), array( 'status' => 429 ) );
		}

		return true;
	}

	protected function origin_allowed( $origin ) {
		$raw = get_option( 'olvibg_allowed_origins', home_url() );
		$origins = array_filter( array_map( 'trim', preg_split( '/[\r\n,]+/', (string) $raw ) ) );
		if ( empty( $origins ) ) {
			return true;
		}
		$origin = rtrim( $origin, '/' );
		foreach ( $origins as $allowed ) {
			if ( rtrim( $allowed, '/' ) === $origin ) {
				return true;
			}
		}
		return false;
	}

	protected function client_ip() {
		$keys = array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' );
		foreach ( $keys as $key ) {
			if ( ! empty( $_SERVER[ $key ] ) ) {
				$ip = explode( ',', (string) $_SERVER[ $key ] )[0];
				return trim( $ip );
			}
		}
		return '0.0.0.0';
	}

	protected function rate_limited( $ip ) {
		$max    = (int) get_option( 'olvibg_rate_limit_max', 20 );
		$window = (int) get_option( 'olvibg_rate_limit_window_min', 10 );
		if ( $max <= 0 ) {
			return false; // Permite desactivar el rate-limit poniendo 0 en Ajustes.
		}
		$key   = 'olvibg_rl_' . md5( $ip );
		$count = (int) get_transient( $key );
		if ( $count >= $max ) {
			return true;
		}
		set_transient( $key, $count + 1, max( 1, $window ) * MINUTE_IN_SECONDS );
		return false;
	}

	protected function is_honeypot_filled( $request ) {
		$website = trim( (string) $request->get_param( 'website' ) );
		return $website !== '';
	}

	protected function fail( $code, $message, $status = 400 ) {
		return new WP_Error( $code, $message, array( 'status' => $status ) );
	}
}
