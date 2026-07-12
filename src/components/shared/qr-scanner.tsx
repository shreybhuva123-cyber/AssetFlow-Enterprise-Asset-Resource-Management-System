'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/lib/toast';

export function QRScannerModal({ isOpen, onClose, onScan }: { isOpen: boolean; onClose: () => void; onScan: (data: string) => void }) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setHasCamera(true);
        setScanning(true);
        // In a real implementation, we would attach jsQR or html5-qrcode here
        // For the demo, we will simulate a scan after 3 seconds if the user clicks a "Simulate Scan" button
      }
    } catch (err) {
      console.error(err);
      setHasCamera(false);
      notify.error('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSimulateScan = () => {
    onScan('asset-uuid-1234-demo');
    onClose();
    notify.success('Asset scanned successfully');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2"><QrCode className="h-5 w-5" /> Scan Asset</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 flex flex-col items-center justify-center min-h-[300px] bg-muted/30">
          {hasCamera === false ? (
            <div className="text-center text-muted-foreground">
              <Camera className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Camera not available.</p>
              <Button onClick={handleSimulateScan} className="mt-4">Simulate Scan (Demo)</Button>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-w-[250px] bg-black rounded-xl overflow-hidden border-2 border-primary shadow-inner">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg"></div>
              {scanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-scan"></div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-muted/10 text-center">
          <p className="text-sm text-muted-foreground">Point your camera at an AssetFlow QR code or barcode.</p>
          {hasCamera && <Button onClick={handleSimulateScan} variant="outline" className="mt-4 w-full">Simulate Scan (Demo)</Button>}
        </div>
      </div>
    </div>
  );
}
