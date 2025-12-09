import api from './api';

export interface Comment {
  _id: string;
  ticketId: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  message: string;
}

export const commentService = {
  getCommentsByTicket: async (ticketId: string) => {
    const response = await api.get(`/comments?ticketId=${ticketId}`);
    return response.data;
  },

  createComment: async (ticketId: string, data: CreateCommentData) => {
    const response = await api.post('/comments', {
      ticketId,
      ...data,
    });
    return response.data;
  },
};

