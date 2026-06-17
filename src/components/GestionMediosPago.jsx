import { useState, useEffect } from 'react'
import { apiFetch } from '../api' // Valida que la ruta relativa sea la adecuada

function GestionMediosPago() {
  const [medios, setMedios] = useState([])
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargarMedios = () => {
    // Reemplazado por apiFetch para inyectar la cabecera de autenticación
    apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago')
      .then(data => setMedios(data))
      .catch(err => console.error("Error al cargar medios de pago:", err))
  }

  useEffect(() => {
    cargarMedios()
  }, [])

  const handleCrear = async (e) => {
    e.preventDefault()
    if (!nuevoNombre.trim()) return
    setCargando(true)

    try {
      // Reemplazado por apiFetch. Se eliminó la configuración explícita de cabeceras
      const res = await apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago', {
        method: 'POST',
        body: JSON.stringify({ nombre: nuevoNombre, activo: true })
      })

      setNuevoNombre('')
      cargarMedios()
    } catch (err) {
      console.error(err)
      alert('No se pudo crear el medio de pago o la sesión expiró.')
    } finally {
      setCargando(false)
    }
  }

  const handleToggleActivo = async (medio) => {
    try {
      // Reemplazado por apiFetch
      await apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago/${medio.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...medio, activo: !medio.activo })
      })

      cargarMedios()
    } catch (err) {
      console.error(err)
      alert('No se pudo actualizar el estado.')
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>💳 Configuración de Medios de Pago</h3>

      {/* Formulario de Alta */}
      <form onSubmit={handleCrear} style={{ marginBottom: '25px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ej: Modo, Cuenta DNI, Ualá..."
          value={nuevoNombre}
          onChange={e => setNuevoNombre(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#333333', backgroundColor: '#fff' }}
          disabled={cargando}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          disabled={cargando}
        >
          {cargando ? 'Guardando...' : '➕ Agregar'}
        </button>
      </form>

      {/* Tabla de Medios Existentes */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', color: '#4a5568' }}>ID</th>
              <th style={{ color: '#4a5568' }}>Medio de Pago</th>
              <th style={{ color: '#4a5568' }}>Estado</th>
              <th style={{ textAlign: 'center', color: '#4a5568' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {medios.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#2d3748' }}>#{m.id}</td>
                <td>
                  <strong style={{ color: '#1e293b', fontSize: '15px' }}>{m.nombre}</strong>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: m.activo ? '#f0fff4' : '#fff5f5',
                    color: m.activo ? '#38a169' : '#c53030'
                  }}>
                    {m.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleActivo(m)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: m.activo ? '#e53e3e' : '#3182ce',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {m.activo ? '🚫 Desactivar' : '⚡ Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GestionMediosPago;