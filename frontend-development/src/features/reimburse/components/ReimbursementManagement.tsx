import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import type { Reimbursement } from '../../../lib/mock-data';
import { reimbursementService } from '../services/reimbursementService';
import { Plus, DollarSign, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ReimbursementManagementProps {
  userRole: 'Admin' | 'Other';
  userName: string;
  userRoleString: string; // untuk submittedByRole
}

export function ReimbursementManagement({ userRole, userName, userRoleString }: ReimbursementManagementProps) {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(reimbursementService.getAll());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<Reimbursement | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  // Form state untuk create reimbursement (hanya untuk non-Admin)
  const [newReimbursement, setNewReimbursement] = useState({
    title: '',
    description: '',
    category: 'Transport' as Reimbursement['category'],
    amount: '',
    expenseDate: '',
    notes: '',
    receiptFile: null as File | null,
  });

  const handleCreateReimbursement = () => {
    if (!newReimbursement.title || !newReimbursement.description || !newReimbursement.amount || !newReimbursement.expenseDate) {
      toast.error('Mohon lengkapi semua field yang required');
      return;
    }

    // Simulate file upload
    let receiptUrl: string | undefined;
    if (newReimbursement.receiptFile) {
      receiptUrl = URL.createObjectURL(newReimbursement.receiptFile);
    }

    const reimbursement = reimbursementService.createReimbursement(
      newReimbursement.title,
      newReimbursement.description,
      newReimbursement.category,
      parseFloat(newReimbursement.amount),
      newReimbursement.expenseDate,
      userName,
      userRoleString,
      reimbursements,
      newReimbursement.notes || undefined,
      receiptUrl
    );

    setReimbursements([reimbursement, ...reimbursements]);
    setIsCreateDialogOpen(false);
    setNewReimbursement({
      title: '',
      description: '',
      category: 'Transport',
      amount: '',
      expenseDate: '',
      notes: '',
      receiptFile: null,
    });
    toast.success('Reimbursement berhasil disubmit');
  };

  const handleReview = (reimbursement: Reimbursement, action: 'approve' | 'reject') => {
    setSelectedReimbursement(reimbursement);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewDialog(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedReimbursement) return;
    if (reviewAction === 'reject' && !reviewNotes.trim()) {
      toast.error('Mohon isi alasan penolakan');
      return;
    }

    const updatedReimbursements = reimbursementService.updateStatus(
      selectedReimbursement.id,
      reviewAction === 'approve' ? 'Approved' : 'Rejected',
      userName,
      reimbursements,
      reviewAction === 'reject' ? reviewNotes : undefined
    );

    setReimbursements(updatedReimbursements);
    setShowReviewDialog(false);
    setSelectedReimbursement(null);
    setReviewNotes('');
    toast.success(`Reimbursement berhasil di-${reviewAction === 'approve' ? 'approve' : 'reject'}!`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: typeof Clock, variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      Pending: { icon: Clock, variant: 'secondary', className: 'bg-orange-50 text-orange-600 border-orange-200' },
      Approved: { icon: CheckCircle, variant: 'default', className: 'bg-green-50 text-green-600 border-green-200' },
      Rejected: { icon: XCircle, variant: 'destructive', className: 'bg-red-50 text-red-600 border-red-200' },
    };
    const config = configs[status] || configs.Pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Transport: 'bg-blue-50 text-blue-600 border-blue-200',
      Meals: 'bg-purple-50 text-purple-600 border-purple-200',
      'Office Supplies': 'bg-gray-50 text-gray-600 border-gray-200',
      'Client Meeting': 'bg-indigo-50 text-indigo-600 border-indigo-200',
      Equipment: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      Training: 'bg-pink-50 text-pink-600 border-pink-200',
      Other: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
      <Badge variant="outline" className={colors[category] || colors.Other}>
        {category}
      </Badge>
    );
  };

  const filteredReimbursements = reimbursementService.filterReimbursements(
    reimbursements,
    filterStatus,
    userRole,
    userName
  );

  // Statistics
  const totalPending = userRole === 'Admin'
    ? reimbursementService.getTotalAmountByStatus('Pending', reimbursements)
    : reimbursementService.getTotalAmountByStatus('Pending', reimbursementService.getByUser(userName, reimbursements));
  
  const totalApproved = userRole === 'Admin'
    ? reimbursementService.getTotalAmountByStatus('Approved', reimbursements)
    : reimbursementService.getTotalAmountByStatus('Approved', reimbursementService.getByUser(userName, reimbursements));

  const totalRejected = userRole === 'Admin'
    ? reimbursementService.getTotalAmountByStatus('Rejected', reimbursements)
    : 0;

  const pendingCount = userRole === 'Admin'
    ? reimbursementService.getCountByStatus('Pending', reimbursements)
    : reimbursementService.getCountByStatus('Pending', reimbursementService.getByUser(userName, reimbursements));

  const approvedCount = userRole === 'Admin'
    ? reimbursementService.getCountByStatus('Approved', reimbursements)
    : reimbursementService.getCountByStatus('Approved', reimbursementService.getByUser(userName, reimbursements));

  const rejectedCount = userRole === 'Admin'
    ? reimbursementService.getCountByStatus('Rejected', reimbursements)
    : reimbursementService.getCountByStatus('Rejected', reimbursementService.getByUser(userName, reimbursements));

  const totalSubmitted = userRole === 'Admin'
    ? reimbursements.length
    : reimbursementService.getMyReimbursementsCount(userName, reimbursements);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className={`grid grid-cols-1 md:grid-cols-${userRole === 'Admin' ? '4' : '3'} gap-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingCount} requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalApproved)}</div>
            <p className="text-xs text-gray-500 mt-1">{approvedCount} requests</p>
          </CardContent>
        </Card>

        {userRole === 'Admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{formatCurrency(totalRejected)}</div>
              <p className="text-xs text-gray-500 mt-1">{rejectedCount} requests</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total {userRole === 'Admin' ? 'Requests' : 'Submitted'}</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalSubmitted}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Submit Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({userRole === 'Admin' ? reimbursements.length : reimbursementService.getMyReimbursementsCount(userName, reimbursements)})
          </Button>
          <Button
            variant={filterStatus === 'Pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('Pending')}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filterStatus === 'Approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('Approved')}
          >
            Approved ({approvedCount})
          </Button>
          <Button
            variant={filterStatus === 'Rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('Rejected')}
          >
            Rejected ({rejectedCount})
          </Button>
        </div>
        {userRole !== 'Admin' && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Reimbursement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit New Reimbursement</DialogTitle>
                <DialogDescription>Isi form untuk submit reimbursement pengeluaran kantor</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Bensin untuk meeting client"
                    value={newReimbursement.title}
                    onChange={(e) => setNewReimbursement({ ...newReimbursement, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Jelaskan detail pengeluaran..."
                    rows={4}
                    value={newReimbursement.description}
                    onChange={(e) => setNewReimbursement({ ...newReimbursement, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newReimbursement.category}
                      onValueChange={(value) => setNewReimbursement({ ...newReimbursement, category: value as Reimbursement['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Client Meeting">Client Meeting</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount (Rp) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 150000"
                      value={newReimbursement.amount}
                      onChange={(e) => setNewReimbursement({ ...newReimbursement, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenseDate">
                    Expense Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={newReimbursement.expenseDate}
                    onChange={(e) => setNewReimbursement({ ...newReimbursement, expenseDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Catatan tambahan..."
                    rows={2}
                    value={newReimbursement.notes}
                    onChange={(e) => setNewReimbursement({ ...newReimbursement, notes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptFile">Receipt File (Optional)</Label>
                  <Input
                    id="receiptFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewReimbursement({ ...newReimbursement, receiptFile: e.target.files ? e.target.files[0] : null })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReimbursement}>
                  Submit Reimbursement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reimbursement List */}
      <div className="space-y-3">
        {filteredReimbursements.length === 0 ? (
          <Card>
            <div className="flex items-center justify-center h-24 text-gray-500">
              Tidak ada reimbursement
            </div>
          </Card>
        ) : (
          filteredReimbursements.map(reimb => (
            <Card key={reimb.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base">{reimb.title}</h3>
                      {getStatusBadge(reimb.status)}
                      {getCategoryBadge(reimb.category)}
                    </div>
                    <p className="text-sm text-gray-600">{reimb.description}</p>
                    {reimb.notes && (
                      <p className="text-sm text-gray-500 italic">Note: {reimb.notes}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Expense Date: {formatDate(reimb.expenseDate)}</span>
                      <span>•</span>
                      <span>Submitted: {formatDate(reimb.requestDate)}</span>
                      {userRole === 'Admin' && (
                        <>
                          <span>•</span>
                          <span>By: {reimb.submittedBy} ({reimb.submittedByRole})</span>
                        </>
                      )}
                      {reimb.approvedDate && (
                        <>
                          <span>•</span>
                          <span>
                            {reimb.status === 'Approved' ? 'Approved' : 'Rejected'}: {formatDate(reimb.approvedDate)}
                          </span>
                        </>
                      )}
                    </div>
                    {reimb.rejectedReason && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <p className="text-red-600">Rejected {userRole === 'Admin' ? 'Reason' : ''}:</p>
                        <p>{reimb.rejectedReason}</p>
                      </div>
                    )}
                    {reimb.receiptUrl && (
                      <div className="mt-2">
                        <a
                          href={reimb.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="h-4 w-4" />
                          View Receipt
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xl font-semibold">{formatCurrency(reimb.amount)}</p>
                    <p className="text-xs text-gray-500">#{reimb.id}</p>
                    {userRole === 'Admin' && reimb.status === 'Pending' && (
                      <div className="flex flex-col gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleReview(reimb, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(reimb, 'reject')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog (hanya untuk Admin) */}
      {userRole === 'Admin' && (
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{reviewAction === 'approve' ? 'Approve' : 'Reject'} Reimbursement</DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve'
                  ? `Approve reimbursement: ${selectedReimbursement?.title} - ${formatCurrency(selectedReimbursement?.amount || 0)}`
                  : `Reject reimbursement: ${selectedReimbursement?.title} - ${formatCurrency(selectedReimbursement?.amount || 0)}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>
                  {reviewAction === 'approve' ? 'Notes (Optional)' : 'Rejection Reason *'}
                </Label>
                <Textarea
                  placeholder={reviewAction === 'approve' ? 'Tambahkan catatan approval' : 'Alasan penolakan'}
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  required={reviewAction === 'reject'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowReviewDialog(false);
                setSelectedReimbursement(null);
                setReviewNotes('');
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                variant={reviewAction === 'reject' ? 'destructive' : 'default'}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                disabled={reviewAction === 'reject' && !reviewNotes.trim()}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

