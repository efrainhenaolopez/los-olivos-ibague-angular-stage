<?php
/**
 * Admin · Salas (CRUD).
 *
 * Replica el patrón nativo de WordPress `edit-tags.php` (que WooCommerce
 * usa en Productos → Atributos): contenedor de 2 columnas con
 * `form-wrap` a la izquierda y tabla `wp-list-table` a la derecha.
 *
 * Admite filtro opcional `?sede_id=N` para acotar la tabla a las salas
 * de una sede (usado por el link "Configurar salas" desde Sedes).
 *
 * También expone el endpoint AJAX que el form de obituarios consume
 * para filtrar dinámicamente el dropdown de sala al cambiar la sede.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Salas {

	const PAGE = 'olvibg-salas';

	public function register() {
		add_action( 'admin_post_olvibg_sala_save',   array( __CLASS__, 'handle_save' ) );
		add_action( 'admin_post_olvibg_sala_delete', array( __CLASS__, 'handle_delete' ) );
		add_action( 'wp_ajax_olvibg_salas_by_sede',  array( __CLASS__, 'ajax_salas_by_sede' ) );
	}

	public static function render() {
		$sedes_repo = new OlvIbg_Sedes_Repo();
		$salas_repo = new OlvIbg_Salas_Repo();
		$sedes      = $sedes_repo->all();

		$filtro_sede_id = isset( $_GET['sede_id'] ) ? (int) $_GET['sede_id'] : 0;
		$q              = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$edit_id        = isset( $_GET['edit'] ) ? (int) $_GET['edit'] : 0;
		$edit           = $edit_id > 0 ? $salas_repo->find( $edit_id ) : null;

		$sede_preseleccionada = $edit ? (int) $edit->sede_id : $filtro_sede_id;

		$salas = $salas_repo->search( array( 'q' => $q, 'sede_id' => $filtro_sede_id ) );

		$sedes_idx = array();
		foreach ( $sedes as $s ) {
			$sedes_idx[ (int) $s->id ] = $s->nombre;
		}
		?>
		<div class="wrap olvibg olvibg-edit-tags">
			<h1 class="wp-heading-inline">
				<?php esc_html_e( 'Salas', 'los-olivos-ibague' ); ?>
				<?php if ( $filtro_sede_id > 0 && isset( $sedes_idx[ $filtro_sede_id ] ) ) : ?>
					<span class="subtitle"><?php echo esc_html( sprintf( __( 'filtrando por %s', 'los-olivos-ibague' ), $sedes_idx[ $filtro_sede_id ] ) ); ?></span>
				<?php endif; ?>
			</h1>
			<?php if ( $filtro_sede_id > 0 ) : ?>
				<a class="page-title-action" href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE ) ); ?>"><?php esc_html_e( 'Ver todas', 'los-olivos-ibague' ); ?></a>
			<?php endif; ?>
			<hr class="wp-header-end">
			<?php OlvIbg_Admin_Notices::print_default(); ?>

			<?php if ( empty( $sedes ) ) : ?>
				<div class="notice notice-warning"><p>
					<?php
					printf(
						/* translators: %s: link to Sedes admin page */
						esc_html__( 'Primero debes crear al menos una sede antes de añadir salas. %s', 'los-olivos-ibague' ),
						'<a href="' . esc_url( admin_url( 'admin.php?page=' . OlvIbg_Admin_Sedes::PAGE ) ) . '">' . esc_html__( 'Ir a Sedes →', 'los-olivos-ibague' ) . '</a>'
					);
					?>
				</p></div>
			<?php endif; ?>

			<div class="olvibg-col-container wp-clearfix">
				<div class="olvibg-col-left">
					<div class="col-wrap">
						<div class="form-wrap">
							<h2><?php echo $edit ? esc_html__( 'Editar sala', 'los-olivos-ibague' ) : esc_html__( 'Añadir nueva sala', 'los-olivos-ibague' ); ?></h2>
							<p><?php esc_html_e( 'Las salas pertenecen a una sede. Cada obituario seleccionará una sala dentro de la sede elegida.', 'los-olivos-ibague' ); ?></p>

							<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
								<input type="hidden" name="action" value="olvibg_sala_save">
								<?php wp_nonce_field( 'olvibg_sala_save' ); ?>
								<input type="hidden" name="id" value="<?php echo $edit ? (int) $edit->id : 0; ?>">

								<div class="form-field form-required">
									<label for="olvibg-sala-sede"><?php esc_html_e( 'Sede', 'los-olivos-ibague' ); ?></label>
									<select id="olvibg-sala-sede" name="sede_id" required <?php disabled( empty( $sedes ) ); ?>>
										<option value=""><?php esc_html_e( '— Seleccionar —', 'los-olivos-ibague' ); ?></option>
										<?php foreach ( $sedes as $s ) : ?>
											<option value="<?php echo (int) $s->id; ?>" <?php selected( $sede_preseleccionada === (int) $s->id ); ?>>
												<?php echo esc_html( $s->nombre ); ?>
											</option>
										<?php endforeach; ?>
									</select>
									<p><?php esc_html_e( 'La sede a la que pertenece esta sala.', 'los-olivos-ibague' ); ?></p>
								</div>

								<div class="form-field form-required">
									<label for="olvibg-sala-nombre"><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></label>
									<input type="text" id="olvibg-sala-nombre" name="nombre" required value="<?php echo esc_attr( $edit->nombre ?? '' ); ?>">
									<p><?php esc_html_e( 'Nombre de la sala dentro de la sede.', 'los-olivos-ibague' ); ?></p>
								</div>

								<div class="form-field">
									<label>
										<input type="checkbox" name="activo" value="1" <?php checked( ! $edit || (int) $edit->activo === 1 ); ?>>
										<?php esc_html_e( 'Activa', 'los-olivos-ibague' ); ?>
									</label>
								</div>

								<p class="submit">
									<button class="button button-primary" type="submit" <?php disabled( empty( $sedes ) ); ?>>
										<?php echo $edit ? esc_html__( 'Actualizar sala', 'los-olivos-ibague' ) : esc_html__( 'Añadir sala', 'los-olivos-ibague' ); ?>
									</button>
									<?php if ( $edit ) : ?>
										<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=' . self::PAGE ) ); ?>"><?php esc_html_e( 'Cancelar', 'los-olivos-ibague' ); ?></a>
									<?php endif; ?>
								</p>
							</form>
						</div>
					</div>
				</div>

				<div class="olvibg-col-right">
					<div class="col-wrap">
						<?php if ( ! empty( $sedes ) ) : ?>
							<form method="get">
								<input type="hidden" name="page" value="<?php echo esc_attr( self::PAGE ); ?>">
								<div class="tablenav top">
									<div class="alignleft actions">
										<label class="screen-reader-text" for="olvibg-filter-sede"><?php esc_html_e( 'Filtrar por sede', 'los-olivos-ibague' ); ?></label>
										<select id="olvibg-filter-sede" name="sede_id">
											<option value="0"><?php esc_html_e( 'Todas las sedes', 'los-olivos-ibague' ); ?></option>
											<?php foreach ( $sedes as $s ) : ?>
												<option value="<?php echo (int) $s->id; ?>" <?php selected( $filtro_sede_id === (int) $s->id ); ?>>
													<?php echo esc_html( $s->nombre ); ?>
												</option>
											<?php endforeach; ?>
										</select>
										<button type="submit" class="button"><?php esc_html_e( 'Filtrar', 'los-olivos-ibague' ); ?></button>
									</div>
									<p class="search-box">
										<label class="screen-reader-text" for="olvibg-search-salas"><?php esc_html_e( 'Buscar salas', 'los-olivos-ibague' ); ?></label>
										<input type="search" id="olvibg-search-salas" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="<?php esc_attr_e( 'Nombre de la sala…', 'los-olivos-ibague' ); ?>">
										<input type="submit" class="button" value="<?php esc_attr_e( 'Buscar', 'los-olivos-ibague' ); ?>">
									</p>
								</div>
							</form>
						<?php endif; ?>

						<table class="wp-list-table widefat fixed striped table-view-list">
							<thead>
								<tr>
									<th scope="col" class="manage-column column-name column-primary"><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Sede', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Activa', 'los-olivos-ibague' ); ?></th>
								</tr>
							</thead>
							<tbody>
							<?php foreach ( $salas as $s ) :
								$edit_url = add_query_arg( array( 'page' => self::PAGE, 'edit' => (int) $s->id ), admin_url( 'admin.php' ) );
								$del_url  = wp_nonce_url( admin_url( 'admin-post.php?action=olvibg_sala_delete&id=' . (int) $s->id . '&sede_id=' . (int) $s->sede_id ), 'olvibg_sala_delete_' . (int) $s->id );
							?>
								<tr>
									<td class="column-primary">
										<strong><a class="row-title" href="<?php echo esc_url( $edit_url ); ?>"><?php echo esc_html( $s->nombre ); ?></a></strong>
										<div class="row-actions">
											<span class="edit"><a href="<?php echo esc_url( $edit_url ); ?>"><?php esc_html_e( 'Editar', 'los-olivos-ibague' ); ?></a> | </span>
											<span class="delete"><a class="submitdelete" href="<?php echo esc_url( $del_url ); ?>" onclick="return confirm('<?php echo esc_js( __( '¿Eliminar esta sala?', 'los-olivos-ibague' ) ); ?>');"><?php esc_html_e( 'Eliminar', 'los-olivos-ibague' ); ?></a></span>
										</div>
									</td>
									<td><?php echo esc_html( $sedes_idx[ (int) $s->sede_id ] ?? '—' ); ?></td>
									<td><?php echo (int) $s->activo ? '<span class="dashicons dashicons-yes"></span>' : '—'; ?></td>
								</tr>
							<?php endforeach; ?>
							<?php if ( empty( $salas ) ) : ?>
								<tr class="no-items"><td class="colspanchange" colspan="3"><?php esc_html_e( 'No hay salas para este filtro.', 'los-olivos-ibague' ); ?></td></tr>
							<?php endif; ?>
							</tbody>
							<tfoot>
								<tr>
									<th scope="col" class="manage-column column-name column-primary"><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Sede', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Activa', 'los-olivos-ibague' ); ?></th>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	public static function handle_save() {
		check_admin_referer( 'olvibg_sala_save' );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		$repo    = new OlvIbg_Salas_Repo();
		$id      = (int) ( $_POST['id'] ?? 0 );
		$sede_id = (int) ( $_POST['sede_id'] ?? 0 );
		$data    = array(
			'sede_id' => $sede_id,
			'nombre'  => $_POST['nombre'] ?? '',
			'activo'  => isset( $_POST['activo'] ) ? 1 : 0,
		);

		$base = admin_url( 'admin.php?page=' . self::PAGE );

		if ( $sede_id <= 0 || $data['nombre'] === '' ) {
			wp_safe_redirect( add_query_arg( 'error', 'missing', $base ) );
			exit;
		}

		if ( $id > 0 ) {
			$repo->update( $id, $data );
		} else {
			$repo->insert( $data );
		}

		wp_safe_redirect( add_query_arg( array( 'updated' => 1, 'sede_id' => $sede_id ), $base ) );
		exit;
	}

	public static function handle_delete() {
		$id      = (int) ( $_GET['id'] ?? 0 );
		$sede_id = (int) ( $_GET['sede_id'] ?? 0 );
		check_admin_referer( 'olvibg_sala_delete_' . $id );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		$sala = ( new OlvIbg_Salas_Repo() )->find( $id );
		if ( $sala && ! $sede_id ) {
			$sede_id = (int) $sala->sede_id;
		}
		( new OlvIbg_Salas_Repo() )->delete( $id );

		$args = array( 'deleted' => 1 );
		if ( $sede_id > 0 ) {
			$args['sede_id'] = $sede_id;
		}
		wp_safe_redirect( add_query_arg( $args, admin_url( 'admin.php?page=' . self::PAGE ) ) );
		exit;
	}

	public static function ajax_salas_by_sede() {
		check_ajax_referer( 'olvibg_admin', 'nonce' );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_send_json_error( 'forbidden', 403 );
		}
		$sede_id = (int) ( $_GET['sede_id'] ?? 0 );
		$salas   = ( new OlvIbg_Salas_Repo() )->by_sede( $sede_id, true );
		$out     = array_map( function ( $s ) {
			return array( 'id' => (int) $s->id, 'nombre' => $s->nombre );
		}, $salas );
		wp_send_json_success( $out );
	}
}
