'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal — weBazaar Design System
 *
 * Sizes: sm | md | lg | xl | full
 * Features: focus trap, backdrop blur, escape close, aria-modal,
 *           mobile bottom sheet on small screens
 */

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  description,
  showClose = true,
  closeOnBackdrop = true,
  className = '',
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Focus trap
  const trapFocus = useCallback((e) => {
    if (!panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // Open/close effects
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    }, 50);

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', trapFocus);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose, trapFocus]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          // Mobile: bottom sheet
          'relative z-10 w-full bg-white overflow-y-auto',
          'rounded-t-2xl sm:rounded-xl',
          'max-h-[90vh] sm:max-h-[85vh]',
          // Desktop: centred panel with max-width
          `sm:w-full ${sizeClasses[size] || sizeClasses.md}`,
          // Enter animation
          'animate-scale-in origin-bottom sm:origin-center',
          // Shadows
          'shadow-xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-sand" />
        </div>

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 pt-4 pb-2 sm:pt-6 sm:pb-3">
            {title && (
              <h2 className="text-h4 font-display text-ink pr-8">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full text-walnut hover:bg-linen hover:text-ink transition-colors duration-fast"
                aria-label="Close dialog"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {description && (
          <p id="modal-desc" className="px-6 text-body-sm text-walnut">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );

  // Portal to document.body
  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}

/**
 * Convenience sub-components for structured content
 */
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div
      className={`flex items-center justify-end gap-3 pt-4 mt-4 border-t border-sand/50 ${className}`}
    >
      {children}
    </div>
  );
};
Modal.Footer.displayName = 'Modal.Footer';
