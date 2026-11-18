# Registro de Rutas Permitidas sin Menú

Este documento registra todas las páginas `page.tsx` bajo `/plataforma` que no corresponden a un ítem directo del menú de navegación, conforme a lo establecido en la Regla R1 y la Fase 15 de la reestructuración del ITSM.

## Inventario de Rutas Permitidas sin Menú (10 rutas)

| Ruta Relativa | Pantalla Padre | Propósito Funcional | Tipo de Ruta |
|---|---|---|---|
| `/plataforma/cambios/gestion/[id]` | Gestión de cambios (`/plataforma/cambios/gestion`, #21073) | Expediente técnico y dictamen del RFC de cambio | Detalle `[id]` |
| `/plataforma/conocimiento/[id]` | Base de conocimiento (`/plataforma/conocimiento/base`, #21157) | Lectura completa y retroalimentación de artículo | Detalle `[id]` |
| `/plataforma/conocimiento/configuracion/articulos/[id]/editar` | Configuración de conocimiento (`/plataforma/conocimiento/configuracion`, #21202) | Editor de artículo existente (actualización de contenido) | Acción técnica |
| `/plataforma/conocimiento/configuracion/articulos/[id]/historial` | Configuración de conocimiento (`/plataforma/conocimiento/configuracion`, #21202) | Trazabilidad y comparación de versiones del artículo | Detalle `[id]` |
| `/plataforma/incidentes/[id]` | Bandeja de incidentes (`/plataforma/incidentes/bandeja`, #21233) | Expediente y resolución técnica de incidente | Detalle `[id]` |
| `/plataforma/solicitudes/[id]` | Bandeja de solicitudes (`/plataforma/solicitudes/bandeja`, #21244) | Expediente y atención de solicitud de servicio | Detalle `[id]` |
| `/plataforma/tickets/[id]` | Mi trabajo / Mesa de servicio | Detalle genérico unificado de ticket (accesible desde agenda/paneles) | Detalle `[id]` |
| `/plataforma/problemas/[id]` | Bandeja de problemas (`/plataforma/problemas/bandeja`, #21093) | Expediente de problema, causa raíz y workaround | Detalle `[id]` |
| `/plataforma/servicios/configuracion/[id]/formulario` | Catálogo de servicios (`/plataforma/servicios/catalogo`, #21164) | Diseñador de campos dinámicos específicos por servicio | Acción técnica |
| `/plataforma` | Inicio (`/plataforma/inicio`, #21022) | Raíz del espacio de trabajo (redirige al inicio del usuario autenticado) | Redirección de entrada (Excepción R2 #1) |

---

## Verificación de Integridad

- **Total páginas bajo `/plataforma`:** 68
- **Páginas de menú canónicas (Anexo B):** 58
- **Páginas permitidas sin menú:** 10
- **Rutas huérfanas / no autorizadas:** 0
