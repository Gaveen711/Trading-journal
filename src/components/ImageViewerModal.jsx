import { useState } from 'react';
import { XLg, ExclamationTriangleFill } from 'react-bootstrap-icons';
import { motion as Motion } from 'framer-motion';

export function ImageViewerModal({ imageUrl, onClose }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
      />

      {/* Image Wrapper */}
      <Motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative max-w-5xl max-h-[85vh] flex items-center justify-center z-10 pointer-events-none"
      >
        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-4 bg-card/90 border border-border/40 w-[320px] p-8 rounded-2xl text-center pointer-events-auto shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-1">
              <ExclamationTriangleFill className="w-6 h-6 text-destructive" />
            </div>
            <span className="text-xs font-black uppercase text-foreground tracking-wider">Failed to Load Image</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider">
              Verify your connection or Firebase storage permissions.
            </p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Full screen preview"
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl border border-white/10 shadow-2xl pointer-events-auto"
            onError={() => setHasError(true)}
          />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-14 right-2 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white/80 hover:text-white transition-all active:scale-95 pointer-events-auto shadow-lg"
          title="Close viewer"
        >
          <XLg className="w-4 h-4" />
        </button>
      </Motion.div>
    </div>
  );
}
