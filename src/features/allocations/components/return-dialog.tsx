'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notify } from '@/lib/toast';

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD',      label: 'Good' },
  { value: 'FAIR',      label: 'Fair' },
  { value: 'POOR',      label: 'Poor' },
  { value: 'DAMAGED',   label: 'Damaged — notes required' },
  { value: 'LOST',      label: 'Lost — notes required' },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  allocationId: string;
  onSuccess?: () => void;
}

export function ReturnDialog({ open, onOpenChange, allocationId, onSuccess }: Props) {
  const [condition, setCondition]     = useState('GOOD');
  const [damageNotes, setDamageNotes] = useState('');
  const [comments, setComments]       = useState('');
  const [loading, setLoading]         = useState(false);

  const needsNotes = ['DAMAGED', 'LOST'].includes(condition);

  async function handleSubmit() {
    if (needsNotes && !damageNotes.trim()) { notify.error('Damage/loss notes are required for this condition'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/allocations/${allocationId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition, damageNotes: damageNotes || undefined, comments: comments || undefined, photos: [] }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      notify.success('Asset returned successfully');
      setCondition('GOOD'); setDamageNotes(''); setComments('');
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Failed to process return');
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>Record the condition of the asset upon return.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Return Condition *</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {needsNotes && (
            <div className="space-y-2">
              <Label>Damage / Loss Notes *</Label>
              <Textarea value={damageNotes} onChange={e => setDamageNotes(e.target.value)} placeholder="Describe the damage or loss..." rows={3} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Additional Comments</Label>
            <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Any additional notes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Processing...' : 'Submit Return'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
