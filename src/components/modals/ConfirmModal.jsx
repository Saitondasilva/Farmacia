// components/modals/ConfirmModal.jsx
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const ConfirmModal = ({ 
  isOpen, 
  onClose,      // <-- Nome que você quer usar
  onCancel,     // <-- Nome antigo para compatibilidade
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar" 
}) => {
  // Usa onClose se existir, senão usa onCancel
  const handleClose = onClose || onCancel;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};