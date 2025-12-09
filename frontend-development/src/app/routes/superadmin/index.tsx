import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { AlertCircle, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export interface SuperAdminTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  createdBy: string;
  createdAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
}

const mockTickets: SuperAdminTicket[] = [
  {
    id: 'IT-001',
    title: 'Error saat login ke sistem',
    description: 'Saya tidak bisa login dengan akun saya, muncul error "Invalid credentials"',
    priority: 'high',
    status: 'in-progress',
    category: 'Technical Issue',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-10-18',
    assignedTo: 'IT Team',
  },
  {
    id: 'IT-002',
    title: 'Request fitur baru untuk dashboard',
    description: 'Bisa ditambahkan filter berdasarkan tanggal untuk reports?',
    priority: 'medium',
    status: 'open',
    category: 'Feature Request',
    createdBy: 'Rina Kusuma',
    createdAt: '2025-10-15',
  },
  {
    id: 'IT-003',
    title: 'Server down di production',
    description: 'Server production tidak bisa diakses sejak pagi',
    priority: 'urgent',
    status: 'resolved',
    category: 'Technical Issue',
    createdBy: 'Admin',
    createdAt: '2025-10-20',
    assignedTo: 'IT Team',
    resolvedAt: '2025-10-20',
    resolution: 'Server sudah di-restart dan berjalan normal',
  },
];

export function SuperAdminDashboard() {
  const [tickets, setTickets] = useState<SuperAdminTicket[]>(mockTickets);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SuperAdminTicket | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SuperAdminTicket = {
      id: `IT-${String(tickets.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'open',
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTickets([...tickets, newTicket]);
    setFormData({ title: '', description: '', priority: 'medium', category: '' });
    setShowForm(false);
    toast.success('Ticket berhasil dibuat!');
  };

  const handleAssign = (ticketId: string) => {
    const updatedTickets = tickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: 'in-progress' as const, assignedTo: 'IT Team' }
        : t
    );
    setTickets(updatedTickets);
    toast.success('Ticket berhasil di-assign!');
  };

  const handleResolve = () => {
    if (!selectedTicket || !resolution) return;
    
    const updatedTickets = tickets.map(t => 
      t.id === selectedTicket.id 
        ? { 
            ...t, 
            status: 'resolved' as const,
            resolvedAt: new Date().toISOString().split('T')[0],
            resolution 
          }
        : t
    );
    setTickets(updatedTickets);
    setShowResolveDialog(false);
    setSelectedTicket(null);
    setResolution('');
    toast.success('Ticket berhasil di-resolve!');
  };

  const handleClose = (ticketId: string) => {
    const updatedTickets = tickets.map(t => 
      t.id === ticketId ? { ...t, status: 'closed' as const } : t
    );
    setTickets(updatedTickets);
    toast.success('Ticket berhasil di-close!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'in-progress':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'resolved':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'closed':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">{openTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Menunggu penanganan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-yellow-600">{inProgressTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Sedang dikerjakan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">{resolvedTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Sudah diselesaikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">{urgentTickets}</div>
            <p className="text-xs text-gray-500 mt-1">Prioritas tinggi</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Ticket Button */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Buat Ticket Baru
        </Button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Buat Ticket Baru</CardTitle>
            <CardDescription>Buat ticket baru untuk menangani issue atau request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul ticket"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Account Issue">Account Issue</SelectItem>
                    <SelectItem value="System Maintenance">System Maintenance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan masalah atau request Anda secara detail"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tickets ({tickets.length})</CardTitle>
          <CardDescription>Kelola semua ticket yang masuk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{ticket.title}</p>
                        {ticket.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">{ticket.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.createdBy}</TableCell>
                    <TableCell>{ticket.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {ticket.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => handleAssign(ticket.id)}
                          >
                            Assign
                          </Button>
                        )}
                        {ticket.status === 'in-progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowResolveDialog(true);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                        {ticket.status === 'resolved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClose(ticket.id)}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Masukkan solusi atau penjelasan untuk ticket: {selectedTicket?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Jelaskan solusi atau penjelasan untuk ticket ini"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowResolveDialog(false);
              setSelectedTicket(null);
              setResolution('');
            }}>
              Batal
            </Button>
            <Button onClick={handleResolve} disabled={!resolution}>
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
