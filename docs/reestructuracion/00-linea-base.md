# Informe de Línea Base y Descubrimiento — Fase 0

**Fecha de ejecución:** 2026-11-17  
**Rama de trabajo:** `reestructuracion-menu`  
**Tag de punto de retorno:** `pre-reestructuracion-menu`  
**Ruta del respaldo de base de datos:** `docs/reestructuracion/respaldo/backup_pre_reestructuracion.sql` (131 tablas volcadas, 2.04 MB)

---

## 1. Entorno de Ejecución y Versiones de Software
- **Node.js:** `v24.22.1`
- **Gestor de paquetes (npm):** `11.19.1`
- **Next.js:** `14.2.35` (App Router con React Server Components)
- **TypeScript:** `5.5.4`
- **Motor / Cliente de BD:** `pg 8.12.0` (acceso directo vía Pool relacional sin ORM pesado)
- **Servidor de Base de Datos:** PostgreSQL `17.6` en Supabase AWS (pooler transaccional)

---

## 2. Salud de la Línea Base (Verificación 0.2)
- **`tsc --noEmit`:** 0 errores de compilación TypeScript. Exitoso.
- **`next build`:** 268 rutas estáticas y dinámicas compiladas exitosamente con cero errores de build. Exitoso.
- **`next lint`:** No existe archivo de configuración inicial de ESLint en la raíz (Next.js solicita asistente interactivo al invocar `next lint`).
- **Pruebas E2E (`node scripts/test_e2e_lifecycle.js`):**
  - Total pruebas: 30
  - Aprobadas: 25
  - Fallidas: 5 (Fallo preexistente en FASE 8 y 9 debido a validación en creación de RFC: `criterios_exito` obligatorio para cambios normales).
- **Pruebas E2E de Excepciones (`node scripts/test_e2e_exceptions.js`):**
  - Total pruebas: 25
  - Aprobadas: 19
  - Fallidas: 6 (Fallo preexistente en FASE 3 debido a dependencia con la RFC de prueba y parámetros de cambio de emergencia).

---

## 3. Cifras y Métricas Iniciales («Antes»)
- **Total opciones de menú en BD (`opciones_menu`):** **227** (todas activas: 12 raíces, 20 sub-agrupadores, 195 pantallas). Conciliación 100% con el manual y Anexo A.
- **Total perfiles de usuario en BD:** **10** (Administrador [1], Técnico [2], Solicitante [3], Supervisor [4], Gestor de Área [5], Auditor [6], Aprobador [7], Gestor de Cambios [8], Gestor de Activos [9], Gestor de Problemas [10]).
- **Total asignaciones en `opciones_menu_perfiles`:** **387** concesiones activas.
- **Rutas físicas inventariadas (`src/app`):** **463** archivos de ruta (`page.tsx`, `route.ts`, `layout.tsx`, etc.) documentados en `00-rutas-antes.csv`.
- **URLs de plataforma distintas rastreadas:** **206** URLs identificadas.
- **Total de referencias a URLs y componentes:** **2,108** referencias registradas en `referencias-antes.csv`.
- **Redirecciones detectadas:** **89** puntos de redirección/navegación registrados en `redirecciones-antes.csv`.

---

## 4. Hallazgos Relevantes y Decisiones Arquitectónicas (0.10)
1. **Elementos de Configuración (N5):** Confirmada existencia de `elemento_configuracion` (25 CIs) y `VistaCmdb.tsx` (Caso A). Se vinculará como pantalla canónica en CMDB.
2. **`debe_cambiar_clave` (N6):** La columna no existe en `usuarios`. Se añadirá vía migración DDL en la implementación de N6.
3. **Recuperación de contraseña por correo:** Se retiran las rutas de `/api/auth/recuperar-clave/*`. El reset lo efectúa el Administrador desde «Usuarios».
4. **Post-Login:** Aterrizaje unificado en `/plataforma/inicio` cargando la vista correspondiente al perfil activo.
5. **Importación masiva de activos:** `VistaImportacionActivos` es un componente de página y se incrustará directamente en la vista `importar` de inventario.
6. **Esquema de permisos de vistas (N1):** Camino B (creación de `opciones_menu_vistas_perfiles`).
7. **Campos personalizados:** Existe 1 registro en `campo_personalizado`. Conforme a la regla de 0.9, se conserva el motor de renderizado de campos dinámicos.
8. **Matriz de prioridad:** Confirmada tabla institucional única `matriz_prioridad_institucional` (18 reglas configuradas).

---

## 5. Verificación de Cumplimiento de Fase 0
- [x] Rama `reestructuracion-menu` creada.
- [x] Tag `pre-reestructuracion-menu` creado.
- [x] Respaldo de BD generado en `docs/reestructuracion/respaldo/backup_pre_reestructuracion.sql`.
- [x] `docs/reestructuracion/00-rutas-antes.csv` generado.
- [x] `docs/reestructuracion/matriz-acceso-antes.csv` generado.
- [x] `docs/reestructuracion/referencias-antes.csv` generado.
- [x] `docs/reestructuracion/redirecciones-antes.csv` generado.
- [x] `docs/reestructuracion/00-autorizacion.md` redactado.
- [x] `docs/reestructuracion/00-decisiones.md` redactado.
- [x] `docs/reestructuracion/dependencias-eliminacion.md` redactado.
- [x] `docs/reestructuracion/00-linea-base.md` redactado.
- [x] Cero modificaciones en código de producción `src/` durante la Fase 0.
