# Solicitudes a Otros Módulos — Gestión de Problemas

**Módulo emisor:** `src/modules/problemas`  
**Referencia:** Sección 16 de `DOCUMENTACIÓN/prompt_1_config_gestion_de_problemas.md`  
**Regla:** El módulo `problemas` no modifica módulos ajenos. Registra aquí sus requerimientos de contrato y aplica degradación controlada mientras no sean atendidos.

---

| Id | Módulo destino (dueño) | Qué se necesita | Contrato propuesto | Comportamiento mientras no exista (degradación) |
| :--- | :--- | :--- | :--- | :--- |
| **S-1** | `tickets` (Miguel) | Publicación de adaptadores reutilizables del creador de campos para problemas (`entidad = 'problema'`). | `@/modules/tickets/ui` | `problemas` utiliza su adaptador local en `config/formulario/components/` sin replicar la máquina de datos. |
| **S-2** | `shared` (Tech Lead) | Desagregación opcional de capacidades finas (`problemas:config:editar`, `problemas:config:restaurar`, `kedb:publicar`). | Constantes en `src/shared/lib/capacidades.ts` | Cubierto operativamente por `PROBLEMAS_CONFIGURAR` y `PROBLEMAS_CONFIG_PUBLICAR`. |
| **S-3** | `servicios` (Miguel) | Montaje de `BloqueObjetivosProblemas` en la vista de administración de SLA (`/plataforma/admin/servicios/sla`). | `@/modules/problemas/ui` (`BloqueObjetivosProblemas`) | Los objetivos de tiempo se consultan y configuran desde la pantalla `flujo` de problemas de manera autónoma. |
| **S-4** | `incidentes` / `tickets` (Miguel) | Botón "Crear problema desde incidente", banner de vinculación y sugerencia de KEDB en el registro de incidentes. | Servicios `@/modules/problemas` (`crearProblemaDesdeIncidente`, `sugerirErroresConocidos`) | La configuración se expone por contrato; el renderizado en la interfaz del incidente se activará cuando `incidentes` lo monte. |
| **S-5** | `organizacion` (Junior) | Servicio de consulta de ausencias de técnicos (`esTecnicoDisponible(idTecnico, fecha)`). | `@/modules/organizacion` | Si no está activo el contrato, la opción "Considerar disponibilidad" en reglas de asignación muestra aviso informativo. |
| **S-6** | `plataforma` (Miguel) | Notificaciones de eventos de dominio (`problema.*`, `kedb.*`) y registro en `auditoria_sistema`. | Servicios de eventos y auditoría de `@/modules/plataforma` | Los cambios de configuración se auditan con log estructurado y la notificación directa se realiza vía outbox local. |
| **S-7** | `cambios` (Nain) | Generación de RFC desde problema y sincronización de estado del problema ante resolución de cambio. | `@/modules/cambios` (`crearRfcDesdeProblema`) | Se persiste el vínculo `id_problema_origen` en la RFC; la automatización se procesa vía servicio sin import cruzado. |
| **S-8** | `cmdb` / `activos` (Nain) | Bloqueo o advertencia en baja de CIs con problemas abiertos y lectura de criticidad de CI. | `@/modules/cmdb` (consulta de CI) | Lectura de atributos de CI mediante SQL acotado de solo lectura. |
| **S-9** | `conocimiento` (Alexis) | Generación automática de borrador de artículo de conocimiento desde problema o error conocido. | `@/modules/conocimiento` (`crearBorradorDesdeProblema`) | Se guarda la configuración de la política; la generación automática se activa una vez publicado el contrato en `conocimiento`. |
| **S-10** | `shared` (Tech Lead) | Unificación de `BarraAccionesComun`, `ModalPublicacion` y `AlertaCampo`. | `@/shared/components/admin` y `@/shared/components/ui` | **Atendida.** Los componentes base ya existen y se consumen de `@/shared/components/...`. |
