import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

/**
 * Transporter de Nodemailer configurado con el servicio de Gmail.
 */
function obtenerTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error("Faltan las variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD.replace(/\s+/g, ""), // Limpiar cualquier espacio accidental
    },
  });
}

/**
 * Envía el correo con el código de 6 caracteres para la recuperación de contraseña.
 */
export async function enviarCorreoCodigoRecuperacion(
  correoDestino: string,
  codigo: string,
  nombres: string
): Promise<{ success: boolean; messageId?: string }> {
  const transporter = obtenerTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; }
        .header h1 { color: #1e3a8a; font-size: 20px; margin: 0; }
        .content { color: #374151; font-size: 14px; line-height: 1.6; }
        .code-box { text-align: center; margin: 28px 0; }
        .code { display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1d4ed8; background-color: #eff6ff; padding: 14px 28px; border-radius: 8px; border: 2px dashed #93c5fd; }
        .alert-box { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #92400e; }
        .footer { margin-top: 28px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Sistema de Tickets</h1>
        </div>
        <div class="content">
          <p>Hola, <strong>${nombres}</strong>:</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu usuario. Tu código de seguridad es:</p>
          
          <div class="code-box">
            <span class="code">${codigo}</span>
          </div>

          <div class="alert-box">
            <p style="margin: 0 0 6px 0;"><strong>Validez del código:</strong> Solo tienes <strong>1 minuto</strong> a partir de este momento para ingresarlo en el sistema.</p>
            <p style="margin: 0;"><strong>Tiempo límite:</strong> Dispones de un máximo de <strong>3 minutos</strong> para concluir el cambio de contraseña.</p>
          </div>

          <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
            Si tú no solicitaste este código, puedes ignorar este mensaje con total tranquilidad; tu contraseña actual no será modificada.
          </p>
        </div>
        <div class="footer">
          Mensaje automático generado por el Sistema de Mesa de Ayuda. Por favor no responder a este correo.
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: `"Sistema de Tickets" <${GMAIL_USER}>`,
    to: correoDestino,
    subject: `Tu código de recuperación es ${codigo} - Sistema de Tickets`,
    text: `Hola ${nombres}, tu código de recuperación para el Sistema de Tickets es: ${codigo}. Es válido únicamente por 1 minuto y tienes 3 minutos en total para completar el cambio.`,
    html: htmlContent,
  });

  return { success: true, messageId: info.messageId };
}

/**
 * Envía un correo con las credenciales corporativas generadas al correo personal del nuevo usuario.
 */
export async function enviarCorreoCredencialesNuevas(
  correoPersonalDestino: string,
  datos: {
    nombres: string;
    correoCorporativo: string;
    claveTemporal: string;
    perfiles: string[];
  }
): Promise<{ success: boolean; messageId?: string }> {
  const transporter = obtenerTransporter();

  const perfilesHtml = datos.perfiles.length > 0
    ? datos.perfiles.map(p => `<span style="display:inline-block;background:#e0e7ff;color:#3730a3;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:600;margin-right:4px;margin-bottom:4px;">${p}</span>`).join(" ")
    : '<span style="color:#64748b;font-size:12px;">Sin perfil asignado</span>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
        .card { max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }
        .header h1 { color: #1e3a8a; font-size: 20px; margin: 0; }
        .content { color: #334155; font-size: 14px; line-height: 1.6; }
        .credenciales-box { background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0; }
        .cred-item { margin-bottom: 12px; }
        .cred-item:last-child { margin-bottom: 0; }
        .cred-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .cred-valor { font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 3px; word-break: break-all; }
        .alert-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #1e40af; }
        .footer { margin-top: 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Sistema de Tickets</h1>
        </div>
        <div class="content">
          <p>Estimado(a) <strong>${datos.nombres}</strong>:</p>
          <p>Tu usuario de acceso al Sistema de Gestión de Tickets ha sido creado exitosamente. A continuación encontrarás tus credenciales oficiales de acceso:</p>
          
          <div class="credenciales-box">
            <div class="cred-item">
              <div class="cred-label">Usuario / Correo corporativo:</div>
              <div class="cred-valor">${datos.correoCorporativo}</div>
            </div>
            <div class="cred-item">
              <div class="cred-label">Contraseña estándar asignada:</div>
              <div class="cred-valor">${datos.claveTemporal}</div>
            </div>
            <div class="cred-item">
              <div class="cred-label">Perfil(es) en el sistema:</div>
              <div style="margin-top: 5px;">
                ${perfilesHtml}
              </div>
            </div>
          </div>

          <div class="alert-box">
            <p style="margin: 0 0 6px 0;"><strong>Instrucciones de seguridad:</strong></p>
            <p style="margin: 0;">Utiliza tu correo corporativo y contraseña para tu primer ingreso al sistema. Recuerda mantener tus credenciales en confidencialidad y actualizar tu clave periódicamente.</p>
          </div>
        </div>
        <div class="footer">
          Mensaje automático generado por el Sistema de Gestión de Tickets. Por favor no responder a este correo.
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: `"Sistema de Tickets" <${GMAIL_USER}>`,
    to: correoPersonalDestino,
    subject: `Credenciales de acceso al Sistema de Tickets`,
    text: `Hola ${datos.nombres}, tu usuario de acceso ha sido creado. Correo corporativo: ${datos.correoCorporativo}, Contraseña: ${datos.claveTemporal}.`,
    html: htmlContent,
  });

  return { success: true, messageId: info.messageId };
}

