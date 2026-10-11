# Especificacion de Requerimientos No Funcionales (RNF)

## Informacion del Documento y Roles Oficiales

- **Proyecto:** Sistema de Gestion de Tickets y Servicios de TI (Mesa de Ayuda / Service Desk - ITSM)
- **Asignatura:** Programacion Aplicada III / Ingenieria de Software
- **Concepto Fundamental de Requerimiento No Funcional (RNF):**
  - Un requerimiento no funcional define los **atributos de calidad, restricciones tecnicas, rendimiento y condiciones operativas** que determinan como debe comportarse el sistema.
  - A diferencia de las reglas de negocio (que dictan directrices organizacionales) y de los requerimientos funcionales (que describen acciones y tareas especificas), los RNF establecen metricas objetivas de eficiencia, disponibilidad, seguridad informatica, usabilidad, capacidad y mantenibilidad del software.
  - Basado en el estandar internacional de calidad de software **ISO/IEC 25010 (SQuaRE)**.
- **Roles Oficiales del Sistema (6):**
  1. **Solicitante:** Trabajador o cliente que reporta incidentes, solicita servicios y califica la atencion.
  2. **Tecnico:** Especialista operativo que atiende y resuelve los requerimientos tecnicos.
  3. **Supervisor:** Lider que coordina al equipo, equilibra cargas de trabajo y monitorea el cumplimiento de plazos.
  4. **Gestor de Area:** Responsable de departamento que autoriza o deniega peticiones con impacto de recursos.
  5. **Auditor:** Revisor formal de la transparencia, cumplimiento normativo e inalterabilidad de registros.
  6. **Administrador:** Responsable de la gestion integral de usuarios, catalogo de servicios y parametros del sistema.
- **Terminologia Estandarizada:** Se utiliza exclusivamente el termino "usuario" o "usuarios".

---

## 1. Catalogo de Requerimientos No Funcionales (RNF)

```
+----------------------------------------------------------------------------------------------------+
|                       REQUERIMIENTOS NO FUNCIONALES DEL SISTEMA (RNF)                              |
+-------------+----------------------------------------------+---------------------------------------+
| Codigo      | Atributo de Calidad (ISO/IEC 25010)          | Metrica y Criterio de Aceptacion      |
+-------------+----------------------------------------------+---------------------------------------+
| RNF-01      | Eficiencia de Rendimiento y Respuesta        | Respuestas transaccionales < 2.0 s    |
| RNF-02      | Disponibilidad y Continuidad Operativa       | Operatividad minima del 99.5% laboral |
| RNF-03      | Seguridad del Software y Proteccion de Datos | Cifrado HTTPS/TLS y datos resguardados|
| RNF-04      | Usabilidad y Adaptabilidad Multidispositivo  | Diseno responsivo movil y escritorio  |
| RNF-05      | Escalabilidad y Capacidad Concurrente        | 50 sesiones simultaneas sin demora    |
| RNF-06      | Mantenibilidad, Modularidad y Arquitectura   | Arquitectura por capas desacopladas   |
+-------------+----------------------------------------------+---------------------------------------+
```

---

## 2. Desarrollo Detallado de Requerimientos No Funcionales

---

### [RNF-01] Eficiencia de Rendimiento y Tiempos de Respuesta
- **Atributo de Calidad:** Rendimiento / Eficiencia de Desempeno (Performance Efficiency).
- **Que define para el Sistema:** El software debe responder de manera agil y fluida ante las solicitudes del personal, evitando demoras que perjudiquen el flujo laboral.
- **Criterio de Medicion y Aceptacion:**
  - Las transacciones cotidianas (filtrado de tickets en bandejas, busqueda en el catalogo de servicios, envio de comentarios y cambios de estado) deben completarse en un tiempo no mayor a 1.5 a 2.0 segundos bajo condiciones habituales de red.
  - La generacion y descarga de reportes gerenciales en hojas de calculo debe ejecutarse en menos de 3.5 segundos para volumenes de hasta diez mil registros.
- **Impacto en el Servicio:** Permite que tecnicos y supervisores atiendan incidentes con celeridad sin que la plataforma se convierta en un cuello de botella.

---

### [RNF-02] Disponibilidad y Continuidad Operativa
- **Atributo de Calidad:** Confiabilidad / Disponibilidad (Reliability & Availability).
- **Que define para el Sistema:** La plataforma de soporte debe encontrarse operativa y lista para recibir requerimientos durante toda la jornada productiva de la organizacion.
- **Criterio de Medicion y Aceptacion:**
  - El sistema debe garantizar un nivel de disponibilidad no menor al 99.5% durante el horario de atencion laboral establecido por la empresa (lunes a sabado de 07:00 a 20:00).
  - En caso de presentarse una falla imprevista, el tiempo medio de recuperacion operativa del servicio (MTTR) no debe superar los 30 minutos.
