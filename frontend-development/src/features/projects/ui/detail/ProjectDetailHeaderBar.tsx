/**
 * Header bar for Project Detail. Rendered in-page or in global Header (inHeader).
 */

import { ArrowLeft } from 'lucide-react';

export interface ProjectDetailHeaderBarProps {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  /** Optional line below subtitle, e.g. "ID: HO-L103-001 • Period: 2025-02-15 – 2025-05-15" */
  metaLine?: string;
  onBack: () => void;
  /** When true, compact layout for global Header (same pattern as LeadDetailHeaderBar) */
  inHeader?: boolean;
}

export function ProjectDetailHeaderBar({
  title,
  subtitle,
  statusLabel,
  metaLine,
  onBack,
  inHeader = false,
}: ProjectDetailHeaderBarProps) {
  if (inHeader) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
              {statusLabel && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 shrink-0">
                  {statusLabel}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-2 text-sm text-gray-600">
              {subtitle && <span>{subtitle}</span>}
              {metaLine && <span className="text-gray-500">{metaLine}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-semibold text-gray-900 m-0">{title}</h1>
        {statusLabel && (
          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800">
            {statusLabel}
          </span>
        )}
      </div>
      {subtitle && <p className="text-gray-600 mb-1">{subtitle}</p>}
      {metaLine && (
        <p className="text-sm text-gray-500">{metaLine}</p>
      )}
    </div>
  );
}
