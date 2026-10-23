# Informe de Etapa 0 — Reconocimiento de Código y Base de Datos (Gestión de Problemas)

**Fecha:** 2026-10-21  
**Módulo:** `src/modules/problemas`  
**Documento base:** `DOCUMENTACIÓN/prompt_1_config_gestion_de_problemas.md` (v3.0)  
**Arquitectura de referencia:** `DOCUMENTACIÓN/ARQUITECTURA_Y_CODIGO.md` y `DOCUMENTACIÓN/MENUS_Y_PERFILES.md`

---

## 1. Estructura Actual de `src/modules/problemas`

El módulo se encuentra estructurado bajo el patrón **Vertical Slice**:

```
src/modules/problemas/
├── index.ts                       # Contrato público del módulo en servidor
├── api/                           # Controladores de endpoints operativos y de administración
│   ├── admin/                     # Controladores de configuración (formulario, flujo, relaciones, etc.)
│   └── ...                        # Controladores de endpoints de gestión operativa
├── components/                    # Componentes compartidos del módulo (ProblemasWorkspace.tsx)
├── config/                        # Carpeta equivalente a 'configuracion/' (regla de nombres concisos <= 3 palabras)
│   ├── formulario/                # Vista y pestañas de Configuración de Formulario (1.3.3.1)
│   ├── flujo/                     # Vista y pestañas de Flujo de Investigación (1.3.3.2)
│   ├── relaciones/                # Vista y pestañas de Relaciones e Integraciones (1.3.3.3)
│   └── hub/                       # Vista puente del módulo de administración
├── hooks/                         # Hooks de consulta y mutación
├── permissions/                   # Reglas de validación de permisos
├── presentadores/                 # Presentadores de detalle de problema
├── services/                      # Servicios de dominio con consultas SQL parametrizadas a @/shared/lib/db
└── views/                         # Vistas de operación (análisis RCA, candidatos, recurrentes, KEDB, etc.)
```

### Hallazgo de la carpeta de configuración:
- La carpeta ya existe en el repositorio y se denomina **`config/`** (no `configuracion/`).
- De acuerdo con la sección 0A del Prompt 1 (*"si la Etapa 0 encuentra una equivalente ya existente, úsala; no dupliques"*), **se preserva `src/modules/problemas/config/`**.
- Se creará `src/modules/problemas/ui.ts` para exponer componentes de interfaz hacia otros módulos (ej. `BloqueObjetivosProblemas`).

---

## 2. Matriz de Prioridad

- **Ubicación:** `src/modules/problemas/services/matrizPrioridadService.ts`.
- **Persistencia:** Tabla `matriz_prioridad_institucional` con discriminador `entidad` (`'compartida'` vs `'problema'`).
- **Comportamiento:**
  - Por defecto (`usar_matriz_propia = false`), el cálculo de prioridad utiliza la matriz institucional compartida calculada por `calcularPrioridadITIL` en `src/modules/tickets`.
  - Cuando `usar_matriz_propia = true`, el módulo lee las celdas específicas de `matriz_prioridad_institucional WHERE entidad = 'problema'`, persistidas a través de `configuracion_sistema (matriz_problemas_config)`.
- **Cumplimiento:** No se genera ningún motor duplicado; opera como tabla de anulación local controlada por el módulo.

---

## 3. Motor de SLA y Cómputo de Horas Hábiles

- **Ubicación:** Centralizado en `src/shared/lib/sla.ts` y expuesto por contrato en `@/modules/servicios`.
- **Parámetros institucionales (RN-10):**
  - Horario hábil: Lunes a Viernes de 08:00 a 18:00 (10 horas hábiles/día).
  - Descuento de fines de semana y feriados de `calendario_feriados` + `FERIADOS_INSTITUCIONALES_RECURRENTES`.
- **Pausas y detención por estado:**
  - La tabla `problema_estado` contiene las columnas `pausa_reloj_diagnostico`, `pausa_reloj_resolucion`, `detiene_reloj_diagnostico` y `detiene_reloj_resolucion`.
  - La fecha límite efectiva de los objetivos se calcula dinámicamente con `calcularFechaLimiteHorasHabilesAsync` sumando las horas hábiles configuradas en `problema_objetivo_tiempo`.

---

## 4. Componentes Reutilizables y Visibilidad

- **Componentes comunes de administración:**
  - `BarraAccionesComun`: Ubicado en `@/shared/components/admin/BarraAccionesComun`.
  - `ModalPublicacion`: Ubicado en `@/shared/components/admin/ModalPublicacion`.
  - `AlertaCampo`: Ubicado en `@/shared/components/ui/AlertaCampo`.
- **Iconografía:** Estandarizada mediante la librería `lucide-react`.
- **Editor de formularios y campos personalizados:** Residen en `src/modules/tickets`. En `src/modules/problemas/config/formulario/components/` se utilizan adaptadores específicos para campos de problemas sin duplicar la lógica de tipos de datos.

---

## 5. Capacidades RBAC y Perfiles

### Capacidades ya existentes en `src/shared/lib/capacidades.ts`:
- `PROBLEMAS_VER` (`problemas:ver`)
- `PROBLEMAS_CREAR` (`problemas:crear`)
- `PROBLEMAS_GESTIONAR` (`problemas:gestionar`)
- `PROBLEMAS_CONFIGURAR` (`problemas:configurar`)
- `PROBLEMAS_CONFIG_VER` (`problemas:config:ver`)
- `PROBLEMAS_CONFIG_PUBLICAR` (`problemas:config:publicar`)
- `KEDB_VER` (`kedb:ver`)

