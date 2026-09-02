<?php
/**
 * Plugin Name:       Los Olivos Ibague
 * Plugin URI:        https://www.metamark.com.co
 * Description:       Backend para Los Olivos · obituarios, registros de defunción, condolencias y formularios de contacto. Expone endpoints REST bajo el namespace serfuncoop/v1 para el frontend Angular.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            MetaMark
 * Author URI:        https://www.metamark.com.co
 * License:           GPL-2.0+
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       los-olivos-ibague
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'OLVIBG_VERSION',     '1.0.0' );
define( 'OLVIBG_PLUGIN_FILE', __FILE__ );
define( 'OLVIBG_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'OLVIBG_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'OLVIBG_TABLE_PREFIX', 'olvibg_' );
define( 'OLVIBG_REST_NAMESPACE', 'serfuncoop/v1' );
define( 'OLVIBG_TEXT_DOMAIN', 'los-olivos-ibague' );

spl_autoload_register( function ( $class ) {
	if ( strpos( $class, 'OlvIbg_' ) !== 0 ) {
		return;
	}

	// "OlvIbg_" tiene 7 caracteres; el resto del nombre se convierte a
	// kebab-case y se compone como `class-olvibg-{slug}.php`.
	$slug = strtolower( str_replace( '_', '-', substr( $class, 7 ) ) );
	$file = 'class-olvibg-' . $slug . '.php';

	$candidates = array(
		OLVIBG_PLUGIN_DIR . 'includes/' . $file,
		OLVIBG_PLUGIN_DIR . 'includes/rest/' . $file,
		OLVIBG_PLUGIN_DIR . 'includes/repositories/' . $file,
		OLVIBG_PLUGIN_DIR . 'includes/admin/' . $file,
		OLVIBG_PLUGIN_DIR . 'includes/mail/' . $file,
	);

	foreach ( $candidates as $path ) {
		if ( file_exists( $path ) ) {
			require_once $path;
			return;
		}
	}
} );

register_activation_hook( __FILE__, array( 'OlvIbg_Activator', 'activate' ) );

add_action( 'plugins_loaded', function () {
	load_plugin_textdomain( OLVIBG_TEXT_DOMAIN, false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

	$loader = new OlvIbg_Loader();
	$loader->register();
} );
