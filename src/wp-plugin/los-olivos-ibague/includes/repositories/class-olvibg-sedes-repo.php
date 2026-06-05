<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Sedes_Repo {

	private $table;

	public function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'sedes';
	}

	public function all( $only_active = false ) {
		global $wpdb;
		$where = $only_active ? 'WHERE activo = 1' : '';
		return $wpdb->get_results( "SELECT * FROM {$this->table} {$where} ORDER BY nombre ASC" );
	}

	/**
	 * Búsqueda libre sobre nombre / ciudad / dirección.
	 */
	public function search( $q ) {
		global $wpdb;
		$q = trim( (string) $q );
		if ( $q === '' ) {
			return $this->all();
		}
		$like = '%' . $wpdb->esc_like( $q ) . '%';
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$this->table}
			 WHERE nombre LIKE %s OR ciudad LIKE %s OR direccion LIKE %s
			 ORDER BY nombre ASC",
			$like, $like, $like
		) );
	}

	public function find( $id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->table} WHERE id = %d", $id ) );
	}

	public function insert( $data ) {
		global $wpdb;
		$wpdb->insert( $this->table, array(
			'nombre'    => sanitize_text_field( $data['nombre'] ),
			'direccion' => isset( $data['direccion'] ) ? sanitize_text_field( $data['direccion'] ) : null,
			'ciudad'    => isset( $data['ciudad'] ) ? sanitize_text_field( $data['ciudad'] ) : null,
			'activo'    => ! empty( $data['activo'] ) ? 1 : 0,
		), array( '%s', '%s', '%s', '%d' ) );
		return (int) $wpdb->insert_id;
	}

	public function update( $id, $data ) {
		global $wpdb;
		return $wpdb->update( $this->table, array(
			'nombre'    => sanitize_text_field( $data['nombre'] ),
			'direccion' => isset( $data['direccion'] ) ? sanitize_text_field( $data['direccion'] ) : null,
			'ciudad'    => isset( $data['ciudad'] ) ? sanitize_text_field( $data['ciudad'] ) : null,
			'activo'    => ! empty( $data['activo'] ) ? 1 : 0,
		), array( 'id' => (int) $id ), array( '%s', '%s', '%s', '%d' ), array( '%d' ) );
	}

	public function delete( $id ) {
		global $wpdb;
		return $wpdb->delete( $this->table, array( 'id' => (int) $id ), array( '%d' ) );
	}
}
