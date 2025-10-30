import { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';

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
  },
];

export function ReimbursePage() {
  const [reimburses, setReimburses] = useState<Reimburse[]>(mockReimburses);
  const [showForm, setShowForm] = useState(false);
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-blue-500';
      case 'paid':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const totalAmount = reimburses.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Reimburse</h2>
          <p className="text-gray-500">Request pengembalian biaya operasional</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          + Ajukan Reimburse Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Total Reimburse</p>
          <p className="text-2xl font-bold">{formatRupiah(totalAmount)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold">
            {reimburses.filter((r) => r.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-bold">
            {reimburses.filter((r) => r.status === 'approved').length}
          </p>
        </Card>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ajukan Reimburse Baru</h3>
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
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Transportation, Meal, etc"
                required
              />
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
        </Card>
      )}

      <Card>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {reimburses.map((reimburse) => (
              <TableRow key={reimburse.id}>
                <TableCell className="font-medium">{reimburse.id}</TableCell>
                <TableCell>{reimburse.date}</TableCell>
                <TableCell>{reimburse.category}</TableCell>
                <TableCell>{reimburse.description}</TableCell>
                <TableCell>{formatRupiah(reimburse.amount)}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(reimburse.status)} text-white`}>
                    {reimburse.status}
                  </Badge>
                </TableCell>
                <TableCell>{reimburse.submittedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

