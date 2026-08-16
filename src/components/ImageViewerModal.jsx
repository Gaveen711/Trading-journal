import { useState } from 'react';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';
import { AppDialog } from './app/AppDialog';

export function ImageViewerModal({ imageUrl, onClose }) {
  const [hasError, setHasError] = useState(false);

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Image preview"
      titleHidden
      size="full"
    >
      {hasError ? (
        <div className="flex w-80 max-w-[90vw] cursor-default flex-col items-center gap-2 rounded-xl border border-border bg-popover p-6 text-center">
          <ExclamationTriangleFill className="size-5 text-destructive" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Failed to load image</span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verify your connection or storage permissions.
          </p>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Full screen preview"
          className="max-h-[85vh] max-w-[90vw] cursor-default rounded-lg border border-border object-contain"
          onError={() => setHasError(true)}
        />
      )}
    </AppDialog>
  );
}
