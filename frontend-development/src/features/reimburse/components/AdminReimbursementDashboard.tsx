import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import type { Reimbursement } from '../../../lib/mock-data';
import { reimbursementService } from '../services/reimbursementService';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface AdminReimbursementDashboardProps {
  userName: string;
}

export function AdminReimbursementDashboard({ userName }: AdminReimbursementDashboardProps) {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(reimbursementService.getAll());
  const [selectedReimb, setSelectedReimb] = useState<Reimbursement | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleApprove = (reimbId: string) => {
    const updatedReimbursements = reimbursementService.updateStatus(
      reimbId,
      'Approved',
      userName,
      reimbursements
    );
    setReimbursements(updatedReimbursements);
    toast.success('Reimbursement approved');
    setIsDetailDialogOpen(false);
    setSelectedReimb(null);
  };

  const handleReject = (reimbId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Mohon isi alasan penolakan');
      return;
    }
    const updatedReimbursements = reimbursementService.updateStatus(
      reimbId,
      'Rejected',
      userName,
      reimbursements,
      rejectionReason
    );
    setReimbursements(updatedReimbursements);
    toast.success('Reimbursement rejected');
    setIsDetailDialogOpen(false);
    setSelectedReimb(null);
    setRejectionReason('');
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

  const filteredReimbursements = filterStatus === 'all'
    ? reimbursements
    : reimbursements.filter(r => r.status === filterStatus);

  // Statistics menggunakan service
  const totalPending = reimbursementService.getTotalAmountByStatus('Pending', reimbursements);
  const totalApproved = reimbursementService.getTotalAmountByStatus('Approved', reimbursements);
  const totalRejected = reimbursementService.getTotalAmountByStatus('Rejected', reimbursements);
  const pendingCount = reimbursementService.getCountByStatus('Pending', reimbursements);
  const approvedCount = reimbursementService.getCountByStatus('Approved', reimbursements);
  const rejectedCount = reimbursementService.getCountByStatus('Rejected', reimbursements);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {pendingCount} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalApproved)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {approvedCount} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalRejected)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {rejectedCount} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reimbursements.length}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All ({reimbursements.length})
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

      {/* Reimbursement List */}
      <div className="space-y-3">
        {filteredReimbursements.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-24 text-gray-500">
              Tidak ada reimbursement
            </CardContent>
          </Card>
        ) : (
          filteredReimbursements.map(reimb => (
            <Card key={reimb.id} className={reimb.status === 'Pending' ? 'border-2 border-orange-200' : ''}>
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
                      <span>
                        By: {reimb.submittedBy} ({reimb.submittedByRole})
                      </span>
                      <span>•</span>
                      <span>Expense: {formatDate(reimb.expenseDate)}</span>
                      <span>•</span>
                      <span>Submitted: {formatDate(reimb.requestDate)}</span>
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
                        <p className="text-red-600">Rejected Reason:</p>
                        <p>{reimb.rejectedReason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xl">{formatCurrency(reimb.amount)}</p>
                      <p className="text-xs text-gray-500">#{reimb.id}</p>
                    </div>
                    {reimb.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReimb(reimb);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          View Details
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReimb && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>{selectedReimb.title}</DialogTitle>
                  {getStatusBadge(selectedReimb.status)}
                  {getCategoryBadge(selectedReimb.category)}
                </div>
                <DialogDescription>
                  Reimbursement #{selectedReimb.id} - {formatCurrency(selectedReimb.amount)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-sm">{selectedReimb.description}</p>
                </div>
                {selectedReimb.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm italic">{selectedReimb.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Submitted By</p>
                    <p>
                      {selectedReimb.submittedBy} ({selectedReimb.submittedByRole})
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="text-lg">{formatCurrency(selectedReimb.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expense Date</p>
                    <p>{formatDate(selectedReimb.expenseDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Request Date</p>
                    <p>{formatDate(selectedReimb.requestDate)}</p>
                  </div>
                </div>
                {selectedReimb.status === 'Pending' && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm">Action</p>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Alasan penolakan (jika reject)..."
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(selectedReimb.id)}
                        disabled={!rejectionReason.trim()}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => handleApprove(selectedReimb.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

