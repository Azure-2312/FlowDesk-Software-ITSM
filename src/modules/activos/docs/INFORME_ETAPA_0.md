# INFORME ETAPA 0 — Reconocimiento y Auditoría Técnica: Módulo Activos (ITAM / SAM)

**Fecha:** 22 de Octubre de 2026  
**Módulo:** `src/modules/activos`  
**Referencia:** Prompt 3 de 3 — Versión 3.0 (Marco ITIL v4, ISO/IEC 20000-1, ISO/IEC 19770-1, ISO/IEC 27001)

---

## 1. Estructura Actual de Activos y CI (Puente de Datos)

- **Tabla `activo` (24 columnas):** Contiene el inventario físico y lógico con ciclo de vida ITAM. Incluye `id_activo` (PK), `codigo_patrimonial`, `numero_serie`, `tipo_activo`, `marca`, `modelo`, `id_departamento`, `id_usuario_custodio`, `ubicacion`, `estado`, `fecha_adquisicion`, `costo_compra`, `garantia_meses`, `valor_residual`, `vida_util_meses`, `campos_adicionales` (`jsonb`), etc.
- **Tabla `elemento_configuracion` (18 columnas):** Representa el ítem de configuración CMDB. Incluye `id_ci` (PK), `codigo_ci`, `nombre`, `id_tipo_ci`, `id_activo` (FK nullable hacia `activo`), `ip_principal`, `hostname`, `criticidad`, `entorno`, etc.
- **Puente por Datos:** Opción B canónica: `elemento_configuracion.id_activo -> activo.id_activo`. No existe una tercera tabla maestra y no hay duplicación de atributos de propiedad vs configuración.
- **Selector de CI en Incidentes:** Realiza consultas basadas en el custodio (`id_usuario_custodio` y `id_activo`), garantizando que los usuarios puedan asociar sus equipos asignados a tickets de soporte sin alterar el esquema.

---

## 2. Estructura de `src/modules/activos` y `src/modules/cmdb`

- **Módulo `activos`:**
  - `src/modules/activos/index.ts`: Contrato público del servidor exportando servicios de activos, modelos, tipos, licencias, asignaciones y configuraciones 1.5.1, 1.5.2, 1.5.3.
  - `src/modules/activos/config/`: Contiene las vistas `VistaTiposModelosAtributos.tsx`, `VistaCiclosVidaTransiciones.tsx`, `VistaLicenciasContratos.tsx` y sus componentes `Pestana*.tsx`.
  - `src/modules/activos/api/admin/`: Controladores de configuración (`tiposModelosAtributosConfiguracionController.ts`, `ciclosVidaTransicionesConfiguracionController.ts`, `licenciasContratosConfiguracionController.ts`).
  - `src/modules/activos/services/`: Servicios de lógica de negocio y SQL parametrizado.
- **Módulo `cmdb`:**
  - `src/modules/cmdb/index.ts`: Contrato público del servidor exportando servicios de CI, tipos, relaciones, análisis de topología/impacto, auditoría y configuración 1.5.4.
  - `src/modules/cmdb/config/cmdb-relaciones/`: Vista `VistaCmdbRelaciones.tsx` y sus 6 componentes `Pestana*.tsx`.
  - `src/modules/cmdb/api/admin/`: Controlador `cmdbRelacionesConfiguracionController.ts` y `cmdbTiposController.ts`.

---

## 3. Componentes Reutilizables y Visibilidad de Contrato

- **Patrón Común de Configuración:** `BarraAccionesComun`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`, `ModalVistaPrevia`.
- **Iconografía y Botones:** Iconos de trazo lineal uniforme SVG (Lucide/Feather, 16x16px), botones de acción en filas de 32x32px (`.boton-accion-icono`) con solo icono y tooltips accesibles (`title`, `aria-label`).
- **Validaciones:** Funciones puras con catálogo de validadores 3C (`V-CODIGO`, `V-NOMBRE`, `V-TEXTO`, etc.) y alertas mediante `AlertaCampo` (`role="alert"`).

---

## 4. Capacidades y Perfiles (SoD)

- **Capacidades Declaradas en `src/shared/lib/capacidades.ts`:**
  - `activos:ver`, `activos:gestionar`, `activos:configurar`
  - `licencias:ver`, `licencias:asignaciones:ver`, `licencias:gestionar`
  - `cmdb:ver`, `cmdb:gestionar`
- **Capacidades Específicas Requeridas (Sección 10 / SA-2):**
  - Se definen para `activos:config:ver`, `activos:config:editar`, `activos:config:publicar`, `licencias:config:*`, `contratos:config:*`.
  - El perfil **Administrador (1)** posee capacidades de configuración total.
  - El perfil **Gestor de Activos (9)** posee capacidades operativas completas y acceso a las vistas de catálogo asignadas.

---

## 5. Tablas Existentes Relacionadas

- `contrato_ti` (12 columnas): Gestión de contratos con proveedores y coberturas.
- `licencia_software` (14 columnas) y `licencia_asignacion` (9 columnas): SAM y cumplimiento.
- `ubicacion` (14 columnas): Jerarquía de sedes, pisos, ambientes y racks.
- `mantenimiento_activo` (12 columnas): Bitácora técnica y órdenes de servicio.
- `solicitud_baja_activo` (14 columnas): Workflow de disposición y borrado seguro.
- `acta_entrega` (10 columnas): Evidencias formales de asignación y firmas.
- `configuracion_modulo_versiones`: Snapshot inmutable y versionado JSON.
- `bloqueo_edicion_concurrente`: Bloqueo de concurrencia con caducidad a 15 min.

---

## 6. Estado del Módulo Operativo

- Inventario de Activos (`/plataforma/activos/inventario`): Operativo con filtros por clase y estado.
- Mis Activos (`/plataforma/activos/mis-activos`): Operativo para perfil Solicitante.
- Consola de Gestor de Activos (`/plataforma/gestor-activos/*`): Paneles de recepción, inventario físico, asignaciones y bajas.
- Relaciones CMDB (`/plataforma/activos/cmdb`): Visualización de topología y dependencias.

---

## 7. Capacidades Técnicas y Cifrado

- **PDF y Etiquetas:** Uso de generación SVG y HTML imprimible nativo para fichas y etiquetas patrimoniales con QR vectorial sin dependencias externas pesadas.
- **Datos Sensibles:** Máscara en cliente (`●●●●●●●●`) y hash/cifrado de claves de licencia en base de datos.
- **Almacenamiento de Adjuntos:** Metadatos en tabla y almacenamiento seguro.

---

## 8. Cumplimiento de la Sección 13 (Modelo de Datos)

- Las tablas base ya existen en la base de datos de Supabase.
- Se asegura la integridad referencial y las transiciones mediante validación estricta en la capa de servicios (`*Service.ts`).

---

## 9. Respuestas a Preguntas Abiertas (Sección 15)

1. **Pantallas operativas de 2.4:** Se asegura la integración y congruencia de los contratos de datos entre la configuración y las pantallas operativas existentes.
2. **Librería de PDF y QR:** Se adopta renderizado estándar nativo compatible con navegadores modernos para etiquetas y actas sin alterar `package.json`.
3. **Proveedores:** Se consume el catálogo de proveedores existente mediante degradación elegante de solo lectura si no se requiere edición.
4. **Cifrado de datos sensibles:** Enmascaramiento por defecto y almacenamiento protegido.
5. **Desactivación de usuarios:** Advertencia en consola de activos pendientes de devolución cuando un usuario es desvinculado.
6. **Pruebas:** Funciones puras verificadas para transiciones de ciclo de vida y validaciones de unicidad de serie/código.
