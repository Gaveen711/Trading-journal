import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const SIZE_CLASS = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

// Base UI 1.3 close reasons that a non-dismissible dialog vetoes.
const VETO_REASONS = ['escape-key', 'outside-press', 'focus-out'];

// The Console popup: flat surface, one border, opacity-only motion, z-[80].
const POPUP_BASE =
  'fixed top-1/2 left-1/2 z-[80] grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-popover p-4 text-sm text-popover-foreground duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0';

// The Console scrim: flat, no blur, z-[70], opacity-only fade.
const OVERLAY_BASE =
  'fixed inset-0 isolate z-[70] bg-background/80 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0';

/**
 * AppDialog — the one dialog shell for /app. Structurally required title
 * (it is the accessible name), focus trap + restore, Escape, scroll lock
 * and outside inertness come from the Base UI primitive.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange     Single-arg; AppDialog absorbs Base UI's eventDetails.
 * @param {React.ReactNode} props.title                    REQUIRED always — it is the accessible name.
 * @param {boolean} [props.titleHidden=false]              Title renders sr-only (lightbox case).
 * @param {React.ReactNode} [props.description]            Wired to aria-describedby by the primitive.
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='md']   sm=24rem md=32rem lg=42rem xl=56rem, full=chrome-less lightbox.
 * @param {React.ReactNode} [props.children]
 * @param {React.ReactNode} [props.footer]                 -> DialogFooter (the shipped L2 band).
 * @param {React.ReactNode} [props.headerAction]           Right-of-title slot, before the X.
 * @param {boolean} [props.dismissible=true]               false => Escape, outside-press, focus-out all vetoed; no X.
 * @param {boolean} [props.showCloseButton=true]
 * @param {React.RefObject|boolean|Function} [props.initialFocus]   Forwarded to Dialog.Popup.
 * @param {React.RefObject|boolean|Function} [props.finalFocus]
 * @param {boolean} [props.scrollBody=true]                Body scrolls; header/footer pinned. max-h-[85dvh].
 * @param {(open: boolean) => void} [props.onOpenChangeComplete]    Pass-through (capture timing hooks).
 * @param {string} [props.className]                       Applied to the Popup.
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  titleHidden = false,
  description,
  size = 'md',
  children,
  footer,
  headerAction,
  dismissible = true,
  showCloseButton = true,
  initialFocus,
  finalFocus,
  scrollBody = true,
  onOpenChangeComplete,
  className,
}) {
  const isFull = size === 'full';
  const showClose = showCloseButton && dismissible;

  const handleOpenChange = (next, details) => {
    if (!dismissible && !next && VETO_REASONS.includes(details.reason)) {
      details.cancel();
      return;
    }
    onOpenChange?.(next);
  };

  // Full mode: the popup spans the viewport (image centered inside), so the
  // close button's absolute corner IS the viewport corner while staying inside
  // the focus trap. The popup transform is reset because a transformed
  // ancestor would re-anchor any fixed descendant.
  const popupClassName = isFull
    ? cn(
        POPUP_BASE,
        'inset-0 translate-x-0 translate-y-0 grid size-full max-w-none place-items-center rounded-none border-0 bg-transparent p-0',
        dismissible && 'cursor-zoom-out',
        className
      )
    : cn(
        POPUP_BASE,
        SIZE_CLASS[size] ?? SIZE_CLASS.md,
        scrollBody && 'max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto]',
        className
      );

  const closeButton = showClose ? (
    <DialogClose
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn('absolute', isFull ? 'top-3 right-3' : 'top-2 right-2')}
        />
      }
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </DialogClose>
  ) : null;

  // Lightbox affordance: clicking the empty area around the image closes,
  // clicks on the content itself do not.
  const handleFullBackdropClick = (event) => {
    if (isFull && dismissible && event.target === event.currentTarget) {
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      disablePointerDismissal={!dismissible}
    >
      <DialogPortal>
        <DialogPrimitive.Backdrop
          data-slot="dialog-overlay"
          className={cn(OVERLAY_BASE, isFull && 'cursor-zoom-out')}
        />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={popupClassName}
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          onClick={handleFullBackdropClick}
        >
          {isFull ? (
            <>
              <DialogTitle className="sr-only">{title}</DialogTitle>
              {children}
            </>
          ) : (
            <>
              <DialogHeader className={cn(showClose && 'pr-8')}>
                <div className="flex items-start justify-between gap-2">
                  {/* A dialog is a floating section: section-title role, not text-base. */}
                  <DialogTitle
                    className={cn('text-sm font-medium text-foreground', titleHidden && 'sr-only')}
                  >
                    {title}
                  </DialogTitle>
                  {headerAction}
                </div>
                {description != null && (
                  <DialogDescription className="text-xs">{description}</DialogDescription>
                )}
              </DialogHeader>
              <div className={cn(scrollBody && 'min-h-0 overflow-y-auto')}>{children}</div>
              {footer != null && <DialogFooter>{footer}</DialogFooter>}
            </>
          )}
          {closeButton}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
