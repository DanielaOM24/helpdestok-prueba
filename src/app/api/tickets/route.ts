import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendEmail, getEmailTemplate } from '@/lib/email';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let query: any = {};

    if (payload.role === 'client') {
      query.createdBy = payload.userId;
    }

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    return NextResponse.json(
      { message: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'client') {
      return NextResponse.json(
        { message: 'Solo los clientes pueden crear tickets' },
        { status: 403 }
      );
    }

    const { title, description, priority = 'medium' } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: 'Título y descripción son obligatorios' },
        { status: 400 }
      );
    }

    const ticket = await Ticket.create({
      title,
      description,
      createdBy: payload.userId,
      priority,
      status: 'open',
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email');

    if (populatedTicket && populatedTicket.createdBy) {
      const user = populatedTicket.createdBy as any;
      const emailTemplate = getEmailTemplate(
        'created',
        ticket.title,
        ticket._id.toString()
      );
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    return NextResponse.json(populatedTicket, { status: 201 });
  } catch (error) {
    console.error('Error creando ticket:', error);
    return NextResponse.json(
      { message: 'Error al crear ticket' },
      { status: 500 }
    );
  }
}

