import { useState, useEffect } from 'react'

function AdminTiendas() {
  const [tiendas, setTiendas] = useState([])
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)

  const API_URL = 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/tiendas'
  const token = localStorage.getItem('martina_user_token')

  const cargarTiendas = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTiendas(data)
      }
    } catch (err) {
      console.error('Error al traer tiendas:', err)
    }
  }

  useEffect(() => {
    cargarTiendas()
  }, [])

  const manejarSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setCargando(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre: nombre.trim() })
      })

      if (res.ok) {
        setNombre('')
        cargarTiendas()
        alert('Tienda dada de alta correctamente.')
      } else {
        alert('Hubo un problema al crear la tienda.')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const toggleEstado = async (tienda) => {
    try {
      const res = await fetch(`${API_URL}/${tienda.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: tienda.id,
          nombre: tienda.nombre,
          activa: !tienda.activa
        })
      })

      if (res.ok) {
        cargarTiendas()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🏢 Administración de Tiendas</h3>

      {/* Formulario de Alta */}
      <form onSubmit={manejarSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nombre de la nueva tienda / comercio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ flexGrow: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <button
          type="submit"
          disabled={cargando}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {cargando ? 'Registrando...' : '➕ Crear Tienda'}
        </button>
      </form>

      {/* Tabla de Listado */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Nombre</th>
            <th style={{ padding: '10px' }}>Estado</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {tiendas.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.id}</td>
              <td style={{ padding: '10px' }}>{t.nombre}</td>
              <td style={{ padding: '10px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: t.activa ? '#d1e7dd' : '#f8d7da',
                  color: t.activa ? '#0f5132' : '#842029'
                }}>
                  {t.activa ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td style={{ padding: '10px', textAlign: 'right' }}>
                <button
                  onClick={() => toggleEstado(t)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backgroundColor: t.activa ? '#dc3545' : '#198754',
                    color: 'white'
                  }}
                >
                  {t.activa ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminTiendas