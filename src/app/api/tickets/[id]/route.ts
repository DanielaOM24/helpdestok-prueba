import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendEmail, getEmailTemplate } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const ticket = await Ticket.findById(params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (payload.role === 'client' && ticket.createdBy.toString() !== payload.userId) {
      return NextResponse.json(
        { message: 'No autorizado para ver este ticket' },
        { status: 403 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error obteniendo ticket:', error);
    return NextResponse.json(
      { message: 'Error al obtener ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'agent') {
      return NextResponse.json(
        { message: 'Solo los agentes pueden actualizar tickets' },
        { status: 403 }
      );
    }

    const { status, priority, assignedTo } = await request.json();

    const ticket = await Ticket.findById(params.id)
      .populate('createdBy', 'name email');

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    const previousStatus = ticket.status;

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (status === 'closed' && previousStatus !== 'closed' && ticket.createdBy) {
      const user = ticket.createdBy as any;
      const emailTemplate = getEmailTemplate(
        'closed',
        ticket.title,
        ticket._id.toString()
      );
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error actualizando ticket:', error);
    return NextResponse.json(
      { message: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const ticket = await Ticket.findById(params.id);

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (payload.role !== 'agent' && ticket.createdBy.toString() !== payload.userId) {
      return NextResponse.json(
        { message: 'No autorizado para eliminar este ticket' },
        { status: 403 }
      );
    }

    await Ticket.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Ticket eliminado' });
  } catch (error) {
    console.error('Error eliminando ticket:', error);
    return NextResponse.json(
      { message: 'Error al eliminar ticket' },
      { status: 500 }
    );
  }
}

