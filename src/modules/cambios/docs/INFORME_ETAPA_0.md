# INFORME ETAPA 0 — Reconocimiento y Pre-vuelo: Gestión de Cambios (RFC)

> **Documento normativo:** `DOCUMENTACIÓN/prompt_2_config_gestion_de_cambios.md` (v3.0)  
> **Fecha:** 2026-10-21  
> **Módulo:** `src/modules/cambios`  
> **Estado:** Completado para validación previa a Etapa A  

---

## 1. Estructura actual de `src/modules/cambios`

El módulo `cambios` implementa la arquitectura **Vertical Slice**. Su estructura interna actual es:

```
src/modules/cambios/
├── api/                                  # Controladores API del módulo
├── components/                           # Componentes operativos de cambios
├── config/                               # Configuración del proceso (4 pantallas)
│   ├── formulario/                       # Configuración de formulario de RFC
│   │   ├── components/                   # Pestañas (Campos, Catalogos, Cuestionario, Plantillas, etc.)
│   │   └── VistaFormularioCambio.tsx
│   ├── tipos-requisitos/                 # Tipos de cambio y requisitos
│   │   ├── components/                   # Pestañas (Tipos, Matriz Autoridad, Modelos, Clasificación)
│   │   └── VistaTiposRequisitos.tsx
│   ├── flujo-evaluacion/                 # Flujo, comités y aprobaciones
│   │   ├── components/                   # Pestañas (Estados, Transiciones, Etapas, Comités, PIR, etc.)
│   │   └── VistaFlujoEvaluacion.tsx
│   └── notificaciones-calendario/        # Notificaciones, ventanas y congelamiento
│       ├── components/                   # Pestañas (Notificaciones, Ventanas, Congelamiento, Feriados, etc.)
│       └── VistaNotificacionesCalendario.tsx
├── docs/                                 # Documentación técnica y contratos
│   ├── INFORME_ETAPA_0.md
│   └── SOLICITUDES_A_OTROS_MODULOS.md
├── gestion/                              # Vistas y paneles operativos de gestión de cambios
├── hooks/                                # Hooks específicos del dominio
├── permissions/                          # Helpers de permisos locales
├── presentadores/                        # Presentadores de RFC
├── services/                             # Lógica de dominio y acceso a PostgreSQL
├── views/                                # Vistas principales del módulo
└── index.ts                              # Contrato público de servidor (exporta 48 símbolos)
```

* **Nota de nomenclatura:** El módulo utiliza la subcarpeta `config/` (máximo 3 palabras por directorio), alineada con la convención del proyecto y el módulo hermano `problemas`.
* **Contrato UI (`ui.ts`):** Actualmente no existe en `cambios`. Se creará `src/modules/cambios/ui.ts` exportando las vistas administrativas y componentes compartidos para consumo de cascarones y otros módulos.

---

## 2. Matriz de Prioridad Institucional

* **Ubicación:** `src/modules/servicios/services/slaService.ts` y tabla `matriz_prioridad_institucional` en PostgreSQL.
* **Consumo:** Función `calcularPrioridadITIL(idImpacto, idUrgencia)` proveniente del núcleo compartido.
* **Comportamiento en Cambios:** Cuando `usar_matriz_propia = false`, los cambios calculan su prioridad exactamente igual que los incidentes y problemas (P1–P4). Si se activa la matriz propia para cambios, opera como una tabla de anulación (`cambio_config_matriz`) sin duplicar el motor central de cálculo.

---

## 3. Motor de SLA y Calendarios Hábiles

* **Ubicación:** Centralizado en `src/modules/servicios/services/slaService.ts` con la función `calcularFechaLimiteHorasHabilesAsync`.
* **Horario y Feriados:** El motor descuenta fines de semana y feriados institucionales registrados en la tabla `calendario_feriados`.
* **Tabla Compartida:** La tabla `calendario_feriados` ya existe en PostgreSQL (11 columnas: `id`, `fecha_inicio`, `fecha_fin`, `nombre`, `tipo`, `alcance`, `sede_id`, `recurrente_anual`, `activo`, auditoría). Se reutiliza directamente en la pestaña de feriados sin crear estructuras paralelas.

---

## 4. Componentes Reutilizables y Visibilidad

* **Barra de Acciones y Modales:** Centralizados en `@/shared/components/admin/BarraAccionesComun` y `@/shared/components/admin/ModalPublicacion`. Las vistas importarán directamente desde `@/shared/components/admin/`.
* **Iconos:** Centralizados en `@/shared/components/ui/Iconos`. Se eliminarán los archivos locales duplicados `src/modules/cambios/config/flujo-evaluacion/components/Iconos.tsx` y `src/modules/cambios/config/notificaciones-calendario/components/Iconos.tsx`.
* **Alertas y Validaciones:** `@/shared/components/ui/AlertaCampo` se utiliza para la presentación de errores en formularios.

---

## 5. Capacidades y Perfiles (RBAC)

