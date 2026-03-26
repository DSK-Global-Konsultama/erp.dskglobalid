import { Badge } from '../../../../components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileEdit,
  Send,
  ThumbsDown,
  ThumbsUp,
  Upload,
} from 'lucide-react';
import type {
  PaymentTerm,
  ProcessStatus,
  PaymentStatus,
} from '../../../../lib/mock-data';

interface PaymentTermStatusBadgeProps {
  /** Full term: badge shows processStatus unless SENT_TO_CLIENT, then paymentStatus */
  term: PaymentTerm;
}

type BadgeConfig = {
  variant: 'outline';
  className: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const processConfig: Record<ProcessStatus, BadgeConfig> = {
  DRAFT: {
    variant: 'outline',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: FileEdit,
    label: 'Draft',
  },
  READY_FOR_APPROVAL: {
    variant: 'outline',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Upload,
    label: 'Ready for Approval',
  },
  PENDING_CEO_APPROVAL: {
    variant: 'outline',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Pending CEO Approval',
  },
  CEO_APPROVED: {
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ThumbsUp,
    label: 'CEO Approved',
  },
  CEO_REJECTED: {
    variant: 'outline',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: ThumbsDown,
    label: 'CEO Rejected',
  },
  SENT_TO_CLIENT: {
    variant: 'outline',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Send,
    label: 'Sent to Client',
  },
};

const paymentConfig: Record<PaymentStatus, BadgeConfig> = {
  UNPAID: {
    variant: 'outline',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Unpaid',
  },
  PARTIAL: {
    variant: 'outline',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Clock,
    label: 'Partial',
  },
  PAID: {
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Paid',
  },
  OVERDUE: {
    variant: 'outline',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    label: 'Overdue',
  },
};

export function PaymentTermStatusBadge({ term }: PaymentTermStatusBadgeProps) {
  const showPayment =
    term.processStatus === 'SENT_TO_CLIENT';
  const config = showPayment
    ? paymentConfig[term.paymentStatus]
    : processConfig[term.processStatus];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
