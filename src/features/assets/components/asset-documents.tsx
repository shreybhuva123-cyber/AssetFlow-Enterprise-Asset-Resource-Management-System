'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Plus, Loader2, File, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notify } from '@/lib/toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  INVOICE:            'Invoice',
  WARRANTY:           'Warranty',
  MANUAL:             'Manual',
  CERTIFICATE:        'Certificate',
  INSURANCE:          'Insurance',
  MAINTENANCE_REPORT: 'Maintenance Report',
  OTHER:              'Other',
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export type AssetDocumentItem = {
  id:           string;
  publicUrl:    string;
  fileName:     string;
  fileSize:     number;
  mimeType:     string;
  documentType: string;
  description?: string | null;
  createdAt:    string;
};

interface AssetDocumentsProps {
  assetId:   string;
  documents: AssetDocumentItem[];
  canEdit?:  boolean;
  onUpdate?: () => void;
}

export function AssetDocuments({ assetId, documents, canEdit, onUpdate }: AssetDocumentsProps) {
  const [uploading, setUploading]   = useState(false);
  const [docType, setDocType]       = useState('OTHER');
  const [deleting, setDeleting]     = useState<string | null>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('documentType', docType);

      const res  = await fetch(`/api/assets/${assetId}/documents`, { method: 'POST', body: fd });
      const json = await res.json() as { error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Upload failed'); return; }

      notify.success('Document uploaded');
      onUpdate?.();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [assetId, docType, onUpdate]);

  const handleDelete = useCallback(async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    setDeleting(docId);
    try {
      const res  = await fetch(`/api/assets/${assetId}/documents/${docId}`, { method: 'DELETE' });
      const json = await res.json() as { error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Delete failed'); return; }
      notify.success('Document deleted');
      onUpdate?.();
    } finally {
      setDeleting(null);
    }
  }, [assetId, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Upload row */}
      {canEdit && (
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="h-9 w-[160px] bg-background/50 border-border/60 text-xs" id="doc-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label
            htmlFor="doc-upload"
            className={cn(
              'flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border/60',
              'bg-muted/20 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground',
              uploading && 'pointer-events-none opacity-60',
            )}
            id="upload-doc-label"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload Document'}
            <input
              id="doc-upload"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              className="sr-only"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground rounded-xl border border-dashed border-border/40">
          <File className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No documents attached</p>
          {canEdit && <p className="text-sm mt-0.5">Upload invoices, manuals, warranties, and more</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc, idx) => {
            const Icon = getFileIcon(doc.mimeType);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 group"
              >
                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="rounded-full bg-muted px-1.5 py-0.5">
                      {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}
                    </span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={doc.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    id={`download-doc-${doc.id}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {canEdit && (
                    <button
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => void handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      id={`delete-doc-${doc.id}`}
                    >
                      {deleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
