import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { mockInvoices } from '../../../lib/mock-data';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function InvoiceManagement() {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Invoice Management</h2>
        <p className="text-gray-500">Track payments and invoices</p>
      </div>

      <div className="space-y-4">
        {mockInvoices.map(invoice => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{invoice.clientName}</CardTitle>
                  <CardDescription>Invoice #{invoice.id}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Total Invoice</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Terms:</p>
                <div className="space-y-2">
                  {invoice.paymentTerms.map(term => (
                    <div key={term.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(term.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Term {term.termNumber} - {term.description}
                          </p>
                          <p className="text-xs text-gray-500">{term.percentage}% • {formatCurrency(term.amount)}</p>
                          {term.dueDate && (
                            <p className="text-xs text-gray-400">Due: {formatDate(term.dueDate)}</p>
                          )}
                          {term.paidDate && (
                            <p className="text-xs text-green-600">Paid: {formatDate(term.paidDate)}</p>
                          )}
                        </div>
                      </div>
                      {getPaymentStatusBadge(term.status)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

