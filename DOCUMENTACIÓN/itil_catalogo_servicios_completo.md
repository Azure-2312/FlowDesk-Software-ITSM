# Catálogo Maestro Integral de Servicios Corporativos y Workflows de Atención
## Marco Normativo: ITIL v4, ISO/IEC 20000-1, ISO/IEC 27001, SOX y COBIT

Este documento establece el **Catálogo Definitivo de 23 Servicios de TI** para el sistema empresarial, integrando tanto las solicitudes e incidentes operativos de la Mesa de Ayuda (*Helpdesk*), como las prácticas estratégicas de la Mesa de Servicios (*Service Desk*: Cambios CAB, Problemas de causa raíz, Gestión de Activos y Contratos con Proveedores).

---

## 1. Estructura del Portafolio de Servicios (7 Familias Corporativas)

```
+---------------------------------------------------------------------------------------------------+
|                         PORTAFOLIO INTEGRAL DE SERVICIOS DE TI (23 SERVICIOS)                     |
+-------------------------------------------------+-------------------------------------------------+
| MESA DE AYUDA (HELPDESK OPERATIVO)              | MESA DE SERVICIOS (SERVICE DESK AVANZADO)       |
+-------------------------------------------------+-------------------------------------------------+
| Familia 1: Identidad, Accesos y Cuentas (SOX)   | Familia 7: Gestión Estratégica Service Desk     |
| * SRV-ACC-01: Accesos en Sistemas Corporativos  | * SRV-CHG-01: Cambio Estándar de Infraestructura|
| * SRV-ACC-02: Desactivación por Cese Laboral    | * SRV-CHG-02: Cambio Normal Mayor con CAB       |
| * SRV-ACC-03: Accesos Temporales Terceros       | * SRV-PRB-01: Investigación Problema Causa Raíz |
| * SRV-ACC-04: Buzones Compartidos y Listas      | * SRV-CNT-01: Gestión Garantía con Fabricante   |
|                                                 | * SRV-AST-01: Baja Patrimonial y Borrado Seguro |
| Familia 2: Equipamiento y Hardware (ITAM)       +-------------------------------------------------+
| * SRV-HW-01: Asignación de Laptop Nueva         | Familia 5: Ciberseguridad y Riesgos (ISO 27001) |
| * SRV-HW-02: Renovación por Obsolescencia       | * SRV-SEC-01: Restablecimiento Credenciales MFA |
| * SRV-HW-03: Préstamo Equipo de Contingencia    | * SRV-SEC-02: Reporte Incidente Seguridad / Malw|
| * SRV-HW-04: Accesorios Periféricos             | * SRV-SEC-03: Excepción Firewall / Proxy Web    |
|                                                 +-------------------------------------------------+
| Familia 3: Software y Productividad             | Familia 6: Procesos Integrados de Personas      |
| * SRV-SW-01: Software Especializado Licenciado  | * SRV-ONB-01: Puesto Digital Onboarding TI      |
| * SRV-SW-02: Licencias Colaboración Cloud       |                                                 |
| * SRV-SW-03: Restauración Backup de Archivos    |                                                 |
|                                                 |                                                 |
| Familia 4: Conectividad y Redes                 |                                                 |
| * SRV-RED-01: Incidente Conectividad y Voz IP   |                                                 |
| * SRV-RED-02: Habilitación Punto de Red / Wi-Fi |                                                 |
| * SRV-RED-03: Telefonía Móvil Corporativa       |                                                 |
+-------------------------------------------------+-------------------------------------------------+
```

---

## 2. Fichas Técnicas y Workflows Detallados por Servicio

---

### FAMILIA 1: Identidad, Accesos y Cuentas (Gobernanza SOX / ISO 27001)

#### 1. SRV-ACC-01: Accesos y Privilegios en Sistemas Corporativos (ERP / CRM / VPN)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Cuentas y Accesos
* **SLA:** Respuesta: 2h | Resolución: 8h | **Compuerta:** Sí (Jefatura de Área) | **Costo:** S/. 0.00
* **Entregable:** Usuario y roles habilitados en SAP, Oracle o CRM bajo principio de menor privilegio.
* **Workflow:**
  1. `SOLICITADO` (Solicitante): Justificación de negocio y perfil requerido. [SLA Activo]
  2. `PENDIENTE_APROBACION` (Jefe Aprobador): Compuerta de autorización jerárquica. [Pausa SLA]
  3. `VALIDACION_SEGURIDAD` (Seguridad TI): Verificación de no conflicto SoD (Segregation of Duties). [SLA Activo]
  4. `APROVISIONAMIENTO` (Sistemas N3): Creación técnica de la cuenta y asignación de permisos. [SLA Activo]
  5. `VERIFICACION_ENTREGA` (Solicitante): Comprobación de ingreso conforme y cierre. [SLA Activo]