- **Impacto en el Servicio:** Otorga certidumbre institucional de que las contingencias tecnologicas siempre contaran con un canal formal habilitado para su reporte inmediato.

---

### [RNF-03] Seguridad del Software y Proteccion de Datos
- **Atributo de Calidad:** Seguridad Informatica (Security & Confidentiality).
- **Que define para el Sistema:** El software debe proteger la privacidad e integridad de los datos institucionales transmitidos y almacenados, resguardando las credenciales y la informacion privada de las solicitudes.
- **Criterio de Medicion y Aceptacion:**
  - Todo el trafico entre el navegador y el servidor debe cursar obligatoriamente bajo protocolo web seguro (HTTPS con TLS 1.3).
  - Las contrasenas deben procesarse mediante algoritmos de derivacion criptografica irreversibles.
  - El sistema debe protegerse de vulnerabilidades comunes en aplicaciones web (inyecciones SQL mediante consultas parametrizadas, ataques XSS mediante sanitizacion de entradas y proteccion contra manipulacion de sesiones activas).
- **Impacto en el Servicio:** Protege los activos de informacion institucional y previene intrusiones o accesos no autorizados a la infraestructura corporativa.

---

### [RNF-04] Usabilidad y Adaptabilidad Multidispositivo
- **Atributo de Calidad:** Usabilidad y Adaptabilidad (Usability & Responsiveness).
- **Que define para el Sistema:** La interfaz debe ser clara, intuitiva y accesible desde distintos dispositivos de trabajo (computadoras de escritorio, laptops, tablets y telefonos moviles institucionales).
- **Criterio de Medicion y Aceptacion:**
  - La interfaz de usuario debe adaptarse fluidamente a pantallas con anchos desde 360 pixeles hasta monitores de alta resolucion, sin perdida de funcionalidad ni desbordamientos horizontales.
  - Cualquier colaborador debe ser capaz de registrar una solicitud de soporte en menos de 3 minutos sin requerir capacitaciones tecnicas previas.
  - La plataforma debe presentar retroalimentacion visual clara (mensajes descriptivos de exito, aviso o error) que guie al usuario ante omisiones o errores de llenado.
- **Impacto en el Servicio:** Facilita la adopcion inmediata de la herramienta por parte de los trabajadores y permite a jefes y supervisores autorizar o derivar casos desde sus dispositivos moviles en cualquier momento.

---

### [RNF-05] Escalabilidad y Capacidad Concurrente
- **Atributo de Calidad:** Capacidad y Escalabilidad (Scalability & Capacity).
- **Que define para el Sistema:** La arquitectura del software debe soportar el crecimiento de la demanda de atenciones y el incremento progresivo de personal sin degradar sus estandares de rendimiento.
- **Criterio de Medicion y Aceptacion:**
  - El sistema debe soportar un minimo de 50 usuarios concurrentes realizando transacciones simultaneas y almacenar mas de 10,000 expedientes historicos sin presentar bloqueos de base de datos ni incremento superior al 20% en los tiempos de respuesta.
- **Impacto en el Servicio:** Garantiza la viabilidad del producto tanto para su uso corporativo actual como para su distribucion a organizaciones de mediana envergadura.

---

### [RNF-06] Mantenibilidad, Modularidad y Arquitectura
- **Atributo de Calidad:** Mantenibilidad y Portabilidad (Maintainability & Modularity).
- **Que define para el Sistema:** La aplicacion debe estructurarse con componentes desacoplados, ordenados y legibles que faciliten su evolucion continua y adaptacion a nuevos requerimientos del negocio.
- **Criterio de Medicion y Aceptacion:**
  - Separacion estricta en tres capas logicas: capa de presentacion visual, capa de servicios y logica del negocio, y capa de persistencia de datos.
  - Modulos independientes para administracion, catalogo de servicios, gestion de tecnicos y ciclo de vida de tickets, permitiendo modificar o incorporar reglas operativas sin alterar el funcionamiento global de la plataforma.
  - Registro centralizado de excepciones y errores para diagnostico rapido por parte del equipo de desarrollo.
- **Impacto en el Servicio:** Reduce el costo y tiempo de mantenimiento, facilitando la incorporacion de nuevas funcionalidades de mesa de ayuda a lo largo del tiempo.
