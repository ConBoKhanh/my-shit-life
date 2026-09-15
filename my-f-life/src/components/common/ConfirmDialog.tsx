import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  confirmVariant = 'warning',
  onConfirm,
  onCancel,
}) => {
  const getConfirmStyle = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          backgroundColor: 'var(--color-error)',
          color: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-text-primary)',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(21, 11, 40, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="game-card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Dialog */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: confirmVariant === 'danger' ? '#FFEBEB' : '#FFF3D6',
                  color: confirmVariant === 'danger' ? 'var(--color-error)' : '#D98200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {title}
                </h3>
              </div>
            </div>

            {/* Nội dung thông báo */}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              {message}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={onCancel}
                className="btn-outline"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                style={{
                  ...getConfirmStyle(),
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.15s ease',
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
