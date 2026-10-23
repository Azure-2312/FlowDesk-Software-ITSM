# Indice Maestro de Informes Tecnicos por Perfil ITSM (ITIL v4)

Este documento consolida y da acceso directo a los 10 informes de auditoria tecnica, arquitectonica y funcional elaborados para cada perfil del sistema.

Cada informe contiene el inventario exhaustivo de carpetas, subcarpetas, archivos de ruta (`page.tsx`), vistas modulares (`.tsx`), controladores y endpoints de API (`route.ts`), su diagnostico de desarrollo y su alineacion con las practicas de **ITIL v4**, **ISO/IEC 20000-1** e **ISO/IEC 27001**.

---

## 1. Acceso a los Informes por Perfil

| Perfil ID | Rol ITSM | Archivo de Informe | Cobertura Funcional |
| :---: | :--- | :--- | :---: |
| **1** | Administrador | [`INFORME_PERFIL_ADMINISTRADOR.md`](./INFORME_PERFIL_ADMINISTRADOR.md) | **81%** (39/48 opciones) |
| **2** | Especialista Tecnico | [`INFORME_PERFIL_TECNICO.md`](./INFORME_PERFIL_TECNICO.md) | **90%** (36/40 opciones) |
| **3** | Solicitante | [`INFORME_PERFIL_SOLICITANTE.md`](./INFORME_PERFIL_SOLICITANTE.md) | **100%** (12/12 opciones) |
| **4** | Supervisor | [`INFORME_PERFIL_SUPERVISOR.md`](./INFORME_PERFIL_SUPERVISOR.md) | **89%** (34/38 opciones) |
| **5** | Gestor de Area | [`INFORME_PERFIL_GESTOR_AREA.md`](./INFORME_PERFIL_GESTOR_AREA.md) | **95%** (21/22 opciones) |
| **6** | Auditor | [`INFORME_PERFIL_AUDITOR.md`](./INFORME_PERFIL_AUDITOR.md) | **96%** (26/27 opciones) |
| **7** | Aprobador (CAB) | [`INFORME_PERFIL_APROBADOR.md`](./INFORME_PERFIL_APROBADOR.md) | **100%** (15/15 opciones) |
| **8** | Gestor de Cambios | [`INFORME_PERFIL_GESTOR_CAMBIOS.md`](./INFORME_PERFIL_GESTOR_CAMBIOS.md) | **84%** (16/19 opciones) |
| **9** | Gestor de Activos y CMDB | [`INFORME_PERFIL_GESTOR_ACTIVOS_CMDB.md`](./INFORME_PERFIL_GESTOR_ACTIVOS_CMDB.md) | **96%** (25/26 opciones) |
| **10** | Gestor de Problemas | [`INFORME_PERFIL_GESTOR_PROBLEMAS.md`](./INFORME_PERFIL_GESTOR_PROBLEMAS.md) | **86%** (12/14 opciones) |

---

## 2. Metricas Consolidadas del Sistema

- **Total de Opciones en Menu Analizadas**: 390
- **Encabezados Jerarquicos de Agrupacion**: 129
- **Vistas Terminales con Ruta Web (`page.tsx`)**: 261
- **Vistas con Desarrollo Completo o Funcional Base**: 236
- **Vistas con Desarrollo Parcial o Consolidacion Pendiente**: 25
- **Porcentaje de Madurez Funcional Global**: **90.4%**

---

## 3. Criterios de Evaluacion Empleados

1. **Desarrollado y 100% Funcional**:
   - Vistas que cuentan con estado reactivo, hooks (`useState`, `useEffect`), componentes modulares desacoplados y consumo activo de endpoints de API conectados a la base de datos PostgreSQL.
2. **Desarrollado (Funcional Base)**:
   - Vistas operativas estables con interfaces funcionales completas.
3. **Parcial (Datos Simulados / Handlers Pendientes)**:
   - Vistas que despliegan interfaz pero poseen colecciones de prueba en memoria o acciones en proceso de integracion.
4. **Esqueleto / Envoltorio Base**:
   - Componentes o envoltorios con logica inicial de redireccion o configuracion basica.
