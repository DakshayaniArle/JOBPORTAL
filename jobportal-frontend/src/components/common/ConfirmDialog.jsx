import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant,
  variant = 'danger',
  loading = false,
  isLoading = false,
}) => {
  const isBusy = loading || isLoading;
  const buttonVariant = confirmVariant || variant;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={!isBusy}>
      <div className="flex flex-col items-center text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>

        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isBusy}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariant === 'danger' ? 'danger' : buttonVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={isBusy}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
