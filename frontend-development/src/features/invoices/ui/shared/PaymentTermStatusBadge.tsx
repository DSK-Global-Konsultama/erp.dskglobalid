import { Badge } from '../../../../components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { PaymentTerm } from '../../../../lib/mock-data';

interface PaymentTermStatusBadgeProps {
  status: PaymentTerm['status'];
}

const config: Record<
  PaymentTerm['status'],
  { variant: 'outline'; className: string; icon: typeof Clock; label: string }
> = {
  pending: {
    variant: 'outline',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Clock,
    label: 'Pending',
  },
  paid: {
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Paid',
  },
  overdue: {
    variant: 'outline',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    label: 'Overdue',
  },
};

export function PaymentTermStatusBadge({ status }: PaymentTermStatusBadgeProps) {
  const { className, icon: Icon, label } = config[status];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
