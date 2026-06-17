import { useState, useEffect } from 'react'
import { apiFetch } from '../api' // Asegurate de validar que la ruta relativa sea la adecuada

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [tiendas, setTiendas] = useState([])
  
  // Estados para el formulario de alta
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tiendaId, setTiendaId] = useState('')
  const [rol, setRol] = useState('vendedor')
  const [cargando, setCargando] = useState(false)

  // Estados para controlar qué fila se está editando en la tabla
  const [editandoEmail, setEditandoEmail] = useState(null)
  const [editandoRol, setEditandoRol] = useState('')
  const [editandoTiendaId, setEditandoTiendaId] = useState('')

  const BASE_URL = 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net'

  const cargarDatos = async () => {
    try {
      // Reemplazado por apiFetch. El interceptor inyecta automáticamente el token.
      const dataUser = await apiFetch(`${BASE_URL}/usuarios`)
      setUsuarios(dataUser)

      const dataTiendas = await apiFetch(`${BASE_URL}/tiendas`)
      setTiendas(dataTiendas.filter(t => t.activa))
    } catch (err) {
      console.error('Error al cargar datos:', err)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const manejarSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || !tiendaId) return
    setCargando(true)

    try {
      // Reemplazado por apiFetch. Removidas cabeceras explícitas innecesarias.
      const data = await apiFetch(`${BASE_URL}/api/auth/register-extended`, {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          tiendaId: parseInt(tiendaId),
          rol: rol
        })
      })

      // El interceptor ya devuelve el JSON resuelto o corta si es 401. 
      // Validamos si la API devolvió un mensaje de error de negocio.
      if (data && data.message) {
        alert(`Error: ${data.message}`)
      } else {
        setEmail('')
        setPassword('')
        setRol('vendedor')
        cargarDatos()
        alert('Usuario creado y asignado con éxito.')
      }
    } catch (err) {
      console.error(err)
      alert('No se pudo procesar la solicitud o el correo ya existe.')
    } finally {
      setCargando(false)
    }
  }

  const iniciarEdicionFila = (u) => {
    setEditandoEmail(u.email || u.userName)
    setEditandoRol(u.rol || 'vendedor')
    setEditandoTiendaId(u.tiendaId)
  }

  const guardarCambiosFila = async (emailUsuario) => {
    try {
      // Reemplazado por apiFetch.
      const data = await apiFetch(`${BASE_URL}/api/auth/usuarios/editar-rol`, {
        method: 'PUT',
        body: JSON.stringify({
          email: emailUsuario,
          nuevoRol: editandoRol,
          tiendaId: parseInt(editandoTiendaId)
        })
      })

      if (data && data.message && data.message.toLowerCase().includes('error')) {
        alert(`Error: ${data.message}`)
      } else {
        setEditandoEmail(null)
        cargarDatos()
        alert('Usuario actualizado con éxito.')
      }
    } catch (err) {
      console.error(err)
      alert('Error al intentar actualizar la configuración del usuario.')
    }
  }

  const manejarEliminar = async (emailUsuario) => {
    if (!window.confirm(`¿Estás completamente seguro de que querés eliminar permanentemente el usuario ${emailUsuario}?`)) return

    try {
      // Reemplazado por apiFetch.
      const data = await apiFetch(`${BASE_URL}/api/auth/usuarios/eliminar/${emailUsuario}`, {
        method: 'DELETE'
      })

      if (data && data.message && data.message.toLowerCase().includes('error')) {
        alert(`Error: ${data.message}`)
      } else {
        cargarDatos()
        alert('Usuario eliminado correctamente de la base de datos.')
      }
    } catch (err) {
      console.error(err)
      alert('No se pudo eliminar el registro seleccionado.')
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>👥 Administración de Usuarios</h3>

      <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: 0, color: '#4a5568' }}>➕ Registrar Nuevo Usuario Multi-Tenant</h4>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="Correo electrónico / Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={tiendaId}
            onChange={(e) => setTiendaId(e.target.value)}
            required
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
          >
            <option value="">-- Seleccionar Tienda Asignada --</option>
            {tiendas.map(t => (
              <option key={t.id} value={t.id}>{t.nombre} (ID: {t.id})</option>
            ))}
          </select>

          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
          >
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador de Tienda</option>
            <option value="master">Master / SaaS Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
        >
          {cargando ? 'Creando cuenta...' : 'Confirmar y Guardar Usuario'}
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '10px' }}>Usuario</th>
            <th style={{ padding: '10px' }}>Tienda ID</th>
            <th style={{ padding: '10px' }}>Rol asignado</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, index) => {
            const mailActual = u.email || u.userName
            const esFilaEditable = editandoEmail === mailActual
            const esMaestroInmune = mailActual.toLowerCase() === 'damiansortino@gmail.com' || mailActual.toLowerCase() === 'master@martinashopp.com'

            return (
              <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', fontWeight: '500' }}>{mailActual}</td>
                
                {/* Celda de Tienda */}
                <td style={{ padding: '10px' }}>
                  {esFilaEditable ? (
                    <select 
                      value={editandoTiendaId} 
                      onChange={(e) => setEditandoTiendaId(e.target.value)}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      {tiendas.map(t => (
                        <option key={t.id} value={t.id}>Tienda {t.id} - {t.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                      🏢 Tienda {u.tiendaId}
                    </span>
                  )}
                </td>

                {/* Celda de Rol */}
                <td style={{ padding: '10px' }}>
                  {esFilaEditable ? (
                    <select 
                      value={editandoRol} 
                      onChange={(e) => setEditandoRol(e.target.value)}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="vendedor">Vendedor</option>
                      <option value="admin">Admin</option>
                      <option value="master">Master</option>
                    </select>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: u.rol === 'master' ? '#e0f2fe' : u.rol === 'admin' ? '#fef3c7' : '#f3f4f6',
                      color: u.rol === 'master' ? '#0369a1' : u.rol === 'admin' ? '#b45309' : '#374151'
                    }}>
                      {u.rol?.toUpperCase()}
                    </span>
                  )}
                </td>

                {/* Botones de Operación */}
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {esMaestroInmune ? (
                    <span style={{ fontSize: '12px', color: '#a0aec0', fontStyle: 'italic' }}>Inmune</span>
                  ) : esFilaEditable ? (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => guardarCambiosFila(mailActual)} style={{ border: 'none', background: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>💾</button>
                      <button onClick={() => setEditandoEmail(null)} style={{ border: 'none', background: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => iniciarEdicionFila(u)} style={{ border: 'none', background: '#007bff', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => manejarEliminar(mailActual)} style={{ border: 'none', background: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUsuarios;