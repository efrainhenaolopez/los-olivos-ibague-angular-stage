<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Menu {

	const CAPABILITY = 'manage_options';
	const PAGE_ROOT  = 'olvibg';

	public function register() {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function add_menu() {
		add_menu_page(
			__( 'Los Olivos', 'los-olivos-ibague' ),
			__( 'Los Olivos', 'los-olivos-ibague' ),
			self::CAPABILITY,
			self::PAGE_ROOT,
			array( $this, 'render_dashboard' ),
			OLVIBG_PLUGIN_URL . 'assets/img/icono_olivos.png',
			28
		);

		add_submenu_page( self::PAGE_ROOT, __( 'Dashboard', 'los-olivos-ibague' ), __( 'Dashboard', 'los-olivos-ibague' ),
			self::CAPABILITY, self::PAGE_ROOT, array( $this, 'render_dashboard' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Obituarios', 'los-olivos-ibague' ), __( 'Obituarios', 'los-olivos-ibague' ),
			self::CAPABILITY, 'olvibg-obituarios', array( 'OlvIbg_Admin_Obituarios', 'render' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Registros de defunción', 'los-olivos-ibague' ), __( 'Registros defunción', 'los-olivos-ibague' ),
			self::CAPABILITY, 'olvibg-registros', array( 'OlvIbg_Admin_Registros', 'render' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Condolencias', 'los-olivos-ibague' ), $this->condolencias_label(),
			self::CAPABILITY, 'olvibg-condolencias', array( 'OlvIbg_Admin_Condolencias', 'render' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Contacto', 'los-olivos-ibague' ), $this->contacto_label(),
			self::CAPABILITY, 'olvibg-contacto', array( 'OlvIbg_Admin_Contacto', 'render' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Sedes', 'los-olivos-ibague' ), __( 'Sedes', 'los-olivos-ibague' ),
			self::CAPABILITY, OlvIbg_Admin_Sedes::PAGE, array( 'OlvIbg_Admin_Sedes', 'render' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Salas', 'los-olivos-ibague' ), __( 'Salas', 'los-olivos-ibague' ),
			self::CAPABILITY, OlvIbg_Admin_Salas::PAGE, array( 'OlvIbg_Admin_Salas', 'render' ) );

		add_submenu_page( self::PAGE_ROOT, __( 'Ajustes', 'los-olivos-ibague' ), __( 'Ajustes', 'los-olivos-ibague' ),
			self::CAPABILITY, 'olvibg-ajustes', array( 'OlvIbg_Admin_Ajustes', 'render' ) );
	}

	private function condolencias_label() {
		$pending = ( new OlvIbg_Condolencias_Repo() )->count_pending();
		$label   = __( 'Condolencias', 'los-olivos-ibague' );
		if ( $pending > 0 ) {
			$label .= sprintf( ' <span class="awaiting-mod count-%d"><span class="pending-count">%d</span></span>', $pending, $pending );
		}
		return $label;
	}

	private function contacto_label() {
		$nuevos = ( new OlvIbg_Contacto_Repo() )->count_nuevos();
		$label  = __( 'Contacto', 'los-olivos-ibague' );
		if ( $nuevos > 0 ) {
			$label .= sprintf( ' <span class="awaiting-mod count-%d"><span class="pending-count">%d</span></span>', $nuevos, $nuevos );
		}
		return $label;
	}

	public function enqueue_assets( $hook ) {
		if ( strpos( (string) $hook, 'olvibg' ) === false && strpos( (string) $hook, self::PAGE_ROOT ) === false ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_script( 'jquery-ui-sortable' );

		$css_path = OLVIBG_PLUGIN_DIR . 'assets/css/admin.css';
		$js_path  = OLVIBG_PLUGIN_DIR . 'assets/js/admin.js';

		wp_enqueue_style(
			'olvibg-admin',
			OLVIBG_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			file_exists( $css_path ) ? filemtime( $css_path ) : OLVIBG_VERSION
		);

		wp_enqueue_script(
			'olvibg-admin',
			OLVIBG_PLUGIN_URL . 'assets/js/admin.js',
			array( 'jquery', 'jquery-ui-sortable' ),
			file_exists( $js_path ) ? filemtime( $js_path ) : OLVIBG_VERSION,
			true
		);

		wp_localize_script( 'olvibg-admin', 'OLVIBG', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'olvibg_admin' ),
			'i18n'    => array(
				'selectPhotos' => __( 'Seleccionar fotos', 'los-olivos-ibague' ),
				'usePhotos'    => __( 'Usar estas fotos', 'los-olivos-ibague' ),
			),
		) );
	}

	public function render_dashboard() {
		$obituarios  = count( ( new OlvIbg_Obituarios_Repo() )->visibles() );
		$condolencias = ( new OlvIbg_Condolencias_Repo() )->count_pending();
		$contacto    = ( new OlvIbg_Contacto_Repo() )->count_nuevos();
		?>
		<div class="wrap olvibg">
			<h1><?php esc_html_e( 'Los Olivos · Dashboard', 'los-olivos-ibague' ); ?></h1>
			<div class="olvibg-cards">
				<div class="olvibg-card">
					<h2><?php echo esc_html( $obituarios ); ?></h2>
					<p><?php esc_html_e( 'Obituarios vigentes', 'los-olivos-ibague' ); ?></p>
					<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-obituarios' ) ); ?>">
						<?php esc_html_e( 'Administrar', 'los-olivos-ibague' ); ?>
					</a>
				</div>
				<div class="olvibg-card">
					<h2><?php echo esc_html( $condolencias ); ?></h2>
					<p><?php esc_html_e( 'Condolencias por moderar', 'los-olivos-ibague' ); ?></p>
					<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-condolencias' ) ); ?>">
						<?php esc_html_e( 'Moderar', 'los-olivos-ibague' ); ?>
					</a>
				</div>
				<div class="olvibg-card">
					<h2><?php echo esc_html( $contacto ); ?></h2>
					<p><?php esc_html_e( 'Consultas de contacto nuevas', 'los-olivos-ibague' ); ?></p>
					<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-contacto' ) ); ?>">
						<?php esc_html_e( 'Ver consultas', 'los-olivos-ibague' ); ?>
					</a>
				</div>
			</div>
		</div>
		<?php
	}
}
