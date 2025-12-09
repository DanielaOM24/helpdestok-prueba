'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ticketService, Ticket } from '@/services/ticketService';
import { commentService, Comment } from '@/services/commentService';

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
    });

    useEffect(() => {
        if (ticketId) {
            loadTicket();
            loadComments();
        }
    }, [ticketId]);

    const loadTicket = async () => {
        try {
            setLoading(true);
            setError('');
            if (!ticketId) {
                setError('ID de ticket no válido');
                setLoading(false);
                return;
            }
            console.log('Cargando ticket con ID:', ticketId);
            const data = await ticketService.getTicket(ticketId);
            console.log('Ticket cargado:', data);
            setTicket(data);
        } catch (err: any) {
            console.error('Error cargando ticket:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error al cargar ticket';
            setError(errorMessage);
            console.error('Detalles del error:', {
                status: err.response?.status,
                data: err.response?.data,
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        if (!ticketId) return;
        try {
            const data = await commentService.getCommentsByTicket(ticketId);
            setComments(data);
        } catch (err: any) {
            console.error('Error cargando comentarios:', err);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!commentText.trim()) {
            setError('El comentario no puede estar vacío');
            return;
        }

        if (!ticketId) {
            setError('ID de ticket no válido');
            return;
        }

        try {
            await commentService.createComment(ticketId, { message: commentText.trim() });
            setCommentText('');
            setSuccess('Comentario agregado exitosamente');
            loadComments();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error agregando comentario:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error al agregar comentario';
            setError(errorMessage);
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!ticketId) return;
        try {
            await ticketService.updateTicket(ticketId, { status: newStatus as any });
            setSuccess('Estado actualizado');
            loadTicket();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError('Error al actualizar estado');
        }
    };

    const handleStartEdit = () => {
        if (ticket) {
            setEditData({
                title: ticket.title,
                description: ticket.description,
                priority: ticket.priority,
            });
            setIsEditing(true);
            setError('');
            setSuccess('');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({ title: '', description: '', priority: 'medium' });
        setError('');
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!editData.title.trim() || !editData.description.trim()) {
            setError('Título y descripción son obligatorios');
            return;
        }

        try {
            const updateData: any = {
                title: editData.title.trim(),
                description: editData.description.trim(),
            };

            // Solo agentes pueden cambiar prioridad
            if (user?.role === 'agent') {
                updateData.priority = editData.priority;
            }

            if (!ticketId) {
                setError('ID de ticket no válido');
                return;
            }
            await ticketService.updateTicket(ticketId, updateData);
            setSuccess('Ticket actualizado exitosamente');
            setIsEditing(false);
            loadTicket();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar ticket';
            setError(errorMessage);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
            open: 'info',
            in_progress: 'warning',
            resolved: 'success',
            closed: 'default',
        };
        const labels: Record<string, string> = {
            open: 'Abierto',
            in_progress: 'En Progreso',
            resolved: 'Resuelto',
            closed: 'Cerrado',
        };
        return <Badge text={labels[status] || status} variant={variants[status] || 'default'} />;
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
        };
        const labels: Record<string, string> = {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta',
        };
        return <Badge text={labels[priority] || priority} variant={variants[priority] || 'default'} />;
    };

    if (!ticketId) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <p className="text-lg text-red-600">ID de ticket no válido</p>
                        <Button
                            variant="outline"
                            text="Volver"
                            click={() => router.back()}
                            className="mt-4"
                        />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-lg">Cargando ticket...</div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!ticket && !loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <nav className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        text="← Volver"
                                        click={() => router.back()}
                                    />
                                </div>
                            </div>
                        </div>
                    </nav>
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg text-red-600 mb-4">
                                {error || 'Ticket no encontrado'}
                            </p>
                            <Button
                                variant="outline"
                                text="Volver al Dashboard"
                                click={() => {
                                    if (user?.role === 'client') {
                                        router.push('/dashboard/client');
                                    } else {
                                        router.push('/dashboard/agent');
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    text="← Volver"
                                    click={() => router.back()}
                                />
                            </div>
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold text-gray-900">Detalle del Ticket</h1>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {success}
                            </div>
                        )}

                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    {isEditing ? (
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xl font-semibold"
                                                value={editData.title}
                                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                                placeholder="Título del ticket"
                                            />
                                        </div>
                                    ) : (
                                        ticket && <CardTitle text={ticket.title} />
                                    )}
                                    {ticket && (
                                        <div className="flex gap-2 items-center">
                                            {!isEditing && (
                                                <>
                                                    {getStatusBadge(ticket.status)}
                                                    {getPriorityBadge(ticket.priority)}
                                                </>
                                            )}
                                            {!isEditing && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    text="Editar"
                                                    click={handleStartEdit}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <form onSubmit={handleSaveEdit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                rows={6}
                                                value={editData.description}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                placeholder="Descripción del ticket"
                                                required
                                            />
                                        </div>
                                        {user?.role === 'agent' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Prioridad
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={editData.priority}
                                                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
                                                >
                                                    <option value="low">Baja</option>
                                                    <option value="medium">Media</option>
                                                    <option value="high">Alta</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button type="submit" text="Guardar Cambios" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                text="Cancelar"
                                                click={handleCancelEdit}
                                            />
                                        </div>
                                    </form>
                                ) : (
                                    ticket && (
                                        <>
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">Descripción:</h4>
                                                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                                            </div>
                                            <div className="border-t pt-4 mt-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">Información del Ticket:</h4>
                                                <div className="text-sm text-gray-600 space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Cliente:</span>
                                                        <span>{ticket.createdBy?.name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Email:</span>
                                                        <span>{ticket.createdBy?.email || 'N/A'}</span>
                                                    </div>
                                                    {ticket.assignedTo && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Asignado a:</span>
                                                            <span>{ticket.assignedTo.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Estado:</span>
                                                        <span>{getStatusBadge(ticket.status)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Prioridad:</span>
                                                        <span>{getPriorityBadge(ticket.priority)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Creado:</span>
                                                        <span>{new Date(ticket.createdAt).toLocaleString('es-ES')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Actualizado:</span>
                                                        <span>{new Date(ticket.updatedAt).toLocaleString('es-ES')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user?.role === 'agent' && ticket.status !== 'closed' && (
                                                <div className="mt-4 space-x-2">
                                                    {ticket.status === 'open' && (
                                                        <Button
                                                            text="Tomar Ticket"
                                                            click={() => handleUpdateStatus('in_progress')}
                                                        />
                                                    )}
                                                    {ticket.status === 'in_progress' && (
                                                        <Button
                                                            variant="secondary"
                                                            text="Marcar Resuelto"
                                                            click={() => handleUpdateStatus('resolved')}
                                                        />
                                                    )}
                                                    {ticket.status === 'resolved' && (
                                                        <Button
                                                            variant="danger"
                                                            text="Cerrar Ticket"
                                                            click={() => handleUpdateStatus('closed')}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )
                                )}
                            </CardContent>
                        </Card>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle text="Comentarios" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 mb-4">
                                    {comments.length === 0 ? (
                                        <p className="text-gray-500">No hay comentarios aún.</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment._id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-semibold text-sm">{comment.author.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="space-y-2">
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Escribe un comentario..."
                                        value={commentText}
                                        onChange={(e) => {
                                            setCommentText(e.target.value);
                                            setError('');
                                        }}
                                        required
                                        minLength={1}
                                    />
                                    <Button
                                        type="submit"
                                        text="Agregar Comentario"
                                        disabled={!commentText.trim() || loading}
                                    />
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

