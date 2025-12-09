import api from './api';

export interface CreateTicketData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
}

export interface UpdateTicketData {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string;
}

export interface Ticket {
    _id: string;
    title: string;
    description: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
}

export const ticketService = {
    getTickets: async (filters?: { status?: string; priority?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);

        const response = await api.get(`/tickets?${params.toString()}`);
        return response.data;
    },

    getTicket: async (id: string) => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    createTicket: async (data: CreateTicketData) => {
        const response = await api.post('/tickets', data);
        return response.data;
    },

    updateTicket: async (id: string, data: UpdateTicketData) => {
        const response = await api.put(`/tickets/${id}`, data);
        return response.data;
    },

    deleteTicket: async (id: string) => {
        const response = await api.delete(`/tickets/${id}`);
        return response.data;
    },
};

