<?php
/**
 * Notices admin compartidos · saved/deleted/error vía querystring.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Notices {

	public static function print_default() {
		if ( ! empty( $_GET['updated'] ) ) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Cambios guardados.', 'los-olivos-ibague' ) . '</p></div>';
		}
		if ( ! empty( $_GET['deleted'] ) ) {
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Registro eliminado.', 'los-olivos-ibague' ) . '</p></div>';
		}
		if ( ! empty( $_GET['error'] ) ) {
			echo '<div class="notice notice-error"><p>' . esc_html__( 'Faltan campos obligatorios.', 'los-olivos-ibague' ) . '</p></div>';
		}
	}
}
