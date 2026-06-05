<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Rest_Registros extends OlvIbg_Rest_Base {

	public function register_routes() {
		register_rest_route( $this->ns(), '/registros-defuncion', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'list' ),
			'permission_callback' => array( $this, 'allow_public' ),
		) );
	}

	public function list( $request ) {
		$repo = new OlvIbg_Registros_Repo();
		$rows = $repo->all();

		$out = array();
		foreach ( $rows as $row ) {
			$out[] = array(
				'id'                 => (int) $row->id,
				'serQuerido'         => $row->ser_querido,
				'numeroRegistro'     => $row->numero_registro,
				'notaria'            => $row->notaria,
				'documentoIdentidad' => $row->documento_identidad,
				'fechaFallecimiento' => $row->fecha_fallecimiento ? mysql2date( 'd/m/Y', $row->fecha_fallecimiento, false ) : null,
			);
		}
		return rest_ensure_response( $out );
	}
}
