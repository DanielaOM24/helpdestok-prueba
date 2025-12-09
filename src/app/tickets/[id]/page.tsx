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
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTicket();
    loadComments();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const data = await ticketService.getTicket(ticketId);
      setTicket(data);
    } catch (err: any) {
      setError('Error al cargar ticket');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getCommentsByTicket(ticketId);
      setComments(data);
    } catch (err: any) {
      console.error('Error cargando comentarios:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await commentService.createComment(ticketId, { message: commentText });
      setCommentText('');
      setSuccess('Comentario agregado');
      loadComments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Error al agregar comentario');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus as any });
      setSuccess('Estado actualizado');
      loadTicket();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Error al actualizar estado');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Cargando...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Ticket no encontrado</div>
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
                  <CardTitle text={ticket.title} />
                  <div className="flex gap-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{ticket.description}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Cliente: {ticket.createdBy.name}</p>
                  <p>Email: {ticket.createdBy.email}</p>
                  {ticket.assignedTo && (
                    <p>Asignado a: {ticket.assignedTo.name}</p>
                  )}
                  <p>Creado: {new Date(ticket.createdAt).toLocaleString()}</p>
                  <p>Actualizado: {new Date(ticket.updatedAt).toLocaleString()}</p>
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
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  />
                  <Button type="submit" text="Agregar Comentario" />
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

