import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import type { Project } from '../../../lib/mock-data';
import type { ReactElement } from 'react';

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days until due date
 */
export function getDaysUntilDue(dueDate: string): number {
  return Math.floor(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Get status badge component configuration
 */
export function getStatusBadge(status: Project['status']): ReactElement {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; icon: any; label: string }> = {
    'waiting-assignment': {
      variant: 'outline' as const,
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: UserPlus,
      label: 'Waiting Assignment',
    },
    'waiting-pm': {
      variant: 'outline' as const,
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: UserPlus,
      label: 'Waiting PM Assignment',
    },
    'waiting-el': {
      variant: 'outline' as const,
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: AlertCircle,
      label: 'Waiting EL Approval',
    },
    'waiting-first-payment': {
      variant: 'outline' as const,
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertCircle,
      label: 'Waiting Payment 50%',
    },
    'in-progress': {
      variant: 'outline' as const,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      label: 'In Progress',
    },
    'waiting-final-payment': {
      variant: 'outline' as const,
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: AlertCircle,
      label: 'Waiting Final Payment',
    },
    'completed': {
      variant: 'outline' as const,
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle,
      label: 'Completed',
    },
  };

  const { variant, className, icon: Icon, label } = config[status] || config['waiting-assignment'];
  return (
    <Badge variant={variant} className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

