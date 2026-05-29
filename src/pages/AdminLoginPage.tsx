import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AdminLoginPage() {
  const { signIn, user, isAdmin, loading, roleLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !roleLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, loading, roleLoading, navigate]);

  if (user && roleLoading) {
    return <div className="centered">Validando permissões...</div>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      return;
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card glass" onSubmit={handleSubmit}>
        <h1>Login Administrativo</h1>
        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="password-input"
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="primary-btn" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
