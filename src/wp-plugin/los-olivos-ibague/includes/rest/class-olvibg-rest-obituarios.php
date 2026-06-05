<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Rest_Obituarios extends OlvIbg_Rest_Base {

	public function register_routes() {
		register_rest_route( $this->ns(), '/obituarios', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'list' ),
			'permission_callback' => array( $this, 'allow_public' ),
		) );
	}

	public function list( $request ) {
		$repo = new OlvIbg_Obituarios_Repo();
		$rows = $repo->visibles();

		$out = array();
		foreach ( $rows as $row ) {
			$out[] = $this->transform( $row, $repo );
		}
		return rest_ensure_response( $out );
	}

	private function transform( $row, OlvIbg_Obituarios_Repo $repo ) {
		$fotos = array();
		foreach ( $repo->fotos( $row->id ) as $f ) {
			$url = wp_get_attachment_url( (int) $f->attachment_id );
			if ( ! $url ) {
				continue;
			}
			$fotos[] = array(
				'id'    => (int) $f->attachment_id,
				'url'   => $url,
				'alt'   => get_post_meta( (int) $f->attachment_id, '_wp_attachment_image_alt', true ),
				'orden' => (int) $f->orden,
			);
		}

		$asesor_id     = (int) $row->asesor;
		$asesor_nombre = '';
		if ( $asesor_id > 0 ) {
			$user = get_userdata( $asesor_id );
			if ( $user ) {
				$asesor_nombre = $user->display_name;
			}
		}

		$sede_nombre = isset( $row->sede_nombre ) ? (string) $row->sede_nombre : '';
		$sala_nombre = isset( $row->sala_nombre ) ? (string) $row->sala_nombre : '';
		$tipo        = isset( $row->tipo_velacion ) ? (string) $row->tipo_velacion : OlvIbg_Obituarios_Repo::TIPO_SALA;

		// `sedeYSala` mantiene compat con el interface TS actual:
		// SALA       → "{sala_nombre} {sede_nombre}"
		// RESIDENCIA → "Residencia · {dirección}"
		if ( $tipo === OlvIbg_Obituarios_Repo::TIPO_RESIDENCIA ) {
			$sede_y_sala = __( 'Residencia', 'los-olivos-ibague' )
				. ( $row->salavelacion ? ' · ' . $row->salavelacion : '' );
		} else {
			$sede_y_sala = trim( $sala_nombre . ( $sede_nombre ? ' ' . $sede_nombre : '' ) );
		}

		return array(
			// Alias para compat con el interface TS Obituario.
			'id'                 => (int) $row->id,
			'nombre'             => $row->nombrefallecido,
			'sedeYSala'          => $sede_y_sala,
			'ciudad'             => $row->municipio,
			'exequias'           => $row->lugarexequias,
			'fechaFallecimiento' => mysql2date( 'd/m/Y', $row->fechafallecimiento, false ),
			'fechaHoraExequias'  => mysql2date( 'd/m/Y - H:i', $row->fechaexequias, false ),
			'destinoFinal'       => $row->destinofinal,
			'horaDestinoFinal'   => mysql2date( 'H:i', $row->fechadestino, false ),

			// Extras crudos (TS los ignora silenciosamente).
			'tipo_velacion'      => $tipo,
			'sede_id'            => (int) $row->sede,
			'sede_nombre'        => $sede_nombre,
			'sala_id'            => (int) $row->sala,
			'sala_nombre'        => $sala_nombre,
			'direccion_residencia' => $tipo === OlvIbg_Obituarios_Repo::TIPO_RESIDENCIA ? $row->salavelacion : '',
			'lugarexequias'      => $row->lugarexequias,
			'fechaexequias_raw'  => $row->fechaexequias,
			'fechadestino_raw'   => $row->fechadestino,
			'estado'             => $row->estado,
			'asesor_id'          => $asesor_id,
			'asesor_nombre'      => $asesor_nombre,

			'fotos'              => $fotos,
		);
	}
}
