import { useState, useEffect } from 'react'

function GestionVendedores() {
  const [vendedores, setVendedores] = useState([])
  const [nombre, setNombre] = useState('')
  const [idEditar, setIdEditar] = useState(null)

  const API_URL = 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/vendedores'

  const cargarVendedores = async () => {
    try {
      const res = await fetch(API_URL)
      if (res.ok) setVendedores(await res.json())
    } catch (err) {
      console.error("Error al cargar vendedores:", err)
    }
  }

  useEffect(() => {
    cargarVendedores()
  }, [])

  const guardarVendedor = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return

    const esEdicion = idEditar !== null
    const url = esEdicion ? `${API_URL}/${idEditar}` : API_URL
    const metodo = esEdicion ? 'PUT' : 'POST'
    
    const cuerpo = {
      id: esEdicion ? idEditar : 0,
      nombre,
      activo: esEdicion ? vendedores.find(v => v.id === idEditar).activo : true
    }

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      })

      if (res.ok) {
        setNombre('')
        setIdEditar(null)
        cargarVendedores()
      }
    } catch (err) {
      console.error("Error al guardar vendedor:", err)
    }
  }

  const iniciarEdicion = (vendedor) => {
    setIdEditar(vendedor.id)
    setNombre(vendedor.nombre)
  }

  const cambiarEstadoVendedor = async (vendedor) => {
    try {
      await fetch(`${API_URL}/${vendedor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vendedor, activo: !vendedor.activo })
      })
      cargarVendedores()
    } catch (err) {
      console.error("Error al cambiar estado:", err)
    }
  }

  return (
    <div>
      <h3>Gestión de Vendedores</h3>
      
      <form onSubmit={guardarVendedor} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nombre del vendedor" 
          value={nombre} 
          onChange={e => setNombre(e.target.value)} 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1, fontSize: '15px' }}
          required 
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: idEditar ? '#ffc107' : '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {idEditar ? 'Actualizar' : 'Agregar'}
        </button>
        {idEditar && (
          <button type="button" onClick={() => { setIdEditar(null); setNombre(''); }} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <thead>
          <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px' }}>Nombre</th>
            <th>Estado</th>
            <th style={{ textAlign: 'right', paddingRight: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map(v => (
            <tr key={v.id} style={{ borderBottom: '1px solid #edf2f7', opacity: v.activo ? 1 : 0.6 }}>
              <td style={{ padding: '12px', fontWeight: '500' }}>{v.nombre}</td>
              <td>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: v.activo ? '#e2f0d9' : '#fff5f5', color: v.activo ? '#385723' : '#e53e3e' }}>
                  {v.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ textAlign: 'right', paddingRight: '12px' }}>
                <button onClick={() => iniciarEdicion(v)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => cambiarEstadoVendedor(v)} style={{ padding: '6px 12px', backgroundColor: v.activo ? '#dc3545' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {v.activo ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GestionVendedores