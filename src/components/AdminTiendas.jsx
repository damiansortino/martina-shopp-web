import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

function AdminTiendas() {
  const [tiendas, setTiendas] = useState([])
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)

  const BASE_URL = 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net'

  const cargarTiendas = async () => {
    try {
      const data = await apiFetch(`${BASE_URL}/tiendas`)
      setTiendas(data)
    } catch (err) {
      console.error('Error al cargar tiendas:', err)
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
      const data = await apiFetch(`${BASE_URL}/tiendas`, {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          activa: true
        })
      })

      if (data && data.message) {
        alert(`Error: ${data.message}`)
      } else {
        setNombre('')
        cargarTiendas()
        alert('Tienda creada con éxito.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al crear la tienda.')
    } finally {
      setCargando(false)
    }
  }

  const toggleEstado = async (tienda) => {
    try {
      const data = await apiFetch(`${BASE_URL}/tiendas/${tienda.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id: tienda.id,
          nombre: tienda.nombre,
          activa: !tienda.activa
        })
      })

      if (data && data.message) {
        alert(`Error: ${data.message}`)
      } else {
        cargarTiendas()
      }
    } catch (err) {
      console.error(err)
      alert('Error al modificar el estado de la tienda.')
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🏢 Administración de Tiendas (SaaS Multi-Tenant)</h3>

      <form onSubmit={manejarSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nombre de la nueva sucursal / tienda"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <button
          type="submit"
          disabled={cargando}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {cargando ? 'Guardando...' : 'Crear Tienda'}
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '10px', width: '60px' }}>ID</th>
            <th style={{ padding: '10px' }}>Nombre Comercial</th>
            <th style={{ padding: '10px', width: '120px' }}>Estado</th>
            <th style={{ padding: '10px', width: '150px', textAlign: 'right' }}>Acciones</th>
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

export default AdminTiendas;