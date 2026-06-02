import { XLg } from 'react-bootstrap-icons';
import { motion } from 'framer-motion';

export function ImageViewerModal({ imageUrl, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-zoom-out"
      />

      {/* Image Wrapper */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative max-w-5xl max-h-[85vh] flex items-center justify-center z-10 pointer-events-none"
      >
        <img
          src={imageUrl}
          alt="Full screen preview"
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl border border-white/10 shadow-2xl pointer-events-auto"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-14 right-2 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white/80 hover:text-white transition-all active:scale-95 pointer-events-auto shadow-lg"
          title="Close viewer"
        >
          <XLg className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