### Asignación vigente en `CAPACIDADES_POR_PERFIL`:
- **Administrador (1):** Configura y publica (`PROBLEMAS_CONFIG_VER`, `PROBLEMAS_CONFIGURAR`, `PROBLEMAS_CONFIG_PUBLICAR`), consulta problemas y KEDB, pero no opera tickets directamente (SoD).
- **Gestor de Problemas (10):** Tiene capacidades completas de gestión (`PROBLEMAS_VER`, `PROBLEMAS_CREAR`, `PROBLEMAS_GESTIONAR`, `PROBLEMAS_CONFIGURAR`, `PROBLEMAS_CONFIG_VER`, `KEDB_VER`).
- **Supervisor (4):** Supervisión y asignación (`PROBLEMAS_VER`, `PROBLEMAS_CREAR`, `PROBLEMAS_GESTIONAR`, `PROBLEMAS_CONFIG_VER`, `KEDB_VER`).
- **Auditor (6):** Solo lectura (`PROBLEMAS_VER`, `PROBLEMAS_CONFIG_VER`, `KEDB_VER`).
- **Aprobador (7):** Evaluación y aprobación de dictámenes de problemas mayores y aceptación de riesgo.

### Propuesta de capacidades finas (Solicitud S-2):
- Incorporar granularidad adicional si se requiere desacoplar `problemas:config:editar`, `problemas:config:restaurar` e `importar-exportar`.

---

## 6. Inventario de Tablas en Base de Datos

Se constató que las 31 tablas de problemas y su configuración ya existen en PostgreSQL:
1. `problema` (maestro de problemas)
2. `error_conocido` (KEDB)
3. `plantilla_problema`
4. `problema_analisis` (RCA: 5 porqués, Ishikawa, línea de tiempo)
5. `problema_categoria` (categorías a 2 niveles)
6. `problema_causa_raiz_categoria`
7. `problema_cierre_aprobacion` (aprobaciones SoD de problemas mayores)
8. `problema_codigo_cierre`
9. `problema_config_cmdb`
10. `problema_config_conocimiento`
11. `problema_config_incidentes_vinculados`
12. `problema_config_kedb`
13. `problema_config_mayor`
14. `problema_config_reapertura`
15. `problema_config_rfc`
16. `problema_criterio_mayor`
17. `problema_estado`
18. `problema_incidente` (relación N:M problema–incidente)
19. `problema_metodo_analisis`
20. `problema_motivo_cancelacion`
21. `problema_motivo_espera`
22. `problema_objetivo_tiempo` (relojes por prioridad)
23. `problema_origen`
24. `problema_regla_asignacion`
25. `problema_regla_escalamiento`
26. `problema_regla_umbral`
27. `problema_regla_umbral_ejecucion`
28. `problema_relaciones_version`
29. `problema_tarea_catalogo`
30. `problema_tarea_paquete`
31. `problema_transicion`

Además, existen:
- `ticket_incidente` con `id_problema` y `es_incidente_mayor`.
- `tecnico_ausencias` en el esquema de organización.

---

## 7. Tabla de Diferencias y Estado de Pantallas

| Pantalla | Ruta Canónica | Estado Actual en Repositorio | Tareas para Etapa A / B / C |
| :--- | :--- | :--- | :--- |
| **Página padre** | `/plataforma/admin/procesos/problemas` | Cascarón que monta `VistaHubProblemas`. | Configurar redirección a `/formulario` para compatibilidad limpia. |
| **1.3.3.1 Formulario** | `/plataforma/admin/procesos/problemas/formulario` | Cascarón en `src/app/.../page.tsx` montando `VistaFormularioProblemas` en `src/modules/problemas/config/formulario/`. | Agregar guarda `exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER)`; depurar componentes duplicados huérfanos en `src/app`; validar pestanas. |
| **1.3.3.2 Flujo** | `/plataforma/admin/procesos/problemas/flujo` | Cascarón montando `VistaFlujoProblemas` en `src/modules/problemas/config/flujo/` con 8 pestañas. | Agregar guarda de página; conectar simuladores de asignación y escalamiento; validar transiciones. |
| **1.3.3.3 Relaciones** | `/plataforma/admin/procesos/problemas/relaciones` | Cascarón montando `VistaRelacionesProblemas` en `src/modules/problemas/config/relaciones/` con 6 pestañas. | Agregar guarda de página; conectar simulación de umbral; validar políticas KEDB y RFC. |

---

## 8. Riesgos y Acciones Preventivas

1. **Riesgo:** Duplicación de código si se recrea una carpeta `configuracion/` en vez de usar `config/`.  
   **Mitigación:** Se utiliza estrictamente `src/modules/problemas/config/`.
2. **Riesgo:** Existencia de carpetas huérfanas en `src/app/plataforma/admin/procesos/problemas/**/components/` que datan de la arquitectura anterior.  
   **Mitigación:** En la Etapa A se retirarán esas carpetas no utilizadas, manteniendo los archivos `page.tsx` como cascarones delgados que importan desde `@/modules/problemas`.
3. **Riesgo:** Importación de librerías obsoletas en controladores.  
   **Mitigación:** Todo controlador consumirá `@/shared/lib/db`, `@/shared/lib/capacidades`, `@/shared/lib/api-auth` y `respuestaError`.
