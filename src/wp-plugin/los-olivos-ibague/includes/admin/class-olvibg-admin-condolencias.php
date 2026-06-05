<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Condolencias {

	public function register() {
		add_action( 'admin_post_olvibg_condolencia_moderate', array( __CLASS__, 'handle_moderate' ) );
	}

	public static function render() {
		$estado_actual = isset( $_GET['estado'] ) ? sanitize_key( $_GET['estado'] ) : 'pending';
		$repo          = new OlvIbg_Condolencias_Repo();
		$rows          = $repo->by_estado( $estado_actual === 'all' ? null : $estado_actual );
		$obituarios    = new OlvIbg_Obituarios_Repo();
		?>
		<div class="wrap olvibg">
			<h1><?php esc_html_e( 'Condolencias', 'los-olivos-ibague' ); ?></h1>

			<?php if ( ! empty( $_GET['moderated'] ) ) : ?>
				<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Condolencia moderada.', 'los-olivos-ibague' ); ?></p></div>
			<?php endif; ?>

			<ul class="subsubsub">
				<?php
				$tabs = array(
					'pending'  => __( 'Pendientes', 'los-olivos-ibague' ),
					'approved' => __( 'Aprobadas', 'los-olivos-ibague' ),
					'rejected' => __( 'Rechazadas', 'los-olivos-ibague' ),
					'all'      => __( 'Todas', 'los-olivos-ibague' ),
				);
				$last = array_key_last( $tabs );
				foreach ( $tabs as $key => $label ) :
					$url = add_query_arg( array( 'page' => 'olvibg-condolencias', 'estado' => $key ), admin_url( 'admin.php' ) );
					$cls = $estado_actual === $key ? 'current' : '';
					?>
					<li><a class="<?php echo esc_attr( $cls ); ?>" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $label ); ?></a><?php echo $key !== $last ? ' |' : ''; ?></li>
				<?php endforeach; ?>
			</ul>

			<p style="margin-top:60px">
				<a class="button" href="<?php echo esc_url( add_query_arg( array( 'action' => 'olvibg_export_csv', 'type' => 'condolencias', 'estado' => $estado_actual ), admin_url( 'admin-post.php' ) ) ); ?>">
					<?php esc_html_e( 'Exportar CSV (filtro actual)', 'los-olivos-ibague' ); ?>
				</a>
			</p>

			<table class="widefat striped">
				<thead><tr>
					<th><?php esc_html_e( 'Autor', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Obituario', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Mensaje', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Fecha', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Estado', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Acciones', 'los-olivos-ibague' ); ?></th>
				</tr></thead>
				<tbody>
				<?php foreach ( $rows as $r ) :
					$obit = $obituarios->find( (int) $r->obituario_id );
					?>
					<tr>
						<td>
							<strong><?php echo esc_html( $r->autor_nombre ); ?></strong>
							<?php if ( $r->autor_email ) : ?>
								<br><small><?php echo esc_html( $r->autor_email ); ?></small>
							<?php endif; ?>
						</td>
						<td>
							<?php if ( $obit ) : ?>
								<a href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-obituarios&mode=edit&id=' . (int) $obit->id ) ); ?>">
									<?php echo esc_html( $obit->nombrefallecido ); ?>
								</a>
							<?php else : ?>
								<em>#<?php echo (int) $r->obituario_id; ?></em>
							<?php endif; ?>
						</td>
						<td>
							<?php
							$mensaje      = (string) $r->mensaje;
							$preview      = wp_trim_words( $mensaje, 30, '…' );
							$needs_expand = str_word_count( $mensaje ) > 30 || mb_strlen( $mensaje ) > 220;
							if ( $needs_expand ) :
								?>
								<details class="olvibg-mensaje">
									<summary><?php echo nl2br( esc_html( $preview ) ); ?></summary>
									<div class="olvibg-mensaje__full"><?php echo nl2br( esc_html( $mensaje ) ); ?></div>
								</details>
							<?php else : ?>
								<?php echo nl2br( esc_html( $mensaje ) ); ?>
							<?php endif; ?>
						</td>
						<td><?php echo esc_html( mysql2date( 'd/m/Y H:i', $r->fecha, false ) ); ?></td>
						<td>
							<span class="olvibg-badge olvibg-badge-<?php echo esc_attr( $r->estado ); ?>">
								<?php echo esc_html( ucfirst( $r->estado ) ); ?>
							</span>
						</td>
						<td>
							<?php if ( $r->estado !== 'approved' ) : ?>
								<a class="button button-primary" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=olvibg_condolencia_moderate&id=' . (int) $r->id . '&estado=approved' ), 'olvibg_moderate_' . (int) $r->id ) ); ?>">
									<?php esc_html_e( 'Aprobar', 'los-olivos-ibague' ); ?>
								</a>
							<?php endif; ?>
							<?php if ( $r->estado !== 'rejected' ) : ?>
								<a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=olvibg_condolencia_moderate&id=' . (int) $r->id . '&estado=rejected' ), 'olvibg_moderate_' . (int) $r->id ) ); ?>">
									<?php esc_html_e( 'Rechazar', 'los-olivos-ibague' ); ?>
								</a>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
				<?php if ( empty( $rows ) ) : ?>
					<tr><td colspan="6"><?php esc_html_e( 'No hay condolencias en este estado.', 'los-olivos-ibague' ); ?></td></tr>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	public static function handle_moderate() {
		$id     = (int) ( $_GET['id'] ?? 0 );
		$estado = isset( $_GET['estado'] ) ? sanitize_key( $_GET['estado'] ) : '';
		check_admin_referer( 'olvibg_moderate_' . $id );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}
		( new OlvIbg_Condolencias_Repo() )->moderate( $id, $estado, get_current_user_id() );
		wp_safe_redirect( add_query_arg( array( 'page' => 'olvibg-condolencias', 'moderated' => 1 ), admin_url( 'admin.php' ) ) );
		exit;
	}
}
