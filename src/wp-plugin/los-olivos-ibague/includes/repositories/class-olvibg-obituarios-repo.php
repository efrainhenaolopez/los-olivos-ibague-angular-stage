<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Repositorio de obituarios.
 *
 * Por regla de negocio NO expone delete(). Un obituario se oculta del
 * endpoint público mediante `estado='I'` o vence automáticamente cuando
 * `fechadestino < NOW()` (la disposición final del cuerpo cierra el ciclo).
 */
class OlvIbg_Obituarios_Repo {

	const TIPO_SALA       = 'SALA';
	const TIPO_RESIDENCIA = 'RESIDENCIA';

	private $table;
	private $fotos_table;

	public function __construct() {
		global $wpdb;
		$this->table       = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'obituarios';
		$this->fotos_table = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'obituario_fotos';
	}

	public function visibles() {
		global $wpdb;
		$sedes = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'sedes';
		$salas = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'salas';

		$sql = "SELECT o.*,
				sed.nombre AS sede_nombre,
				sal.nombre AS sala_nombre
			FROM {$this->table} o
			LEFT JOIN {$sedes} sed ON sed.id = o.sede
			LEFT JOIN {$salas} sal ON sal.id = o.sala
			WHERE o.estado = 'A' AND o.fechadestino >= %s
			ORDER BY o.fechafallecimiento DESC, o.id DESC";

		return $wpdb->get_results( $wpdb->prepare( $sql, current_time( 'mysql' ) ) );
	}

	public function all() {
		global $wpdb;
		$sedes = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'sedes';
		$salas = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'salas';

		$sql = "SELECT o.*,
				sed.nombre AS sede_nombre,
				sal.nombre AS sala_nombre
			FROM {$this->table} o
			LEFT JOIN {$sedes} sed ON sed.id = o.sede
			LEFT JOIN {$salas} sal ON sal.id = o.sala
			ORDER BY o.fecha DESC, o.id DESC";

		return $wpdb->get_results( $sql );
	}

	/**
	 * Búsqueda + filtros para el listado admin.
	 *
	 * @param array $args  ['q' => string, 'sede_id' => int, 'estado_filter' => string]
	 *                     estado_filter: 'vigente' | 'vencido' | 'inactivo' | ''
	 */
	public function search( $args = array() ) {
		global $wpdb;
		$sedes = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'sedes';
		$salas = $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'salas';

		$where  = array( '1=1' );
		$values = array();

		if ( ! empty( $args['q'] ) ) {
			$like     = '%' . $wpdb->esc_like( trim( (string) $args['q'] ) ) . '%';
			$where[]  = 'o.nombrefallecido LIKE %s';
			$values[] = $like;
		}
		if ( ! empty( $args['sede_id'] ) ) {
			$where[]  = 'o.sede = %d';
			$values[] = (int) $args['sede_id'];
		}
		if ( ! empty( $args['estado_filter'] ) ) {
			$now = current_time( 'mysql' );
			switch ( $args['estado_filter'] ) {
				case 'vigente':
					$where[]  = "o.estado = 'A'";
					$where[]  = 'o.fechadestino >= %s';
					$values[] = $now;
					break;
				case 'vencido':
					$where[]  = "o.estado = 'A'";
					$where[]  = 'o.fechadestino < %s';
					$values[] = $now;
					break;
				case 'inactivo':
					$where[] = "o.estado = 'I'";
					break;
			}
		}

		$sql = "SELECT o.*,
				sed.nombre AS sede_nombre,
				sal.nombre AS sala_nombre
			FROM {$this->table} o
			LEFT JOIN {$sedes} sed ON sed.id = o.sede
			LEFT JOIN {$salas} sal ON sal.id = o.sala
			WHERE " . implode( ' AND ', $where ) . "
			ORDER BY o.fecha DESC, o.id DESC";

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
		$payload = $this->payload( $data );
		$payload['fecha'] = current_time( 'mysql' );
		$wpdb->insert( $this->table, $payload, $this->payload_formats( true ) );
		return (int) $wpdb->insert_id;
	}

