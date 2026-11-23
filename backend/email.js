import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Por defecto usamos gmail, se puede configurar otro SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

export const sendRecoveryEmail = async (to, newPassword) => {
  const mailOptions = {
    from: `"Casa Tuti" <${process.env.EMAIL_USER || 'no-reply@casatuti.com'}>`,
    to,
    subject: 'Recuperación de Contraseña - Casa Tuti',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #455f3e;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Hemos recibido una solicitud para recuperar tu contraseña en la plataforma de Casa Tuti.</p>
        <p>Tu nueva contraseña temporal es: <strong>${newPassword}</strong></p>
        <p>Por favor, usa esta contraseña para iniciar sesión. Te recomendamos cambiarla por una propia más adelante.</p>
        <br>
        <p>Saludos,<br>El equipo de Casa Tuti</p>
      </div>
    `
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Credenciales de correo no configuradas (.env EMAIL_USER y EMAIL_PASS).');
      console.warn(`Simulando envío a ${to}. Contraseña temporal: ${newPassword}`);
      return true; // Simulamos éxito en desarrollo
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de recuperación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw new Error('No se pudo enviar el correo de recuperación.');
  }
};

export const getPronoun = (genero) => {
  switch (genero?.toUpperCase()) {
    case 'M': return 'o';
    case 'F': return 'a';
    case 'X': return '@';
    default: return 'a'; // Default histórico
  }
};

export const sendWelcomeEmail = async (to, name, tempPassword, rulesHtml, genero = 'F') => {
  const p = getPronoun(genero);
  const mailOptions = {
    from: `"Casa Tuti" <${process.env.EMAIL_USER || 'no-reply@casatuti.com'}>`,
    to,
    subject: `¡Bienvenid${p} a Casa Tuti! - Tus accesos y normas de convivencia`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #455f3e; text-align: center;">¡Bienvenid${p} a Casa Tuti, ${name}!</h2>
        <p>Estamos muy felices de que te unas a nuestro taller.</p>
        
        <h3 style="color: #a84231;">Tus credenciales de acceso</h3>
        <p>Tu cuenta ha sido creada exitosamente. Para ingresar a la plataforma, utiliza los siguientes datos ingresando a <a href="https://casatuti-app-espaciocreativo.vercel.app/" target="_blank" style="color: #455f3e; font-weight: bold;">https://casatuti-app-espaciocreativo.vercel.app/</a>:</p>
        <ul>
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Contraseña provisoria:</strong> <span style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${tempPassword}</span></li>
        </ul>
        <p style="color: #d97706; font-weight: bold;">⚠️ Importante: Te recomendamos cambiar esta contraseña por una propia en tu primer inicio de sesión.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <h3 style="color: #455f3e;">Normas de Convivencia</h3>
        <p>Para asegurar la mejor experiencia para tod${p}s, te pedimos que leas nuestras normas de convivencia:</p>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 6px; font-size: 14px;">
          ${rulesHtml}
        </div>
        
        <br>
        <p style="text-align: center;">¡Nos vemos en clase!<br><strong>El equipo de Casa Tuti</strong></p>
      </div>
    `
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Credenciales de correo no configuradas. Simulando email de bienvenida.');
      return true;
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de bienvenida enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar el correo de bienvenida:', error);
    // No lanzamos error para que la creación del usuario no falle si el correo falla
    return false;
  }
};

