<?php
/**
 * Crea las tablas del plugin en la activación vía dbDelta.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Activator {

	public static function activate() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$prefix          = $wpdb->prefix . OLVIBG_TABLE_PREFIX;

		$queries = array();

		$queries[] = "CREATE TABLE {$prefix}sedes (
			id INT(11) NOT NULL AUTO_INCREMENT,
			nombre VARCHAR(150) NOT NULL,
			direccion VARCHAR(255) NULL,
			ciudad VARCHAR(120) NULL,
			activo TINYINT(1) NOT NULL DEFAULT 1,
			PRIMARY KEY  (id),
			UNIQUE KEY nombre (nombre)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$prefix}salas (
			id INT(11) NOT NULL AUTO_INCREMENT,
			sede_id INT(11) NOT NULL,
			nombre VARCHAR(150) NOT NULL,
			activo TINYINT(1) NOT NULL DEFAULT 1,
			PRIMARY KEY  (id),
			UNIQUE KEY sede_nombre (sede_id, nombre),
			KEY sede_id (sede_id)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$prefix}obituarios (
			id INT(11) NOT NULL AUTO_INCREMENT,
			nombrefallecido VARCHAR(250) NOT NULL,
			tipo_velacion VARCHAR(20) NOT NULL DEFAULT 'SALA',
			sede INT(11) NOT NULL DEFAULT 0,
			sala INT(11) NOT NULL DEFAULT 0,
			municipio VARCHAR(256) NOT NULL,
			salavelacion VARCHAR(255) NOT NULL DEFAULT '',
			lugarexequias VARCHAR(150) NOT NULL DEFAULT '',
			destinofinal VARCHAR(150) NOT NULL DEFAULT '',
			fechafallecimiento DATETIME NOT NULL,
			fechaexequias DATETIME NOT NULL,
			fechadestino DATETIME NOT NULL,
			mensajes INT(11) NOT NULL DEFAULT 0,
			ofrendas INT(11) NOT NULL DEFAULT 0,
			estado VARCHAR(1) NOT NULL DEFAULT 'A',
			asesor INT(11) NOT NULL DEFAULT 0,
			fecha DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY fechadestino_estado (fechadestino, estado),
			KEY sede_sala (sede, sala),
			KEY asesor (asesor)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$prefix}obituario_fotos (
			id BIGINT(20) NOT NULL AUTO_INCREMENT,
			obituario_id INT(11) NOT NULL,
			attachment_id BIGINT(20) NOT NULL,
			orden INT(11) NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			UNIQUE KEY obituario_attachment (obituario_id, attachment_id),
			KEY obituario_id (obituario_id)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$prefix}registros_defuncion (
			id BIGINT(20) NOT NULL AUTO_INCREMENT,
			ser_querido VARCHAR(200) NOT NULL,
			numero_registro VARCHAR(40) NULL,
			notaria VARCHAR(200) NOT NULL,
			documento_identidad VARCHAR(40) NULL,
			fecha_fallecimiento DATE NULL,
			fecha DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY fecha_fallecimiento (fecha_fallecimiento)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$prefix}condolencias (
			id BIGINT(20) NOT NULL AUTO_INCREMENT,
			obituario_id INT(11) NOT NULL,
			autor_nombre VARCHAR(120) NOT NULL,
			autor_email VARCHAR(190) NULL,
			mensaje TEXT NOT NULL,
			estado VARCHAR(20) NOT NULL DEFAULT 'pending',
			ip VARCHAR(45) NULL,
			user_agent TEXT NULL,
			moderated_at DATETIME NULL,
			moderado_por BIGINT(20) NULL,
			fecha DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY estado (estado),
			KEY obituario_estado (obituario_id, estado)
		) {$charset_collate};";

		$queries[] = "CREATE TABLE {$prefix}contacto_submissions (
			id BIGINT(20) NOT NULL AUTO_INCREMENT,
			nombre VARCHAR(120) NOT NULL,
			apellido VARCHAR(120) NULL,
			cedula VARCHAR(40) NULL,
			telefono VARCHAR(40) NOT NULL,
			correo VARCHAR(190) NOT NULL,
			servicio VARCHAR(120) NULL,
			mensaje TEXT NOT NULL,
			pagina_origen VARCHAR(255) NULL,
			ip VARCHAR(45) NULL,
			user_agent TEXT NULL,
			estado VARCHAR(20) NOT NULL DEFAULT 'nuevo',
			fecha DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY estado (estado),
			KEY correo (correo)
		) {$charset_collate};";

		foreach ( $queries as $sql ) {
			dbDelta( $sql );
		}

		if ( false === get_option( 'olvibg_mail_to' ) ) {
			add_option( 'olvibg_mail_to', get_option( 'admin_email' ) );
		}
		if ( false === get_option( 'olvibg_allowed_origins' ) ) {
			add_option( 'olvibg_allowed_origins', home_url() );
		}

		update_option( 'olvibg_db_version', OLVIBG_VERSION );
	}
}
