<?php
/**
 * Admin · Registros de defunción.
 *
 * Solo importación masiva (sábanas). No hay creación ni edición manual:
 * la única forma de actualizar el set es subir un CSV nuevo, que vacía
 * la tabla (TRUNCATE) y la rellena con las filas del archivo.
 *
 * Delimitador: punto y coma (`;`). Excel en es-CO lo usa por defecto.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Registros {

	const CSV_HEADERS   = array( 'ser_querido', 'documento_identidad', 'numero_registro', 'notaria', 'fecha_fallecimiento' );
	const CSV_DELIMITER = ';';

	public function register() {
		add_action( 'admin_post_olvibg_registros_import',  array( __CLASS__, 'handle_import' ) );
		add_action( 'admin_post_olvibg_registros_tpl_csv', array( __CLASS__, 'handle_template_download' ) );
	}

	public static function render() {
		$show_import = isset( $_GET['view'] ) && $_GET['view'] === 'import';
		$q           = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$rows        = ( new OlvIbg_Registros_Repo() )->search( array( 'q' => $q, 'limit' => 1000 ) );

		$base_url   = admin_url( 'admin.php?page=olvibg-registros' );
		$import_url = add_query_arg( 'view', 'import', $base_url );
		?>
		<div class="wrap olvibg">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Registros de defunción', 'los-olivos-ibague' ); ?></h1>
			<?php if ( $show_import ) : ?>
				<a class="page-title-action" href="<?php echo esc_url( $base_url ); ?>"><?php esc_html_e( 'Cerrar importación', 'los-olivos-ibague' ); ?></a>
			<?php else : ?>
				<a class="page-title-action" href="<?php echo esc_url( $import_url ); ?>"><?php esc_html_e( 'Importar registros', 'los-olivos-ibague' ); ?></a>
			<?php endif; ?>
			<hr class="wp-header-end">

			<?php self::print_import_notices(); ?>

			<?php if ( $show_import ) : ?>
				<div class="olvibg-import-panel">
					<h2><?php esc_html_e( 'Cargar sábana de registros (CSV)', 'los-olivos-ibague' ); ?></h2>
					<p class="description">
						<strong style="color:#b32d2e"><?php esc_html_e( '⚠ Al importar se eliminarán TODOS los registros existentes y se reemplazarán por los del archivo.', 'los-olivos-ibague' ); ?></strong>
					</p>
					<p>
						<?php
						printf(
							/* translators: %s: header names */
							esc_html__( 'Archivo CSV delimitado por punto y coma (;), con encabezados: %s.', 'los-olivos-ibague' ),
							'<code>' . esc_html( implode( ';', self::CSV_HEADERS ) ) . '</code>'
						);
						?>
						<?php esc_html_e( 'Formato de fecha: YYYY-MM-DD o DD/MM/YYYY.', 'los-olivos-ibague' ); ?>
					</p>
					<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block;margin-right:8px;">
						<input type="hidden" name="action" value="olvibg_registros_import">
						<?php wp_nonce_field( 'olvibg_registros_import' ); ?>
						<input type="file" name="csv_file" accept=".csv,text/csv" required>
						<button type="submit" class="button button-primary" onclick="return confirm('<?php echo esc_js( __( '¿Confirmas? Esto eliminará TODOS los registros actuales antes de importar.', 'los-olivos-ibague' ) ); ?>');">
							<?php esc_html_e( 'Importar y reemplazar', 'los-olivos-ibague' ); ?>
						</button>
					</form>
					<a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=olvibg_registros_tpl_csv' ), 'olvibg_registros_tpl_csv' ) ); ?>">
						<?php esc_html_e( 'Descargar plantilla CSV', 'los-olivos-ibague' ); ?>
					</a>
				</div>
			<?php endif; ?>

			<form method="get">
				<input type="hidden" name="page" value="olvibg-registros">
				<p class="search-box">
					<label class="screen-reader-text" for="olvibg-search-registros"><?php esc_html_e( 'Buscar registros', 'los-olivos-ibague' ); ?></label>
					<input type="search" id="olvibg-search-registros" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="<?php esc_attr_e( 'Nombre, documento o notaría…', 'los-olivos-ibague' ); ?>">
					<input type="submit" class="button" value="<?php esc_attr_e( 'Buscar', 'los-olivos-ibague' ); ?>">
				</p>
			</form>

			<table class="wp-list-table widefat fixed striped table-view-list">
				<thead><tr>
					<th scope="col" class="manage-column column-primary"><?php esc_html_e( 'Ser querido', 'los-olivos-ibague' ); ?></th>
					<th scope="col" class="manage-column"><?php esc_html_e( 'Documento', 'los-olivos-ibague' ); ?></th>
					<th scope="col" class="manage-column"><?php esc_html_e( 'Registro', 'los-olivos-ibague' ); ?></th>
					<th scope="col" class="manage-column"><?php esc_html_e( 'Notaría', 'los-olivos-ibague' ); ?></th>
					<th scope="col" class="manage-column"><?php esc_html_e( 'Fallecimiento', 'los-olivos-ibague' ); ?></th>
				</tr></thead>
				<tbody>
				<?php foreach ( $rows as $r ) : ?>
					<tr>
						<td class="column-primary"><strong><?php echo esc_html( $r->ser_querido ); ?></strong></td>
						<td><?php echo esc_html( (string) $r->documento_identidad ); ?></td>
						<td><?php echo esc_html( (string) $r->numero_registro ); ?></td>
						<td><?php echo esc_html( $r->notaria ); ?></td>
						<td><?php echo $r->fecha_fallecimiento ? esc_html( mysql2date( 'd/m/Y', $r->fecha_fallecimiento, false ) ) : '—'; ?></td>
					</tr>
				<?php endforeach; ?>
				<?php if ( empty( $rows ) ) : ?>
					<tr class="no-items"><td class="colspanchange" colspan="5">
						<?php echo $q !== ''
							? esc_html__( 'No hay registros que coincidan con la búsqueda.', 'los-olivos-ibague' )
							: esc_html__( 'Aún no hay registros. Carga una sábana CSV para empezar.', 'los-olivos-ibague' ); ?>
					</td></tr>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	// ------------------------------------------------------------------
	// Importador CSV · plantilla + import (TRUNCATE + bulk insert)
	// ------------------------------------------------------------------

	public static function handle_template_download() {
		check_admin_referer( 'olvibg_registros_tpl_csv' );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		nocache_headers();
		header( 'Content-Type: text/csv; charset=UTF-8' );
		header( 'Content-Disposition: attachment; filename="plantilla-registros-defuncion.csv"' );

		$out = fopen( 'php://output', 'w' );
		fwrite( $out, "\xEF\xBB\xBF" ); // BOM UTF-8 (Excel reconoce acentos)
		fputcsv( $out, self::CSV_HEADERS,                                                                                            self::CSV_DELIMITER );
		fputcsv( $out, array( 'JUAN PEREZ GOMEZ', '12345678', '10333500',        'NOTARIA SEGUNDA DE IBAGUÉ',  '2026-04-10' ), self::CSV_DELIMITER );
		fputcsv( $out, array( 'MARIA LOPEZ DIAZ', '87654321', 'N.A / PENDIENTE', 'NOTARIA PRIMERA DE ESPINAL', '09/04/2026' ), self::CSV_DELIMITER );
		fclose( $out );
		exit;
	}

	public static function handle_import() {
		check_admin_referer( 'olvibg_registros_import' );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		$base = admin_url( 'admin.php?page=olvibg-registros' );

		if ( empty( $_FILES['csv_file']['tmp_name'] ) || ! is_uploaded_file( $_FILES['csv_file']['tmp_name'] ) ) {
			wp_safe_redirect( add_query_arg( 'import_error', 'no_file', $base ) );
			exit;
		}
		if ( ! empty( $_FILES['csv_file']['error'] ) ) {
			wp_safe_redirect( add_query_arg( 'import_error', 'upload', $base ) );
			exit;
		}

		$path = $_FILES['csv_file']['tmp_name'];
		$fh   = fopen( $path, 'r' );
		if ( ! $fh ) {
			wp_safe_redirect( add_query_arg( 'import_error', 'read', $base ) );
			exit;
		}

		// Strip BOM si existe.
		$first = fread( $fh, 3 );
		if ( $first !== "\xEF\xBB\xBF" ) {
			rewind( $fh );
		}

		$headers = fgetcsv( $fh, 0, self::CSV_DELIMITER );
		if ( ! $headers ) {
			fclose( $fh );
			wp_safe_redirect( add_query_arg( 'import_error', 'empty', $base ) );
			exit;
		}

		$headers = array_map( function ( $h ) {
			return strtolower( trim( (string) $h ) );
		}, $headers );

		if ( $headers !== self::CSV_HEADERS ) {
			fclose( $fh );
			wp_safe_redirect( add_query_arg( 'import_error', 'headers', $base ) );
			exit;
		}

		$rows    = array();
		$skipped = 0;
		while ( ( $cols = fgetcsv( $fh, 0, self::CSV_DELIMITER ) ) !== false ) {
			// Saltar líneas vacías.
			if ( count( $cols ) === 1 && trim( (string) $cols[0] ) === '' ) {
				continue;
			}
			if ( count( $cols ) < count( self::CSV_HEADERS ) ) {
				$skipped++;
				continue;
			}

			$ser_querido = trim( (string) $cols[0] );
			$notaria     = trim( (string) $cols[3] );
			if ( $ser_querido === '' || $notaria === '' ) {
				$skipped++;
				continue;
			}

			$rows[] = array(
				'ser_querido'         => sanitize_text_field( $ser_querido ),
				'documento_identidad' => sanitize_text_field( trim( (string) $cols[1] ) ) ?: null,
				'numero_registro'     => sanitize_text_field( trim( (string) $cols[2] ) ) ?: null,
				'notaria'             => sanitize_text_field( $notaria ),
				'fecha_fallecimiento' => self::parse_fecha( trim( (string) $cols[4] ) ),
			);
		}
		fclose( $fh );

		$repo = new OlvIbg_Registros_Repo();
		$repo->truncate();
		$inserted = $repo->bulk_insert_raw( $rows );

		$args = array(
			'import_ok' => 1,
			'inserted'  => $inserted,
			'skipped'   => $skipped,
		);
		wp_safe_redirect( add_query_arg( $args, $base ) );
		exit;
	}

	/**
	 * Parsea una fecha en formatos aceptados (ISO YYYY-MM-DD o DD/MM/YYYY)
	 * y la normaliza a YYYY-MM-DD. Retorna null si no se puede parsear.
	 */
	private static function parse_fecha( $value ) {
		$value = trim( (string) $value );
		if ( $value === '' ) {
			return null;
		}
		$formats = array( 'Y-m-d', 'd/m/Y', 'j/n/Y', 'd-m-Y', 'Y/m/d' );
		foreach ( $formats as $fmt ) {
			$dt = DateTime::createFromFormat( $fmt, $value );
			if ( $dt && $dt->format( $fmt ) === $value ) {
				return $dt->format( 'Y-m-d' );
			}
		}
		return null;
	}

	private static function print_import_notices() {
		if ( ! empty( $_GET['import_ok'] ) ) {
			$inserted = (int) ( $_GET['inserted'] ?? 0 );
			$skipped  = (int) ( $_GET['skipped'] ?? 0 );
			$msg      = sprintf(
				/* translators: 1: inserted count, 2: skipped count */
				_n(
					'Importación completada: %1$d registro insertado, %2$d omitido.',
					'Importación completada: %1$d registros insertados, %2$d omitidos.',
					$inserted,
					'los-olivos-ibague'
				),
				$inserted,
				$skipped
			);
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
		}
		if ( ! empty( $_GET['import_error'] ) ) {
			$code     = sanitize_key( $_GET['import_error'] );
			$mensajes = array(
				'no_file' => __( 'No se recibió ningún archivo.', 'los-olivos-ibague' ),
				'upload'  => __( 'Error al subir el archivo (PHP upload error).', 'los-olivos-ibague' ),
				'read'    => __( 'No se pudo leer el archivo CSV.', 'los-olivos-ibague' ),
				'empty'   => __( 'El archivo CSV está vacío o sin encabezados.', 'los-olivos-ibague' ),
				'headers' => sprintf(
					/* translators: %s: expected headers separated by `;` */
					__( 'Los encabezados del CSV no coinciden. Esperados (separados por punto y coma): %s.', 'los-olivos-ibague' ),
					implode( ';', self::CSV_HEADERS )
				),
			);
			$msg = $mensajes[ $code ] ?? __( 'Error desconocido al importar.', 'los-olivos-ibague' );
			echo '<div class="notice notice-error"><p>' . esc_html( $msg ) . '</p></div>';
		}
	}
}
