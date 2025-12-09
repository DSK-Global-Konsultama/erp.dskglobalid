import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { mockLeads, type Lead, leadSources } from '../../../lib/mock-data';
import { Plus, Filter, Calendar, AlertTriangle, Hand } from 'lucide-react';
import { toast } from 'sonner';

interface LeadsManagementProps {
  userRole: 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD-MEO' | 'BD-Executive';
  userName: string;
}

export function LeadsManagement({ userRole, userName }: LeadsManagementProps) {
  // Helper function untuk filter awal BD Executive
  const getInitialFilteredLeads = (leadsList: Lead[]) => {
    if (userRole === 'BD-Executive') {
      const claimedByUser = leadsList.filter(l => l.claimedBy === userName);
      const availableLeads = leadsList.filter(l => l.status === 'available');
      const combined = [...availableLeads, ...claimedByUser];
      const uniqueIds = new Set(combined.map(l => l.id));
      return Array.from(uniqueIds).map(id => combined.find(l => l.id === id)!);
    }
    if (userRole === 'BD-MEO') {
      return leadsList.filter(l => l.createdBy === userName);
    }
    // CEO and COO see all leads
    return leadsList;
  };

  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(() => getInitialFilteredLeads(mockLeads));
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newLead, setNewLead] = useState({
    clientName: '',
    company: '',
    email: '',
    phone: '',
    source: 'Facebook' as Lead['source'],
    notes: '',
  });

  const applyFilters = () => {
    let filtered = [...leads];

    // BD Executive hanya lihat available leads atau yang dia claim
    if (userRole === 'BD-Executive') {
      // Pisahkan leads yang sudah di-claim oleh user dan yang belum di-claim
      const claimedByUser = filtered.filter(l => l.claimedBy === userName);
      const availableLeads = filtered.filter(l => l.status === 'available');
      
      // Gabungkan leads yang available dan yang sudah di-claim oleh user
      filtered = [...availableLeads, ...claimedByUser];
      
      // Hapus duplikat jika ada (jika lead available dan sudah di-claim oleh user)
      const uniqueIds = new Set(filtered.map(l => l.id));
      filtered = Array.from(uniqueIds).map(id => filtered.find(l => l.id === id)!);
    }

    // BD Content Creator lihat semua leads yang dia buat
    if (userRole === 'BD-MEO') {
      filtered = filtered.filter(l => l.createdBy === userName);
    }

    if (filterStatus !== 'all') {
      // Untuk BD Executive, filter status hanya diterapkan pada leads yang available
      // Leads yang sudah di-claim oleh user tetap ditampilkan
      if (userRole === 'BD-Executive') {
        const claimedByUser = filtered.filter(l => l.claimedBy === userName);
        const otherLeads = filtered.filter(l => l.claimedBy !== userName && l.status === filterStatus);
        filtered = [...claimedByUser, ...otherLeads];
        // Hapus duplikat
        const uniqueIds = new Set(filtered.map(l => l.id));
        filtered = Array.from(uniqueIds).map(id => filtered.find(l => l.id === id)!);
      } else {
        filtered = filtered.filter(l => l.status === filterStatus);
      }
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(l => l.source === filterSource);
    }

    if (dateFrom) {
      filtered = filtered.filter(l => new Date(l.createdDate) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(l => new Date(l.createdDate) <= new Date(dateTo));
    }

    setFilteredLeads(filtered);
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterSource('all');
    setDateFrom('');
    setDateTo('');
    
    // Untuk BD Executive, tetap filter hanya available dan yang sudah di-claim
    if (userRole === 'BD-Executive') {
      const claimedByUser = leads.filter(l => l.claimedBy === userName);
      const availableLeads = leads.filter(l => l.status === 'available');
      const combined = [...availableLeads, ...claimedByUser];
      const uniqueIds = new Set(combined.map(l => l.id));
      setFilteredLeads(Array.from(uniqueIds).map(id => combined.find(l => l.id === id)!));
    } else {
      setFilteredLeads(leads);
    }
  };

  const handleAddLead = () => {
    const lead: Lead = {
      id: `L${String(leads.length + 1).padStart(3, '0')}`,
      ...newLead,
      status: 'available',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: userName,
    };

    setLeads([lead, ...leads]);
    setFilteredLeads([lead, ...filteredLeads]);
    setIsAddDialogOpen(false);
    setNewLead({
      clientName: '',
      company: '',
      email: '',
      phone: '',
      source: 'Facebook',
      notes: '',
    });
    
    toast.success('Lead berhasil ditambahkan!');
  };

  const handleClaimLead = (leadId: string) => {
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: 'claimed' as const,
          claimedBy: userName,
          claimedDate: new Date().toISOString().split('T')[0],
        };
      }
      return l;
    });
    
    setLeads(updatedLeads);
    applyFilters();
    toast.success('Lead berhasil di-claim! Tidak bisa di-cancel.');
  };

  const updateLeadStatus = (id: string, newStatus: Lead['status']) => {
    const updatedLeads = leads.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: newStatus,
          lastFollowUp: newStatus === 'follow-up' ? new Date().toISOString().split('T')[0] : l.lastFollowUp,
        };
      }
      return l;
    });
    
    setLeads(updatedLeads);
    applyFilters();
    toast.success('Status lead berhasil diupdate!');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      available: 'default',
      claimed: 'secondary',
      'follow-up': 'secondary',
      deal: 'outline',
      lost: 'destructive',
    };
    const labels: Record<string, string> = {
      available: 'Available',
      claimed: 'Claimed',
      'follow-up': 'Follow Up',
      deal: 'Deal',
      lost: 'Lost',
    };
    const classNameMap: Record<string, string> = {
      'follow-up': 'bg-yellow-50 text-yellow-700 border-yellow-500',
      'deal': 'bg-green-50 text-green-700 border-green-500',
    };
    return <Badge variant={variants[status] || 'default'} className={classNameMap[status]}>{labels[status]}</Badge>;
  };

  const isMissed = (lead: Lead) => {
    if (lead.status !== 'follow-up' || !lead.lastFollowUp) return false;
    const daysSinceFollowUp = Math.floor(
      (new Date().getTime() - new Date(lead.lastFollowUp).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceFollowUp > 90;
  };

  const availableLeads = filteredLeads.filter(l => l.status === 'available').length;
  const claimedLeads = filteredLeads.filter(l => l.claimedBy === userName).length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {userRole === 'BD-Executive' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Available Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{availableLeads}</div>
              <p className="text-xs text-gray-500 mt-1">Belum ada yang claim</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">My Claimed Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{claimedLeads}</div>
              <p className="text-xs text-gray-500 mt-1">Sedang saya handle</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="follow-up">Follow Up</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sumber</Label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sumber</SelectItem>
                  {leadSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Tanggal Dari
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Tanggal Sampai
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>Terapkan Filter</Button>
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                {userRole === 'BD-Executive' && `${availableLeads} leads tersedia untuk di-claim`}
                {userRole === 'BD-MEO' && 'Leads yang saya input'}
                {(userRole === 'CEO' || userRole?.startsWith('COO-')) && 'Semua leads di sistem'}
              </CardDescription>
            </div>
            {userRole === 'BD-MEO' && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Lead Baru</DialogTitle>
                    <DialogDescription>Input lead baru dari sumber marketing</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nama Client</Label>
                      <Input
                        id="clientName"
                        value={newLead.clientName}
                        onChange={e => setNewLead({ ...newLead, clientName: e.target.value })}
                        placeholder="Nama lengkap client"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Perusahaan</Label>
                      <Input
                        id="company"
                        value={newLead.company}
                        onChange={e => setNewLead({ ...newLead, company: e.target.value })}
                        placeholder="Nama perusahaan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Sumber Lead</Label>
                      <Select value={newLead.source} onValueChange={(value: Lead['source']) => setNewLead({ ...newLead, source: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {leadSources.map(source => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        id="notes"
                        value={newLead.notes}
                        onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                        placeholder="Catatan tentang lead ini"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddLead}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Claimed By</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="text-sm font-medium">Belum ada data leads</p>
                        <p className="text-xs mt-1">
                          {userRole === 'BD-Executive' && 'Tidak ada leads yang tersedia atau yang sudah Anda claim'}
                          {userRole === 'BD-MEO' && 'Belum ada leads yang Anda input'}
                          {(userRole === 'CEO' || userRole?.startsWith('COO-')) && 'Belum ada leads di sistem'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map(lead => (
                  <TableRow key={lead.id} className={isMissed(lead) ? 'bg-red-50' : ''}>
                    <TableCell>{lead.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isMissed(lead) && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm">{lead.clientName}</p>
                          {isMissed(lead) && (
                            <p className="text-xs text-red-500">MISS - 3+ bulan</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{lead.email}</p>
                        <p className="text-gray-500">{lead.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      {lead.claimedBy ? (
                        <div className="text-sm">
                          <p>{lead.claimedBy}</p>
                          <p className="text-xs text-gray-500">{formatDate(lead.claimedDate)}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(lead.createdDate)}</p>
                        {lead.lastFollowUp && (
                          <p className="text-xs text-gray-500">Last FU: {formatDate(lead.lastFollowUp)}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* BD Executive: Claim button */}
                          {(userRole === 'BD-Executive' || userRole === 'CEO' || userRole?.startsWith('COO-')) && lead.status === 'available' && (
                          <Button
                            size="sm"
                            onClick={() => handleClaimLead(lead.id)}
                          >
                            <Hand className="w-3 h-3 mr-1" />
                            Claim
                          </Button>
                        )}

                        {/* BD Executive: Update status for claimed leads */}
                        {userRole === 'BD-Executive' && lead.claimedBy === userName && lead.status !== 'deal' && (
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value as Lead['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="claimed">Claimed</SelectItem>
                              <SelectItem value="follow-up">Follow Up</SelectItem>
                              <SelectItem value="deal">Deal</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {/* CEO/COO: View only */}
                        {(userRole === 'CEO' || userRole?.startsWith('COO-')) && lead.status === 'deal' && (
                          <Badge variant="outline">
                            Converted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