	public function update( $id, $data ) {
		global $wpdb;
		$payload = $this->payload( $data );
		return $wpdb->update(
			$this->table,
			$payload,
			array( 'id' => (int) $id ),
			$this->payload_formats( false ),
			array( '%d' )
		);
	}

	private function payload( $data ) {
		$tipo = ( ( $data['tipo_velacion'] ?? self::TIPO_SALA ) === self::TIPO_RESIDENCIA )
			? self::TIPO_RESIDENCIA
			: self::TIPO_SALA;

		// salavelacion sirve dos propósitos según el tipo de velación:
		//   SALA       → queda vacío (la sala viene del catálogo, columnas `sede`+`sala`).
		//   RESIDENCIA → guarda la dirección de la casa donde se vela. sede/sala = 0.
		if ( $tipo === self::TIPO_RESIDENCIA ) {
			$sede         = 0;
			$sala         = 0;
			$salavelacion = sanitize_text_field( $data['salavelacion'] ?? '' );
		} else {
			$sede         = (int) ( $data['sede'] ?? 0 );
			$sala         = (int) ( $data['sala'] ?? 0 );
			$salavelacion = '';
		}

		return array(
			'nombrefallecido'    => sanitize_text_field( $data['nombrefallecido'] ),
			'tipo_velacion'      => $tipo,
			'sede'               => $sede,
			'sala'               => $sala,
			'municipio'          => sanitize_text_field( $data['municipio'] ),
			'salavelacion'       => $salavelacion,
			'lugarexequias'      => sanitize_text_field( $data['lugarexequias'] ?? '' ),
			'destinofinal'       => sanitize_text_field( $data['destinofinal'] ?? '' ),
			'fechafallecimiento' => $this->datetime( $data['fechafallecimiento'] ),
			'fechaexequias'      => $this->datetime( $data['fechaexequias'] ),
			'fechadestino'       => $this->datetime( $data['fechadestino'] ?? $data['fechaexequias'] ),
			'estado'             => in_array( $data['estado'] ?? 'A', array( 'A', 'I' ), true ) ? $data['estado'] : 'A',
			'asesor'             => (int) ( $data['asesor'] ?? 0 ),
		);
	}

	private function payload_formats( $include_fecha ) {
		// Orden: nombrefallecido, tipo_velacion, sede, sala, municipio,
		// salavelacion, lugarexequias, destinofinal, fechafallecimiento,
		// fechaexequias, fechadestino, estado, asesor [, fecha].
		$formats = array( '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d' );
		if ( $include_fecha ) {
			$formats[] = '%s';
		}
		return $formats;
	}

	private function datetime( $value ) {
		if ( empty( $value ) ) {
			return current_time( 'mysql' );
		}
		// Acepta `Y-m-d\TH:i` (input datetime-local) o `Y-m-d H:i:s`.
		$value = str_replace( 'T', ' ', $value );
		if ( strlen( $value ) === 16 ) {
			$value .= ':00';
		}
		return $value;
	}

	public function fotos( $obituario_id ) {
		global $wpdb;
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$this->fotos_table} WHERE obituario_id = %d ORDER BY orden ASC, id ASC",
			(int) $obituario_id
		) );
	}

	public function set_fotos( $obituario_id, array $attachment_ids ) {
		global $wpdb;
		$obituario_id = (int) $obituario_id;
		$wpdb->delete( $this->fotos_table, array( 'obituario_id' => $obituario_id ), array( '%d' ) );

		$orden = 0;
		foreach ( $attachment_ids as $att_id ) {
			$att_id = (int) $att_id;
			if ( $att_id <= 0 ) {
				continue;
			}
			$wpdb->insert(
				$this->fotos_table,
				array(
					'obituario_id'  => $obituario_id,
					'attachment_id' => $att_id,
					'orden'         => $orden++,
				),
				array( '%d', '%d', '%d' )
			);
		}
	}
}
