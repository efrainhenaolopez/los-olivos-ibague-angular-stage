<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Csv_Exporter {

	const CSV_DELIMITER = ';';

	public function register() {
		add_action( 'admin_post_olvibg_export_csv', array( __CLASS__, 'handle' ) );
	}

	public static function handle() {
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}
		$type = isset( $_GET['type'] ) ? sanitize_key( $_GET['type'] ) : '';

		switch ( $type ) {
			case 'contacto':
				self::export_contacto();
				break;
			case 'condolencias':
				self::export_condolencias();
				break;
			default:
				wp_die( esc_html__( 'Tipo no soportado', 'los-olivos-ibague' ) );
		}
	}

	private static function export_contacto() {
		$estado = isset( $_GET['estado'] ) ? sanitize_key( $_GET['estado'] ) : '';
		$q      = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$rows   = ( new OlvIbg_Contacto_Repo() )->search( array( 'estado' => $estado, 'q' => $q, 'limit' => 10000 ) );

		self::stream_headers( 'contacto-' . date( 'Y-m-d-His' ) );
		$out = fopen( 'php://output', 'w' );
		fwrite( $out, "\xEF\xBB\xBF" ); // BOM UTF-8 para Excel
		fputcsv( $out, array( 'ID', 'Nombre', 'Apellido', 'Cedula', 'Telefono', 'Correo', 'Servicio', 'Mensaje', 'Pagina origen', 'IP', 'Estado', 'Fecha' ), self::CSV_DELIMITER );
		foreach ( $rows as $r ) {
			fputcsv( $out, array(
				$r->id, $r->nombre, $r->apellido, $r->cedula, $r->telefono, $r->correo,
				$r->servicio, $r->mensaje, $r->pagina_origen, $r->ip, $r->estado, $r->fecha,
			), self::CSV_DELIMITER );
		}
		fclose( $out );
		exit;
	}

	private static function export_condolencias() {
		$estado = isset( $_GET['estado'] ) ? sanitize_key( $_GET['estado'] ) : 'pending';
		$rows   = ( new OlvIbg_Condolencias_Repo() )->by_estado( $estado === 'all' ? null : $estado, 10000 );

		self::stream_headers( 'condolencias-' . date( 'Y-m-d-His' ) );
		$out = fopen( 'php://output', 'w' );
		fwrite( $out, "\xEF\xBB\xBF" );
		fputcsv( $out, array( 'ID', 'Obituario ID', 'Autor', 'Email', 'Mensaje', 'Estado', 'IP', 'Fecha', 'Moderado' ), self::CSV_DELIMITER );
		foreach ( $rows as $r ) {
			fputcsv( $out, array(
				$r->id, $r->obituario_id, $r->autor_nombre, $r->autor_email, $r->mensaje,
				$r->estado, $r->ip, $r->fecha, $r->moderated_at,
			), self::CSV_DELIMITER );
		}
		fclose( $out );
		exit;
	}

	private static function stream_headers( $filename ) {
		nocache_headers();
		header( 'Content-Type: text/csv; charset=UTF-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '.csv"' );
	}
}
