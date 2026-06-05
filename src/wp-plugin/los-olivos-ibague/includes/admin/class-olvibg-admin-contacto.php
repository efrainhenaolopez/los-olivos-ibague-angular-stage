<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Contacto {

	public function register() {
		add_action( 'admin_post_olvibg_contacto_estado', array( __CLASS__, 'handle_set_estado' ) );
	}

	public static function render() {
		$estado = isset( $_GET['estado'] ) ? sanitize_key( $_GET['estado'] ) : '';
		$q      = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$repo   = new OlvIbg_Contacto_Repo();
		$rows   = $repo->search( array( 'estado' => $estado, 'q' => $q ) );
		?>
		<div class="wrap olvibg">
			<h1><?php esc_html_e( 'Consultas de contacto', 'los-olivos-ibague' ); ?></h1>

			<?php if ( ! empty( $_GET['updated'] ) ) : ?>
				<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Cambios guardados.', 'los-olivos-ibague' ); ?></p></div>
			<?php endif; ?>

			<form method="get" style="margin: 16px 0;">
				<input type="hidden" name="page" value="olvibg-contacto">
				<input type="search" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="<?php esc_attr_e( 'Buscar por nombre, apellido o correo…', 'los-olivos-ibague' ); ?>" class="regular-text">
				<select name="estado">
					<option value=""><?php esc_html_e( 'Todos los estados', 'los-olivos-ibague' ); ?></option>
					<?php foreach ( OlvIbg_Contacto_Repo::ESTADOS as $e ) : ?>
						<option value="<?php echo esc_attr( $e ); ?>" <?php selected( $estado, $e ); ?>><?php echo esc_html( ucfirst( $e ) ); ?></option>
					<?php endforeach; ?>
				</select>
				<button class="button" type="submit"><?php esc_html_e( 'Filtrar', 'los-olivos-ibague' ); ?></button>
				<a class="button" href="<?php echo esc_url( add_query_arg( array( 'action' => 'olvibg_export_csv', 'type' => 'contacto', 'estado' => $estado, 'q' => $q ), admin_url( 'admin-post.php' ) ) ); ?>">
					<?php esc_html_e( 'Exportar CSV', 'los-olivos-ibague' ); ?>
				</a>
			</form>

			<table class="widefat striped">
				<thead><tr>
					<th><?php esc_html_e( 'Nombre', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Contacto', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Servicio', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Mensaje', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Origen', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Fecha', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Estado', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Acciones', 'los-olivos-ibague' ); ?></th>
				</tr></thead>
				<tbody>
				<?php foreach ( $rows as $r ) : ?>
					<tr>
						<td>
							<strong><?php echo esc_html( trim( $r->nombre . ' ' . (string) $r->apellido ) ); ?></strong>
							<?php if ( $r->cedula ) : ?>
								<br><small>CC <?php echo esc_html( $r->cedula ); ?></small>
							<?php endif; ?>
						</td>
						<td>
							<?php echo esc_html( $r->telefono ); ?><br>
							<small><?php echo esc_html( $r->correo ); ?></small>
						</td>
						<td><?php echo esc_html( (string) $r->servicio ); ?></td>
						<td><?php echo nl2br( esc_html( wp_trim_words( $r->mensaje, 25 ) ) ); ?></td>
						<td><small><?php echo esc_html( (string) $r->pagina_origen ); ?></small></td>
						<td><?php echo esc_html( mysql2date( 'd/m/Y H:i', $r->fecha, false ) ); ?></td>
						<td><span class="olvibg-badge olvibg-badge-<?php echo esc_attr( $r->estado ); ?>"><?php echo esc_html( ucfirst( $r->estado ) ); ?></span></td>
						<td>
							<?php foreach ( OlvIbg_Contacto_Repo::ESTADOS as $e ) :
								if ( $e === $r->estado ) continue;
								$url = wp_nonce_url( admin_url( 'admin-post.php?action=olvibg_contacto_estado&id=' . (int) $r->id . '&estado=' . $e ), 'olvibg_contacto_estado_' . (int) $r->id );
								?>
								<a class="button button-small" href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( ucfirst( $e ) ); ?></a>
							<?php endforeach; ?>
						</td>
					</tr>
				<?php endforeach; ?>
				<?php if ( empty( $rows ) ) : ?>
					<tr><td colspan="8"><?php esc_html_e( 'No hay consultas para este filtro.', 'los-olivos-ibague' ); ?></td></tr>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	public static function handle_set_estado() {
		$id     = (int) ( $_GET['id'] ?? 0 );
		$estado = isset( $_GET['estado'] ) ? sanitize_key( $_GET['estado'] ) : '';
		check_admin_referer( 'olvibg_contacto_estado_' . $id );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}
		( new OlvIbg_Contacto_Repo() )->set_estado( $id, $estado );
		wp_safe_redirect( add_query_arg( array( 'page' => 'olvibg-contacto', 'updated' => 1 ), admin_url( 'admin.php' ) ) );
		exit;
	}
}
