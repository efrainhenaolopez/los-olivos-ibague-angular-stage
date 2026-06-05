<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Condolencias_Repo {

	private $table;

	const ESTADOS = array( 'pending', 'approved', 'rejected' );

	public function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'condolencias';
	}

	public function by_estado( $estado = null, $limit = 200 ) {
		global $wpdb;
		if ( $estado && in_array( $estado, self::ESTADOS, true ) ) {
			return $wpdb->get_results( $wpdb->prepare(
				"SELECT * FROM {$this->table} WHERE estado = %s ORDER BY fecha DESC, id DESC LIMIT %d",
				$estado, (int) $limit
			) );
		}
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$this->table} ORDER BY fecha DESC, id DESC LIMIT %d",
			(int) $limit
		) );
	}

	public function find( $id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->table} WHERE id = %d", (int) $id ) );
	}

	public function insert( $data ) {
		global $wpdb;
		$wpdb->insert( $this->table, array(
			'obituario_id' => (int) $data['obituario_id'],
			'autor_nombre' => sanitize_text_field( $data['autor_nombre'] ),
			'autor_email'  => isset( $data['autor_email'] ) ? sanitize_email( $data['autor_email'] ) : null,
			'mensaje'      => sanitize_textarea_field( $data['mensaje'] ),
			'estado'       => 'pending',
			'ip'           => isset( $data['ip'] ) ? substr( sanitize_text_field( $data['ip'] ), 0, 45 ) : null,
			'user_agent'   => isset( $data['user_agent'] ) ? sanitize_text_field( $data['user_agent'] ) : null,
			'fecha'        => current_time( 'mysql' ),
		), array( '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s' ) );
		return (int) $wpdb->insert_id;
	}

	public function moderate( $id, $estado, $user_id ) {
		global $wpdb;
		if ( ! in_array( $estado, self::ESTADOS, true ) ) {
			return false;
		}
		return $wpdb->update( $this->table, array(
			'estado'       => $estado,
			'moderated_at' => current_time( 'mysql' ),
			'moderado_por' => (int) $user_id,
		), array( 'id' => (int) $id ), array( '%s', '%s', '%d' ), array( '%d' ) );
	}

	public function count_pending() {
		global $wpdb;
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$this->table} WHERE estado = 'pending'" );
	}

	/**
	 * Condolencias aprobadas de un obituario, para la pared pública.
	 * Solo devuelve columnas seguras (sin email/IP/UA).
	 */
	public function aprobadas_por_obituario( $obituario_id, $limit = 100 ) {
		global $wpdb;
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT id, autor_nombre, mensaje, fecha
			 FROM {$this->table}
			 WHERE obituario_id = %d AND estado = 'approved'
			 ORDER BY fecha DESC, id DESC
			 LIMIT %d",
			(int) $obituario_id, (int) $limit
		) );
	}
}
