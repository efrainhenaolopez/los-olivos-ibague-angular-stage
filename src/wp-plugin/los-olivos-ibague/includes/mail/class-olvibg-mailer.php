<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Mailer {

	public function send_contacto( $row ) {
		if ( ! $row ) {
			return false;
		}
		$subject = '[Los Olivos] ' . __( 'Nueva consulta de contacto', 'los-olivos-ibague' );
		$body    = $this->template_contacto( $row );
		return $this->send( $subject, $body );
	}

	public function send_condolencia_pendiente( $row ) {
		if ( ! $row ) {
			return false;
		}
		$subject = '[Los Olivos] ' . __( 'Condolencia pendiente de moderar', 'los-olivos-ibague' );
		$body    = $this->template_condolencia( $row );
		return $this->send( $subject, $body );
	}

	private function send( $subject, $body ) {
		$to      = get_option( 'olvibg_mail_to', get_option( 'admin_email' ) );
		$cc      = trim( (string) get_option( 'olvibg_mail_cc', '' ) );
		$headers = array( 'Content-Type: text/html; charset=UTF-8' );
		if ( $cc !== '' ) {
			$headers[] = 'Cc: ' . $cc;
		}
		return wp_mail( $to, $subject, $body, $headers );
	}

	private function template_contacto( $row ) {
		$custom = trim( (string) get_option( 'olvibg_mail_template_contacto', '' ) );
		$vars   = array(
			'{nombre}'   => esc_html( trim( $row->nombre . ' ' . ( $row->apellido ?? '' ) ) ),
			'{cedula}'   => esc_html( (string) $row->cedula ),
			'{telefono}' => esc_html( $row->telefono ),
			'{correo}'   => esc_html( $row->correo ),
			'{servicio}' => esc_html( (string) $row->servicio ),
			'{mensaje}'  => nl2br( esc_html( $row->mensaje ) ),
			'{pagina}'   => esc_html( (string) $row->pagina_origen ),
			'{fecha}'    => esc_html( $row->fecha ),
			'{admin_url}'=> esc_url( admin_url( 'admin.php?page=olvibg-contacto' ) ),
		);
		$tpl = $custom !== '' ? $custom : $this->default_contacto_template();
		return strtr( $tpl, $vars );
	}

	private function template_condolencia( $row ) {
		$custom = trim( (string) get_option( 'olvibg_mail_template_condolencia', '' ) );
		$vars   = array(
			'{autor}'        => esc_html( $row->autor_nombre ),
			'{email}'        => esc_html( (string) $row->autor_email ),
			'{mensaje}'      => nl2br( esc_html( $row->mensaje ) ),
			'{obituario_id}' => (int) $row->obituario_id,
			'{fecha}'        => esc_html( $row->fecha ),
			'{admin_url}'    => esc_url( admin_url( 'admin.php?page=olvibg-condolencias' ) ),
		);
		$tpl = $custom !== '' ? $custom : $this->default_condolencia_template();
		return strtr( $tpl, $vars );
	}

	private function default_contacto_template() {
		return '<h2>Nueva consulta de contacto · Los Olivos</h2>
		<p><strong>Nombre:</strong> {nombre}<br>
		<strong>Cédula:</strong> {cedula}<br>
		<strong>Teléfono:</strong> {telefono}<br>
		<strong>Correo:</strong> {correo}<br>
		<strong>Servicio:</strong> {servicio}<br>
		<strong>Página origen:</strong> {pagina}<br>
		<strong>Fecha:</strong> {fecha}</p>
		<p><strong>Mensaje:</strong></p><blockquote>{mensaje}</blockquote>
		<p><a href="{admin_url}">Ver en el panel administrativo</a></p>';
	}

	private function default_condolencia_template() {
		return '<h2>Condolencia pendiente · Los Olivos</h2>
		<p><strong>Autor:</strong> {autor}<br>
		<strong>Email:</strong> {email}<br>
		<strong>Obituario #:</strong> {obituario_id}<br>
		<strong>Fecha:</strong> {fecha}</p>
		<p><strong>Mensaje:</strong></p><blockquote>{mensaje}</blockquote>
		<p><a href="{admin_url}">Moderar en el panel administrativo</a></p>';
	}
}
