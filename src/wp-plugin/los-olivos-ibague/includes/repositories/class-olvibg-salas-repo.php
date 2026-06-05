<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Salas_Repo {

	private $table;

	public function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'salas';
	}

	public function all( $only_active = false ) {
		global $wpdb;
		$where = $only_active ? 'WHERE activo = 1' : '';
		return $wpdb->get_results( "SELECT * FROM {$this->table} {$where} ORDER BY sede_id ASC, nombre ASC" );
	}

	public function by_sede( $sede_id, $only_active = false ) {
		global $wpdb;
		$sede_id = (int) $sede_id;
		$active  = $only_active ? 'AND activo = 1' : '';
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$this->table} WHERE sede_id = %d {$active} ORDER BY nombre ASC", $sede_id ) );
	}

	/**
	 * Búsqueda con filtro por sede + búsqueda libre por nombre.
	 *
	 * @param array $args  ['q' => string, 'sede_id' => int]
	 */
	public function search( $args = array() ) {
		global $wpdb;
		$where  = array( '1=1' );
		$values = array();

		if ( ! empty( $args['sede_id'] ) ) {
			$where[]  = 'sede_id = %d';
			$values[] = (int) $args['sede_id'];
		}
		if ( ! empty( $args['q'] ) ) {
			$like     = '%' . $wpdb->esc_like( trim( (string) $args['q'] ) ) . '%';
			$where[]  = 'nombre LIKE %s';
			$values[] = $like;
		}

		$sql = "SELECT * FROM {$this->table} WHERE " . implode( ' AND ', $where ) . ' ORDER BY sede_id ASC, nombre ASC';
		if ( $values ) {
			return $wpdb->get_results( $wpdb->prepare( $sql, $values ) );
		}
		return $wpdb->get_results( $sql );
	}

	public function find( $id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->table} WHERE id = %d", $id ) );
	}

	public function insert( $data ) {
		global $wpdb;
		$wpdb->insert( $this->table, array(
			'sede_id' => (int) $data['sede_id'],
			'nombre'  => sanitize_text_field( $data['nombre'] ),
			'activo'  => ! empty( $data['activo'] ) ? 1 : 0,
		), array( '%d', '%s', '%d' ) );
		return (int) $wpdb->insert_id;
	}

	public function update( $id, $data ) {
		global $wpdb;
		return $wpdb->update( $this->table, array(
			'sede_id' => (int) $data['sede_id'],
			'nombre'  => sanitize_text_field( $data['nombre'] ),
			'activo'  => ! empty( $data['activo'] ) ? 1 : 0,
		), array( 'id' => (int) $id ), array( '%d', '%s', '%d' ), array( '%d' ) );
	}

	public function delete( $id ) {
		global $wpdb;
		return $wpdb->delete( $this->table, array( 'id' => (int) $id ), array( '%d' ) );
	}
}
