<?php
/**
 * Uninstall script.
 *
 * Las tablas del plugin NO se eliminan al desinstalar — contienen datos
 * sensibles (obituarios históricos, leads de contacto, condolencias).
 * Solo se limpian las options registradas.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$options = array(
	'olvibg_mail_to',
	'olvibg_mail_cc',
	'olvibg_mail_template_contacto',
	'olvibg_mail_template_condolencia',
	'olvibg_allowed_origins',
	'olvibg_db_version',
);

foreach ( $options as $opt ) {
	delete_option( $opt );
}
