=== Los Olivos Ibague ===
Contributors: brivalabs
Author URI: https://www.brivalabs.com
Tags: obituarios, condolencias, contacto, funeraria, rest-api
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Backend de Los Olivos: obituarios, registros de defunción, condolencias y formularios de contacto. Expone endpoints REST para el frontend Angular.

== Description ==

Este plugin centraliza la gestión de:

* **Obituarios** con galería de fotos (Media Library de WP). Visibilidad automática según la fecha de exequias.
* **Registros de defunción** con CRUD completo.
* **Condolencias** con flujo de moderación (pendiente / aprobada / rechazada).
* **Formularios de contacto** con notificación por email y exportación CSV.
* **Sedes y Salas** como catálogos editables (sede 1:N salas).

Los endpoints REST viven bajo el namespace `serfuncoop/v1`:

* `GET /wp-json/serfuncoop/v1/obituarios`
* `GET /wp-json/serfuncoop/v1/registros-defuncion`
* `POST /wp-json/serfuncoop/v1/contacto`
* `POST /wp-json/serfuncoop/v1/condolencias`
* `POST /wp-json/serfuncoop/v1/payment-login` — proxy de login a la pasarela pública de pagos (Olivos Web Gateway). Guarda las credenciales server-side y devuelve el enlace firmado con JWT que el frontend abre en una pestaña nueva.

== Installation ==

1. Comprime la carpeta `los-olivos-ibague/` en un `.zip`.
2. En WP Admin → Plugins → Añadir nuevo → Subir, sube el `.zip` y actívalo.
3. Al activar se crean 7 tablas con prefijo `{wp_prefix}olvibg_`.
4. En el menú "Los Olivos" → "Sedes y Salas" registra primero las sedes y luego sus salas.
5. En "Ajustes" configura el email de notificaciones, los orígenes CORS permitidos y las credenciales de la pasarela de pagos (URL, usuario y contraseña). Al activar se siembran los valores sandbox de Ibagué; también pueden forzarse con las constantes `OLVIBG_PAYMENT_USERNAME` y `OLVIBG_PAYMENT_PASSWORD` en `wp-config.php`.

== Changelog ==

= 1.0.0 =
* Versión inicial.
