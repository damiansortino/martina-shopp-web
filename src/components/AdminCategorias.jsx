import { useState, useEffect } from 'react'

function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre] = useState('')
  const [rentabilidad, setRentabilidad] = useState('')
  
  // Estado para controlar si estamos editando una categoría existente
  const [categoriaAEditar, setCategoriaAEditar] = useState(null)

  useEffect(() => {
    traerCategorias()
  }, [])

  const traerCategorias = async () => {
    try {
      const res = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/categorias')
      if (res.ok) {
        const data = await res.json()
        setCategorias(data)
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err)
    }
  }

  const activarEdicion = (cat) => {
    setCategoriaAEditar(cat)
    setNombre(cat.nombre)
    setRentabilidad((cat.rentabilidadPorDefecto * 100).toFixed(0))
  }

  const cancelarEdicion = () => {
    setCategoriaAEditar(null)
    setNombre('')
    setRentabilidad('')
  }

  const guardarCategoria = async (e) => {
    e.preventDefault()
    if (!nombre || !rentabilidad) return

    const margenDecimal = parseFloat(rentabilidad) / 100
    const esEdicion = !!categoriaAEditar

    const url = esEdicion 
      ? `https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/categorias/${categoriaAEditar.id}`
      : 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/categorias'

    const metodo = esEdicion ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: esEdicion ? categoriaAEditar.id : 0,
          nombre,
          rentabilidadPorDefecto: margenDecimal
        })
      })

      if (res.ok) {
        alert(esEdicion ? '¡Categoría actualizada con éxito!' : '¡Categoría creada con éxito!')
        cancelarEdicion()
        traerCategorias()
      }
    } catch (err) {
      console.error("Error al guardar categoría:", err)
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3>Módulos de Rentabilidad por Categoría</h3>
      
      {/* Formulario de Alta / Edición */}
      <form onSubmit={guardarCategoria} style={{ marginBottom: '25px', background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
        <h4 style={{ marginTop: 0 }}>{categoriaAEditar ? `Editar Rubro: ${categoriaAEditar.nombre}` : 'Nueva Categoría / Rubro'}</h4>
        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Nombre de Categoría:</label>
          <input type="text" placeholder="Ej: Ropa, Bazar, Calzado" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Markup de Rentabilidad (%):</label>
          <input type="number" placeholder="Ej: 50" value={rentabilidad} onChange={e => setRentabilidad(e.target.value)} required style={inputStyle} />
        </div>
        
        <button type="submit" style={{ ...btnPrimaryStyle, backgroundColor: categoriaAEditar ? '#28a745' : '#007bff' }}>
          {categoriaAEditar ? 'Guardar Cambios' : 'Crear Rubro'}
        </button>

        {categoriaAEditar && (
          <button type="button" onClick={cancelarEdicion} style={{ ...btnPrimaryStyle, backgroundColor: '#6c757d', marginTop: '8px' }}>
            Cancelar Edición
          </button>
        )}
      </form>

      {/* Listado Actual */}
      <h4>Márgenes de Ganancia Configurados</h4>
      {categorias.length === 0 ? (
        <p style={{ color: '#777', textAlign: 'center' }}>No hay categorías creadas todavía.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Rubro</th>
              <th style={{ padding: '8px' }}>Markup Aplicado</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{cat.nombre}</td>
                <td style={{ padding: '8px', color: '#28a745', fontWeight: 'bold' }}>
                  {(cat.rentabilidadPorDefecto * 100).toFixed(0)}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  <button 
                    onClick={() => activarEdicion(cat)} 
                    style={{ padding: '6px 12px', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#333' }
const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }
const btnPrimaryStyle = { width: '100%', padding: '10px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }

export default AdminCategorias