import React, { useState } from 'react';
import Logo from '../../components/Logo';
import './Login.css';

function Login() {
  // Estados para manejar los datos del formulario y errores
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true); // Activa el estado de "cargando"
    setError(''); // Limpia los errores anteriores

    try {
      // Simula una llamada a la API
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Si la respuesta es exitosa, guarda el token y redirige al usuario
        console.log('Login exitoso:', data);
        localStorage.setItem('token', data.token); // Guarda el token en localStorage
        window.location.href = '/Dashboard'; // Redirige al dashboard
      } else {
        // Si hay un error, muestra el mensaje de error
        setError(data.message || 'Error al iniciar sesión.');
      }
    } catch (error) {
      // Maneja errores de red o del servidor
      setError('Error de conexión. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false); // Desactiva el estado de "cargando"
    }
  };

  return (
    <div className="login-container">
      <Logo/>
      <h2>Iniciar sesión</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;