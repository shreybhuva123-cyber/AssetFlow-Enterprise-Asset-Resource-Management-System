'use client';

import { useState, useCallback } from 'react';
import { QrCode, Download, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/toast';
import Image from 'next/image';

interface AssetQRCardProps {
  assetId:   string;
  assetTag:  string;
  assetName: string;
  qrDataUrl?: string | null;
  onUpdate?: () => void;
}

export function AssetQRCard({ assetId, assetTag, assetName, qrDataUrl: initialQR, onUpdate }: AssetQRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState(initialQR);
  const [loading, setLoading]     = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/assets/${assetId}/qr`, { method: 'POST' });
      const json = await res.json() as { data?: { qrDataUrl: string }; error?: string };
      if (!res.ok) { notify.error(json.error ?? 'Failed to generate QR'); return; }
      setQrDataUrl(json.data!.qrDataUrl);
      notify.success('QR code generated');
      onUpdate?.();
    } finally {
      setLoading(false);
    }
  }, [assetId, onUpdate]);

  const download = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href     = qrDataUrl;
    a.download = `${assetTag}-qr.png`;
    a.click();
  }, [qrDataUrl, assetTag]);

  const print = useCallback(() => {
    if (!qrDataUrl) return;
    const win = window.open('', '_blank');
    win?.document.write(`
      <html><body style="text-align:center;padding:40px;font-family:monospace">
        <h2>${assetTag}</h2>
        <p style="color:#666">${assetName}</p>
        <img src="${qrDataUrl}" style="width:200px;height:200px" />
        <p style="font-size:12px;color:#999;margin-top:10px">Scan to view asset details</p>
      </body></html>
    `);
    win?.print();
    win?.close();
  }, [qrDataUrl, assetTag, assetName]);

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <QrCode className="h-4 w-4 text-primary" />
        QR Code
      </div>

      {qrDataUrl ? (
        <div className="relative p-3 bg-white rounded-xl shadow-sm border border-border/30">
          <Image
            src={qrDataUrl}
            alt={`QR code for ${assetTag}`}
            width={160}
            height={160}
            className="rounded-lg"
          />
        </div>
      ) : (
        <div className="h-40 w-40 rounded-xl bg-muted/30 border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <QrCode className="h-10 w-10 opacity-30" />
          <span className="text-xs">Not generated</span>
        </div>
      )}

      <p className="font-mono text-xs font-semibold text-muted-foreground">{assetTag}</p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={generate}
          disabled={loading}
          className="gap-1.5 h-8 text-xs"
          id="regenerate-qr-btn"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {qrDataUrl ? 'Regenerate' : 'Generate'}
        </Button>

        {qrDataUrl && (
          <>
            <Button size="sm" variant="outline" onClick={download} className="gap-1.5 h-8 text-xs" id="download-qr-btn">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={print} className="gap-1.5 h-8 text-xs" id="print-qr-btn">
              Print
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
