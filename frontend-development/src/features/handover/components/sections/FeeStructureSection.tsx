import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../types';

type FeeStructureItem = {
  id?: string;
  description?: string;
  amount?: number;
  percentage?: number;
};

interface FeeStructureSectionProps {
  sectionId: SectionId;
  feeStructure: FeeStructureItem[];
  paymentTermsText: string;
  onFeeStructureChange: (fees: FeeStructureItem[]) => void;
  onPaymentTermsTextChange: (value: string) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function FeeStructureSection({
  sectionId,
  feeStructure,
  paymentTermsText,
  onFeeStructureChange,
  onPaymentTermsTextChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: FeeStructureSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="FEE STRUCTURE & PAYMENT TERMS"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <RevisionComments comments={revisionComments} sectionTitle="FEE STRUCTURE & PAYMENT TERMS" />
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border border-gray-300">Item</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Amount (Rp)</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Notes</th>
                  {!readOnly && <th className="w-10 border border-gray-300"></th>}
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((fee, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={fee.description || ''}
                        onChange={(e) => {
                          const newFees = [...feeStructure];
                          newFees[index].description = e.target.value;
                          onFeeStructureChange(newFees);
                        }}
                        placeholder="Item description"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="number"
                        value={fee.amount || ''}
                        onChange={(e) => {
                          const newFees = [...feeStructure];
                          newFees[index].amount = Number(e.target.value);
                          onFeeStructureChange(newFees);
                        }}
                        placeholder="0"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={fee.percentage ? `${fee.percentage}%` : ''}
                        onChange={(e) => {
                          const newFees = [...feeStructure];
                          const val = e.target.value.replace('%', '');
                          newFees[index].percentage = val ? Number(val) : undefined;
                          onFeeStructureChange(newFees);
                        }}
                        placeholder="Notes"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    {!readOnly && (
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {feeStructure.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onFeeStructureChange(feeStructure.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFeeStructureChange([...feeStructure, { id: `FEE-${Date.now()}`, description: '', amount: 0 }])}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Fee Item
            </Button>
          )}
          
          <div className="mt-3">
            <Label htmlFor="paymentTerms" className="mb-3 block">Payment Terms:</Label>
            <Textarea
              id="paymentTerms"
              value={paymentTermsText}
              onChange={(e) => onPaymentTermsTextChange(e.target.value)}
              placeholder="Invoice details, payment schedule, work start conditions..."
              rows={3}
              disabled={readOnly}
              className={readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