#### 2. SRV-ACC-02: Desactivación Inmediata de Accesos por Cese Laboral (Offboarding TI)
* **Tipo ITIL:** Solicitud de Servicio (Prioridad Alta) | **Categoría:** Cuentas y Accesos
* **SLA:** Respuesta: 1h | Resolución: 2h | **Compuerta:** No (Mandato formal de RRHH) | **Costo:** S/. 0.00
* **Entregable:** Cuentas de Active Directory y correo bloqueadas, tokens de sesión revocados, reenvío de buzón configurado y acta de revocación generada para auditoría SOX/ISO 27001.
* **Workflow:**
  1. `NOTIFICACION_RRHH` (Recursos Humanos): Registro de cese con fecha y hora exacta de desvinculación. [SLA Activo]
  2. `BLOQUEO_INMEDIATO` (Mesa N1 / Sistemas N3): Desactivación de cuenta en AD, reseteo de clave y revocación de tokens OAuth activos en móviles/laptops. [SLA Activo]
  3. `CONVERSION_BUZON` (Sistemas N3): Conversión de buzón a buzón compartido y asignación de permisos de lectura a la jefatura directa. [SLA Activo]
  4. `AUDITORIA_REVOCACION` (Seguridad TI): Confirmación de revocación total en ERP, CRM, VPN y emisión de certificado de baja de accesos. [SLA Activo]

#### 3. SRV-ACC-03: Accesos Temporales para Terceros, Contratistas o Consultores Externos
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Cuentas y Accesos
* **SLA:** Respuesta: 2h | Resolución: 4h | **Compuerta:** Sí (Sponsor Interno / Gerencia) | **Costo:** S/. 0.00
* **Entregable:** Credencial temporal con fecha de expiración automática fijada en Active Directory y acceso VPN restringido únicamente a la IP del servidor de destino.
* **Workflow:**
  1. `SOLICITADO` (Solicitante / Sponsor): Registro de datos del contratista, empresa proveedora, fecha límite de servicio y servidores requeridos. [SLA Activo]
  2. `APROBACION_SPONSOR` (Gestor de Área): Validación de contrato vigente y responsabilidad del consultor. [Pausa SLA]
  3. `POLITICA_CADUCIDAD` (Seguridad TI): Configuración de regla en firewall con lista blanca estricta (IP destino) y parámetro `AccountExpires` en AD. [SLA Activo]
  4. `ENTREGA_CREDENCIAL` (Mesa N1): Envío de credencial temporal vía canal cifrado al consultor. [SLA Activo]

#### 4. SRV-ACC-04: Creación de Buzones Compartidos y Listas de Distribución
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Cuentas y Accesos
* **SLA:** Respuesta: 4h | Resolución: 12h | **Compuerta:** Sí (Jefatura de Área) | **Costo:** S/. 0.00
* **Entregable:** Buzón compartido en Exchange / M365 (ej. `facturacion@empresa.com`) con miembros asignados y permisos Send-As / Full-Access.
* **Workflow:**
  1. `SOLICITADO` (Solicitante): Nombre propuesto del buzón, propósito y lista de usuarios autorizados. [SLA Activo]
  2. `APROBACION_JEFATURA` (Jefe Aprobador): Visto bueno del correo funcional corporativo. [Pausa SLA]
  3. `CREACION_EXCHANGE` (Sistemas N3): Creación del objeto compartido en Exchange Online y configuración de permisos de delegación. [SLA Activo]
  4. `VERIFICACION` (Solicitante): Comprobación de sincronización del buzón en los clientes Outlook de los usuarios autorizados. [SLA Activo]

---

### FAMILIA 2: Equipamiento de Cómputo y Puesto de Trabajo (ITAM / Hardware Lifecycle)

#### 5. SRV-HW-01: Asignación de Laptop o Estación de Trabajo Nueva
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Equipamiento Nuevo
* **SLA:** Respuesta: 4h | Resolución: 48h | **Compuerta:** Sí (Aprobación Presupuestal) | **Costo:** S/. 1,200.00
* **Entregable:** Laptop corporativa con imagen oficial (SOE), BitLocker activo, antivirus corporativo y registro patrimonial en CMDB.
* **Workflow:**
  1. `SOLICITADO` (Solicitante): Petición de equipo e imputación a centro de costos. [SLA Activo]
  2. `APROBACION_PRESUPUESTO` (Jefe Aprobador): Aprobación presupuestal de la compra o amortización del hardware. [Pausa SLA]
  3. `PREPARACION_STAGING` (Soporte N2): Clonación de SOE, cifrado de disco y unión al dominio. [SLA Activo]
  4. `REGISTRO_CMDB` (Soporte N2): Asociación de placa patrimonial, serie y MAC con el usuario en el inventario. [SLA Activo]
  5. `ENTREGA_CONFORMIDAD` (Solicitante): Firma de acta de entrega física y custodia del bien. [SLA Activo]

