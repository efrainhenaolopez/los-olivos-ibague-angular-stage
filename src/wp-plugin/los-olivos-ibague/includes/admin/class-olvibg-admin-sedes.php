<?php
/**
 * Admin · Sedes (CRUD).
 *
 * Replica el patrón nativo de WordPress `edit-tags.php` (que WooCommerce
 * usa en Productos → Atributos): contenedor de 2 columnas con
 * `form-wrap` a la izquierda y tabla `wp-list-table` a la derecha. Las
 * clases `form-wrap` y `form-field` heredan estilo de `wp-admin/forms.css`.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Sedes {

	const PAGE = 'olvibg-sedes';

	public function register() {
		add_action( 'admin_post_olvibg_sede_save',   array( __CLASS__, 'handle_save' ) );
		add_action( 'admin_post_olvibg_sede_delete', array( __CLASS__, 'handle_delete' ) );
	}

	public static function render() {
		$sedes_repo = new OlvIbg_Sedes_Repo();
		$salas_repo = new OlvIbg_Salas_Repo();
		$q          = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$sedes      = $sedes_repo->search( $q );

		$edit_id = isset( $_GET['edit'] ) ? (int) $_GET['edit'] : 0;
		$edit    = $edit_id > 0 ? $sedes_repo->find( $edit_id ) : null;

		$conteo = array();
		foreach ( $salas_repo->all() as $s ) {
			$conteo[ (int) $s->sede_id ] = ( $conteo[ (int) $s->sede_id ] ?? 0 ) + 1;
		}
		?>
		<div class="wrap olvibg olvibg-edit-tags">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Sedes', 'los-olivos-ibague' ); ?></h1>
			<hr class="wp-header-end">
			<?php OlvIbg_Admin_Notices::print_default(); ?>

			<div class="olvibg-col-container wp-clearfix">
				<div class="olvibg-col-left">
					<div class="col-wrap">
						<div class="form-wrap">
							<h2><?php echo $edit ? esc_html__( 'Editar sede', 'los-olivos-ibague' ) : esc_html__( 'Añadir nueva sede', 'los-olivos-ibague' ); ?></h2>
							<p><?php esc_html_e( 'Las sedes son el contenedor de salas. Cada sala pertenece a una sede.', 'los-olivos-ibague' ); ?></p>

							<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
								<input type="hidden" name="action" value="olvibg_sede_save">
								<?php wp_nonce_field( 'olvibg_sede_save' ); ?>
								<input type="hidden" name="id" value="<?php echo $edit ? (int) $edit->id : 0; ?>">

								<div class="form-field form-required">
									<label for="olvibg-sede-nombre"><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></label>
									<input type="text" id="olvibg-sede-nombre" name="nombre" required value="<?php echo esc_attr( $edit->nombre ?? '' ); ?>">
									<p><?php esc_html_e( 'Nombre de la sede (mostrado en el admin de obituarios).', 'los-olivos-ibague' ); ?></p>
								</div>

								<div class="form-field">
									<label for="olvibg-sede-direccion"><?php esc_html_e( 'Dirección', 'los-olivos-ibague' ); ?></label>
									<input type="text" id="olvibg-sede-direccion" name="direccion" value="<?php echo esc_attr( $edit->direccion ?? '' ); ?>">
									<p><?php esc_html_e( 'Dirección física de la sede (opcional).', 'los-olivos-ibague' ); ?></p>
								</div>

								<div class="form-field">
									<label for="olvibg-sede-ciudad"><?php esc_html_e( 'Ciudad', 'los-olivos-ibague' ); ?></label>
									<input type="text" id="olvibg-sede-ciudad" name="ciudad" value="<?php echo esc_attr( $edit->ciudad ?? '' ); ?>">
								</div>

								<div class="form-field">
									<label>
										<input type="checkbox" name="activo" value="1" <?php checked( ! $edit || (int) $edit->activo === 1 ); ?>>
										<?php esc_html_e( 'Activa', 'los-olivos-ibague' ); ?>
									</label>
									<p><?php esc_html_e( 'Solo las sedes activas aparecen en el selector de obituarios.', 'los-olivos-ibague' ); ?></p>
								</div>

								<p class="submit">
									<button class="button button-primary" type="submit">
										<?php echo $edit ? esc_html__( 'Actualizar sede', 'los-olivos-ibague' ) : esc_html__( 'Añadir sede', 'los-olivos-ibague' ); ?>
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
						<form method="get" class="olvibg-tablenav">
							<input type="hidden" name="page" value="<?php echo esc_attr( self::PAGE ); ?>">
							<p class="search-box">
								<label class="screen-reader-text" for="olvibg-search-sedes"><?php esc_html_e( 'Buscar sedes', 'los-olivos-ibague' ); ?></label>
								<input type="search" id="olvibg-search-sedes" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="<?php esc_attr_e( 'Nombre, ciudad o dirección…', 'los-olivos-ibague' ); ?>">
								<input type="submit" class="button" value="<?php esc_attr_e( 'Buscar', 'los-olivos-ibague' ); ?>">
							</p>
						</form>
						<table class="wp-list-table widefat fixed striped table-view-list">
							<thead>
								<tr>
									<th scope="col" class="manage-column column-name column-primary"><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Ciudad', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Activa', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Salas', 'los-olivos-ibague' ); ?></th>
								</tr>
							</thead>
							<tbody>
							<?php foreach ( $sedes as $s ) :
								$edit_url  = add_query_arg( array( 'page' => self::PAGE, 'edit' => (int) $s->id ), admin_url( 'admin.php' ) );
								$salas_url = add_query_arg( array( 'page' => OlvIbg_Admin_Salas::PAGE, 'sede_id' => (int) $s->id ), admin_url( 'admin.php' ) );
								$del_url   = wp_nonce_url( admin_url( 'admin-post.php?action=olvibg_sede_delete&id=' . (int) $s->id ), 'olvibg_sede_delete_' . (int) $s->id );
								$n_salas   = $conteo[ (int) $s->id ] ?? 0;
							?>
								<tr>
									<td class="column-primary">
										<strong><a class="row-title" href="<?php echo esc_url( $edit_url ); ?>"><?php echo esc_html( $s->nombre ); ?></a></strong>
										<div class="row-actions">
											<span class="edit"><a href="<?php echo esc_url( $edit_url ); ?>"><?php esc_html_e( 'Editar', 'los-olivos-ibague' ); ?></a> | </span>
											<span class="delete"><a class="submitdelete" href="<?php echo esc_url( $del_url ); ?>" onclick="return confirm('<?php echo esc_js( __( '¿Eliminar esta sede? Sus salas también se eliminarán.', 'los-olivos-ibague' ) ); ?>');"><?php esc_html_e( 'Eliminar', 'los-olivos-ibague' ); ?></a></span>
										</div>
									</td>
									<td><?php echo esc_html( (string) $s->ciudad ); ?></td>
									<td><?php echo (int) $s->activo ? '<span class="dashicons dashicons-yes"></span>' : '—'; ?></td>
									<td>
										<?php echo (int) $n_salas; ?>
										<br><a href="<?php echo esc_url( $salas_url ); ?>"><?php esc_html_e( 'Configurar salas', 'los-olivos-ibague' ); ?></a>
									</td>
								</tr>
							<?php endforeach; ?>
							<?php if ( empty( $sedes ) ) : ?>
								<tr class="no-items"><td class="colspanchange" colspan="4"><?php esc_html_e( 'Aún no hay sedes registradas.', 'los-olivos-ibague' ); ?></td></tr>
							<?php endif; ?>
							</tbody>
							<tfoot>
								<tr>
									<th scope="col" class="manage-column column-name column-primary"><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Ciudad', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Activa', 'los-olivos-ibague' ); ?></th>
									<th scope="col" class="manage-column"><?php esc_html_e( 'Salas', 'los-olivos-ibague' ); ?></th>
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
		check_admin_referer( 'olvibg_sede_save' );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		$repo = new OlvIbg_Sedes_Repo();
		$id   = (int) ( $_POST['id'] ?? 0 );
		$data = array(
			'nombre'    => $_POST['nombre'] ?? '',
			'direccion' => $_POST['direccion'] ?? '',
			'ciudad'    => $_POST['ciudad'] ?? '',
			'activo'    => isset( $_POST['activo'] ) ? 1 : 0,
		);

		if ( $id > 0 ) {
			$repo->update( $id, $data );
		} else {
			$repo->insert( $data );
		}
		wp_safe_redirect( add_query_arg( 'updated', '1', admin_url( 'admin.php?page=' . self::PAGE ) ) );
		exit;
	}

	public static function handle_delete() {
		$id = (int) ( $_GET['id'] ?? 0 );
		check_admin_referer( 'olvibg_sede_delete_' . $id );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		// Eliminar primero las salas hijas para mantener la integridad.
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . OLVIBG_TABLE_PREFIX . 'salas', array( 'sede_id' => $id ), array( '%d' ) );
		( new OlvIbg_Sedes_Repo() )->delete( $id );

		wp_safe_redirect( add_query_arg( 'deleted', '1', admin_url( 'admin.php?page=' . self::PAGE ) ) );
		exit;
	}
}
