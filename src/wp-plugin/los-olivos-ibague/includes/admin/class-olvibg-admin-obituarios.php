<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class OlvIbg_Admin_Obituarios {

	public function register() {
		add_action( 'admin_post_olvibg_obituario_save', array( __CLASS__, 'handle_save' ) );
	}

	public static function render() {
		$mode = isset( $_GET['mode'] ) ? sanitize_key( $_GET['mode'] ) : 'list';

		if ( in_array( $mode, array( 'edit', 'new' ), true ) ) {
			self::render_form( $mode === 'edit' ? (int) ( $_GET['id'] ?? 0 ) : 0 );
			return;
		}
		self::render_list();
	}

	private static function render_list() {
		$q             = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$filtro_sede   = isset( $_GET['sede_id'] ) ? (int) $_GET['sede_id'] : 0;
		$filtro_estado = isset( $_GET['estado_filter'] ) ? sanitize_key( $_GET['estado_filter'] ) : '';

		$rows = ( new OlvIbg_Obituarios_Repo() )->search( array(
			'q'             => $q,
			'sede_id'       => $filtro_sede,
			'estado_filter' => $filtro_estado,
		) );
		$sedes = ( new OlvIbg_Sedes_Repo() )->all( true );
		?>
		<div class="wrap olvibg">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Obituarios', 'los-olivos-ibague' ); ?></h1>
			<a class="page-title-action" href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-obituarios&mode=new' ) ); ?>">
				<?php esc_html_e( 'Nuevo obituario', 'los-olivos-ibague' ); ?>
			</a>
			<hr class="wp-header-end">
			<?php
			if ( ! empty( $_GET['updated'] ) ) {
				echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Obituario guardado.', 'los-olivos-ibague' ) . '</p></div>';
			}
			?>

			<form method="get">
				<input type="hidden" name="page" value="olvibg-obituarios">
				<div class="tablenav top">
					<div class="alignleft actions">
						<label class="screen-reader-text" for="olvibg-filter-sede-obit"><?php esc_html_e( 'Filtrar por sede', 'los-olivos-ibague' ); ?></label>
						<select id="olvibg-filter-sede-obit" name="sede_id">
							<option value="0"><?php esc_html_e( 'Todas las sedes', 'los-olivos-ibague' ); ?></option>
							<?php foreach ( $sedes as $s ) : ?>
								<option value="<?php echo (int) $s->id; ?>" <?php selected( $filtro_sede === (int) $s->id ); ?>>
									<?php echo esc_html( $s->nombre ); ?>
								</option>
							<?php endforeach; ?>
						</select>
						<label class="screen-reader-text" for="olvibg-filter-estado-obit"><?php esc_html_e( 'Filtrar por estado', 'los-olivos-ibague' ); ?></label>
						<select id="olvibg-filter-estado-obit" name="estado_filter">
							<option value=""><?php esc_html_e( 'Todos los estados', 'los-olivos-ibague' ); ?></option>
							<option value="vigente"  <?php selected( $filtro_estado, 'vigente' ); ?>><?php esc_html_e( 'Vigentes',   'los-olivos-ibague' ); ?></option>
							<option value="vencido"  <?php selected( $filtro_estado, 'vencido' ); ?>><?php esc_html_e( 'Vencidos',   'los-olivos-ibague' ); ?></option>
							<option value="inactivo" <?php selected( $filtro_estado, 'inactivo' ); ?>><?php esc_html_e( 'Inactivos',  'los-olivos-ibague' ); ?></option>
						</select>
						<button type="submit" class="button"><?php esc_html_e( 'Filtrar', 'los-olivos-ibague' ); ?></button>
					</div>
					<p class="search-box">
						<label class="screen-reader-text" for="olvibg-search-obit"><?php esc_html_e( 'Buscar obituarios', 'los-olivos-ibague' ); ?></label>
						<input type="search" id="olvibg-search-obit" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="<?php esc_attr_e( 'Nombre del fallecido…', 'los-olivos-ibague' ); ?>">
						<input type="submit" class="button" value="<?php esc_attr_e( 'Buscar', 'los-olivos-ibague' ); ?>">
					</p>
				</div>
			</form>
			<table class="widefat striped">
				<thead><tr>
					<th><?php esc_html_e( 'Nombre fallecido', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Destino final', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Velación', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Municipio', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Asesor', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Estado', 'los-olivos-ibague' ); ?></th>
					<th><?php esc_html_e( 'Fotos', 'los-olivos-ibague' ); ?></th>
					<th></th>
				</tr></thead>
				<tbody>
				<?php foreach ( $rows as $r ) :
					$vigente   = $r->estado === 'A' && strtotime( $r->fechadestino ) >= current_time( 'timestamp' );
					$badge     = $r->estado === 'I' ? 'inactivo' : ( $vigente ? 'vigente' : 'vencido' );
					$badge_txt = $r->estado === 'I' ? __( 'Inactivo', 'los-olivos-ibague' ) : ( $vigente ? __( 'Vigente', 'los-olivos-ibague' ) : __( 'Vencido', 'los-olivos-ibague' ) );
					$asesor_id   = (int) $r->asesor;
					$asesor_name = $asesor_id ? ( get_userdata( $asesor_id ) ? get_userdata( $asesor_id )->display_name : '—' ) : '—';
					$n_fotos     = count( ( new OlvIbg_Obituarios_Repo() )->fotos( $r->id ) );
					$es_residencia = ( $r->tipo_velacion ?? OlvIbg_Obituarios_Repo::TIPO_SALA ) === OlvIbg_Obituarios_Repo::TIPO_RESIDENCIA;
					if ( $es_residencia ) {
						$velacion_txt = __( 'Residencia', 'los-olivos-ibague' ) . ( $r->salavelacion ? ' · ' . $r->salavelacion : '' );
					} else {
						$velacion_txt = trim( ( $r->sala_nombre ?? '' ) . ' · ' . ( $r->sede_nombre ?? '' ), ' ·' );
					}
				?>
					<tr>
						<td><strong><?php echo esc_html( $r->nombrefallecido ); ?></strong></td>
						<td><?php echo esc_html( mysql2date( 'd/m/Y H:i', $r->fechadestino, false ) ); ?></td>
						<td><?php echo esc_html( $velacion_txt ); ?></td>
						<td><?php echo esc_html( $r->municipio ); ?></td>
						<td><?php echo esc_html( $asesor_name ); ?></td>
						<td><span class="olvibg-badge olvibg-badge-<?php echo esc_attr( $badge ); ?>"><?php echo esc_html( $badge_txt ); ?></span></td>
						<td><?php echo (int) $n_fotos; ?></td>
						<td>
							<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-obituarios&mode=edit&id=' . (int) $r->id ) ); ?>">
								<?php esc_html_e( 'Editar', 'los-olivos-ibague' ); ?>
							</a>
						</td>
					</tr>
				<?php endforeach; ?>
				<?php if ( empty( $rows ) ) : ?>
					<tr><td colspan="8"><?php esc_html_e( 'Aún no hay obituarios.', 'los-olivos-ibague' ); ?></td></tr>
				<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	private static function render_form( $id ) {
		$repo       = new OlvIbg_Obituarios_Repo();
		$obit       = $id > 0 ? $repo->find( $id ) : null;
		$sedes      = ( new OlvIbg_Sedes_Repo() )->all( true );
		$salas_all  = ( new OlvIbg_Salas_Repo() )->all( true );
		$fotos      = $obit ? $repo->fotos( $id ) : array();
		$users      = get_users( array( 'orderby' => 'display_name' ) );

		$get = function ( $key, $default = '' ) use ( $obit ) {
			return $obit && isset( $obit->$key ) ? $obit->$key : $default;
		};

		$dt = function ( $val ) {
			if ( ! $val ) return '';
			$t = strtotime( $val );
			return $t ? date( 'Y-m-d\TH:i', $t ) : '';
		};
		?>
		<div class="wrap olvibg">
			<h1><?php echo $obit ? esc_html__( 'Editar obituario', 'los-olivos-ibague' ) : esc_html__( 'Nuevo obituario', 'los-olivos-ibague' ); ?></h1>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="olvibg-form">
				<input type="hidden" name="action" value="olvibg_obituario_save">
				<?php wp_nonce_field( 'olvibg_obituario_save' ); ?>
				<input type="hidden" name="id" value="<?php echo (int) ( $obit->id ?? 0 ); ?>">

				<?php
				$tipo_actual = $get( 'tipo_velacion', OlvIbg_Obituarios_Repo::TIPO_SALA );
				if ( ! in_array( $tipo_actual, array( OlvIbg_Obituarios_Repo::TIPO_SALA, OlvIbg_Obituarios_Repo::TIPO_RESIDENCIA ), true ) ) {
					$tipo_actual = OlvIbg_Obituarios_Repo::TIPO_SALA;
				}
				?>
				<table class="form-table">
					<tr>
						<th><label><?php esc_html_e( 'Nombre del fallecido', 'los-olivos-ibague' ); ?> *</label></th>
						<td><input type="text" name="nombrefallecido" required class="regular-text" value="<?php echo esc_attr( $get( 'nombrefallecido' ) ); ?>"></td>
					</tr>
					<tr>
						<th><label for="olvibg-tipo-velacion"><?php esc_html_e( 'Tipo de velación', 'los-olivos-ibague' ); ?> *</label></th>
						<td>
							<select name="tipo_velacion" id="olvibg-tipo-velacion" class="olvibg-tipo-velacion" required>
								<option value="SALA" <?php selected( $tipo_actual, OlvIbg_Obituarios_Repo::TIPO_SALA ); ?>>
									<?php esc_html_e( 'Velación en sala', 'los-olivos-ibague' ); ?>
								</option>
								<option value="RESIDENCIA" <?php selected( $tipo_actual, OlvIbg_Obituarios_Repo::TIPO_RESIDENCIA ); ?>>
									<?php esc_html_e( 'Velación en residencia', 'los-olivos-ibague' ); ?>
								</option>
							</select>
						</td>
					</tr>
					<tr class="olvibg-velacion-sala">
						<th><label><?php esc_html_e( 'Sede', 'los-olivos-ibague' ); ?> *</label></th>
						<td>
							<select name="sede" id="olvibg-sede">
								<option value=""><?php esc_html_e( '— Seleccionar —', 'los-olivos-ibague' ); ?></option>
								<?php foreach ( $sedes as $s ) : ?>
									<option value="<?php echo (int) $s->id; ?>" <?php selected( (int) $get( 'sede', 0 ) === (int) $s->id ); ?>>
										<?php echo esc_html( $s->nombre ); ?>
									</option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
					<tr class="olvibg-velacion-sala">
						<th><label><?php esc_html_e( 'Sala', 'los-olivos-ibague' ); ?> *</label></th>
						<td>
							<select name="sala" id="olvibg-sala" data-current="<?php echo (int) $get( 'sala', 0 ); ?>">
								<option value=""><?php esc_html_e( '— Seleccionar sede primero —', 'los-olivos-ibague' ); ?></option>
								<?php foreach ( $salas_all as $s ) : ?>
									<option value="<?php echo (int) $s->id; ?>" data-sede="<?php echo (int) $s->sede_id; ?>" <?php selected( (int) $get( 'sala', 0 ) === (int) $s->id ); ?>>
										<?php echo esc_html( $s->nombre ); ?>
									</option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
					<tr class="olvibg-velacion-residencia">
						<th><label><?php esc_html_e( 'Dirección de la residencia', 'los-olivos-ibague' ); ?> *</label></th>
						<td>
							<input type="text" name="salavelacion" class="regular-text" value="<?php echo esc_attr( $get( 'salavelacion' ) ); ?>" placeholder="Cra 5 #12-34, Barrio Centro">
							<p class="description"><?php esc_html_e( 'Dirección completa donde se realiza la velación.', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Municipio', 'los-olivos-ibague' ); ?> *</label></th>
						<td><input type="text" name="municipio" required class="regular-text" value="<?php echo esc_attr( $get( 'municipio', 'Ibagué' ) ); ?>"></td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Lugar de exequias', 'los-olivos-ibague' ); ?></label></th>
						<td><input type="text" name="lugarexequias" class="regular-text" value="<?php echo esc_attr( $get( 'lugarexequias' ) ); ?>" placeholder="Parroquia ..."></td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Destino final', 'los-olivos-ibague' ); ?></label></th>
						<td><input type="text" name="destinofinal" class="regular-text" value="<?php echo esc_attr( $get( 'destinofinal' ) ); ?>" placeholder="Cremación, Parque Memorial Los Olivos"></td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Fecha de fallecimiento', 'los-olivos-ibague' ); ?> *</label></th>
						<td><input type="datetime-local" name="fechafallecimiento" required value="<?php echo esc_attr( $dt( $get( 'fechafallecimiento' ) ) ); ?>"></td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Fecha y hora de exequias', 'los-olivos-ibague' ); ?> *</label></th>
						<td><input type="datetime-local" name="fechaexequias" required value="<?php echo esc_attr( $dt( $get( 'fechaexequias' ) ) ); ?>"></td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Fecha y hora de destino final', 'los-olivos-ibague' ); ?> *</label></th>
						<td>
							<input type="datetime-local" name="fechadestino" required value="<?php echo esc_attr( $dt( $get( 'fechadestino' ) ) ); ?>">
							<p class="description"><?php esc_html_e( 'Obligatorio. Tras esta fecha, el obituario se oculta automáticamente del feed público.', 'los-olivos-ibague' ); ?></p>
						</td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Estado', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<select name="estado">
								<option value="A" <?php selected( $get( 'estado', 'A' ), 'A' ); ?>><?php esc_html_e( 'Activo', 'los-olivos-ibague' ); ?></option>
								<option value="I" <?php selected( $get( 'estado', 'A' ), 'I' ); ?>><?php esc_html_e( 'Inactivo', 'los-olivos-ibague' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Asesor', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<select name="asesor">
								<option value="0"><?php esc_html_e( '— Sin asignar —', 'los-olivos-ibague' ); ?></option>
								<?php foreach ( $users as $u ) : ?>
									<option value="<?php echo (int) $u->ID; ?>" <?php selected( (int) $get( 'asesor', 0 ) === (int) $u->ID ); ?>>
										<?php echo esc_html( $u->display_name ); ?>
									</option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
					<tr>
						<th><label><?php esc_html_e( 'Fotos', 'los-olivos-ibague' ); ?></label></th>
						<td>
							<div id="olvibg-fotos-wrap">
								<button type="button" class="button" id="olvibg-fotos-btn"><?php esc_html_e( 'Seleccionar fotos', 'los-olivos-ibague' ); ?></button>
								<p class="description"><?php esc_html_e( 'Las fotos se suben a la Galería de WP. Arrastra para reordenar.', 'los-olivos-ibague' ); ?></p>
								<ul id="olvibg-fotos-list" class="olvibg-fotos-list">
									<?php foreach ( $fotos as $f ) :
										$url = wp_get_attachment_image_url( (int) $f->attachment_id, 'thumbnail' );
										if ( ! $url ) continue;
									?>
										<li data-id="<?php echo (int) $f->attachment_id; ?>">
											<img src="<?php echo esc_url( $url ); ?>" alt="">
											<button type="button" class="olvibg-foto-remove" aria-label="<?php esc_attr_e( 'Quitar', 'los-olivos-ibague' ); ?>">&times;</button>
											<input type="hidden" name="foto_ids[]" value="<?php echo (int) $f->attachment_id; ?>">
										</li>
									<?php endforeach; ?>
								</ul>
							</div>
						</td>
					</tr>
				</table>

				<p>
					<button type="submit" class="button button-primary"><?php esc_html_e( 'Guardar obituario', 'los-olivos-ibague' ); ?></button>
					<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=olvibg-obituarios' ) ); ?>"><?php esc_html_e( 'Volver', 'los-olivos-ibague' ); ?></a>
				</p>
			</form>
		</div>
		<?php
	}

	public static function handle_save() {
		check_admin_referer( 'olvibg_obituario_save' );
		if ( ! current_user_can( OlvIbg_Admin_Menu::CAPABILITY ) ) {
			wp_die( esc_html__( 'No autorizado', 'los-olivos-ibague' ) );
		}

		$id   = (int) ( $_POST['id'] ?? 0 );
		$data = array(
			'nombrefallecido'    => $_POST['nombrefallecido'] ?? '',
			'tipo_velacion'      => $_POST['tipo_velacion'] ?? OlvIbg_Obituarios_Repo::TIPO_SALA,
			'sede'               => $_POST['sede'] ?? 0,
			'sala'               => $_POST['sala'] ?? 0,
			'municipio'          => $_POST['municipio'] ?? '',
			'salavelacion'       => $_POST['salavelacion'] ?? '',
			'lugarexequias'      => $_POST['lugarexequias'] ?? '',
			'destinofinal'       => $_POST['destinofinal'] ?? '',
			'fechafallecimiento' => $_POST['fechafallecimiento'] ?? '',
			'fechaexequias'      => $_POST['fechaexequias'] ?? '',
			'fechadestino'       => $_POST['fechadestino'] ?? '',
			'estado'             => $_POST['estado'] ?? 'A',
			'asesor'             => $_POST['asesor'] ?? 0,
		);

		$repo = new OlvIbg_Obituarios_Repo();
		if ( $id > 0 ) {
			$repo->update( $id, $data );
		} else {
			$id = $repo->insert( $data );
		}

		$fotos = isset( $_POST['foto_ids'] ) && is_array( $_POST['foto_ids'] )
			? array_map( 'absint', $_POST['foto_ids'] )
			: array();
		$repo->set_fotos( $id, $fotos );

		wp_safe_redirect( admin_url( 'admin.php?page=olvibg-obituarios&updated=1' ) );
		exit;
	}
}
