<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Registros_Repo {

	private $table;

	public function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'registros_defuncion';
	}

	public function all( $limit = 500 ) {
		global $wpdb;
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$this->table} ORDER BY fecha_fallecimiento DESC, id DESC LIMIT %d",
			(int) $limit
		) );
	}

	/**
	 * Búsqueda libre sobre ser_querido / documento_identidad / notaria.
	 *
	 * @param array $args  ['q' => string, 'limit' => int]
	 */
	public function search( $args = array() ) {
		global $wpdb;
		$q     = isset( $args['q'] ) ? trim( (string) $args['q'] ) : '';
		$limit = isset( $args['limit'] ) ? (int) $args['limit'] : 1000;

		if ( $q === '' ) {
			return $this->all( $limit );
		}

		$like = '%' . $wpdb->esc_like( $q ) . '%';
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$this->table}
			 WHERE ser_querido LIKE %s OR documento_identidad LIKE %s OR notaria LIKE %s
			 ORDER BY fecha_fallecimiento DESC, id DESC
			 LIMIT %d",
			$like, $like, $like, $limit
		) );
	}

	public function find( $id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->table} WHERE id = %d", (int) $id ) );
	}

	public function insert( $data ) {
		global $wpdb;
		$wpdb->insert( $this->table, array(
			'ser_querido'         => sanitize_text_field( $data['ser_querido'] ),
			'numero_registro'     => isset( $data['numero_registro'] ) ? sanitize_text_field( $data['numero_registro'] ) : null,
			'notaria'             => sanitize_text_field( $data['notaria'] ),
			'documento_identidad' => isset( $data['documento_identidad'] ) ? sanitize_text_field( $data['documento_identidad'] ) : null,
			'fecha_fallecimiento' => isset( $data['fecha_fallecimiento'] ) ? sanitize_text_field( $data['fecha_fallecimiento'] ) : null,
			'fecha'               => current_time( 'mysql' ),
		), array( '%s', '%s', '%s', '%s', '%s', '%s' ) );
		return (int) $wpdb->insert_id;
	}

	public function update( $id, $data ) {
		global $wpdb;
		return $wpdb->update( $this->table, array(
			'ser_querido'         => sanitize_text_field( $data['ser_querido'] ),
			'numero_registro'     => isset( $data['numero_registro'] ) ? sanitize_text_field( $data['numero_registro'] ) : null,
			'notaria'             => sanitize_text_field( $data['notaria'] ),
			'documento_identidad' => isset( $data['documento_identidad'] ) ? sanitize_text_field( $data['documento_identidad'] ) : null,
			'fecha_fallecimiento' => isset( $data['fecha_fallecimiento'] ) ? sanitize_text_field( $data['fecha_fallecimiento'] ) : null,
		), array( 'id' => (int) $id ), array( '%s', '%s', '%s', '%s', '%s' ), array( '%d' ) );
	}

	public function delete( $id ) {
		global $wpdb;
		return $wpdb->delete( $this->table, array( 'id' => (int) $id ), array( '%d' ) );
	}

	/**
	 * Vacía la tabla completa. Usado por el importador CSV antes del bulk insert.
	 * TRUNCATE reinicia el AUTO_INCREMENT (deseado · IDs empiezan de 1 con el nuevo set).
	 */
	public function truncate() {
		global $wpdb;
		return $wpdb->query( "TRUNCATE TABLE {$this->table}" );
	}

	/**
	 * Insert directo con datos ya saneados — versión para bulk del importador
	 * (omite la sanitización adicional que hace insert() porque el importador
	 * ya validó/normalizó cada fila).
	 *
	 * @param array $rows  Array de arrays asociativos con las columnas de la tabla.
	 * @return int  Número de filas insertadas correctamente.
	 */
	public function bulk_insert_raw( array $rows ) {
		global $wpdb;
		$count = 0;
		foreach ( $rows as $row ) {
			$ok = $wpdb->insert( $this->table, array(
				'ser_querido'         => $row['ser_querido'],
				'numero_registro'     => $row['numero_registro'],
				'notaria'             => $row['notaria'],
				'documento_identidad' => $row['documento_identidad'],
				'fecha_fallecimiento' => $row['fecha_fallecimiento'],
				'fecha'               => current_time( 'mysql' ),
			), array( '%s', '%s', '%s', '%s', '%s', '%s' ) );
			if ( false !== $ok ) {
				$count++;
			}
		}
		return $count;
	}
}
