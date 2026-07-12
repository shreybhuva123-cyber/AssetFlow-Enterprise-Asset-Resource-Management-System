'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Plus, Trash2, Star, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';

export type AssetImageItem = {
  id:        string;
  publicUrl: string;
  fileName:  string;
  isPrimary: boolean;
  fileSize:  number;
  mimeType:  string;
};

interface AssetGalleryProps {
  assetId:    string;
  images:     AssetImageItem[];
  canEdit?:   boolean;
  onUpdate?:  () => void;
}

export function AssetGallery({ assetId, images, canEdit, onUpdate }: AssetGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevImage = () => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const nextImage = () => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : null));

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('isPrimary', images.length === 0 ? 'true' : 'false');

      const res  = await fetch(`/api/assets/${assetId}/images`, { method: 'POST', body: fd });
      const json = await res.json() as { error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Upload failed'); return; }

      notify.success('Image uploaded');
      onUpdate?.();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [assetId, images.length, onUpdate]);

  const handleDelete = useCallback(async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    setDeleting(imageId);
    try {
      const res  = await fetch(`/api/assets/${assetId}/images/${imageId}`, { method: 'DELETE' });
      const json = await res.json() as { error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Delete failed'); return; }
      notify.success('Image deleted');
      onUpdate?.();
    } finally {
      setDeleting(null);
    }
  }, [assetId, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Upload button */}
      {canEdit && (
        <label
          htmlFor="image-upload"
          className={cn(
            'flex items-center gap-2 w-fit cursor-pointer rounded-lg border border-dashed border-border/60',
            'bg-muted/20 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground',
            uploading && 'pointer-events-none opacity-60',
          )}
          id="upload-image-label"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Add Image'}
          <input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}

      {/* Gallery grid */}
      {images.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground rounded-xl border border-dashed border-border/40">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center">
            <Star className="h-6 w-6 opacity-30" />
          </div>
          <p className="font-medium">No images yet</p>
          {canEdit && <p className="text-sm mt-0.5">Click "Add Image" to upload the first photo</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted/30 border border-border/40 cursor-pointer"
              onClick={() => openLightbox(idx)}
            >
              <Image
                src={img.publicUrl}
                alt={img.fileName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-xs text-white font-medium">
                  <Star className="h-2.5 w-2.5 fill-white" />
                  Primary
                </div>
              )}

              {/* Delete button */}
              {canEdit && (
                <button
                  className={cn(
                    'absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 opacity-0 group-hover:opacity-100',
                    'transition-opacity flex items-center justify-center text-white hover:bg-destructive/80',
                    deleting === img.id && 'opacity-100',
                  )}
                  onClick={(e) => { e.stopPropagation(); void handleDelete(img.id); }}
                  id={`delete-image-${img.id}`}
                >
                  {deleting === img.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && images[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={closeLightbox}
              id="close-lightbox-btn"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  id="prev-image-btn"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  id="next-image-btn"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[85vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIdx].publicUrl}
                alt={images[lightboxIdx].fileName}
                width={1200}
                height={800}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              />
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full">
                {images[lightboxIdx].fileName} · {lightboxIdx + 1} / {images.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
