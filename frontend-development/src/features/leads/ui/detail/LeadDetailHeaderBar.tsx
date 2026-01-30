import { ArrowLeft, Tag, Mail, Phone, User } from 'lucide-react';
import { StatusChip } from '../shared/StatusChip';

/**
 * Props for the lead detail block shown in the app header bar (when viewing a lead).
 * App/Header pass the same shape from setLeadDetail / leadDetail state.
 */
export interface LeadDetailHeaderBarProps {
  clientName: string;
  company?: string;
  status: string;
  service?: string;
  source?: string;
  picEmail?: string;
  picPhone?: string;
  onBack: () => void;
}

/**
 * Lead detail header bar content: back button + company/title + status + client/source/PIC.
 * Rendered inside the global Header when leadDetail is set (BD Executive / CEO lead detail view).
 * Lives in leads feature so the feature owns the presentation; Header only provides the slot.
 */
export function LeadDetailHeaderBar({
  company,
  clientName,
  status,
  source,
  picEmail,
  picPhone,
  onBack,
}: LeadDetailHeaderBarProps) {
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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">{company || clientName}</h1>
            <StatusChip status={status} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {clientName && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{clientName}</span>
              </div>
            )}
            {source && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{source}</span>
              </div>
            )}
            {picEmail && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{picEmail}</span>
              </div>
            )}
            {picPhone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{picPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
