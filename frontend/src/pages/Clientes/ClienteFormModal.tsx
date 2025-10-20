import { useState } from 'react';
import Modal from '../../components/Modal';
import ClienteForm from './ClienteForm';

export default function ClienteFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  // Para forzar reset del form al reabrir
  const [seed, setSeed] = useState(0);
  const handleClose = () => {
    setSeed(s => s + 1);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo cliente" size="md">
      {/* ClienteForm ya hace la mutación y muestra toasts */}
      <div key={seed}>
        <ClienteForm />
      </div>
    </Modal>
  );
}
