import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      // Después de login, lee de nuevo el usuario desde el contexto
      // usando un microtick para asegurar que se actualizó
      setTimeout(() => {
        try {
          const ujson = sessionStorage.getItem('access_token'); // solo para forzar el re-render; no se usa aquí
          // Redirección simple según rol
          // (el AuthContext ya actualizó el estado y Layout mostrará el rol)
          nav('/'); // navega a home por defecto
        } catch {}
      }, 0);
    } catch (e: any) {
      setErr(e?.message || 'Credenciales inválidas');
    }
  }

  return (
    <div style={{ display:'grid', placeItems:'center', height:'100dvh', padding:24 }}>
      <form onSubmit={onSubmit} style={{ display:'grid', gap:12, width:320 }}>
        <h1>Gym App — Login</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Entrar</button>
        {err && <small style={{ color:'crimson' }}>{err}</small>}
        <div style={{ fontSize:12, color:'#555' }}>
          admin@gym.com / admin123<br/>
          usuario@gym.com / user123
        </div>
      </form>
    </div>
  );
}
