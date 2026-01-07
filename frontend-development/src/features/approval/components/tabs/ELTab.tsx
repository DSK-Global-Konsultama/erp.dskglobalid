import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { EngagementLetterUploadModal } from '../../../leads/components/modals/EngagementLetterUploadModal';
import type { Lead, EngagementLetter } from '../../../../lib/mock-data';

interface ELTabProps {
  engagementLetters: EngagementLetter[];
  leads: Lead[];
  onUpdateEngagementLetter: (id: string, updates: Partial<EngagementLetter>) => void;
}

export function ELTab({ engagementLetters, leads, onUpdateEngagementLetter }: ELTabProps) {
  const [selectedEL, setSelectedEL] = useState<EngagementLetter | null>(null);

  const getLeadForEL = (el: EngagementLetter): Lead | null => {
    return leads.find(l => l.id === el.leadId) || null;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Engagement Letter Menunggu Approval</h2>
        <p className="text-gray-600 text-sm mt-1">{engagementLetters.length} EL menunggu review</p>
      </div>
      
      {engagementLetters.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada EL menunggu approval
        </div>
      ) : (
        <div className="space-y-3">
          {engagementLetters.map((el) => (
            <Card key={el.id} className="hover:border-gray-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {getLeadForEL(el)?.company || el.clientName || `EL ${el.id}`}
                      </h3>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{el.service}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div>
                        <span className="text-[11px] text-gray-500">Agree Fee: </span>
                        <span className="text-sm font-semibold text-gray-900">
                          IDR {((el.agreeFee || 0) / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Waiting
                    </Badge>
                    <Button
                      onClick={() => setSelectedEL(el)}
                      className="px-5 py-2 bg-white text-gray-900 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
                <div className="flex gap-8 pt-3 border-t border-gray-100">
                  <div className="max-w-[700px]">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Payment Final</div>
                    <div className="text-sm font-medium text-gray-900 break-words">{el.paymentTypeFinal || el.paymentType || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Subcon</div>
                    <div className="text-sm font-medium text-gray-900">{el.hasSubcon ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created</div>
                    <div className="text-sm font-medium text-gray-900">
                      {el.createdAt 
                        ? new Date(el.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedEL && (
        <EngagementLetterUploadModal
          engagementLetter={selectedEL}
          lead={getLeadForEL(selectedEL)}
          open={true}
          onClose={() => setSelectedEL(null)}
          isCEOView={true}
          onUpdateEngagementLetter={(id, updates) => {
            onUpdateEngagementLetter(id, updates);
            if (updates.status === 'APPROVED' || updates.status === 'REJECTED') {
              setSelectedEL(null);
            }
          }}
        />
      )}
    </div>
  );
}

