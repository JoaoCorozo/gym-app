import { useState } from 'react';
import { tokenStorage } from '../../utils/storage';

export default function Login() {
  const [email, setEmail] = useState('demo@gym.com');
  const [password, setPassword] = useState('demo');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de login: guardamos un token fijo
    tokenStorage.set('demo-token');
    window.location.href = '/';
  };

  return (
    <div style={{ display:'grid', placeItems:'center', height:'100dvh', padding:24 }}>
      <form onSubmit={onSubmit} style={{ display:'grid', gap:12, width:320 }}>
        <h1>Gym App — Login</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
