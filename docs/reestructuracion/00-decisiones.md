# Registro de Decisiones de Arquitectura (Fase 0.10)

## Decisión 1: Elementos de Configuración / CIs (N5)
- **Hallazgo:** Se constató en el código y en la base de datos la existencia de la tabla `elemento_configuracion` (25 registros existentes) y el componente integral `src/modules/cmdb/views/VistaCmdb.tsx` renderizado actualmente en `src/app/plataforma/cmdb/page.tsx`. Esta interfaz ya incluye listado con filtros (tipo, criticidad, ambiente, estado), formulario de alta/edición, vinculación de dependencias y desactivación con motivo.
- **Veredicto:** **Caso A**. Existe la pantalla funcional. Se establece la nueva fila de menú institucional «CIs (elementos de configuración)» apuntando a `/plataforma/cmdb/cis` (reutilizando el componente canónico `VistaCmdb`), garantizando su presencia en el sub-agrupador CMDB (#21133) sin necesidad de construir código desde cero.

## Decisión 2: Credencial temporal con cambio obligatorio (`debe_cambiar_clave` - N6)
- **Hallazgo:** La tabla `usuarios` no posee la columna `debe_cambiar_clave`.
- **Veredicto:** Se creará mediante migración DDL la columna `debe_cambiar_clave BOOLEAN DEFAULT false`. Se incorporará la validación en el flujo de inicio de sesión (`/api/auth/login`) para interceptar al usuario y obligarlo a cambiar su clave si `debe_cambiar_clave === true`. Al dar de alta o resetear contraseña desde «Usuarios» (#21209), el administrador visualizará la contraseña temporal generada en pantalla una única vez.

## Decisión 3: Recuperación de contraseña por correo
- **Hallazgo:** Existen las rutas `/api/auth/recuperar-clave/solicitar`, `/verificar`, `/cambiar` y la tabla `codigo_recuperacion`.
- **Veredicto:** En cumplimiento con la regla de producto de erradicar canales de comunicación externos no autorizados (Fase 2), estas rutas y la recuperación autónoma por correo se **eliminan**. El restablecimiento de contraseñas lo realiza un Administrador desde la pantalla «Usuarios» (#21209) generando credenciales temporales.

## Decisión 4: Aterrizaje tras login (Post-Login)
- **Hallazgo:** Actualmente el login envía a `/plataforma/dashboard` o a paneles por perfil.
- **Veredicto:** El destino canónico posterior a la autenticación será unificado a `/plataforma/inicio` (pantalla N3). La vista por defecto que cargará dicha pantalla corresponderá exactamente a la vista autorizada para el perfil activo del usuario:
  - Solicitante -> `solicitante`
  - Técnico -> `tecnico`
  - Supervisor -> `supervisor`
  - Gestor de Área -> `area`
  - Auditor -> `auditor`
  - Aprobador -> `aprobador`
  - Gestor de Cambios -> `gestion-cambios`
  - Gestor de Activos -> `gestion-activos`
  - Gestor de Problemas -> `gestion-problemas`
  - Administrador -> `administrador`

## Decisión 5: Importación masiva de activos
- **Hallazgo:** La ruta `/plataforma/activos/importacion` renderiza un componente de página completa: `VistaImportacionActivos`.
- **Veredicto:** En la pantalla unificada `/plataforma/activos/inventario`, la vista `importar` integrará e incrustará directamente el componente `VistaImportacionActivos`, accesible únicamente para usuarios autorizados con dicha vista.

## Decisión 6: Esquema de permisos para infraestructura de vistas (N1)
- **Hallazgo:** `opciones_menu_perfiles` modela permisos a nivel de ID de menú. Aunque existen capacidades en `capacidades.ts`, no existe granularidad para las 107 vistas específicas definidas en el Anexo C.
- **Veredicto:** **Camino B (Defecto y Mandatorio)**. Se implementa la tabla relacional `opciones_menu_vistas_perfiles (opcion_id, perfil_id, vista, PK compuesta, FKs)` para controlar las concesiones de cada vista de forma segura, estricta e independiente, eliminando cualquier riesgo de escalada de privilegios al fusionar pantallas.
