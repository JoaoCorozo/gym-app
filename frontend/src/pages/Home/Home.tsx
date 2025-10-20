import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import Carousel from '../../components/Carousel';
import SignUpModal from '../Auth/SignUpModal';

export default function Home() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  // Deja admin por defecto para probar rápido
  const [email, setEmail] = useState('admin@gym.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [openSign, setOpenSign] = useState(false);
  const from = loc.state?.from?.pathname as string | undefined;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Intento normal al mock
      const { data } = await api.post('/auth/login', { email, password });
      // 2) Login en contexto
      const u = await login(data);
      nav(from || (u.roles.includes('admin') ? '/admin' : '/planes'), { replace: true });
    } catch (err) {
      // 3) Fallback local para no quedar bloqueado si el mock falla
      console.warn('[Home] /auth/login falló, usando fallback local. Error:', err);
      const isAdmin = /^admin@/i.test(email) && password === 'admin123';
      const isUser = /^user@/i.test(email) && password === 'user123';

      if (!isAdmin && !isUser) {
        alert('Credenciales inválidas');
        setLoading(false);
        return;
      }

      const fake = {
        access_token: 'fake',
        refresh_token: 'fake',
        user: {
          id: isAdmin ? 1 : 2,
          email,
          roles: isAdmin ? ['admin'] : ['user'],
        },
      };

      const u = await login(fake);
      nav(from || (u.roles.includes('admin') ? '/admin' : '/planes'), { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-0 overflow-hidden">
        <Carousel
          slides={[
            { img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1600&auto=format&fit=crop', title: '¡Mes de la fuerza!', caption: 'Inscripción con 50% de descuento.' },
            { img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop', title: 'Clases grupales', caption: 'HIIT, Cycling, Yoga y más — ¡pruébalas!' },
            { img: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600&auto=format&fit=crop', title: 'Entrena sin límites', caption: 'Acceso ampliado en horario extendido.' },
          ]}
          intervalMs={4500}
        />
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h1 className="text-2xl font-extrabold text-neutral-900">Ingresa a BodyForge</h1>
          <p className="text-sm text-neutral-700 mb-4">Accede a tus planes y beneficios.</p>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Correo</label>
              <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Contraseña</label>
              <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn w-full" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
          </form>

          <div className="mt-3 text-sm text-neutral-700">
            ¿Aún no tienes cuenta?{' '}
            <button className="text-forge-700 underline underline-offset-2" onClick={() => setOpenSign(true)}>
              Crea una cuenta
            </button>
          </div>
        </div>

        <div className="card p-6 bg-forge-50 border-forge-200">
          <h2 className="text-xl font-semibold text-forge-800">Beneficios BodyForge</h2>
          <ul className="mt-2 text-neutral-700 list-disc pl-5 space-y-2">
            <li>Clases grupales en horarios extendidos.</li>
            <li>Evaluación y plan de entrenamiento.</li>
            <li>Convenios con empresas y descuentos.</li>
          </ul>
        </div>
      </section>

      <SignUpModal open={openSign} onClose={() => setOpenSign(false)} />
    </div>
  );
}