#### 6. SRV-HW-02: Renovación Tecnológica por Obsolescencia de Equipo (Ciclo de Vida 3-4 años)
* **Tipo ITIL:** Solicitud de Servicio (Planificado) | **Categoría:** Equipamiento Nuevo
* **SLA:** Respuesta: 8h | Resolución: 72h | **Compuerta:** Sí (Validación de Antigüedad por TI) | **Costo:** S/. 1,200.00
* **Entregable:** Reemplazo de equipo antiguo por un modelo vigente, migración transparente de datos del usuario y disposición del equipo anterior a resguardo.
* **Workflow:**
  1. `SOLICITUD_RENOVACION` (Solicitante): Petición indicando placa patrimonial del equipo actual. [SLA Activo]
  2. `VALIDACION_OBSOLESCENCIA` (Gestor de Activos TI): Verificación en CMDB de fecha de compra (> 36 meses de uso). [SLA Activo]
  3. `APROBACION_GERENCIA` (Jefe Aprobador): Visto bueno para reemplazo dentro del plan de CAPEX anual. [Pausa SLA]
  4. `BACKUP_Y_MIGRACION` (Soporte N2): Respaldo de perfil local y transferencia al nuevo equipo. [SLA Activo]
  5. `CANJE_Y_ACTA` (Solicitante / Soporte N2): Entrega del nuevo portátil, recepción del equipo saliente y actualización de estado en CMDB a "En Retiro". [SLA Activo]

#### 7. SRV-HW-03: Préstamo de Equipo de Cómputo de Contingencia (Pool de Resguardo)
* **Tipo ITIL:** Solicitud de Servicio (Rápida) | **Categoría:** Equipamiento Nuevo
* **SLA:** Respuesta: 1h | Resolución: 4h | **Compuerta:** No (Pre-aprobado por contingencia) | **Costo:** S/. 0.00
* **Entregable:** Laptop de resguardo temporal provista en menos de 4 horas mientras el equipo titular se encuentra en reparación o servicio técnico de garantía.
* **Workflow:**
  1. `SOLICITUD_CONTINGENCIA` (Solicitante): Reporte de equipo titular dañado o extraviado con ticket de incidente asociado. [SLA Activo]
  2. `ASIGNACION_POOL` (Mesa N1): Verificación de disponibilidad en el stock de contingencia y reserva de activo. [SLA Activo]
  3. `CONFIGURACION_EXPRESS` (Soporte N2): Ajuste de perfil rápido y conectividad VPN. [SLA Activo]
  4. `FIRMA_PRESTAMO` (Solicitante): Firma de acta de préstamo temporal con fecha pactada de devolución. [SLA Activo]

#### 8. SRV-HW-04: Asignación de Accesorios Periféricos y Ergonomía (Monitores, Docks, Headsets)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Equipamiento Nuevo
* **SLA:** Respuesta: 4h | Resolución: 24h | **Compuerta:** No (Pre-aprobado para catálogo estándar) | **Costo:** S/. 150.00
* **Entregable:** Monitor secundario de 24 pulgadas, estación de acoplamiento (docking station), teclado, mouse o auriculares certificados para teletrabajo.
* **Workflow:**
  1. `SOLICITUD_PERIFERICO` (Solicitante): Selección del accesorio requerido del catálogo de puesto. [SLA Activo]
  2. `DESPACHO_ALMACEN` (Gestor de Activos TI): Extracción del accesorio de almacén y registro de egreso. [SLA Activo]
  3. `INSTALACION_SEDE` (Soporte N2): Colocación en el escritorio del colaborador, prueba de video/audio y firma de recepción. [SLA Activo]

---

### FAMILIA 3: Software, Productividad y Licencias (Software Asset Management)

#### 9. SRV-SW-01: Instalación y Licenciamiento de Software Especializado (Power BI, AutoCAD, Adobe)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Instalación de Software
* **SLA:** Respuesta: 2h | Resolución: 24h | **Compuerta:** Sí (Aprobación de Costo de Licencia) | **Costo:** S/. 350.00
* **Entregable:** Software corporativo activado mediante licencia legal asignada al tenant de la empresa y registrado en inventario de software.
* **Workflow:**
  1. `SOLICITADO` (Solicitante): Solicitud indicando versión requerida y justificación en proyecto. [SLA Activo]
  2. `APROBACION_COSTO` (Jefe Aprobador): Autorización de la suscripción anual o costo de licencia. [Pausa SLA]
  3. `ASIGNACION_TENANT` (Gestor de Activos TI): Asignación de licencia en portal de licenciamiento del fabricante. [SLA Activo]
  4. `DESPLIEGUE_REMOTO` (Sistemas N3): Distribución desatendida mediante Endpoint Manager o instalación remota. [SLA Activo]
  5. `VERIFICACION` (Solicitante): Comprobación de apertura funcional y cierre del servicio. [SLA Activo]

