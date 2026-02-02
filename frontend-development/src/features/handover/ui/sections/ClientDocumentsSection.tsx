import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import { Plus, Trash2, Upload, File } from 'lucide-react';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

interface DocumentItem {
  fileName: string;
  file?: File;
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  uploadDate?: string;
}

interface ClientDocumentsSectionProps {
  sectionId: SectionId;
  documentsReceived: DocumentItem[];
  onDocumentsReceivedChange: (documents: DocumentItem[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function ClientDocumentsSection({
  sectionId,
  documentsReceived,
  onDocumentsReceivedChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: ClientDocumentsSectionProps) {
  const handleFileNameChange = (index: number, fileName: string) => {
    const newDocuments = [...documentsReceived];
    newDocuments[index] = { ...newDocuments[index], fileName };
    onDocumentsReceivedChange(newDocuments);
  };

  const handleFileUpload = (index: number, file: File) => {
    const newDocuments = [...documentsReceived];
    const now = new Date().toISOString();
    newDocuments[index] = {
      ...newDocuments[index],
      file,
      fileName: newDocuments[index].fileName || file.name,
      uploadedAt: now,
      uploadedBy: 'Current User',
      uploadDate: now
    };
    onDocumentsReceivedChange(newDocuments);
  };

  const handleRemove = (index: number) => {
    onDocumentsReceivedChange(documentsReceived.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onDocumentsReceivedChange([...documentsReceived, { fileName: '' }]);
  };

  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="CLIENT-PROVIDED DOCUMENTS"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <RevisionComments comments={revisionComments} sectionTitle="CLIENT-PROVIDED DOCUMENTS" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Documents Received (as of Handover):</h3>
            {documentsReceived.map((doc, index) => (
              <div key={index} className="flex items-start gap-3 mb-4 p-3 border border-gray-200 rounded-lg">
                <span className="text-gray-600 mt-2">•</span>
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    value={doc.fileName}
                    onChange={(e) => handleFileNameChange(index, e.target.value)}
                    placeholder="Document name/description"
                    disabled={readOnly}
                    className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                  />
                  <div className="flex items-center gap-2">
                    {doc.file ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                        <File className="w-4 h-4" />
                        <span className="font-medium">{doc.file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newDocuments = [...documentsReceived];
                              newDocuments[index] = { ...newDocuments[index], file: undefined };
                              onDocumentsReceivedChange(newDocuments);
                            }}
                            className="text-red-600 hover:text-red-700 h-6 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ) : doc.fileUrl ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                        <File className="w-4 h-4" />
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium hover:underline transition-all hover:text-blue-700"
                        >
                          {doc.fileName}
                        </a>
                      </div>
                    ) : (
                      !readOnly && (
                        <label className="flex items-center gap-2 text-sm border border-dashed border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                          <Upload className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700 font-medium">Upload File</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(index, file);
                              }
                            }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          />
                        </label>
                      )
                    )}
                  </div>
                </div>
                {!readOnly && documentsReceived.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    className="text-red-600 hover:text-red-700 mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Document
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
