import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Receipt, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export interface Reimburse {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submittedBy: string;
  submittedAt: string;
  receipt?: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

const mockReimburses: Reimburse[] = [
  {
    id: 'R001',
    description: 'Transportasi ke meeting client',
    amount: 50000,
    category: 'Transportation',
    date: '2025-10-15',
    status: 'pending',
    submittedBy: 'Andi Wijaya',
    submittedAt: '2025-10-16',
  },
  {
    id: 'R002',
    description: 'Makan siang dengan client',
    amount: 150000,
    category: 'Meal',
    date: '2025-10-10',
    status: 'approved',
    submittedBy: 'Rina Kusuma',
    submittedAt: '2025-10-11',
    reviewedBy: 'IT Team',
    reviewedAt: '2025-10-12',
  },
  {
    id: 'R003',
    description: 'Pembelian peralatan kantor',
    amount: 500000,
    category: 'Office Supplies',
    date: '2025-10-18',
    status: 'pending',
    submittedBy: 'Diana Putri',
    submittedAt: '2025-10-19',
  },
];

export function ITReimbursePage() {
  const [reimburses, setReimburses] = useState<Reimburse[]>(mockReimburses);
  const [showForm, setShowForm] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReimburse, setSelectedReimburse] = useState<Reimburse | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReimburse: Reimburse = {
      id: `R${String(reimburses.length + 1).padStart(3, '0')}`,
      description: formData.description,
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      status: 'pending',
      submittedBy: 'Current User',
      submittedAt: new Date().toISOString().split('T')[0],
      notes: formData.notes,
    };
    setReimburses([...reimburses, newReimburse]);
    setFormData({ description: '', amount: '', category: '', date: '', notes: '' });
    setShowForm(false);
    toast.success('Reimburse berhasil diajukan!');
  };

  const handleReview = (reimburse: Reimburse, action: 'approve' | 'reject') => {
    setSelectedReimburse(reimburse);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewDialog(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedReimburse) return;
    
    const updatedReimburses = reimburses.map(r => 
      r.id === selectedReimburse.id 
        ? { 
            ...r, 
            status: (reviewAction === 'approve' ? 'approved' : 'rejected') as Reimburse['status'],
            reviewedBy: 'IT Team',
            reviewedAt: new Date().toISOString().split('T')[0],
            notes: reviewNotes || r.notes,
          }
        : r
    );
    setReimburses(updatedReimburses);
    setShowReviewDialog(false);
    setSelectedReimburse(null);
    setReviewNotes('');
    toast.success(`Reimburse berhasil di-${reviewAction === 'approve' ? 'approve' : 'reject'}!`);
  };

  const handleMarkAsPaid = (id: string) => {
    const updatedReimburses = reimburses.map(r => 
      r.id === id ? { ...r, status: 'paid' as const } : r
    );
    setReimburses(updatedReimburses);
    toast.success('Reimburse ditandai sebagai sudah dibayar!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'approved':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'paid':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = reimburses.reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = reimburses
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);
  const approvedAmount = reimburses
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = reimburses.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reimburse</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatRupiah(totalAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">Semua pengajuan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-gray-500 mt-1">{formatRupiah(pendingAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              {reimburses.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatRupiah(approvedAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {reimburses.filter(r => r.status === 'paid').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatRupiah(reimburses.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Reimburse Button */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Receipt className="w-4 h-4 mr-2" />
          Ajukan Reimburse Baru
        </Button>
      </div>

      {/* Create Reimburse Form */}
      {showForm && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Ajukan Reimburse Baru</CardTitle>
            <CardDescription>Ajukan pengembalian biaya yang telah dikeluarkan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Meal">Meal</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan pengeluaran Anda"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Masukkan jumlah"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan jika perlu"
                  rows={2}
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

      {/* Reimburses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Reimburse ({reimburses.length})</CardTitle>
          <CardDescription>Kelola semua pengajuan reimburse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Diajukan Oleh</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimburses.map((reimburse) => (
                  <TableRow key={reimburse.id}>
                    <TableCell className="font-medium">{reimburse.id}</TableCell>
                    <TableCell>{reimburse.date}</TableCell>
                    <TableCell>{reimburse.category}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{reimburse.description}</p>
                        {reimburse.notes && (
                          <p className="text-xs text-gray-500 mt-1">{reimburse.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatRupiah(reimburse.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(reimburse.status)}>
                        {getStatusIcon(reimburse.status)}
                        {reimburse.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{reimburse.submittedBy}</p>
                        <p className="text-xs text-gray-500">{reimburse.submittedAt}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {reimburse.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleReview(reimburse, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(reimburse, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {reimburse.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(reimburse.id)}
                          >
                            Mark as Paid
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

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reviewAction === 'approve' ? 'Approve' : 'Reject'} Reimburse</DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? `Approve reimburse: ${selectedReimburse?.id} - ${formatRupiah(selectedReimburse?.amount || 0)}`
                : `Reject reimburse: ${selectedReimburse?.id} - ${formatRupiah(selectedReimburse?.amount || 0)}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'Tambahkan catatan approval' : 'Alasan penolakan'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReviewDialog(false);
              setSelectedReimburse(null);
              setReviewNotes('');
            }}>
              Batal
            </Button>
            <Button 
              onClick={handleReviewSubmit}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