#### 10. SRV-SW-02: Aprovisionamiento de Licencia de Colaboración Cloud (Microsoft 365 / Workspace / Zoom)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Instalación de Software
* **SLA:** Respuesta: 2h | Resolución: 12h | **Compuerta:** No (Pre-aprobado por plan de empresa) | **Costo:** S/. 0.00
* **Entregable:** Asignación de plan de suscripción (M365 E3/E5, Google Workspace o Zoom Enterprise) en la consola central de identidades.
* **Workflow:**
  1. `SOLICITUD_PLAN` (Solicitante): Requerimiento de activación de capacidad (ej. licencia de webinars o telefonía Teams). [SLA Activo]
  2. `APROVISIONAMIENTO_CLOUD` (Sistemas N3): Asignación del SKU en Azure Active Directory / Admin Center. [SLA Activo]
  3. `NOTIFICACION_INSTRUCCION` (Mesa N1): Envío de guía de uso de la herramienta habilitada al solicitante. [SLA Activo]

#### 11. SRV-SW-03: Restauración de Archivos y Copias de Seguridad (Restore de Backup)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Software y Aplicaciones
* **SLA:** Respuesta: 2h | Resolución: 8h | **Compuerta:** Sí (Aprobación del Propietario de Datos) | **Costo:** S/. 0.00
* **Entregable:** Archivo, base de datos o carpeta recuperada desde el sistema corporativo de copias de seguridad (Veeam / Commvault) a la fecha solicitada.
* **Workflow:**
  1. `SOLICITUD_RESTORE` (Solicitante): Ruta exacta del archivo, nombre y fecha objetivo de la copia requerida. [SLA Activo]
  2. `APROBACION_SEGURIDAD_DATOS` (Jefe Aprobador / Dueño de Datos): Autorización para sobrescribir o restaurar información en área compartida. [Pausa SLA]
  3. `EJECUCION_JOB_BACKUP` (Sistemas N3 / Especialista Storage): Montaje del punto de restauración y copia hacia el repositorio seguro. [SLA Activo]
  4. `VALIDACION_INTEGRIDAD` (Solicitante): Confirmación de lectura del archivo restaurado sin corrupción. [SLA Activo]

---

### FAMILIA 4: Conectividad, Redes y Comunicaciones (Disponibilidad / Incidentes)

#### 12. SRV-RED-01: Incidente de Conectividad de Red y Telefonía IP en Sede
* **Tipo ITIL:** Incidente Operativo | **Categoría:** Redes y Conectividad
* **SLA:** Respuesta: 1h | Resolución: 4h | **Compuerta:** No (Falla operativa, atención inmediata) | **Costo:** S/. 0.00
* **Entregable:** Enlace de red cableado o Wi-Fi operativo a velocidades nominales, puerto de switch reparado o anexo IP funcional.
* **Workflow:**
  1. `REPORTADO` (Solicitante): Reporte indicando puesto, piso, sede y síntomas de pérdida de conexión. [SLA Activo]
  2. `TRIAJE_N1` (Mesa N1): Prueba remota de ping, comprobación de DHCP y estado de switch de acceso. [SLA Activo]
  3. `INTERVENCION_SEDE` (Soporte N2 / Redes): Sustitución de patch cord, patch panel o reconfiguración de puerto VLAN. [SLA Activo]
  4. `CERTIFICACION_ENLACE` (Soporte N2): Comprobación de no pérdida de paquetes y latencia estable. [SLA Activo]
  5. `RESOLUCION_CIERRE` (Solicitante): Validación de navegación y servicio telefónico normal. [SLA Activo]

#### 13. SRV-RED-02: Habilitación de Punto de Red Físico o Ampliación de Cobertura Wi-Fi
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Redes y Conectividad
* **SLA:** Respuesta: 4h | Resolución: 24h | **Compuerta:** Sí (Jefatura de Operaciones / Infraestructura) | **Costo:** S/. 200.00
* **Entregable:** Punto de red de datos Cat 6A ponchado, certificado con fluke y conectado a switch corporativo, o Access Point instalado para cobertura Wi-Fi.
* **Workflow:**
  1. `SOLICITUD_CABLEADO` (Solicitante): Ubicación del nuevo puesto de trabajo y justificación de densidad. [SLA Activo]
  2. `APROBACION_INFRAESTRUCTURA` (Jefe Aprobador): Visto bueno de espacio físico y puertos libres en rack. [Pausa SLA]
  3. `TENDIDO_Y_CERTIFICACION` (Soporte N2 / Especialista Redes): Tiraje de cable UTP, ponchado en patch panel y certificación. [SLA Activo]
  4. `HABILITACION_SWITCH` (Sistemas N3 / Redes): Asignación de VLAN corporativa en el switch gestionable. [SLA Activo]
  5. `ENTREGA_CONFORME` (Solicitante): Conexión de equipo y comprobación de velocidad de 1 Gbps. [SLA Activo]

