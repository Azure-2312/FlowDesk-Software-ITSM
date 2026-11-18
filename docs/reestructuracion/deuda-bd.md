# Registro de Deuda Técnica de Base de Datos (Fase 15)

**Fecha:** 17 de Noviembre de 2026  
**Regla R6 (Cero destrucción de datos):** En estricto cumplimiento de la regla R6, las tablas y columnas asociadas a funciones eliminadas o diferidas para la Fase 2 no se eliminan físicamente de la base de datos (evitando pérdida de datos históricos o restricciones de claves foráneas). Este documento inventaría dichas estructuras como deuda técnica reconocida para su archivado o migración futura.

---

## 1. Resumen de Tablas

- **Total de tablas en esquema público:** 133
- **Tablas activamente referenciadas por la aplicación:** 119
- **Tablas sin referencias activas en el código (Deuda BD):** 14

---

## 2. Inventario de Tablas sin Referencia Activa en Código

| Tabla | Módulo Original | Motivo de Inactividad | Acción R6 |
|---|---|---|---|
| `acuerdo_nivel_operativo` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `codigo_recuperacion` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `cola_correo` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `evento_servicio` | Operación (Eventos) | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `opciones_menu_bak_20261018` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `opciones_menu_bak_20261020` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `opciones_menu_bak_20261021` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `opciones_menu_perfiles_bak_20261018` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `opciones_menu_perfiles_bak_20261020` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `opciones_menu_perfiles_bak_20261021` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `preferencia_notificacion` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `resiliencia_servicio` | Operación (Resiliencia) | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `respuestas_predefinidas` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |
| `ticket_lecturas` | Operación / Soporte | Función eliminada o diferida a Fase 2 | Conservada intacta sin drop (R6) |

---

## 3. Conclusión

Ninguna tabla ha sido eliminada con `DROP TABLE`. La integridad referencial y el histórico de datos se encuentran completamente preservados.
