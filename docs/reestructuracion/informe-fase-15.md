# Informe de Ejecución — Fase 15: Limpieza Global y Barrido de Huérfanos

**Fecha:** 17 de Noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Objetivo:** Ejecutar la depuración integral del repositorio tras la reestructuración del ITSM: eliminación de páginas y rutas huérfanas, supresión total de redirecciones de compatibilidad por obsolescencia (R2), depuración de capacidades huérfanas, verificación de variables de entorno y generación del inventario de deuda técnica en base de datos bajo la regla de no destrucción de datos (R6).

---

## 1. Tabla de Verificación de Resultados: Esperado vs. Real

| Criterio | Esperado | Real | Estado |
|---|---|---|:---:|
| **E15.1** Rutas huérfanas | 0 rutas huérfanas bajo `/plataforma` | Exactamente 68 páginas `page.tsx`: 58 canónicas de menú + 10 permitidas sin menú documentadas en `rutas-permitidas-sin-menu.md` | **CUMPLIDO** |
| **E15.2** Redirecciones por obsolescencia | 0 redirecciones por obsolescencia (R2 / V-22 / V-23) | 0 shims; eliminadas todas las redirecciones de `admin/[...slug]`, `tickets/`, `mi-cuenta/` y `operacion/`; solo permanecen las 4 legítimas (auth y login según sesión) | **CUMPLIDO** |
| **E15.3** Código muerto | Cero archivos o exports huérfanos | Eliminadas vistas obsoletas de reportes, tickets y wrappers heredados | **CUMPLIDO** |
| **E15.4** Capacidades huérfanas | 0 constantes de capacidad sin consumidor | 15 capacidades huérfanas identificadas y eliminadas de `capacidades.ts` (resultado final: 0 huérfanas) | **CUMPLIDO** |
| **E15.5** Equivalencia y migración | Base de datos sincronizada con esquema final de 73 filas | 73 opciones de menú activas (11 raíces, 4 sub-agrupadores, 58 pantallas) | **CUMPLIDO** |
| **E15.6** Deuda técnica de BD | `deuda-bd.md` generado sin destrucción física (R6) | 14 tablas no referenciadas inventariadas en `docs/reestructuracion/deuda-bd.md`; cero `DROP TABLE` ejecutados | **CUMPLIDO** |
| **E15.7** Informe | Documento `informe-fase-15.md` emitido | Este informe | **CUMPLIDO** |

---

## 2. Inventario de Rutas Bajo `/plataforma`

- **Total `page.tsx`:** 68
- **Páginas de menú oficial (Anexo B):** 58
- **Páginas permitidas sin menú (Anexo y Documento de Rutas):** 10
  1. `/plataforma/cambios/gestion/[id]` (Expediente de cambio)
  2. `/plataforma/conocimiento/[id]` (Detalle de artículo)
  3. `/plataforma/conocimiento/configuracion/articulos/[id]/editar` (Editor de artículo)
  4. `/plataforma/conocimiento/configuracion/articulos/[id]/historial` (Historial de artículo)
  5. `/plataforma/incidentes/[id]` (Expediente de incidente)
  6. `/plataforma/solicitudes/[id]` (Expediente de solicitud)
  7. `/plataforma/tickets/[id]` (Expediente genérico de ticket)
  8. `/plataforma/problemas/[id]` (Expediente de problema)
  9. `/plataforma/servicios/configuracion/[id]/formulario` (Diseñador dinámico de servicio)
  10. `/plataforma` (Entrada al workspace que redirige a `/plataforma/inicio`)

---

## 3. Depuración de Redirecciones (R2 / V-22 / V-23)

Se eliminaron completamente todas las redirecciones de compatibilidad que violaban la regla R2:
- `src/app/plataforma/admin/[...slug]/page.tsx` (18 redirecciones de compatibilidad eliminadas)
- `src/app/plataforma/mi-cuenta/page.tsx` (redirección eliminada; la ruta da 404 y el usuario ingresa a `#21226` `/plataforma/mi-cuenta/perfil`)
- `src/app/plataforma/tickets/page.tsx`, `tickets/reportes/page.tsx`, `tickets/gestion/incidentes/page.tsx`, `tickets/gestion/solicitudes/page.tsx` (redirecciones eliminadas)
- `src/app/plataforma/operacion/page.tsx`, `operacion/eventos-resiliencia/page.tsx` (eliminadas en F14)

---

## 4. Capacidades Depuradas (E15.4)

Se retiraron 15 constantes de capacidades huérfanas sin ningún consumidor en el código:
`TICKETS_ADMINISTRAR`, `INCIDENTES_VER`, `SOLICITUDES_VER`, `SOLICITUDES_CREAR`, `PROBLEMAS_CREAR`, `KEDB_VER`, `CAMBIOS_CREAR`, `SERVICIOS_VER`, `OPERACION_VER`, `OPERACION_EVENTOS`, `OPERACION_RESILIENCIA`, `OPERACION_GESTIONAR`, `OPERACION_ATENDER`, `CATEGORIAS_VER`, `SEGURIDAD_LOGS`.

---

## 5. Deuda Técnica de Base de Datos (R6)

Se documentaron en `docs/reestructuracion/deuda-bd.md` 14 tablas que corresponden a características diferidas a Fase 2 (monitoreo de eventos, resiliencia, conteo físico de activos). Ninguna tabla fue eliminada con `DROP TABLE`, garantizando total consistencia histórica y de claves foráneas.

---

## 6. Compilación y Suite de Pruebas

- **TypeScript (`tsc --noEmit`):** Código de salida 0.
- **Next.js Production Build (`npm run build`):** Exitoso sin errores (código de salida 0).