#### 14. SRV-RED-03: Asignación y Configuración de Telefonía Móvil Corporativa (Smartphone)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Redes y Conectividad
* **SLA:** Respuesta: 4h | Resolución: 48h | **Compuerta:** Sí (Aprobación Gerencial) | **Costo:** S/. 800.00
* **Entregable:** Smartphone corporativo configurado con MDM (Mobile Device Management), plan de datos corporativo, chip SIM y aplicaciones de negocio aseguradas.
* **Workflow:**
  1. `SOLICITUD_MOVIL` (Solicitante): Justificación por rol comercial o gerencial en constante movilidad. [SLA Activo]
  2. `APROBACION_GERENCIA` (Jefe Aprobador): Autorización del costo de terminal y factura mensual de telefonía. [Pausa SLA]
  3. `ENROLAMIENTO_MDM` (Sistemas N3): Configuración de directivas de seguridad (cifrado, borrado remoto, contenedor seguro). [SLA Activo]
  4. `ENTREGA_TERMINAL` (Soporte N2): Firma de cargo de custodia del smartphone y entrega física al colaborador. [SLA Activo]

---

### FAMILIA 5: Ciberseguridad y Gestión de Riesgos (ISO 27001 / Incidentes de Seguridad)

#### 15. SRV-SEC-01: Restablecimiento de Credenciales y Factor de Doble Autenticación (MFA)
* **Tipo ITIL:** Solicitud de Servicio (Ágil) | **Categoría:** Cuentas y Accesos
* **SLA:** Respuesta: 1h | Resolución: 1h | **Compuerta:** No (Autoservicio / Mesa N1) | **Costo:** S/. 0.00
* **Entregable:** Cuenta reactivada, token MFA reseteado y contraseña temporal forzando cambio inmediato.
* **Workflow:**
  1. `SOLICITADO` (Solicitante): Petición con canal secundario de validación de identidad. [SLA Activo]
  2. `DESAFIO_IDENTIDAD` (Mesa N1 / Sistema): Verificación de autenticidad para prevenir suplantación o ingeniería social. [SLA Activo]
  3. `EJECUCION_RESET` (Mesa N1): Desbloqueo en AD / Azure AD con bandera `MustChangePasswordNextLogon`. [SLA Activo]
  4. `CONFIRMACION_CIERRE` (Solicitante): Inicio de sesión exitoso con nueva contraseña personal. [SLA Activo]

#### 16. SRV-SEC-02: Reporte de Incidente de Seguridad / Correo Malicioso (Phishing / Malware)
* **Tipo ITIL:** Incidente Operativo (Prioridad Crítica P1) | **Categoría:** Cuentas y Accesos
* **SLA:** Respuesta: 15 min | Resolución: 1h | **Compuerta:** No (Contención de Emergencia) | **Costo:** S/. 0.00
* **Entregable:** Remoción del correo malicioso de todos los buzones de la empresa, bloqueo de URL en firewall, análisis de compromiso y aislamiento de equipo si hubo ejecución.
* **Workflow:**
  1. `REPORTE_AMENAZA` (Solicitante): Reenvío de correo sospechoso o reporte de comportamiento anómalo en PC. [SLA Activo]
  2. `TRIAJE_INMEDIATO` (Seguridad TI / SOC): Análisis de cabeceras de correo, URL maliciosa y hash de adjunto en sandbox. [SLA Activo]
  3. `CONTENCION_Y_PURGA` (Seguridad TI): Aislamiento de red del endpoint si ejecutó malware y purga masiva del correo en todo el tenant de Office 365. [SLA Activo]
  4. `BLOQUEO_INDICADORES` (Sistemas N3 / Redes): Inclusión del dominio y dirección IP atacante en la lista negra global del firewall perimetral. [SLA Activo]
  5. `INFORME_CIERRE` (Seguridad TI): Notificación al usuario de amenaza contenida y recomendaciones de prevención. [SLA Activo]

