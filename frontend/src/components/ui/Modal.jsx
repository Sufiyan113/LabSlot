import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const Modal = ({ open, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full card shadow-elevated animate-scale-in flex flex-col',
          'max-h-[92dvh] sm:max-h-[90vh]',
          'rounded-t-2xl sm:rounded-2xl',
          'max-w-full',
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border shrink-0">
            <h2 className="text-base sm:text-lg font-semibold text-ink pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="btn-ghost p-2 rounded-lg min-h-0 shrink-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
