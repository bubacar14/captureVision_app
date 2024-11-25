import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const content = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-primary w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-primary-dark flex justify-between items-center sticky top-0 bg-primary z-10">
          <h2 className="text-2xl font-bold text-primary-light">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-dark rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-primary-light" />
          </button>
        </div>
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, modalRoot);
}
