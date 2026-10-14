# Indice Maestro de Documentacion Tecnica - FlowDesk Software ITSM

En este directorio se compila la documentacion tecnica, arquitectonica, funcional y de buenas practicas del sistema **FlowDesk Software ITSM**, desarrollado bajo los estandares de **ITIL v4**, **ISO/IEC 20000-1:2018** e **ISO/IEC 27001:2022**.

---

## 1. Documento Maestro de Arquitectura y Codigo (Referencia Principal)

* **[DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md](DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md)**
  * **Descripcion**: Manual tecnico exhaustivo del software (mas de 14,000 lineas).
  * **Contenido**:
    * Cap. 1: Vision general, Cadena de Valor del Servicio y 4 Dimensiones de ITIL v4.
    * Cap. 2: Arquitectura tecnologica, Next.js 14 App Router, connection pooling PostgreSQL y seguridad stateless.
    * Cap. 3: Modelo de seguridad, control de acceso RBAC, 5 perfiles del sistema y conmutacion de perfil activo.
    * Cap. 4: Diccionario completo de base de datos con las 77 tablas relacionales y restricciones.
    * Cap. 5: Catalogo exhaustivo de las 119 rutas API (`src/app/api/`) con contratos de entrada, consultas SQL y respuestas JSON.
    * Cap. 6: Desglose analitico de las 108 paginas de la aplicacion (`src/app/(app)/`) con estados reactivos y consumo de APIs.
    * Cap. 7: Bibliotecas internas (`src/lib/`) y componentes React reutilizables (`src/components/`).
    * Cap. 8: Modelos de dominio y tipos TypeScript centralizados (`src/types/index.ts`).
    * Cap. 9: Arquitectura de validaciones puras y directivas de UX (cero emojis, cero alertas verdes, bordes rojos de error).
    * Cap. 10: Matriz maestra de privilegios RBAC entidad por entidad.
    * Cap. 11: Compendio de reglas de negocio obligatorias (RN-01 a RN-14).
    * Cap. 12: Manual de instalacion, configuracion de entorno `.env.local`, resolucion de fallas y despliegue a produccion.
    * Cap. 13: Guia de contexto para agentes de Inteligencia Artificial y desarrolladores.

---

## 2. Especificaciones de Ingenieria de Requerimientos

* **[reglas_de_negocio.md](reglas_de_negocio.md)**: Catalogo formal de reglas de negocio del sistema agrupadas por dominios operativos.
* **[requerimientos_funcionales.md](requerimientos_funcionales.md)**: Especificacion modular de requerimientos funcionales del Service Desk.
* **[requerimientos_no_funcionales.md](requerimientos_no_funcionales.md)**: Criterios de calidad, seguridad, rendimiento, responsividad y accesibilidad.
* **[historias_de_usuario.md](historias_de_usuario.md)**: Epicas, historias de usuario atomicas y criterios de aceptacion BDD Gherkin.
* **[matriz_trazabilidad_funciones_hu_rf_rn.md](matriz_trazabilidad_funciones_hu_rf_rn.md)**: Matriz de trazabilidad bidireccional entre requerimientos, historias y funciones.

---

## 3. Gestion del Catalogo y Navegacion

* **[catalogo_maestro_jerarquia_menu_por_perfil_itsm.md](catalogo_maestro_jerarquia_menu_por_perfil_itsm.md)**: Jerarquia completa de opciones de menu sincronizada con la base de datos para cada perfil.
* **[carga_servicios_catalogo_30.md](carga_servicios_catalogo_30.md)**: Especificacion tecnica y guion de carga de los servicios corporativos del catalogo de autoservicio.

---

## 4. Arquitectura Modular, Jerarquia de Carpetas y Organizacion del Equipo Scrum

* **[PROPUESTAS_ARQUITECTURA_Y_ESTRUCTURA.md](PROPUESTAS_ARQUITECTURA_Y_ESTRUCTURA.md)**: Evaluacion arquitectonica y definicion de la Arquitectura Modular Orientada al Dominio (`src/modules/`, `src/shared/` y `src/app/plataforma/`).
* **[ARQUITECTURA_Y_JERARQUIA_SRC.md](ARQUITECTURA_Y_JERARQUIA_SRC.md)**: Arbol jerarquico numerado de todas las carpetas y archivos dentro de `src/` con su respectiva explicacion funcional.
* **[DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md](DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md)**: Plan maestro de division de responsabilidades desde cero entre los 5 integrantes (Miguel, Lourdes, Alexis, Nain y Junior), asignacion de Historias de Usuario (`HU-01` a `HU-44`), Requerimientos (`RF-01` a `RF-44`, `RNF-01` a `RNF-06`), Reglas de Negocio (`RN-01` a `RN-41`), aislamiento de ramas en Git, metodologia Scrum, actas de Daily Standup y prompts para asistentes de IA.
* **[ESQUEMA_MENUS_POR_PERFIL.md](ESQUEMA_MENUS_POR_PERFIL.md)**: Esquema maestro de menus, opciones y subopciones por perfil (10 perfiles oficiales ITSM).
* **[MATRIZ_BRECHA_ACTUAL_VS_PROPUESTA_POR_PERFIL.md](MATRIZ_BRECHA_ACTUAL_VS_PROPUESTA_POR_PERFIL.md)**: Matriz comparativa exhaustiva de brecha (Software Actual vs. Propuesta de Menus por Perfil) con porcentajes de completitud (% Hecho), diagnostico de pendientes y catalogacion de componentes fuera de la propuesta.


