<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Ajustes {

	public function register() {
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	public function register_settings() {
		register_setting( 'olvibg_ajustes', 'olvibg_mail_to', array( 'sanitize_callback' => 'sanitize_email' ) );
		register_setting( 'olvibg_ajustes', 'olvibg_mail_cc', array( 'sanitize_callback' => 'sanitize_text_field' ) );
		register_setting( 'olvibg_ajustes', 'olvibg_mail_template_contacto', array( 'sanitize_callback' => 'wp_kses_post' ) );
		register_setting( 'olvibg_ajustes', 'olvibg_mail_template_condolencia', array( 'sanitize_callback' => 'wp_kses_post' ) );
		register_setting( 'olvibg_ajustes', 'olvibg_allowed_origins', array( 'sanitize_callback' => 'sanitize_textarea_field' ) );
		register_setting( 'olvibg_ajustes', 'olvibg_rate_limit_max', array( 'sanitize_callback' => 'absint', 'default' => 20 ) );
		register_setting( 'olvibg_ajustes', 'olvibg_rate_limit_window_min', array( 'sanitize_callback' => 'absint', 'default' => 10 ) );
	}

	public static function render() {
		?>
		<div class="wrap olvibg">
			<h1><?php esc_html_e( 'Ajustes · Los Olivos', 'los-olivos-ibague' ); ?></h1>
			<form method="post" action="options.php">
				<?php settings_fields( 'olvibg_ajustes' ); ?>
				<table class="form-table">
					<tr>
						<th><label for="olvibg_mail_to"><?php esc_html_e( 'Email destinatario principal', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<input type="email" id="olvibg_mail_to" name="olvibg_mail_to" class="regular-text"
								value="<?php echo esc_attr( get_option( 'olvibg_mail_to', get_option( 'admin_email' ) ) ); ?>">
							<p class="description"><?php esc_html_e( 'Recibe las notificaciones de contacto y condolencias pendientes.', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label for="olvibg_mail_cc"><?php esc_html_e( 'Email CC (opcional)', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<input type="text" id="olvibg_mail_cc" name="olvibg_mail_cc" class="regular-text"
								value="<?php echo esc_attr( get_option( 'olvibg_mail_cc', '' ) ); ?>">
						</td>
					</tr>
					<tr>
						<th><label for="olvibg_allowed_origins"><?php esc_html_e( 'Orígenes CORS permitidos', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<textarea id="olvibg_allowed_origins" name="olvibg_allowed_origins" rows="4" class="large-text code"><?php
								echo esc_textarea( get_option( 'olvibg_allowed_origins', home_url() ) );
							?></textarea>
							<p class="description"><?php esc_html_e( 'Una URL por línea (sin slash final). Solo POST desde estos orígenes podrá enviar formularios.', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label for="olvibg_rate_limit_max"><?php esc_html_e( 'Rate-limit · máximo de envíos por IP', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<input type="number" min="0" step="1" id="olvibg_rate_limit_max" name="olvibg_rate_limit_max" class="small-text"
								value="<?php echo esc_attr( get_option( 'olvibg_rate_limit_max', 20 ) ); ?>">
							<label for="olvibg_rate_limit_window_min" style="margin-left:1rem;"><?php esc_html_e( 'en ventana (minutos):', 'los-olivos-ibague' ); ?></label>
							<input type="number" min="1" step="1" id="olvibg_rate_limit_window_min" name="olvibg_rate_limit_window_min" class="small-text"
								value="<?php echo esc_attr( get_option( 'olvibg_rate_limit_window_min', 10 ) ); ?>">
							<p class="description"><?php esc_html_e( 'Aplica a POST /condolencias y /contacto. Poner 0 en máximo desactiva el rate-limit (útil en dev/QA).', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label for="olvibg_mail_template_contacto"><?php esc_html_e( 'Plantilla email · Contacto', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<textarea id="olvibg_mail_template_contacto" name="olvibg_mail_template_contacto" rows="10" class="large-text code"><?php
								echo esc_textarea( get_option( 'olvibg_mail_template_contacto', '' ) );
							?></textarea>
							<p class="description"><?php esc_html_e( 'HTML. Variables: {nombre} {cedula} {telefono} {correo} {servicio} {mensaje} {pagina} {fecha} {admin_url}. Dejar vacío para usar plantilla por defecto.', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label for="olvibg_mail_template_condolencia"><?php esc_html_e( 'Plantilla email · Condolencia pendiente', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<textarea id="olvibg_mail_template_condolencia" name="olvibg_mail_template_condolencia" rows="10" class="large-text code"><?php
								echo esc_textarea( get_option( 'olvibg_mail_template_condolencia', '' ) );
							?></textarea>
							<p class="description"><?php esc_html_e( 'HTML. Variables: {autor} {email} {mensaje} {obituario_id} {fecha} {admin_url}. Dejar vacío para usar plantilla por defecto.', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
}
