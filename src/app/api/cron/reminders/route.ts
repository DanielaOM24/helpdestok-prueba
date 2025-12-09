import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import Comment from '@/models/Comment';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'cron-secret-key'}`) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const tickets = await Ticket.find({
      status: { $in: ['open', 'in_progress'] },
      updatedAt: { $lt: oneDayAgo },
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    let remindersSent = 0;

    for (const ticket of tickets) {
      const recentComments = await Comment.find({
        ticketId: ticket._id,
        createdAt: { $gte: oneDayAgo },
      });

      if (recentComments.length === 0) {
        if (!ticket.assignedTo) {
          const agents = await User.find({ role: 'agent' });
          for (const agent of agents) {
            const emailTemplate = {
              subject: `Recordatorio: Ticket sin respuesta - ${ticket.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #f59e0b;">Recordatorio de Ticket</h2>
                  <p>El siguiente ticket lleva más de 24 horas sin respuesta:</p>
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Título:</strong> ${ticket.title}</p>
                    <p><strong>ID:</strong> ${ticket._id}</p>
                    <p><strong>Prioridad:</strong> ${ticket.priority}</p>
                    <p><strong>Cliente:</strong> ${(ticket.createdBy as any).name}</p>
                  </div>
                  <p>Por favor, revisa y responde al ticket lo antes posible.</p>
                </div>
              `,
            };
            await sendEmail({
              to: agent.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });
          }
          remindersSent++;
        } else {
          const agent = ticket.assignedTo as any;
          const emailTemplate = {
            subject: `Recordatorio: Ticket sin respuesta - ${ticket.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">Recordatorio de Ticket</h2>
                <p>El siguiente ticket asignado a ti lleva más de 24 horas sin respuesta:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Título:</strong> ${ticket.title}</p>
                  <p><strong>ID:</strong> ${ticket._id}</p>
                  <p><strong>Prioridad:</strong> ${ticket.priority}</p>
                  <p><strong>Cliente:</strong> ${(ticket.createdBy as any).name}</p>
                </div>
                <p>Por favor, revisa y responde al ticket lo antes posible.</p>
              </div>
            `,
          };
          await sendEmail({
            to: agent.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
          remindersSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      ticketsChecked: tickets.length,
      remindersSent,
    });
  } catch (error) {
    console.error('Error en cron job de recordatorios:', error);
    return NextResponse.json(
      { message: 'Error ejecutando cron job', error: String(error) },
      { status: 500 }
    );
  }
}

