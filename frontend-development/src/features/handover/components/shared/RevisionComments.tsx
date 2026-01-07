import { AlertCircle } from 'lucide-react';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';

interface RevisionCommentsProps {
  comments: RevisionComment[];
  sectionTitle: string;
}

export function RevisionComments({ comments, sectionTitle }: RevisionCommentsProps) {
  const filteredComments = comments.filter(r => 
    r.sectionName === sectionTitle || 
    r.sectionName.includes(sectionTitle)
  );
  
  if (filteredComments.length === 0) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
  };
  
  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 rounded-r">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-orange-900 mb-3 text-base">CEO Revision Request</h4>
          <div className="space-y-3">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <p className="text-orange-900 mb-1.5 leading-relaxed">{comment.comment}</p>
                <p className="text-xs text-orange-700">
                  — {comment.requestedBy}{comment.role ? ` (${comment.role})` : ''} • {formatDate(comment.requestedAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
