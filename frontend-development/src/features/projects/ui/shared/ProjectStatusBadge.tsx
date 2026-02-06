import React from 'react';
import { Badge } from '../../../../components/ui/badge';
import { Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import type { Project } from '../../../../lib/mock-data';

const STATUS_CONFIG: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  'waiting-assignment': {
    variant: 'outline',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: UserPlus,
    label: 'Waiting Assignment',
  },
  'waiting-pm': {
    variant: 'outline',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: UserPlus,
    label: 'Waiting PM Assignment',
  },
  'waiting-el': {
    variant: 'outline',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
    label: 'Waiting EL Approval',
  },
  'waiting-first-payment': {
    variant: 'outline',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertCircle,
    label: 'Waiting Payment 50%',
  },
  'in-progress': {
    variant: 'outline',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    label: 'In Progress',
  },
  'waiting-final-payment': {
    variant: 'outline',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
    label: 'Waiting Final Payment',
  },
  completed: {
    variant: 'outline',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Completed',
  },
};

export function ProjectStatusBadge({ status }: { status: Project['status'] }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['waiting-assignment'];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
