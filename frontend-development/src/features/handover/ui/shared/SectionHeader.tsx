import { ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import type { SectionId } from '../../model/types';

interface SectionHeaderProps {
  sectionId: SectionId;
  /** When set (e.g. when some sections are hidden), shown instead of sectionId so numbering is 1–8 consecutive */
  displayNumber?: number;
  title: string;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  onToggle: () => void;
}

export function SectionHeader({
  sectionId,
  displayNumber,
  title,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  onToggle
}: SectionHeaderProps) {
  const numberLabel = displayNumber ?? sectionId;
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 transition-colors rounded-lg ${
        hasRevision ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
        <span className="font-semibold text-gray-900">
          {numberLabel}. {title}
        </span>
        {hasRevision && (
          <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-100 px-2.5 py-1 rounded border border-orange-200">
            <AlertCircle className="w-3 h-3" />
            Revision requested
          </div>
        )}
      </div>
      {isComplete ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : showValidation ? (
        <AlertCircle className="w-5 h-5 text-red-600" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
    </button>
  );
}
