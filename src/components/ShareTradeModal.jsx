import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Download, Copy, XLg, Check2 } from 'react-bootstrap-icons';
import { TradeShareCard } from './TradeShareCard';

export function ShareTradeModal({ trade, onClose }) {
  const cardRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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
        setImageUrl(canvas.toDataURL('image/png'));
        setIsGenerating(false);
      } catch (e) {
        console.error("Failed to generate share card", e);
        setIsGenerating(false);
      }
    };

    // Small timeout to ensure fonts and styles are loaded
    setTimeout(generateImage, 500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">

      {/* Hidden container for rendering the high-res card off-screen */}
      <div className="fixed top-[-9999px] left-[-9999px]">
        <TradeShareCard ref={cardRef} trade={trade} />
      </div>

      <div className="w-full max-w-4xl bg-card border border-border/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border/10 bg-muted/20">
          <div>
            <h3 className="text-lg font-black tracking-tight text-foreground">Share Trade</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <XLg className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 bg-black/40 flex items-center justify-center min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">Rendering High-Res Card...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Trade Share Card" className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5" />
          ) : (
            <p className="text-red-500 text-sm font-bold">Failed to generate image.</p>
          )}
        </div>

        <div className="p-4 bg-muted/10 border-t border-border/10 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            Cancel
          </button>

          <button
            onClick={handleCopy}
            disabled={!imageUrl || copied}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${copied ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-muted border border-border/40 hover:bg-muted/80 text-foreground'}`}
          >
            {copied ? <><Check2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Image</>}
          </button>

          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Download HD
          </button>
        </div>
      </div>
    </div>
  );
}