* **Capacidades existentes en `src/shared/lib/capacidades.ts`:**
  * `CAMBIOS_VER`: Lectura de cambios.
  * `CAMBIOS_CREAR`: Creación de RFC.
  * `CAMBIOS_EDITAR`: Modificación de RFC.
  * `CAMBIOS_EVALUAR`: Evaluación de cambios.
  * `CAMBIOS_APROBAR`: Aprobación de etapas.
  * `CAMBIOS_PROGRAMAR`: Programación de ventanas.
  * `CAMBIOS_IMPLEMENTAR`: Ejecución técnica de cambio.
  * `CAMBIOS_CONFIG_VER`: Acceso de lectura a pantallas de configuración.
  * `CAMBIOS_CONFIG_PUBLICAR`: Publicación oficial de versiones de configuración.
* **Guardas:**
  * Páginas: Deben usar `exigirCapacidadPagina(CAPACIDADES.CAMBIOS_CONFIG_VER)`.
  * Controladores API: Ya utilizan `sesionConCapacidad(CAPACIDADES.CAMBIOS_CONFIG_VER)`.
* **Soporte Deep Linking (`?vista=`):**
  * El Gestor de Cambios accede a enlaces directos:
    * `/plataforma/admin/procesos/cambios/notificaciones-calendario?vista=feriados`
    * `/plataforma/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento`
    * `/plataforma/admin/procesos/cambios/notificaciones-calendario?vista=ventanas`
  * `VistaNotificacionesCalendario.tsx` se actualizará con `useSearchParams` para activar automáticamente la pestaña indicada y filtrar las pestañas visibles según el perfil autenticado.

---

## 6. Estado de Base de Datos (PostgreSQL Supabase)

Todas las tablas requeridas por el Prompt 2 ya existen en PostgreSQL con su esquema completo:

| Tabla | Columnas | Propósito |
|---|---|---|
| `cambio` | 28 columnas | Expediente de RFC, campos ITIL, ventanas, CMDB y resultados |
| `cambio_aprobacion` | 7 columnas | Registro de etapas de aprobación y decisiones |
| `cab_reunion` | 10 columnas | Reuniones, agendas y actas del comité CAB |
| `ecab_decision` | 8 columnas | Decisiones aceleradas del comité de emergencia |
| `periodos_congelamiento` | 20 columnas | Intervalos de restricción, severidad y alcances |
| `ventanas_mantenimiento` | 27 columnas | Recurrencias, capacidades, horarios y alcances |
| `calendario_feriados` | 11 columnas | Feriados nacionales e institucionales compartidos con SLA |
| `cambio_catalogo_item` | 16 columnas | Catálogos configurables del proceso de cambios |
| `cambio_modelo_estandar` | 39 columnas | Modelos de cambio estándar preaprobados y estadísticas |
| `cambio_plantilla` | 17 columnas | Plantillas institucionales de RFC |
| `cambio_excepcion` | 7 columnas | Excepciones a conflictos y ventanas |
| `configuracion_modulo_versiones` | 11 columnas | Historial de versiones, snapshots JSONB y borradores |

---

## 7. Tabla de Diferencias y Hallazgos Críticos

| Elemento | Estado Actual | Acción a Ejecutar |
|---|---|---|
| Cascarones `src/app/plataforma/admin/procesos/cambios/*/components/` | Existen 28 componentes duplicados e inactivos | Eliminar las carpetas de componentes huérfanos |
| Guardia en `src/app/plataforma/admin/procesos/cambios/*/page.tsx` | Faltaba `exigirCapacidadPagina` | Implementar `exigirCapacidadPagina(CAPACIDADES.CAMBIOS_CONFIG_VER)` |
| Redirección en `src/app/plataforma/admin/procesos/cambios/page.tsx` | Redirigía a `/admin/procesos/cambios/formulario` | Redirigir a `/plataforma/admin/procesos/cambios/formulario` |
| Rutas y breadcrumbs en vistas | Contenían `/admin/...`, `/admin/procesos/cambios`, `/cambios/...` | Unificar a URLs canónicas completas `/plataforma/...` |
| Badges de versión en títulos | Etiquetas `1.3.3.1`, `1.3.3.2`, etc. | Retirar códigos legados y conservar títulos limpios |
| `Iconos.tsx` locales en `flujo-evaluacion` y `notificaciones-calendario` | Reexportaban iconos | Eliminar y usar `@/shared/components/ui/Iconos` |
| Parámetro `?vista=` en `VistaNotificacionesCalendario.tsx` | No leía query string | Implementar `useSearchParams` para pestañas dinámicas |

---

## 8. Respuestas a las Preguntas Abiertas

1. **Pantallas operativas complementarias:** Se preservan y enlazan las vistas operativas existentes (`/plataforma/cambios/gestion/...` y `PresentadorRfcAprobador`).
2. **Matriz propia de cambios:** Opera como un override local sobre la celda impacto × urgencia en caso de activación, garantizando que el motor central ITIL no sea duplicado.
3. **Criticidad y responsable de servicios:** `servicio_catalogo` provee el nivel de criticidad para evaluación automática de riesgo; el responsable se vincula al grupo/propietario técnico.
4. **Relaciones CMDB (`ci_relacion`):** Se utiliza `ci_relacion` con profundidad 1 para detección de colisiones de servicio; para relaciones complejas se documenta degradación elegante en SC-8.
5. **Estrategia de pruebas:** Reglas de SoD, quórum, congelamiento y transiciones verificadas mediante funciones puras, sumadas al gate de compilación de producción `npm run build` (0 errores).
