// src/components/ConfirmationModal.tsx
import Modal from "./Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'danger';
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isConfirming = false,
  children,
  variant = 'primary'
}: ConfirmationModalProps) => {

  const confirmButtonClass = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      confirmText={isConfirming ? "Procesando..." : confirmText}
      isConfirming={isConfirming}
      showCancelButton={true}
      cancelText={cancelText}
      confirmButtonClass={confirmButtonClass[variant]}
    >
      {children}
    </Modal>
  );
};

export default ConfirmationModal;