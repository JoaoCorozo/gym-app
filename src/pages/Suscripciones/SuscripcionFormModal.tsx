import { useState } from 'react';
import Modal from '../../components/Modal';
import SuscripcionForm from './SuscripcionForm';

export default function SuscripcionFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [seed, setSeed] = useState(0);
  const handleClose = () => {
    setSeed(s => s + 1);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Nueva suscripción" size="md">
      <div key={seed}>
        <SuscripcionForm />
      </div>
    </Modal>
  );
}