#### 17. SRV-SEC-03: Solicitud de Excepción de Navegación o Desbloqueo en Firewall Web
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Redes y Conectividad
* **SLA:** Respuesta: 2h | Resolución: 8h | **Compuerta:** Sí (Oficial de Seguridad CISO) | **Costo:** S/. 0.00
* **Entregable:** Dominio web o categoría desbloqueada en el proxy / firewall perimetral para una IP o usuario específico con justificación comercial.
* **Workflow:**
  1. `SOLICITUD_DESBLOQUEO` (Solicitante): URL bloqueada, categoría detectada y justificación operativa del negocio. [SLA Activo]
  2. `ANALISIS_REPUTACION` (Seguridad TI): Inspección del sitio en bases de datos de amenazas (VirusTotal, Cisco Talos). [SLA Activo]
  3. `APROBACION_CISO` (Seguridad TI / Jefe Aprobador): Evaluación de riesgo de fuga de información o infección. [Pausa SLA]
  4. `REGLA_FIREWALL` (Sistemas N3 / Redes): Adición de la excepción temporal o permanente en el proxy web. [SLA Activo]
  5. `VERIFICACION_ACCESO` (Solicitante): Comprobación de navegación exitosa en el sitio autorizado. [SLA Activo]

---

### FAMILIA 6: Procesos Integrados de Personas (Employee Experience)

#### 18. SRV-ONB-01: Habilitación Integral de Puesto Digital para Nuevos Ingresos (Onboarding TI)
* **Tipo ITIL:** Solicitud de Servicio (Coordinada) | **Categoría:** Equipamiento Nuevo
* **SLA:** Respuesta: 2h | Resolución: 48h previas al ingreso | **Compuerta:** No (Mandato contractual de RRHH) | **Costo:** S/. 0.00
* **Entregable:** Kit tecnológico completo listo para el primer día laboral: cuenta AD, correo, laptop configurada, anexo IP y accesos departamentales base.
* **Workflow:**
  1. `SOLICITUD_RRHH` (Recursos Humanos): Envío de ficha con fecha de ingreso, puesto, departamento y sede. [SLA Activo]
  2. `TAREA_IDENTIDAD` (Sistemas N3): Creación de cuenta en Active Directory, buzón y asignación de licencias base. [SLA Activo]
  3. `TAREA_HARDWARE` (Soporte N2): Preparación física de laptop, imagen corporativa y rotulado patrimonial. [SLA Activo]
  4. `TAREA_COMUNICACIONES` (Soporte N2 / Redes): Asignación de anexo telefónico y perfil VPN. [SLA Activo]
  5. `CONTROL_CALIDAD` (Supervisor TI): Verificación integral del checklist "Día 1 Listo". [SLA Activo]
  6. `ENTREGA_DIA1` (Soporte N2): Entrega del equipo en sede, firma de cargo e inducción al nuevo colaborador. [SLA Activo]

---

### FAMILIA 7: Gestión Estratégica Service Desk (ITIL v4: Cambios, Problemas, Activos y Proveedores)

#### 19. SRV-CHG-01: Solicitud de Cambio Estándar de Infraestructura (Change Enablement)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Software y Aplicaciones
* **SLA:** Respuesta: 4h | Resolución: 24h | **Compuerta:** No (Pre-aprobado bajo procedimiento estándar documentado) | **Costo:** S/. 0.00
* **Entregable:** Ejecución de tarea programada de bajo riesgo en infraestructura (ej. reinicio mensual de servidor, renovación de certificado SSL, aplicación de parches de seguridad probados en testing).
* **Workflow:**
  1. `REGISTRO_RFC_ESTANDAR` (Sistemas N3 / Técnico): Registro del cambio citando el procedimiento estándar autorizado. [SLA Activo]
  2. `NOTIFICACION_USUARIOS` (Mesa N1): Publicación de aviso de ventana de mantenimiento fuera de horario de producción. [SLA Activo]
  3. `EJECUCION_VENTANA` (Sistemas N3): Aplicación del cambio en el horario nocturno estipulado con plan de rollback disponible. [SLA Activo]
  4. `PRUEBAS_POST_CAMBIO` (Sistemas N3 / Técnico): Comprobación de salud de los servicios y confirmación de estabilidad. [SLA Activo]
  5. `CIERRE_RFC` (Supervisor TI): Registro del resultado y lecciones aprendidas en la bitácora de cambios. [SLA Activo]

#### 20. SRV-CHG-02: Solicitud de Cambio Normal Mayor con Aprobación del Comité CAB
* **Tipo ITIL:** Solicitud de Servicio (Estratégico) | **Categoría:** Software y Aplicaciones
* **SLA:** Respuesta: 8h | Resolución: 72h | **Compuerta:** Sí (Comité Asesor de Cambios - CAB Obligatorio) | **Costo:** S/. 0.00
* **Entregable:** Pase a producción autorizado formalmente tras análisis de impacto en el negocio, plan de contingencia (rollback) y pruebas en entorno de pre-producción (UAT).
* **Workflow:**
  1. `SOLICITUD_RFC_MAYOR` (Sistemas N3 / Desarrollador): Documento técnico de cambio, justificación, riesgos y plan de retroceso. [SLA Activo]
  2. `SESION_EVALUACION_CAB` (Comité CAB / Gestor de Área / Seguridad): Revisión colegiada de impacto operativo y fecha de pase. [Pausa SLA]
  3. `AUTORIZACION_CAMBIO` (Supervisor TI / Gestor de Área): Firma formal de aprobación del CAB en el sistema de tickets. [SLA Activo]
  4. `DESPLIEGUE_PRODUCCION` (Sistemas N3): Ejecución coordinada del cambio en la ventana acordada. [SLA Activo]
  5. `REVISION_POST_IMPLEMENTACION_PIR` (Auditor / Supervisor TI): Evaluación de no afectación de incidentes posteriores al cambio. [SLA Activo]

