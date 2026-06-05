<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Contacto_Repo {

	private $table;

	const ESTADOS = array( 'nuevo', 'leido', 'cerrado' );

	public function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'contacto_submissions';
	}

	public function search( $args = array() ) {
		global $wpdb;

		$where = array( '1=1' );
		$values = array();

		if ( ! empty( $args['estado'] ) && in_array( $args['estado'], self::ESTADOS, true ) ) {
			$where[]  = 'estado = %s';
			$values[] = $args['estado'];
		}
		if ( ! empty( $args['q'] ) ) {
			$like     = '%' . $wpdb->esc_like( $args['q'] ) . '%';
			$where[]  = '(nombre LIKE %s OR apellido LIKE %s OR correo LIKE %s)';
			$values[] = $like;
			$values[] = $like;
			$values[] = $like;
		}

		$limit = isset( $args['limit'] ) ? (int) $args['limit'] : 200;
		$sql   = "SELECT * FROM {$this->table} WHERE " . implode( ' AND ', $where ) . ' ORDER BY fecha DESC, id DESC LIMIT ' . $limit;

		if ( $values ) {
			return $wpdb->get_results( $wpdb->prepare( $sql, $values ) );
		}
		return $wpdb->get_results( $sql );
	}

	public function find( $id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->table} WHERE id = %d", (int) $id ) );
	}

	public function insert( $data ) {
		global $wpdb;
		$wpdb->insert( $this->table, array(
			'nombre'        => sanitize_text_field( $data['nombre'] ),
			'apellido'      => isset( $data['apellido'] ) ? sanitize_text_field( $data['apellido'] ) : null,
			'cedula'        => isset( $data['cedula'] ) ? sanitize_text_field( $data['cedula'] ) : null,
			'telefono'      => sanitize_text_field( $data['telefono'] ),
			'correo'        => sanitize_email( $data['correo'] ),
			'servicio'      => isset( $data['servicio'] ) ? sanitize_text_field( $data['servicio'] ) : null,
			'mensaje'       => sanitize_textarea_field( $data['mensaje'] ),
			'pagina_origen' => isset( $data['pagina'] ) ? esc_url_raw( $data['pagina'] ) : null,
			'ip'            => isset( $data['ip'] ) ? substr( sanitize_text_field( $data['ip'] ), 0, 45 ) : null,
			'user_agent'    => isset( $data['user_agent'] ) ? sanitize_text_field( $data['user_agent'] ) : null,
			'estado'        => 'nuevo',
			'fecha'         => current_time( 'mysql' ),
		), array_fill( 0, 12, '%s' ) );
		return (int) $wpdb->insert_id;
	}

	public function set_estado( $id, $estado ) {
		global $wpdb;
		if ( ! in_array( $estado, self::ESTADOS, true ) ) {
			return false;
		}
		return $wpdb->update( $this->table, array( 'estado' => $estado ),
			array( 'id' => (int) $id ), array( '%s' ), array( '%d' ) );
	}

	public function count_nuevos() {
		global $wpdb;
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$this->table} WHERE estado = 'nuevo'" );
	}
}
