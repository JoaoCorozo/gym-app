import { useState } from 'react';
import Modal from '../../components/Modal';
import PlanForm from './PlanForm';

export default function PlanFormModal({
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
    <Modal open={open} onClose={handleClose} title="Nuevo plan" size="sm">
      <div key={seed}>
        <PlanForm />
      </div>
    </Modal>
  );
}
