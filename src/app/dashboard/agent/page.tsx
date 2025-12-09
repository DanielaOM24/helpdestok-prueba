'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ticketService, Ticket } from '@/services/ticketService';

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTickets(filters);
      setTickets(data);
    } catch (err: any) {
      setError('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus as any });
      loadTickets();
    } catch (err: any) {
      setError('Error al actualizar ticket');
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

  return (
    <ProtectedRoute allowedRoles={['agent']}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">HelpDeskPro - Agente</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Hola, {user?.name}</span>
                <Button variant="outline" size="sm" text="Cerrar sesión" click={logout} />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard de Tickets</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle text="Filtros" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">Todos</option>
                      <option value="open">Abierto</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="resolved">Resuelto</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                      <option value="">Todas</option>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">Cargando tickets...</div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No hay tickets disponibles.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                  <Card key={ticket._id}>
                    <CardHeader>
                      <CardTitle text={ticket.title} className="text-lg" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Cliente: {ticket.createdBy.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Creado: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          text="Ver Detalle"
                          click={() => router.push(`/tickets/${ticket._id}`)}
                        />
                        {ticket.status === 'open' && (
                          <Button
                            size="sm"
                            className="w-full"
                            text="Tomar Ticket"
                            click={() => handleUpdateStatus(ticket._id, 'in_progress')}
                          />
                        )}
                        {ticket.status === 'in_progress' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            text="Marcar Resuelto"
                            click={() => handleUpdateStatus(ticket._id, 'resolved')}
                          />
                        )}
                        {ticket.status === 'resolved' && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="w-full"
                            text="Cerrar Ticket"
                            click={() => handleUpdateStatus(ticket._id, 'closed')}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

