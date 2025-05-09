import React, { useState } from 'react';
import Logo from '../../components/Logo';
import styles from './Login.module.css';

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        console.log('Login exitoso:', data);
        
        // Almacenar datos de forma consistente
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Crear estructura authData consistente con los mismos datos
        const authData = {
          token: data.token,
          user: {
            id: data.user.id,
            role: data.user.role_id === 1 ? 'Admin' : 'User'
          }
        };
        localStorage.setItem('authData', JSON.stringify(authData));
        
        window.location.href = '/Dashboard';
      } else {
        setError(data.error || data.message || 'Error al iniciar sesión.');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo más tarde.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Iniciar sesión</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className={styles.submitBtn}
          >
            {loading ? (
              <span className={styles.loadingText}>Cargando...</span>
            ) : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;