<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Rest_Contacto extends OlvIbg_Rest_Base {

	public function register_routes() {
		register_rest_route( $this->ns(), '/contacto', array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'submit' ),
			'permission_callback' => array( $this, 'allow_public_post' ),
		) );
	}

	public function submit( $request ) {
		if ( $this->is_honeypot_filled( $request ) ) {
			return rest_ensure_response( array( 'ok' => true ) );
		}

		$nombre   = trim( (string) $request->get_param( 'nombre' ) );
		$telefono = trim( (string) $request->get_param( 'telefono' ) );
		$correo   = trim( (string) $request->get_param( 'correo' ) );
		$mensaje  = trim( (string) $request->get_param( 'mensaje' ) );
		$acepta   = $request->get_param( 'aceptaTratamientoDatos' );

		if ( $nombre === '' || $telefono === '' || $correo === '' || $mensaje === '' ) {
			return $this->fail( 'olvibg_missing_fields', __( 'Faltan campos obligatorios', 'los-olivos-ibague' ), 422 );
		}
		if ( ! is_email( $correo ) ) {
			return $this->fail( 'olvibg_invalid_email', __( 'Correo inválido', 'los-olivos-ibague' ), 422 );
		}
		if ( ! $acepta ) {
			return $this->fail( 'olvibg_missing_consent', __( 'Debes aceptar el tratamiento de datos', 'los-olivos-ibague' ), 422 );
		}

		$repo = new OlvIbg_Contacto_Repo();
		$id   = $repo->insert( array(
			'nombre'     => $nombre,
			'apellido'   => $request->get_param( 'apellido' ),
			'cedula'     => $request->get_param( 'cedula' ),
			'telefono'   => $telefono,
			'correo'     => $correo,
			'servicio'   => $request->get_param( 'servicio' ),
			'mensaje'    => $mensaje,
			'pagina'     => $request->get_param( 'pagina' ),
			'ip'         => $this->client_ip(),
			'user_agent' => $request->get_header( 'user_agent' ),
		) );

		if ( $id <= 0 ) {
			return $this->fail( 'olvibg_db_error', __( 'No fue posible guardar la consulta', 'los-olivos-ibague' ), 500 );
		}

		( new OlvIbg_Mailer() )->send_contacto( $repo->find( $id ) );

		return rest_ensure_response( array( 'ok' => true, 'id' => $id ) );
	}
}
