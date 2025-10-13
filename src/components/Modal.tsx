import React, { useEffect } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 card w-full ${sizes} p-0 overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/10 bg-white">
          <div className="font-semibold">{title ?? 'Acción'}</div>
          <button className="btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
        <div className="p-5">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-3 border-t border-black/10 bg-neutral-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
