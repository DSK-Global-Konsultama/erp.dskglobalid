import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import type { Handover } from '../../../../lib/mock-data';

interface HandoverTabProps {
  handovers: Handover[];
  onUpdateHandover: (id: string, updates: Partial<Handover>) => void;
}

export function HandoverTab({ handovers, onUpdateHandover }: HandoverTabProps) {
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Handover Memo Menunggu Approval</h2>
        <p className="text-gray-600 text-sm mt-1">{handovers.length} handover menunggu review</p>
      </div>
      
      {handovers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada handover menunggu approval
        </div>
      ) : (
        <div className="space-y-3">
          {handovers.map((handover) => (
            <Card key={handover.id} className="hover:border-gray-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{handover.clientName}</h3>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{handover.projectTitle}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Project Manager: <span className="text-sm font-medium text-gray-900">{handover.pm}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Waiting
                    </Badge>
                    <Button
                      onClick={() => setSelectedHandover(handover)}
                      className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
                <div className="flex gap-8 pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created By</div>
                    <div className="text-sm font-medium text-gray-900">{handover.createdBy}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Status</div>
                    <div className="text-sm font-medium text-gray-900">Ready for Handover</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Handover Modal */}
      {selectedHandover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Handover Memo Detail</h2>
              <Button variant="ghost" onClick={() => setSelectedHandover(null)}>✕</Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Client Name</p>
                <p className="font-medium">{selectedHandover.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Project Title</p>
                <p className="font-medium">{selectedHandover.projectTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Project Manager</p>
                <p className="font-medium">{selectedHandover.pm}</p>
              </div>
              {selectedHandover.summary && (
                <div>
                  <p className="text-sm text-gray-500">Summary</p>
                  <p className="font-medium">{selectedHandover.summary}</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    onUpdateHandover(selectedHandover.id, { status: 'APPROVED' });
                    setSelectedHandover(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    onUpdateHandover(selectedHandover.id, { status: 'REJECTED' });
                    setSelectedHandover(null);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

