'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from '@/lib/icons';
import { useRouter } from 'next/navigation';

export interface ConflictInfo {
  holderName: string;
  departmentName?: string;
  assetTag: string;
  assetName: string;
  allocationId?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conflict: ConflictInfo | null;
  onCreateTransfer?: () => void;
}

export function ConflictDialog({ open, onOpenChange, conflict, onCreateTransfer }: Props) {
  const router = useRouter();
  if (!conflict) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Asset Already Allocated</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            <strong>{conflict.assetName}</strong> ({conflict.assetTag}) is currently allocated to{' '}
            <strong>{conflict.holderName}</strong>
            {conflict.departmentName && ` — ${conflict.departmentName}`}.
            You cannot allocate an asset that is already assigned to someone else.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onCreateTransfer?.();
              router.push('/transfers/new');
            }}
          >
            Create Transfer Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
