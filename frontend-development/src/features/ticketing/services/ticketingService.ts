import type { Ticket, TicketResponse } from '../../../lib/mock-data';
import { mockTickets } from '../../../lib/mock-data';

export const ticketingService = {
  getAll: (): Ticket[] => {
    // In real app, this would use axios: return await api.get('/tickets').then(r => r.data);
    return mockTickets;
  },

  getByStatus: (status: Ticket['status'], tickets: Ticket[]): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status);
  },

  getByUser: (userName: string, tickets: Ticket[]): Ticket[] => {
    return tickets.filter(ticket => ticket.createdBy === userName);
  },

  createTicket: (
    title: string,
    description: string,
    category: Ticket['category'],
    priority: Ticket['priority'],
    createdBy: string,
    createdByRole: 'IT' | 'Other',
    existingTickets: Ticket[]
  ): Ticket => {
    const newId = `T${String(existingTickets.length + 1).padStart(3, '0')}`;
    const ticket: Ticket = {
      id: newId,
      title,
      description,
      category,
      priority,
      status: 'Open',
      createdBy,
      createdByRole,
      createdDate: new Date().toISOString().split('T')[0],
      responses: [],
    };
    return ticket;
  },

  updateStatus: (
    ticketId: string,
    status: Ticket['status'],
    tickets: Ticket[]
  ): Ticket[] => {
    return tickets.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status,
            updatedDate: new Date().toISOString().split('T')[0],
            resolvedDate:
              status === 'Resolved' || status === 'Closed'
                ? new Date().toISOString().split('T')[0]
                : ticket.resolvedDate,
          }
        : ticket
    );
  },

  addResponse: (
    ticketId: string,
    message: string,
    createdBy: string,
    createdByRole: 'IT' | 'Other',
    tickets: Ticket[]
  ): Ticket[] => {
    if (!message.trim()) return tickets;

    const responseId = `TR${String(Math.random()).substr(2, 3)}`;
    const newResponse: TicketResponse = {
      id: responseId,
      ticketId,
      message,
      createdBy,
      createdByRole,
      createdDate: new Date().toISOString().split('T')[0],
    };

    return tickets.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            responses: [...ticket.responses, newResponse],
            updatedDate: new Date().toISOString().split('T')[0],
          }
        : ticket
    );
  },

  filterTickets: (
    tickets: Ticket[],
    filterStatus: string,
    userRole: 'IT' | 'Other',
    userName: string
  ): Ticket[] => {
    if (userRole === 'IT') {
      // IT: filter berdasarkan status
      return filterStatus === 'all'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);
    } else {
      // Role lain:
      // - "All": tampilkan semua tickets (semua antrian)
      // - "My Ticket": hanya ticket milik user
      if (filterStatus === 'all') {
        return tickets;
      } else if (filterStatus === 'my-ticket') {
        return tickets.filter(t => t.createdBy === userName);
      } else {
        // Fallback untuk status filter (jika ada)
        return tickets.filter(t => t.status === filterStatus);
      }
    }
  },

  getCountByStatus: (status: Ticket['status'], tickets: Ticket[]): number => {
    return tickets.filter(t => t.status === status).length;
  },

  getMyTicketsCount: (userName: string, tickets: Ticket[]): number => {
    return tickets.filter(t => t.createdBy === userName).length;
  },
};

