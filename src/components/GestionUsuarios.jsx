import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Cliente')

  const cargarUsuarios = () => {
    apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Usuarios')
      .then(data => {
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          setUsuarios([]);
        }
      })
      .catch(err => {
        console.error("Error al traer usuarios:", err);
        setUsuarios([]);
      })
  }

  useEffect(() => { cargarUsuarios() }, [])

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    if (!username || !password) return alert("Completar usuario y contraseña")

    try {
      await apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Usuarios', {
        method: 'POST',
        body: JSON.stringify({ username, password, role })
      })
      alert("Usuario creado con éxito")
      setUsername('')
      setPassword('')
      cargarUsuarios()
    } catch (err) {
      alert("Error al crear usuario")
    }
  }

  const handleResetPassword = async (id) => {
    const nuevaPassword = prompt("Ingresá la nueva contraseña para este usuario:")
    if (!nuevaPassword) return

    try {
      await apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Usuarios/${id}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({ password: nuevaPassword })
      })
      alert("Contraseña actualizada correctamente.")
    } catch (err) {
      alert("No se pudo resetear la contraseña.")
    }
  }

  const handleToggleActivo = async (u) => {
    try {
      await apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Usuarios/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          id: u.id, 
          username: u.username, 
          role: u.role, 
          activo: !u.activo 
        })
      })
      cargarUsuarios()
    } catch (err) {
      alert("Error al modificar estado")
    }
  }

  const handleEliminarUsuario = async (id) => {
    if (!confirm("¿Estás seguro de que querés eliminar definitivamente este usuario de Azure?")) return

    try {
      await apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Usuarios/${id}`, {
        method: 'DELETE'
      })
      alert("Usuario eliminado correctamente.")
      cargarUsuarios()
    } catch (err) {
      alert("Error al eliminar el usuario.")
    }
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748' }}>👥 Gestión de Clientes y Usuarios</h3>
      
      <form onSubmit={handleCrearUsuario} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Usuario:</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Contraseña:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Rol:</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
            <option value="Cliente">Cliente</option>
            <option value="Admin">Administrador</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '9px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Registrar</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px' }}>Username</th>
            <th>Rol</th>
            <th>Estado</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(usuarios) && usuarios.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.username}</td>
              <td>
                <span style={{ 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  backgroundColor: u.role === 'Admin' ? '#feebc8' : '#e2e8f0', 
                  color: u.role === 'Admin' ? '#c05621' : '#4a5568', 
                  fontWeight: 'bold' 
                }}>
                  {u.role}
                </span>
              </td>
              <td>{u.activo ? '✅ Activo' : '❌ Suspendido'}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => handleResetPassword(u.id)} style={{ marginRight: '10px', color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer' }}>🔑 Clave</button>
                <button onClick={() => handleToggleActivo(u)} style={{ marginRight: '10px', color: u.activo ? '#dd6b20' : '#38a169', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {u.activo ? 'Bloquear' : 'Activar'}
                </button>
                <button onClick={() => handleEliminarUsuario(u.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GestionUsuarios;