#### 21. SRV-PRB-01: Apertura de Investigación de Problema de Causa Raíz (Problem Management)
* **Tipo ITIL:** Incidente / Problema | **Categoría:** Software y Aplicaciones
* **SLA:** Respuesta: 8h | Resolución: 96h | **Compuerta:** No (Investigación técnica profunda) | **Costo:** S/. 0.00
* **Entregable:** Identificación de la causa raíz de fallas recurrentes, solución temporal documentada (Workaround en KEDB) y propuesta de solución definitiva o cambio mayor.
* **Workflow:**
  1. `APERTURA_PROBLEMA` (Supervisor TI): Detección de incidentes repetitivos (ej. caídas constantes del ERP contable) y asociación de tickets hijos. [SLA Activo]
  2. `ANALISIS_CAUSA_RAIZ_RCA` (Sistemas N3 / Especialista): Diagnóstico con técnicas Ishikawa / 5 Porqués para identificar la raíz técnica. [SLA Activo]
  3. `PUBLICACION_WORKAROUND` (Sistemas N3): Documentación de la solución temporal en la Base de Conocimiento de Errores Conocidos (KEDB) para Mesa N1. [SLA Activo]
  4. `PROPUESTA_SOLUCION_DEFINITIVA` (Sistemas N3): Generación de una Solicitud de Cambio (RFC) o parche definitivo. [SLA Activo]
  5. `CIERRE_MASIVO_INCIDENTES` (Supervisor TI): Resolución del Problema y cierre automatizado de todos los tickets de incidentes vinculados. [SLA Activo]

#### 22. SRV-CNT-01: Gestión de Garantía de Hardware y Reemplazo con Proveedor Externo
* **Tipo ITIL:** Incidente / Solicitud | **Categoría:** Hardware y Equipos
* **SLA:** Respuesta: 4h | Resolución: 72h | **Compuerta:** No (Gestión con contrato de soporte activo) | **Costo:** S/. 0.00
* **Entregable:** Pieza de hardware o equipo completo reemplazado por la garantía oficial del fabricante (Lenovo Premier Support, Dell ProSupport, Cisco SmartNet) sin costo adicional.
* **Workflow:**
  1. `DIAGNOSTICO_FALLA_HARDWARE` (Soporte N2): Comprobación de daño físico no reparable internamente (placa madre, pantalla, disco). [SLA Activo]
  2. `APERTURA_CASO_PROVEEDOR` (Soporte N2): Registro de caso en el portal del fabricante citando número de serie y contrato. [SLA Activo]
  3. `ESPERA_REPUESTO_PROVEEDOR` (Soporte N2): El ticket entra en estado `En espera de proveedor` con reloj pausado justificadamente. [Pausa SLA]
  4. `INTERVENCION_TECNICO_EXTERNO` (Soporte N2 / Proveedor): Asistencia en sede para el reemplazo físico del componente por el fabricante. [SLA Activo]
  5. `PRUEBA_OPERATIVIDAD_Y_CIERRE` (Soporte N2): Diagnóstico de hardware satisfactorio, actualización de serie en CMDB y cierre. [SLA Activo]

#### 23. SRV-AST-01: Baja Patrimonial y Disposición Segura de Activos de TI (IT Asset Disposal)
* **Tipo ITIL:** Solicitud de Servicio | **Categoría:** Equipamiento Nuevo
* **SLA:** Respuesta: 8h | Resolución: 48h | **Compuerta:** Sí (Aprobación de Contabilidad / Auditoría) | **Costo:** S/. 0.00
* **Entregable:** Activo desincorporado de la CMDB y de libros contables, borrado criptográfico seguro de discos (NIST SP 800-88) con certificado de destrucción de datos y disposición ambiental RAEE.
* **Workflow:**
  1. `SOLICITUD_BAJA` (Gestor de Activos TI / Soporte N2): Ficha técnica de equipo dañado irreparable u obsoleto con valor contable cero. [SLA Activo]
  2. `APROBACION_CONTABLE_Y_AUDITORIA` (Auditor / Administrador): Autorización formal de desincorporación patrimonial de activos fijos. [Pausa SLA]
  3. `BORRADO_SEGURO_DATOS` (Seguridad TI): Ejecución de borrado seguro certificado de almacenamiento magnético/SSD bajo estándar NIST 800-88. [SLA Activo]
  4. `CERTIFICADO_Y_BAJA_CMDB` (Gestor de Activos TI): Emisión del certificado de destrucción de datos y actualización de estado en CMDB a "Desincorporado". [SLA Activo]
  5. `DISPOSICION_RAEE` (Soporte N2): Entrega física a operador certificado de residuos de aparatos eléctricos y electrónicos. [SLA Activo]

