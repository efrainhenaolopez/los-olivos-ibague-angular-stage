<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Rest_Condolencias extends OlvIbg_Rest_Base {

	public function register_routes() {
		register_rest_route( $this->ns(), '/condolencias', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'submit' ),
			'permission_callback' => array( $this, 'allow_public_post' ),
		) );
		register_rest_route( $this->ns(), '/condolencias', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'list_aprobadas' ),
			'permission_callback' => array( $this, 'allow_public' ),
			'args'                => array(
				'obituario' => array(
					'required'          => true,
					'sanitize_callback' => 'absint',
				),
			),
		) );
	}

	public function list_aprobadas( $request ) {
		$obituario_id = (int) $request->get_param( 'obituario' );
		if ( $obituario_id <= 0 ) {
			return $this->fail( 'olvibg_invalid_obituario', __( 'obituario inválido', 'los-olivos-ibague' ), 422 );
		}
		$repo = new OlvIbg_Condolencias_Repo();
		$rows = $repo->aprobadas_por_obituario( $obituario_id );
		$out  = array();
		foreach ( $rows as $r ) {
			$out[] = array(
				'id'           => (int) $r->id,
				'autor_nombre' => $r->autor_nombre,
				'mensaje'      => $r->mensaje,
				'fecha'        => $r->fecha,
			);
		}
		return rest_ensure_response( $out );
	}

	public function submit( $request ) {
		if ( $this->is_honeypot_filled( $request ) ) {
			return rest_ensure_response( array( 'ok' => true ) );
		}

		$obituario_id = (int) $request->get_param( 'obituario' );
		$autor        = trim( (string) $request->get_param( 'autor_nombre' ) );
		$mensaje      = trim( (string) $request->get_param( 'mensaje' ) );
		$email        = trim( (string) $request->get_param( 'autor_email' ) );

		if ( $obituario_id <= 0 || $autor === '' || $mensaje === '' ) {
			return $this->fail( 'olvibg_missing_fields', __( 'Faltan campos obligatorios', 'los-olivos-ibague' ), 422 );
		}
		if ( $email !== '' && ! is_email( $email ) ) {
			return $this->fail( 'olvibg_invalid_email', __( 'Correo inválido', 'los-olivos-ibague' ), 422 );
		}

		$obituarios = new OlvIbg_Obituarios_Repo();
		if ( ! $obituarios->find( $obituario_id ) ) {
			return $this->fail( 'olvibg_obituario_not_found', __( 'Obituario no encontrado', 'los-olivos-ibague' ), 404 );
		}

		$repo = new OlvIbg_Condolencias_Repo();
		$id   = $repo->insert( array(
			'obituario_id' => $obituario_id,
			'autor_nombre' => $autor,
			'autor_email'  => $email ?: null,
			'mensaje'      => $mensaje,
			'ip'           => $this->client_ip(),
			'user_agent'   => $request->get_header( 'user_agent' ),
		) );

		if ( $id <= 0 ) {
			return $this->fail( 'olvibg_db_error', __( 'No fue posible guardar la condolencia', 'los-olivos-ibague' ), 500 );
		}

		( new OlvIbg_Mailer() )->send_condolencia_pendiente( $repo->find( $id ) );

		return rest_ensure_response( array(
			'ok'      => true,
			'id'      => $id,
			'message' => __( 'Tu condolencia será revisada antes de publicarse', 'los-olivos-ibague' ),
		) );
	}
}
