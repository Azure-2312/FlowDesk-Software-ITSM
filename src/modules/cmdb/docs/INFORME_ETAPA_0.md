# INFORME ETAPA 0 — Reconocimiento y Auditoría Técnica: Módulo CMDB

**Fecha:** 22 de Octubre de 2026  
**Módulo:** `src/modules/cmdb`  
**Referencia:** Prompt 3 de 3 — Versión 3.0 (ITIL 4 Service Configuration Management, ISO/IEC 20000-1 §8.2.6)

---

## 1. Estructura de la CMDB y Modelo de Datos

- **Tabla `elemento_configuracion` (18 columnas):** Entidad central de los CIs. Mantiene atributos base: `id_ci`, `codigo_ci`, `nombre`, `id_tipo_ci`, `id_activo` (puente opcional al inventario físico), `criticidad`, `entorno`, `estado_registro`, etc.
- **Tabla `tipo_ci` (10 columnas):** Catálogo de clases y tipos de CI con esquemas de atributos requeridos (`atributos_requeridos jsonb`) y reglas de impacto.
- **Tabla `ci_relacion` (12 columnas):** Grafo de topología entre CIs (`id_ci_origen`, `id_ci_destino`, `tipo_relacion`, `vigencia_desde`, `vigencia_hasta`, `estado_registro`).
- **Gobierno de la Configuración:**
  - `cmdb_linea_base`: Instantáneas autorizadas de configuración.
  - `cmdb_inexactitud`: Reportes de discrepancias detectadas por auditoría o monitoreo.
  - `cmdb_actualizacion`: Cambios aplicados a la CMDB derivados de RFCs aprobados.

---

## 2. Estructura de Código y Separación de Módulos

- **Vertical Slice:** Toda la lógica de CMDB reside en `src/modules/cmdb/`.
- **Independencia de Módulos:** `src/modules/cmdb` **no importa** archivos de `src/modules/activos`. La correlación se realiza estrictamente a nivel de consulta por el campo `id_activo`.
- **Pantalla 1.5.4:** Implementada en `src/modules/cmdb/config/cmdb-relaciones/` y montada en `/plataforma/admin/activos-config/cmdb-relaciones`.

---

## 3. Catálogo de Entornos y Criticidades (Sección 12.0)

- **Dueño Canónico:** El módulo `cmdb` es el dueño de la taxonomía de entornos (Producción, Preproducción, Calidad/Testing, Desarrollo) y criticidades (Crítica, Alta, Media, Baja).
- **Consumo Externo:** El módulo de Cambios (RFC) y de Incidentes consumen estas definiciones a través del contrato público de `@/modules/cmdb`.

---

## 4. Calidad y Validación

- Control de integridad referencial bidireccional en relaciones.
- Detección de ciclos prohibidos y validación de tipos de relación autorizados.