---

## 3. Matriz Resumen de Servicios y Parámetros Operativos

| Código | Servicio | Familia | Tipo ITIL | SLA Resp. | SLA Resol. | Compuerta | Costo Ref. |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **SRV-ACC-01** | Accesos en Sistemas Corporativos | Identidad | Solicitud | 2h | 8h | Sí (Jefatura) | S/. 0.00 |
| **SRV-ACC-02** | Desactivación por Cese Laboral (Offboarding) | Identidad | Solicitud | 1h | 2h | No | S/. 0.00 |
| **SRV-ACC-03** | Accesos Temporales a Terceros / Contratistas | Identidad | Solicitud | 2h | 4h | Sí (Sponsor) | S/. 0.00 |
| **SRV-ACC-04** | Buzones Compartidos y Listas de Correo | Identidad | Solicitud | 4h | 12h | Sí (Jefatura) | S/. 0.00 |
| **SRV-HW-01** | Asignación de Laptop o PC Nueva | Hardware | Solicitud | 4h | 48h | Sí (Presupuesto) | S/. 1,200.00 |
| **SRV-HW-02** | Renovación por Obsolescencia Tecnológica | Hardware | Solicitud | 8h | 72h | Sí (Gerencia) | S/. 1,200.00 |
| **SRV-HW-03** | Préstamo de Equipo de Contingencia (Pool) | Hardware | Solicitud | 1h | 4h | No | S/. 0.00 |
| **SRV-HW-04** | Accesorios Periféricos y Ergonomía | Hardware | Solicitud | 4h | 24h | No | S/. 150.00 |
| **SRV-SW-01** | Software Especializado Licenciado | Software | Solicitud | 2h | 24h | Sí (Costo) | S/. 350.00 |
| **SRV-SW-02** | Licencias de Colaboración Cloud (M365/Zoom) | Software | Solicitud | 2h | 12h | No | S/. 0.00 |
| **SRV-SW-03** | Restauración de Backup de Archivos | Software | Solicitud | 2h | 8h | Sí (Dueño Datos)| S/. 0.00 |
| **SRV-RED-01** | Incidente de Conectividad y Telefonía IP | Redes | Incidente | 1h | 4h | No | S/. 0.00 |
| **SRV-RED-02** | Habilitación de Punto de Red o Wi-Fi | Redes | Solicitud | 4h | 24h | Sí (Infraestr.) | S/. 200.00 |
| **SRV-RED-03** | Telefonía Móvil Corporativa (Smartphone) | Redes | Solicitud | 4h | 48h | Sí (Gerencia) | S/. 800.00 |
| **SRV-SEC-01** | Restablecimiento de Credenciales y MFA | Seguridad | Solicitud | 1h | 1h | No | S/. 0.00 |
| **SRV-SEC-02** | Reporte de Incidente de Seguridad / Malware | Seguridad | Incidente | 15 min | 1h | No | S/. 0.00 |
| **SRV-SEC-03** | Excepción de Firewall o Proxy Web | Seguridad | Solicitud | 2h | 8h | Sí (CISO) | S/. 0.00 |
| **SRV-ONB-01** | Habilitación de Puesto Digital Onboarding | Personas | Solicitud | 2h | 48h | No | S/. 0.00 |
| **SRV-CHG-01** | Cambio Estándar de Infraestructura | ServiceDesk | Solicitud | 4h | 24h | No | S/. 0.00 |
| **SRV-CHG-02** | Cambio Normal Mayor con Aprobación CAB | ServiceDesk | Solicitud | 8h | 72h | Sí (CAB) | S/. 0.00 |
| **SRV-PRB-01** | Investigación de Problema de Causa Raíz | ServiceDesk | Incidente | 8h | 96h | No | S/. 0.00 |
| **SRV-CNT-01** | Gestión de Garantía con Fabricante | ServiceDesk | Solicitud | 4h | 72h | No (Pausa Prov.)| S/. 0.00 |
| **SRV-AST-01** | Baja Patrimonial y Borrado Seguro NIST | ServiceDesk | Solicitud | 8h | 48h | Sí (Auditoría) | S/. 0.00 |
