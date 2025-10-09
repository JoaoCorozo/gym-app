import { useState } from 'react';
import { tokenStorage, userStorage } from '../../utils/storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔐 credenciales simuladas
    if (email === 'admin@gym.com' && password === 'admin123') {
      const user = { email, role: 'admin', token: 'admin-token' };
      tokenStorage.set(user.token);
      userStorage.set(user);
      window.location.href = '/admin';
      return;
    }
    if (email === 'usuario@gym.com' && password === 'user123') {
      const user = { email, role: 'user', token: 'user-token' };
      tokenStorage.set(user.token);
      userStorage.set(user);
      window.location.href = '/';
      return;
    }

    setError('Credenciales inválidas');
  };

  return (
    <div style={{ display:'grid', placeItems:'center', height:'100dvh', padding:24 }}>
      <form onSubmit={onSubmit} style={{ display:'grid', gap:12, width:320 }}>
        <h1>Gym App — Login</h1>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Entrar</button>
        {error && <small style={{ color:'crimson' }}>{error}</small>}
        <div style={{ fontSize:12, color:'#555' }}>
          admin@gym.com / admin123<br/>
          usuario@gym.com / user123
        </div>
      </form>
    </div>
  );
}
