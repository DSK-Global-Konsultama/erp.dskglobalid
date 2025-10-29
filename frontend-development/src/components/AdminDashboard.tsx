import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { mockInvoices } from '../lib/mock-data';
import { toast } from 'sonner';
import { DollarSign, AlertCircle, Check, Clock } from 'lucide-react';

export function AdminDashboard() {
  const [invoices, setInvoices] = useState(mockInvoices);

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

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      pending: 'secondary',
      overdue: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const handleMarkAsPaid = (_invoiceId: string, termId: string) => {
    setInvoices(prev => prev.map(inv => ({
      ...inv,
      paymentTerms: inv.paymentTerms.map(term => 
        term.id === termId ? { 
          ...term, 
          status: 'paid' as const, 
          paidDate: new Date().toISOString().split('T')[0] 
        } : term
      )
    })));
    toast.success('Payment marked as paid');
  };

  // Get all payment terms
  const allPaymentTerms = invoices.flatMap(inv => 
    inv.paymentTerms.map(term => ({ ...term, invoiceId: inv.id, invoiceClient: inv.clientName }))
  );

  const pendingPayments = allPaymentTerms.filter(t => t.status === 'pending');
  const overduePayments = allPaymentTerms.filter(t => {
    if (t.status !== 'pending') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="text-gray-500">Track and manage payments</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-gray-500 mt-1">Payment terms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overduePayments.length}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingPayments.reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Invoice pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pending Payments</CardTitle>
          <CardDescription>Total: {pendingPayments.length} payment terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.invoiceClient}</p>
                      <p className="text-xs text-gray-500">
                        Term {payment.termNumber} - {payment.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {payment.percentage}% • {formatCurrency(payment.amount)}
                      </p>
                      {payment.dueDate && (
                        <p className="text-xs text-gray-400">Due: {formatDate(payment.dueDate)}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getPaymentStatusBadge(payment.status)}
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleMarkAsPaid(payment.invoiceId, payment.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark as Paid
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments */}
      {overduePayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-600">Overdue Payments</CardTitle>
            <CardDescription>Total: {overduePayments.length} overdue payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overduePayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 border-red-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.invoiceClient}</p>
                        <p className="text-xs text-gray-500">
                          Term {payment.termNumber} - {payment.description}
                        </p>
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {payment.percentage}% • {formatCurrency(payment.amount)}
                        </p>
                        {payment.dueDate && (
                          <p className="text-xs text-red-500">Overdue since: {formatDate(payment.dueDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPaymentStatusBadge('overdue')}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleMarkAsPaid(payment.invoiceId, payment.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark as Paid
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

