import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import type { Ticket } from '../../../lib/mock-data';
import { ticketingService } from '../services/ticketingService';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface TicketingManagementProps {
  userRole: 'IT' | 'Other';
  userName: string;
}

export function TicketingManagement({ userRole, userName }: TicketingManagementProps) {
  const [tickets, setTickets] = useState<Ticket[]>(ticketingService.getAll());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newResponse, setNewResponse] = useState('');

  // Form state untuk create ticket
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'Technical Issue' as Ticket['category'],
    priority: 'Medium' as Ticket['priority'],
  });

  const handleCreateTicket = () => {
    const ticket = ticketingService.createTicket(
      newTicket.title,
      newTicket.description,
      newTicket.category,
      newTicket.priority,
      userName,
      userRole === 'IT' ? 'IT' : 'Other',
      tickets
    );
    
    setTickets([ticket, ...tickets]);
    setIsCreateDialogOpen(false);
    setNewTicket({
      title: '',
      description: '',
      category: 'Technical Issue',
      priority: 'Medium',
    });
  };

  const handleUpdateStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(ticketingService.updateStatus(ticketId, status, tickets));
  };

  const handleAddResponse = (ticketId: string) => {
    if (!newResponse.trim()) return;
    
    const updatedTickets = ticketingService.addResponse(
      ticketId,
      newResponse,
      userName,
      userRole,
      tickets
    );
    
    setTickets(updatedTickets);
    
    // Update selected ticket if it's the one being responded to
    if (selectedTicket && selectedTicket.id === ticketId) {
      const updatedTicket = updatedTickets.find(t => t.id === ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    }
    
    setNewResponse('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      Low: { variant: 'outline', color: 'text-gray-600' },
      Medium: { variant: 'outline', color: 'text-blue-600' },
      High: { variant: 'outline', color: 'text-orange-600' },
    };
    const config = variants[priority] || variants.Medium;
    return <Badge variant={config.variant} className={config.color}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any, variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      Open: { icon: AlertCircle, variant: 'outline', color: 'text-orange-600' },
      'In Progress': { icon: Clock, variant: 'secondary', color: 'text-blue-600' },
      Resolved: { icon: CheckCircle, variant: 'outline', color: 'text-green-600' },
      Closed: { icon: XCircle, variant: 'outline', color: 'text-gray-600' },
    };
    const config = configs[status] || configs.Open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Filter logic menggunakan service
  const displayTickets = ticketingService.filterTickets(
    tickets,
    filterStatus,
    userRole,
    userName
  );

  return (
    <div className="space-y-6">
      {/* Filter and Create Ticket */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
        {userRole === 'IT' ? (
          <>
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({tickets.length})
            </Button>
            <Button
              variant={filterStatus === 'Open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('Open')}
            >
              Open ({ticketingService.getCountByStatus('Open', tickets)})
            </Button>
            <Button
              variant={filterStatus === 'In Progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('In Progress')}
            >
              In Progress ({ticketingService.getCountByStatus('In Progress', tickets)})
            </Button>
            <Button
              variant={filterStatus === 'Resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('Resolved')}
            >
              Resolved ({ticketingService.getCountByStatus('Resolved', tickets)})
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({tickets.length})
            </Button>
            <Button
              variant={filterStatus === 'my-ticket' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('my-ticket')}
            >
              My Ticket ({ticketingService.getMyTicketsCount(userName, tickets)})
            </Button>
          </>
        )}
        </div>
        {userRole !== 'IT' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>Jelaskan masalah atau request Anda ke IT team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Judul ticket yang jelas..."
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Jelaskan masalah atau request Anda secara detail..."
                    rows={5}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category: value as Ticket['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                        <SelectItem value="Access Request">Access Request</SelectItem>
                        <SelectItem value="Bug Report">Bug Report</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Account Issue">Account Issue</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value as Ticket['priority'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket} disabled={!newTicket.title || !newTicket.description}>
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {displayTickets.length === 0 ? (
          <Card>
            <div className="flex items-center justify-center h-24 text-gray-500">
              Tidak ada tickets
            </div>
          </Card>
        ) : (
          displayTickets.map(ticket => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>By: {ticket.createdBy} ({ticket.createdByRole})</span>
                      <span>•</span>
                      <span>{formatDate(ticket.createdDate)}</span>
                      {ticket.responses.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.responses.length} response{ticket.responses.length > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {userRole === 'IT' && ticket.status !== 'Closed' && (
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleUpdateStatus(ticket.id, value as Ticket['status'])}
                      >
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Get latest ticket data from state
                        const latestTicket = tickets.find(t => t.id === ticket.id) || ticket;
                        setSelectedTicket(latestTicket);
                        setIsDetailDialogOpen(true);
                        setNewResponse('');
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>{selectedTicket.title}</DialogTitle>
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <DialogDescription>
                  Ticket #{selectedTicket.id} • {selectedTicket.category}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Created By</Label>
                    <p className="mt-1">{selectedTicket.createdBy} ({selectedTicket.createdByRole})</p>
                  </div>
                  <div>
                    <Label>Created Date</Label>
                    <p className="mt-1">{formatDate(selectedTicket.createdDate)}</p>
                  </div>
                  {selectedTicket.resolvedDate && (
                    <div>
                      <Label>Resolved Date</Label>
                      <p className="mt-1">{formatDate(selectedTicket.resolvedDate)}</p>
                    </div>
                  )}
                </div>

                {selectedTicket.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedTicket.notes}</p>
                  </div>
                )}

                {/* Responses */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Responses ({selectedTicket.responses.length})</Label>
                  {selectedTicket.responses.map(response => (
                    <div key={response.id} className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
                          <span className="text-gray-900">{response.createdBy}</span>
                          <span className="text-gray-500"> ({response.createdByRole})</span>
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(response.createdDate)}</p>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}

                  {/* Add Response */}
                  {selectedTicket.status !== 'Closed' && (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        placeholder="Tulis response..."
                        rows={3}
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddResponse(selectedTicket.id)}
                        disabled={!newResponse.trim()}
                      >
                        Add Response
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

