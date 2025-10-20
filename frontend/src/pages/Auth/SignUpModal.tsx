import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import { useAuth } from '../../auth/AuthContext';

export default function SignUpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [seed, setSeed] = useState(0);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!open) {
      setNombre(''); setCorreo(''); setPassword(''); setOk(false);
      setSeed((s) => s + 1);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // registrar cliente
      await api.post('/auth/register', { nombre, email: correo, password });
      // login directo
      const { data } = await api.post('/auth/login', { email: correo, password });
      await login(data);
      setOk(true);
      setTimeout(() => onClose(), 800);
    } catch (err) {
      alert('No fue posible crear la cuenta');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Crear cuenta" size="sm">
      <form key={seed} onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Nombre</label>
          <input className="input mt-1" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Correo</label>
          <input className="input mt-1" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium">Contraseña</label>
          <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn w-full">{ok ? '¡Cuenta creada!' : 'Crear cuenta'}</button>
      </form>
    </Modal>
  );
}
