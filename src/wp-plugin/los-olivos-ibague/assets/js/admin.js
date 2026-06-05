(function ($) {
	'use strict';

	$(function () {
		setupTipoVelacionToggle();
		setupSedeSalaFilter();
		setupFotosGallery();
	});

	function setupTipoVelacionToggle() {
		var $select = $('#olvibg-tipo-velacion');
		if (!$select.length) return;

		var $rowsSala       = $('.olvibg-velacion-sala');
		var $rowsResidencia = $('.olvibg-velacion-residencia');
		var $sede           = $('#olvibg-sede');
		var $sala           = $('#olvibg-sala');
		var $direccion      = $rowsResidencia.find('input[name="salavelacion"]');

		function apply(tipo) {
			if (tipo === 'RESIDENCIA') {
				$rowsSala.hide();
				$rowsResidencia.show();
				$sede.prop('required', false);
				$sala.prop('required', false);
				$direccion.prop('required', true);
			} else {
				$rowsSala.show();
				$rowsResidencia.hide();
				$sede.prop('required', true);
				$sala.prop('required', true);
				$direccion.prop('required', false);
			}
		}

		$select.on('change', function () { apply($select.val()); });
		apply($select.val() || 'SALA');
	}

	function setupSedeSalaFilter() {
		var $sede = $('#olvibg-sede');
		var $sala = $('#olvibg-sala');
		if (!$sede.length || !$sala.length) return;

		var current = parseInt($sala.data('current'), 10) || 0;

		function refresh() {
			var sedeId = parseInt($sede.val(), 10) || 0;
			$sala.find('option').each(function () {
				var $opt = $(this);
				if (!$opt.val()) {
					$opt.text(window.OLVIBG && OLVIBG.i18n ? '— —' : '—');
					$opt.prop('disabled', false).show();
					return;
				}
				var optSede = parseInt($opt.data('sede'), 10);
				var visible = optSede === sedeId;
				$opt.toggle(visible).prop('disabled', !visible);
			});
			var $selected = $sala.find('option:selected');
			if (!$selected.length || $selected.prop('disabled')) {
				$sala.val('');
			}
		}

		$sede.on('change', refresh);
		refresh();

		if (current) {
			$sala.val(String(current));
		}
	}

	function setupFotosGallery() {
		var $list = $('#olvibg-fotos-list');
		var $btn  = $('#olvibg-fotos-btn');
		if (!$list.length || !$btn.length) return;

		$list.sortable({ items: '> li', placeholder: 'olvibg-foto-placeholder' });

		$list.on('click', '.olvibg-foto-remove', function (e) {
			e.preventDefault();
			$(this).closest('li').remove();
		});

		var frame;
		$btn.on('click', function (e) {
			e.preventDefault();
			if (frame) {
				frame.open();
				return;
			}
			frame = wp.media({
				title: (window.OLVIBG && OLVIBG.i18n && OLVIBG.i18n.selectPhotos) || 'Seleccionar fotos',
				button: { text: (window.OLVIBG && OLVIBG.i18n && OLVIBG.i18n.usePhotos) || 'Usar estas fotos' },
				library: { type: 'image' },
				multiple: true
			});

			frame.on('select', function () {
				var sel = frame.state().get('selection');
				var existing = {};
				$list.find('li').each(function () {
					existing[$(this).data('id')] = true;
				});
				sel.each(function (att) {
					var data = att.toJSON();
					if (existing[data.id]) return;
					var thumb = (data.sizes && data.sizes.thumbnail && data.sizes.thumbnail.url) || data.url;
					var $li = $(
						'<li data-id="' + data.id + '">' +
						'<img src="' + thumb + '" alt="">' +
						'<button type="button" class="olvibg-foto-remove" aria-label="Quitar">&times;</button>' +
						'<input type="hidden" name="foto_ids[]" value="' + data.id + '">' +
						'</li>'
					);
					$list.append($li);
				});
			});

			frame.open();
		});
	}
})(jQuery);
