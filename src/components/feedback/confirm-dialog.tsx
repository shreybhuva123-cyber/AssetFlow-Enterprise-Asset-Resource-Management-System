'use client';

import * as React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

const variantConfig: Record<ConfirmVariant, {
  icon: React.ElementType;
  iconClass: string;
  iconWrapperClass: string;
  confirmVariant: 'destructive' | 'default' | 'secondary';
}> = {
  danger: {
    icon: Trash2,
    iconClass: 'text-destructive',
    iconWrapperClass: 'bg-destructive/10',
    confirmVariant: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-warning',
    iconWrapperClass: 'bg-warning/10',
    confirmVariant: 'default',
  },
  info: {
    icon: Info,
    iconClass: 'text-info',
    iconWrapperClass: 'bg-info/10',
    confirmVariant: 'default',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    iconWrapperClass: 'bg-success/10',
    confirmVariant: 'default',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('rounded-full p-2.5 shrink-0', config.iconWrapperClass)}>
              <Icon className={cn('h-5 w-5', config.iconClass)} aria-hidden="true" />
            </div>
            <div className="space-y-1 pt-0.5">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function DeleteDialog({ open, onOpenChange, itemName, onConfirm, isLoading }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Confirmation"
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ApproveDialog({ open, onOpenChange, title = 'Approve', description, onConfirm, isLoading }: ApproveDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel="Approve"
      variant="success"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
