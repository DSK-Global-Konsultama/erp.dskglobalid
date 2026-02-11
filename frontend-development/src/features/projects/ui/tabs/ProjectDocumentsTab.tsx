/**
 * Project Documents Tab (Document Center).
 * Data via props; RBAC from projectViewPolicy. Upload mock: toast + close modal.
 */

import { useState } from 'react';
import { Upload, File, FileText, Image, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { ProjectDocument, DocumentCategory } from '../../../../lib/projectWorkflowTypes';
import { canUploadProjectDocument } from '../guards/projectViewPolicy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';

export interface ProjectDocumentsTabProps {
  handoverId: string;
  userRole: 'COO' | 'PM' | string;
  documents: ProjectDocument[];
}

const CATEGORIES: DocumentCategory[] = [
  '01-Handover',
  '02-Client Docs',
  '03-Working Papers',
  '04-Final',
];

function getFileIcon(fileType: string) {
  const lower = fileType.toLowerCase();
  if (lower.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
  if (
    lower.includes('image') ||
    lower.includes('png') ||
    lower.includes('jpg') ||
    lower.includes('jpeg')
  )
    return <Image className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-gray-600" />;
}

export function ProjectDocumentsTab({
  handoverId: _handoverId,
  userRole,
  documents,
}: ProjectDocumentsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | DocumentCategory>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const canUpload = canUploadProjectDocument(userRole);

  const filteredDocuments =
    selectedCategory === 'ALL'
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  const categoryStats = CATEGORIES.map((cat) => ({
    category: cat,
    count: documents.filter((d) => d.category === cat).length,
  }));

  const handleUploadSubmit = () => {
    toast.success('Document uploaded (mock)');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Document Center</h3>
          <p className="text-sm text-gray-600 mt-1">Organize and manage all project documents</p>
        </div>
        {canUpload && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Documents ({documents.length})
            </button>
            {categoryStats.map(({ category: cat, count }) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat} ({count})
              </button>
            ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 [&_td]:py-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="text-sm font-medium">Belum ada data document</p>
                        <p className="text-xs mt-1">Upload dokumen pertama untuk memulai</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.fileType)}
                          <div>
                            <p className="font-medium text-gray-900">{doc.fileName}</p>
                            {doc.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {doc.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{doc.fileSize}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{doc.uploadedBy}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
      </div>

      {canUpload && (
        <UploadDocumentModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUploadSubmit}
        />
      )}
    </div>
  );
}
