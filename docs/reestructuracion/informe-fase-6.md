# Informe de Ejecución — Fase 6: Problemas

**Fecha:** 17 de Noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Objetivo:** Consolidar bandejas y expedientes de Problemas (#21091), reduciendo de 20 a exactamente 5 opciones de menú activas, migrando el análisis de causa raíz como pestaña del expediente (`[id]`), integrando objetivos a Monitor de SLA (#21045), y aplicando control de vistas por perfiles (N1) sin escalamiento de privilegios (R5).

---

## 1. Tabla de Verificación de Resultados: Esperado vs. Real

| Criterio | Esperado | Real | Estado |
|---|---|---|:---:|
| **E6.1** Hijos en «Problemas» | Exactamente 5 hijos según Anexo B (#21105, #21093, #21095, #21098, #21199) | 5 hijos en orden 1 a 5 bajo #21091 | **CUMPLIDO** |
| **E6.2** Opciones eliminadas | 15 opciones de menú eliminadas (#21092, #21094, #21096, #21097, #21099, #21100, #21101, #21102, #21103, #21104, #21106, #21107, #21108, #21200, #21201) | 15 opciones eliminadas de `opciones_menu` y cascada en perfiles | **CUMPLIDO** |
| **E6.3** Referencias a URLs viejas | 0 referencias a rutas eliminadas bajo `/plataforma/problemas/` | 0 referencias activas; actualizadas a canonical `/bandeja`, `/candidatos`, `/configuracion`, `/servicios/sla?vista=problemas` | **CUMPLIDO** |
| **E6.4** Flujo integrado | Recorrido candidato → problema → causa raíz → error conocido → RFC → cierre | Componentes de RCA integrados en pestaña `Causa raíz` de `VistaProblemaDetalle` | **CUMPLIDO** |
| **E6.5** Erradicación de Ishikawa | 0 referencias a Ishikawa en componentes UI | 0 referencias en UI; sustituido por línea de tiempo y 5 porqués | **CUMPLIDO** |
| **E6.6** Build y Tests | Tests N1/Fase 6 verdes, TypeScript sin errores, Build Next.js exitoso | Test suite 100% PASS, `tsc --noEmit` código 0, build exitoso | **CUMPLIDO** |
| **E6.7** Informe | Documento `informe-fase-6.md` emitido | Este informe | **CUMPLIDO** |

---

## 2. Estructura Final del Módulo Problemas (#21091)

| ID | Nombre | URL Canónica | Orden | Vistas N1 Asignadas |
|---|---|---|:---:|---|
| **#21105** | Registrar problema | `/plataforma/problemas/crear` | 1 | *Sin pestañas (Directo)* |
| **#21093** | Bandeja de problemas | `/plataforma/problemas/bandeja` | 2 | `sin-asignar`, `asignados`, `grupo`, `historial` |
| **#21095** | Candidatos a problema | `/plataforma/problemas/candidatos` | 3 | `propuestos`, `recurrentes` |
| **#21098** | Errores conocidos | `/plataforma/problemas/kedb` | 4 | *Sin pestañas (Directo)* |
| **#21199** | Configuración de problemas | `/plataforma/problemas/configuracion` | 5 | `campos`, `listas` |

Adicionalmente:
- **#21101** (Objetivos de tiempo) se absorbió como vista `problemas` dentro de **#21045** (Monitor de SLA en `/plataforma/servicios/sla?vista=problemas`).
- **#21092** (Análisis causa raíz) se integró directamente en el expediente `[id]` (`VistaProblemaDetalle.tsx`).

---

## 3. Matriz de No-Escalación de Privilegios (R5)

Las vistas fueron distribuidas preservando estrictamente los accesos de la línea base:

| Perfil | #21093 (Bandeja) | #21095 (Candidatos) | #21199 (Configuración) | #21045 (Monitor SLA) |
|---|---|---|---|---|
| **Administrador (1)** | `sin-asignar`, `asignados`, `grupo`, `historial` | `propuestos`, `recurrentes` | `campos`, `listas` | `problemas` (y todas las previas) |
| **Técnico (2)** | `asignados`, `grupo` | `propuestos` | *Sin acceso* | *Sin acceso* |
| **Supervisor (4)** | `sin-asignar`, `historial` | `propuestos`, `recurrentes` | *Sin acceso* | `problemas` |
| **Gestor Problemas (6)** | `sin-asignar`, `asignados`, `grupo`, `historial` | `propuestos`, `recurrentes` | `campos`, `listas` | `problemas` |

---

## 4. Archivos Físicos Depurados

Se eliminaron físicamente 14 directorios/páginas obsoletas:
- `src/app/plataforma/problemas/analisis/`
- `src/app/plataforma/problemas/aprobaciones/`
- `src/app/plataforma/problemas/asignacion/`
- `src/app/plataforma/problemas/asignados/`
- `src/app/plataforma/problemas/cambios/`
- `src/app/plataforma/problemas/conocimiento/`
- `src/app/plataforma/problemas/grupo/`
- `src/app/plataforma/problemas/historial/`
- `src/app/plataforma/problemas/mayores/`
- `src/app/plataforma/problemas/objetivos/`
- `src/app/plataforma/problemas/recurrentes/`
- `src/app/plataforma/problemas/configuracion/flujo/`
- `src/app/plataforma/problemas/configuracion/formulario/`
- `src/app/plataforma/problemas/configuracion/relaciones/`

R2 verificado: 0 llamadas a `redirect(` de obsolescencia.
