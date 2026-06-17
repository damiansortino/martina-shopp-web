import { useState, useEffect } from 'react'

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [tiendas, setTiendas] = useState([])
  
  // Estados para el formulario de alta
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tiendaId, setTiendaId] = useState('')
  const [rol, setRol] = useState('vendedor')
  const [cargando, setCargando] = useState(false)

  const BASE_URL = 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/api/auth'
  const token = localStorage.getItem('martina_user_token')

  const cargarDatos = async () => {
    try {
      // 1. Traer lista de usuarios
      const resUser = await fetch(`${BASE_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (resUser.ok) {
        const dataUser = await resUser.json()
        setUsuarios(dataUser)
      }

      // 2. Traer lista de tiendas para el selector desplegable
      const resTiendas = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/tiendas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (resTiendas.ok) {
        const dataTiendas = await resTiendas.json()
        setTiendas(dataTiendas.filter(t => t.activa))
      }
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
      // Usamos el endpoint personalizado de registro extendido
      const res = await fetch(`${BASE_URL}/register-extended`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          tiendaId: parseInt(tiendaId),
          rol: rol
        })
      })

      if (res.ok) {
        setEmail('')
        setPassword('')
        setRol('vendedor')
        cargarDatos()
        alert('Usuario creado y asignado con éxito.')
      } else {
        const errData = await res.json()
        alert(`Error: ${errData.message || 'No se pudo crear el usuario.'}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>👥 Administración de Usuarios</h3>

      {/* Formulario de Registro */}
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
          {/* Selector de Tienda */}
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

          {/* Selector de Rol */}
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

      {/* Tabla de Cuentas */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '10px' }}>Usuario</th>
            <th style={{ padding: '10px' }}>Tienda ID</th>
            <th style={{ padding: '10px' }}>Rol asignado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: '500' }}>{u.email || u.userName}</td>
              <td style={{ padding: '10px' }}>
                <span style={{ backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                  🏢 Tienda {u.tiendaId}
                </span>
              </td>
              <td style={{ padding: '10px' }}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUsuarios