import React, { useState } from 'react';
import Logo from '../../components/Logo';
import './Login.css';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {  // Cambio importante aquí
        console.log('Login exitoso:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/Dashboard';
      } else {
        // Usamos data.error o data.message según lo que devuelva el backend
        setError(data.error || data.message || 'Error al iniciar sesión.');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo más tarde.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
//<Logo />
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          
        </div>
        <h2>Iniciar sesión</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;