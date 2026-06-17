// src/api.js

/**
 * Fetch personalizado para automatizar la inyección del Bearer Token 
 * y asegurar el aislamiento Multi-Tenant en todas las consultas.
 */
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('martina_user_token');

  const config = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };

  const response = await fetch(url, config);

  // Si el backend responde con 401 (No autorizado), limpiamos la sesión por seguridad
  if (response.status === 401) {
    console.warn("Sesión inválida o expirada.");
    localStorage.removeItem('martina_sesion_activa');
    localStorage.removeItem('martina_user_token');
    window.location.reload(); // Fuerza la redirección al Login
  }

  return response.json();
};