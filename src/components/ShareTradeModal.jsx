import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Check, Copy, Download } from 'lucide-react';
import { TradeShareCard } from './TradeShareCard';
import { AppDialog } from './app/AppDialog';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

export function ShareTradeModal({ trade, onClose }) {
  const cardRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const generateImage = async () => {
      if (!cardRef.current) return;
      try {
        // Use html2canvas to capture the hidden component
        const canvas = await html2canvas(cardRef.current, {
          scale: 2, // High resolution
          useCORS: true,
          backgroundColor: '#050505',
          logging: false
        });
        if (!cancelled) {
          setImageUrl(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        }
      } catch (e) {
        console.error("Failed to generate share card", e);
        if (!cancelled) setIsGenerating(false);
      }
    };

    // Small timeout to ensure fonts and styles are loaded
    const timer = setTimeout(generateImage, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `xaujournal_trade_${trade.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy image to clipboard", e);
    }
  };

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Share trade"
      size="xl"
      footer={(
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={handleCopy} disabled={!imageUrl || copied}>
            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copied ? 'Copied' : 'Copy image'}
          </Button>
          <Button onClick={handleDownload} disabled={!imageUrl}>
            <Download data-icon="inline-start" />
            Download HD
          </Button>
        </>
      )}
    >
      {/* Hidden container for rendering the high-res card off-screen */}
      <div className="fixed top-[-9999px] left-[-9999px]">
        <TradeShareCard ref={cardRef} trade={trade} />
      </div>

      <div className="flex min-h-[280px] items-center justify-center overflow-auto rounded-lg bg-muted/40 p-4 sm:min-h-[400px] sm:p-6">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
            <Spinner className="size-8" />
            <p className="text-xs font-medium text-muted-foreground">Rendering high-resolution card…</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Trade share card" className="max-h-[500px] w-full rounded-lg border border-border object-contain shadow-xl" />
        ) : (
          <p className="text-sm font-medium text-destructive" role="alert">Failed to generate image.</p>
        )}
      </div>
    </AppDialog>
  );
}
