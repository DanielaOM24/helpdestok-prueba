import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
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
        const ticketId = searchParams.get('ticketId');

        if (!ticketId) {
            return NextResponse.json(
                { message: 'ticketId es obligatorio' },
                { status: 400 }
            );
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return NextResponse.json(
                { message: 'Ticket no encontrado' },
                { status: 404 }
            );
        }

        // Comparar correctamente los IDs
        const createdById = ticket.createdBy._id
            ? ticket.createdBy._id.toString()
            : ticket.createdBy.toString();

        if (payload.role === 'client' && createdById !== payload.userId) {
            return NextResponse.json(
                { message: 'No autorizado para ver este ticket' },
                { status: 403 }
            );
        }

        const comments = await Comment.find({ ticketId })
            .populate('author', 'name email')
            .sort({ createdAt: 1 });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error obteniendo comentarios:', error);
        return NextResponse.json(
            { message: 'Error al obtener comentarios' },
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
        if (!payload) {
            return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
        }

        const { ticketId, message } = await request.json();

        if (!ticketId || !message) {
            return NextResponse.json(
                { message: 'ticketId y message son obligatorios' },
                { status: 400 }
            );
        }

        const ticket = await Ticket.findById(ticketId)
            .populate('createdBy', 'name email');

        if (!ticket) {
            return NextResponse.json(
                { message: 'Ticket no encontrado' },
                { status: 404 }
            );
        }

        // Comparar correctamente los IDs
        const createdById = ticket.createdBy._id
            ? ticket.createdBy._id.toString()
            : ticket.createdBy.toString();

        if (payload.role === 'client' && createdById !== payload.userId) {
            return NextResponse.json(
                { message: 'No autorizado para comentar en este ticket' },
                { status: 403 }
            );
        }

        const comment = await Comment.create({
            ticketId,
            author: payload.userId,
            message: message.trim(),
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name email');

        // Enviar email si un agente responde
        if (payload.role === 'agent' && ticket.createdBy) {
            const user = ticket.createdBy as any;
            if (user.email) {
                const emailTemplate = getEmailTemplate(
                    'response',
                    ticket.title,
                    ticket._id.toString(),
                    message
                );
                await sendEmail({
                    to: user.email,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html,
                });
            }
        }

        return NextResponse.json(populatedComment, { status: 201 });
    } catch (error: any) {
        console.error('Error creando comentario:', error);
        return NextResponse.json(
            { message: error.message || 'Error al crear comentario', error: String(error) },
            { status: 500 }
        );
    }
}