export const sendDebtReminderEmail = async ({
  to,
  name,
  amount,
  concept,
  branch = 'CENTRO',
  genero = 'F'
}) => {
  const p = getPronoun(genero);
  const formattedAmount = Number(amount || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const isAltoVerde = (branch || '').toUpperCase().includes('ALTO VERDE');
  const alias = isAltoVerde ? 'CASA.TUTI' : 'CASA.TUTI.2';
  const branchLabel = isAltoVerde ? 'Alto Verde' : 'Centro';

  const mailOptions = {
    from: `"Casa Tuti" <${process.env.EMAIL_USER || 'no-reply@casatuti.com'}>`,
    to,
    subject: 'Recordatorio de pago pendiente - Casa Tuti',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C261E; padding: 24px; max-width: 580px; margin: 0 auto; border: 1px solid #EADECE; border-radius: 16px; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #455F3E; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Casa Tuti</h2>
          <p style="color: #8C8275; font-size: 13px; margin: 4px 0 0 0;">Espacio Creativo • Taller de Cerámica</p>
        </div>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 12px;">¡Hola, <strong>${name}</strong>!</p>
        <p style="font-size: 14px; line-height: 1.6; color: #5C5549; margin-top: 0;">
          Te escribimos para recordarte que tenés una deuda pendiente de pago registrada en la plataforma de Casa Tuti.
        </p>

        <div style="background-color: #FFFFFF; border: 1px solid #EADECE; border-radius: 12px; padding: 18px; margin: 20px 0; box-shadow: 0 2px 8px rgba(44,38,30,0.04);">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #8C8275;">Detalle / Concepto:</td>
              <td style="padding: 6px 0; text-align: right; color: #2C261E; font-weight: 700;">${concept}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8C8275;">Sucursal:</td>
              <td style="padding: 6px 0; text-align: right; color: #2C261E; font-weight: 600;">${branchLabel}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0 0 0; color: #2C261E; font-weight: 700; border-top: 1px dashed #EADECE; font-size: 15px;">Monto pendiente:</td>
              <td style="padding: 12px 0 0 0; text-align: right; color: #CC7A42; font-weight: 800; font-size: 22px; border-top: 1px dashed #EADECE;">$${formattedAmount}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #455F3E; font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 8px;">Datos para realizar la transferencia bancaria</h3>
        <div style="background-color: #FFFFFF; border-left: 4px solid #455F3E; border-radius: 0 8px 8px 0; padding: 14px 16px; font-size: 13px; line-height: 1.6; margin-bottom: 20px; border-top: 1px solid #EADECE; border-right: 1px solid #EADECE; border-bottom: 1px solid #EADECE;">
          <p style="margin: 0 0 6px 0;"><strong>Alias:</strong> <span style="font-family: monospace; font-size: 15px; background: #EDE7DC; color: #2C261E; padding: 3px 8px; border-radius: 6px; font-weight: bold;">${alias}</span></p>
          <p style="margin: 0 0 6px 0; color: #5C5549;"><strong>Titular:</strong> María Candelaria Luna Ottonello</p>
          <p style="margin: 0; color: #5C5549;"><strong>Sucursal correspondiente:</strong> ${branchLabel}</p>
        </div>

        <p style="font-size: 13px; color: #5C5549; line-height: 1.5; margin-bottom: 20px;">
          Una vez efectuada la transferencia, por favor <strong>enviá el comprobante por WhatsApp</strong> para que la administración confirme tu pago y te acredite los créditos correspondientes.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://wa.me/5493541591817?text=${encodeURIComponent(`Hola! Envío el comprobante de transferencia por $${formattedAmount} correspondiente a ${concept} (${name}).`)}"
             style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 24px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,211,102,0.25);"
             target="_blank">
            Enviar comprobante por WhatsApp
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #EADECE; margin: 24px 0;">
        <p style="text-align: center; color: #8C8275; font-size: 12px; margin: 0; line-height: 1.5;">
          Si ya abonaste este monto en las últimas horas, por favor desestimá este recordatorio.<br>
          ¡Muchas gracias!<br>
          <strong>El equipo de Casa Tuti</strong>
        </p>
      </div>
    `
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Credenciales de correo no configuradas. Simulando recordatorio de deuda a', to);
      return { sent: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de recordatorio de deuda enviado:', info.messageId, 'a', to);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo de recordatorio de deuda:', error);
    throw new Error('No se pudo enviar el correo de recordatorio: ' + (error.message || 'error SMTP'));
  }
};
