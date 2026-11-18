# Informe de Ejecución — Fase 13: Plataforma (Seguridad y Administración)

**Fecha:** 17 de Noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Objetivo:** Consolidar la raíz «Plataforma» (#21215) a exactamente 3 pantallas planas: «Gestión de usuarios» (#21209), «Perfiles y permisos» (#21210) y «Auditoría y accesos» (#21220, URL `/plataforma/seguridad/auditoria-sistema`, con vistas `configuracion` y `accesos`). Eliminar 11 opciones obsoletas (#21208, #21211, #21213, #21216, #21217, #21218, #21219, #21221, #21222, #21223, #21224) y sus componentes huérfanos sin alterar la regla de negocio de Segregación de Funciones (SoD - autoexclusión en aprobaciones) ni la visualización en pantalla única de contraseñas temporales (N6).

---

## 1. Tabla de Verificación de Resultados: Esperado vs. Real

| Criterio | Esperado | Real | Estado |
|---|---|---|:---:|
| **E13.1** Hijos en «Plataforma» | Exactamente 3 pantallas (#21209, #21210, #21220) | 3 pantallas en órdenes 1, 2 y 3 directamente bajo #21215 | **CUMPLIDO** |
| **E13.2** Opciones eliminadas | 11 filas eliminadas de BD | Eliminadas de `opciones_menu`, `opciones_menu_perfiles` y `opciones_menu_vistas_perfiles` | **CUMPLIDO** |
| **E13.3** URLs viejas eliminadas | Rutas eliminadas devuelven 404 (0 shims / 0 redirects R2) | 8 rutas físicas eliminadas (`accesos/recertificacion`, `cumplimiento/cambios`, `cumplimiento/sod`, `muestreo`, `seguridad-logs`, `mantenimiento-datos`, `salud-sistema`, `menu`) | **CUMPLIDO** |
| **E13.4** Segregación de funciones (SoD) | Regla activa: un usuario no puede dictaminar su propia solicitud ni aprobar su propio cambio | Blindaje estricto en controladores y servicios de aprobación (`aprobacionesController.ts`, `aprobacionesService.ts`, `TarjetaAprobacionSod.tsx`) con error 403 `SOD_AUTOEXCLUSION_VIOLADA` | **CUMPLIDO** |
| **E13.5** Contraseña temporal (N6) | Administrador ve contraseña temporal una sola vez y fuerza cambio al primer login | Implementado en `VistaUsuarios.tsx` con componente de copiado y aviso N6 | **CUMPLIDO** |
| **E13.6** Cero referencias a correo en credenciales | Eliminado "Enviar credenciales por correo" | Reemplazado por campo informativo de contacto en ficha de identidad | **CUMPLIDO** |
| **E13.7** Informe | Documento `informe-fase-13.md` emitido | Este informe | **CUMPLIDO** |

---

## 2. Estructura Final de la Raíz Plataforma (#21215)

| ID | Nombre | URL Canónica | Orden | Vistas N1 Asignadas |
|---|---|---|:---:|---|
| **#21209** | Gestión de usuarios | `/plataforma/seguridad/usuarios` | 1 | *Sin pestañas (Directo)* |
| **#21210** | Perfiles y permisos | `/plataforma/seguridad/perfiles` | 2 | *Sin pestañas (Directo / Grid dinámico)* |
| **#21220** | Auditoría y accesos | `/plataforma/seguridad/auditoria-sistema` | 3 | `configuracion`, `accesos` |

---

## 3. Matriz de Permisos (R5)

| Perfil | #21209 (Usuarios) | #21210 (Perfiles) | #21220 (Auditoría y accesos) |
|---|---|---|---|
| **Administrador (1)** | Acceso completo | Acceso completo | `configuracion`, `accesos` |
| **Auditor (6)** | *Sin acceso* | Consulta | `configuracion`, `accesos` |
| **Demás perfiles (2-5, 7-10)** | *Sin acceso* | *Sin acceso* | *Sin acceso* |

---

## 4. Archivos Físicos y Componentes Depurados (R1)

Se eliminaron físicamente 8 rutas y 7 componentes huérfanos:
- `src/app/plataforma/seguridad/accesos/recertificacion/page.tsx`
- `src/app/plataforma/seguridad/cumplimiento/cambios/page.tsx`
- `src/app/plataforma/seguridad/cumplimiento/sod/page.tsx`
- `src/app/plataforma/seguridad/muestreo/page.tsx`
- `src/app/plataforma/seguridad/seguridad-logs/page.tsx` (absorbida como vista `accesos` en `/plataforma/seguridad/auditoria-sistema`)
- `src/app/plataforma/operacion/mantenimiento-datos/page.tsx`
- `src/app/plataforma/operacion/salud-sistema/page.tsx`
- `src/app/plataforma/operacion/menu/page.tsx`
- `src/modules/identidades/views/VistaRecertificacion.tsx`
- `src/modules/cambios/views/VistaCambiosIrregulares.tsx`
- `src/modules/seguridad/views/VistaSod.tsx`
- `src/modules/seguridad/views/VistaMuestreo.tsx`
- `src/modules/plataforma/config/mantenimiento-datos/VistaMantenimientoDatos.tsx`
- `src/modules/plataforma/config/salud/VistaSaludSistema.tsx`
- `src/modules/plataforma/config/menu/VistaMenu.tsx`

---

## 5. Compilación y Suite de Pruebas

- **Unit/DB Tests (`scripts/test_plataforma_fase13.js`):** 100% PASS.
- **TypeScript (`tsc --noEmit`):** Código de salida 0.
- **Next.js Production Build (`npm run build`):** Exitoso sin errores (código de salida 0).
