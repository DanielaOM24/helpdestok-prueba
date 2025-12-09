import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP no configurado. Email no enviado:', { to, subject });
            return { success: false, message: 'SMTP no configurado' };
        }

        const info = await transporter.sendMail({
            from: `HelpDeskPro <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email:', error);
        return { success: false, error };
    }
}

export function getEmailTemplate(type: 'created' | 'response' | 'closed', ticketTitle: string, ticketId: string, message?: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const templates = {
        created: {
            subject: `Ticket creado: ${ticketTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Ticket Creado Exitosamente</h2>
          <p>Tu ticket ha sido creado y está siendo procesado.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Título:</strong> ${ticketTitle}</p>
            <p><strong>ID del Ticket:</strong> ${ticketId}</p>
          </div>
          <p>Puedes ver el estado de tu ticket en: <a href="${baseUrl}/tickets/${ticketId}">Ver Ticket</a></p>
        </div>
      `,
        },
        response: {
            subject: `Nueva respuesta en tu ticket: ${ticketTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nueva Respuesta en tu Ticket</h2>
          <p>Un agente ha respondido a tu ticket.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Título:</strong> ${ticketTitle}</p>
            <p><strong>Respuesta:</strong></p>
            <p style="background-color: white; padding: 10px; border-left: 3px solid #2563eb;">${message || 'Sin mensaje'}</p>
          </div>
          <p>Puedes ver la respuesta completa en: <a href="${baseUrl}/tickets/${ticketId}">Ver Ticket</a></p>
        </div>
      `,
        },
        closed: {
            subject: `Ticket cerrado: ${ticketTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Ticket Cerrado</h2>
          <p>Tu ticket ha sido cerrado.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Título:</strong> ${ticketTitle}</p>
            <p><strong>ID del Ticket:</strong> ${ticketId}</p>
          </div>
          <p>Gracias por usar HelpDeskPro.</p>
        </div>
      `,
        },
    };

    return templates[type];
}

