import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { NotulensiDetailModal } from '../../../leads/components/modals/NotulensiDetailModal';
import type { Notulensi } from '../../../../lib/mock-data';

interface NotulensiTabProps {
  notulensi: Notulensi[];
  onUpdateNotulensi: (id: string, updates: Partial<Notulensi>) => void;
}

export function NotulensiTab({ notulensi, onUpdateNotulensi }: NotulensiTabProps) {
  const [selectedNotulensi, setSelectedNotulensi] = useState<Notulensi | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Notulensi Menunggu Approval</h2>
        <p className="text-gray-600 text-sm mt-1">{notulensi.length} notulensi menunggu review</p>
      </div>
      
      {notulensi.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada notulensi menunggu approval
        </div>
      ) : (
        <div className="space-y-3">
          {notulensi.map((notulensiItem) => (
            <Card key={notulensiItem.id} className="hover:border-gray-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {notulensiItem.clientName}
                      </h3>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">Notulensi Meeting</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {notulensiItem.meetingInfo.date} • {notulensiItem.meetingInfo.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Waiting
                    </Badge>
                    <Button
                      onClick={() => setSelectedNotulensi(notulensiItem)}
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
                    <div className="text-sm font-medium text-gray-900">{notulensiItem.createdBy}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Document ID</div>
                    <div className="font-mono text-xs text-gray-600">#{notulensiItem.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedNotulensi && (
        <NotulensiDetailModal
          notulensi={selectedNotulensi}
          open={true}
          onClose={() => setSelectedNotulensi(null)}
          onEdit={() => {}}
          onUpdateNotulensi={(id, updates) => {
            onUpdateNotulensi(id, updates);
            if (updates.status === 'APPROVED' || updates.status === 'REJECTED') {
              setSelectedNotulensi(null);
            }
          }}
        />
      )}
    </div>
  );
}

