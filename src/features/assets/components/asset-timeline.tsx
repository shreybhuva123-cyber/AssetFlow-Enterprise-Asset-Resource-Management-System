'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Plus, Wrench, RotateCcw, AlertTriangle, Archive, Trash2,
  Edit, Image, FileText, QrCode, Barcode, MapPin, Tag,
  CheckCircle, UserCheck, Clock, ArrowLeftRight, Calendar, XCircle,
} from 'lucide-react';
import type { TimelineEventType } from '@prisma/client';
import { cn } from '@/lib/utils/cn';

type TimelineEvent = {
  id:          string;
  eventType:   TimelineEventType;
  title:       string;
  description?: string | null;
  createdAt:   string;
  actor?:      { id: string; displayName: string; avatarUrl?: string | null } | null;
  metadata:    Record<string, unknown>;
};

const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
  CREATED:              { icon: Plus,        color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  UPDATED:              { icon: Edit,        color: 'text-blue-600',    bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  STATUS_CHANGED:       { icon: RefreshCw,   color: 'text-violet-600',  bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  CONDITION_CHANGED:    { icon: Edit,        color: 'text-amber-600',   bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  ALLOCATED:            { icon: UserCheck,   color: 'text-blue-600',    bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  RETURNED:             { icon: RotateCcw,   color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  MAINTENANCE_STARTED:  { icon: Wrench,      color: 'text-amber-600',   bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  MAINTENANCE_COMPLETED:{ icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  AUDIT_COMPLETED:      { icon: CheckCircle, color: 'text-blue-600',    bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  LOCATION_CHANGED:     { icon: MapPin,      color: 'text-orange-600',  bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  CATEGORY_CHANGED:     { icon: Tag,         color: 'text-indigo-600',  bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  IMAGE_UPLOADED:       { icon: Image,       color: 'text-pink-600',    bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  IMAGE_DELETED:        { icon: Trash2,      color: 'text-red-600',     bgColor: 'bg-red-100 dark:bg-red-900/30' },
  DOCUMENT_UPLOADED:    { icon: FileText,    color: 'text-cyan-600',    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  DOCUMENT_DELETED:     { icon: Trash2,      color: 'text-red-600',     bgColor: 'bg-red-100 dark:bg-red-900/30' },
  QR_GENERATED:         { icon: QrCode,      color: 'text-slate-600',   bgColor: 'bg-slate-100 dark:bg-slate-800' },
  BARCODE_GENERATED:    { icon: Barcode,     color: 'text-slate-600',   bgColor: 'bg-slate-100 dark:bg-slate-800' },
  RETIRED:              { icon: Archive,     color: 'text-orange-600',  bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  DISPOSED:             { icon: Trash2,      color: 'text-gray-600',    bgColor: 'bg-gray-100 dark:bg-gray-800' },
  LOST:                 { icon: AlertTriangle, color: 'text-red-600',   bgColor: 'bg-red-100 dark:bg-red-900/30' },
  FOUND:                { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  TRANSFERRED:          { icon: ArrowLeftRight, color: 'text-blue-600',    bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  // Phase 4 — Allocation & Booking
  ALLOCATION_CREATED:   { icon: UserCheck,   color: 'text-blue-600',    bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  ALLOCATION_APPROVED:  { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ALLOCATION_RETURNED:  { icon: RotateCcw,   color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ALLOCATION_CANCELLED: { icon: XCircle,     color: 'text-red-600',     bgColor: 'bg-red-100 dark:bg-red-900/30' },
  TRANSFER_REQUESTED:   { icon: ArrowLeftRight, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  TRANSFER_APPROVED:    { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  TRANSFER_REJECTED:    { icon: XCircle,     color: 'text-red-600',     bgColor: 'bg-red-100 dark:bg-red-900/30' },
  TRANSFER_COMPLETED:   { icon: ArrowLeftRight, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  BOOKING_CREATED:      { icon: Calendar,    color: 'text-indigo-600',  bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  BOOKING_CANCELLED:    { icon: XCircle,     color: 'text-red-600',     bgColor: 'bg-red-100 dark:bg-red-900/30' },
  BOOKING_COMPLETED:    { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  RETURN_INITIATED:     { icon: RotateCcw,   color: 'text-amber-600',   bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  RETURN_APPROVED:      { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  RETURN_REJECTED:      { icon: XCircle,     color: 'text-red-600',     bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

// Fallback for missing keys
function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

interface AssetTimelineProps {
  events:     TimelineEvent[];
  isLoading?: boolean;
}

export function AssetTimeline({ events, isLoading }: AssetTimelineProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 pt-1 space-y-1.5">
              <div className="h-3.5 w-48 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No timeline events yet</p>
        <p className="text-sm mt-0.5">Events will appear here as the asset is used</p>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, idx) => {
        const config     = EVENT_CONFIG[event.eventType] ?? EVENT_CONFIG.UPDATED;
        const Icon       = config.icon;
        const isLast     = idx === events.length - 1;
        const isExpanded = expanded.has(event.id);

        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="relative flex gap-4"
          >
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border/60" />
            )}

            {/* Icon */}
            <div className={cn('relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', config.bgColor)}>
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium leading-tight">{event.title}</p>
                  {event.actor && (
                    <p className="text-xs text-muted-foreground mt-0.5">by {event.actor.displayName}</p>
                  )}
                </div>
                <time
                  className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap"
                  dateTime={event.createdAt}
                  title={format(new Date(event.createdAt), 'PPpp')}
                >
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                </time>
              </div>

              {event.description && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{event.description}</p>
              )}

              {Object.keys(event.metadata).length > 0 && (
                <button
                  className="mt-1 text-xs text-primary hover:underline"
                  onClick={() => {
                    const next = new Set(expanded);
                    if (isExpanded) next.delete(event.id); else next.add(event.id);
                    setExpanded(next);
                  }}
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              )}

              {isExpanded && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto font-mono text-muted-foreground"
                >
                  {JSON.stringify(event.metadata, null, 2)}
                </motion.pre>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
