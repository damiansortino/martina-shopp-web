import { useState, useEffect } from 'react'

function FormularioProducto({ onProductoCreado, productoAEditar, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [codigo, setCodigo] = useState('')
  const [costo, setCosto] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [variante, setVariante] = useState('General')
  const [cantidad, setCantidad] = useState('')
  
  // Nuevos estados para el módulo de rentabilidad
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState('')
  const [rentabilidadManual, setRentabilidadManual] = useState('') // En porcentaje entero (ej: 45)

  const [stockId, setStockId] = useState(null)
  const esEdicion = !!productoAEditar

  useEffect(() => {
    traerCategorias()
  }, [])

  useEffect(() => {
    if (esEdicion) {
      setCodigo(productoAEditar.codigoNumerico)
      setNombre(productoAEditar.nombre)
      setDescripcion(productoAEditar.descripcion)
      setCosto(productoAEditar.precioCosto.toString())
      setImagenUrl(productoAEditar.imagenUrl || '')
      setCategoriaId(productoAEditar.categoriaId?.toString() || '')
      setRentabilidadManual(
        productoAEditar.rentabilidadEspecifica 
          ? (productoAEditar.rentabilidadEspecifica * 100).toString() 
          : ''
      )
      
      traerStockDelProducto(productoAEditar.id)
    } else {
      setStockId(null)
      setVariante('General')
      setCantidad('')
      setCategoriaId('')
      setRentabilidadManual('')
      traerSiguienteCodigo()
    }
  }, [productoAEditar, categorias])

  const traerCategorias = async () => {
    try {
      const res = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/categorias')
      if (res.ok) {
        const data = await res.json()
        setCategorias(data)
      }
    } catch (err) {
      console.error("Error al traer categorías:", err)
    }
  }

  const traerSiguienteCodigo = async () => {
    try {
      const res = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/productos/siguiente-codigo')
      if (res.ok) {
        const siguiente = await res.json()
        setCodigo(siguiente.toString())
      }
    } catch (err) {
      console.error('Error al sugerir código:', err)
    }
  }

  const traerStockDelProducto = async (productoId) => {
    try {
      const res = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/stocks')
      if (res.ok) {
        const todosLosStocks = await res.json()
        const stockAsociado = todosLosStocks.find(s => s.productoId === productoId)
        
        if (stockAsociado) {
          setStockId(stockAsociado.id)
          setVariante(stockAsociado.variante || 'General')
          setCantidad(stockAsociado.cantidad.toString())
        } else {
          setStockId(null)
          setCantidad('0')
        }
      }
    } catch (err) {
      console.error('Error al traer el stock:', err)
    }
  }

  // Lógica de simulación visual del Markup en vivo para el comerciante
  const calcularPrecioVentaSugerido = () => {
    const costoNum = parseFloat(costo) || 0
    if (costoNum <= 0) return 0

    if (rentabilidadManual) {
      return costoNum * (1 + (parseFloat(rentabilidadManual) / 100))
    }

    if (categoriaId) {
      const catSeleccionada = categorias.find(c => c.id === parseInt(categoriaId))
      if (catSeleccionada) {
        return costoNum * (1 + catSeleccionada.rentabilidadPorDefecto)
      }
    }

    return costoNum * 1.30 // Base global del 30% por defecto
  }

  const enviarFormulario = async (confirmarPisar = false) => {
    try {
      const metodo = esEdicion ? 'PUT' : 'POST'
      const urlBase = esEdicion 
        ? `https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/productos/${productoAEditar.id}` 
        : 'https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/productos'
      const url = `${urlBase}?confirmarDuplicado=${confirmarPisar}`

      const margenManualDecimal = rentabilidadManual ? parseFloat(rentabilidadManual) / 100 : null

      // 1. Guardar o actualizar Producto incorporando los nuevos campos de margen
      const resProd = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: esEdicion ? productoAEditar.id : 0,
          codigoNumerico: codigo.toString(),
          nombre,
          descripcion,
          precioCosto: parseFloat(costo) || 0,
          imagenUrl,
          categoriaId: categoriaId ? parseInt(categoriaId) : null,
          rentabilidadEspecifica: margenManualDecimal
        })
      })

      if (resProd.ok) {
        const pId = esEdicion ? productoAEditar.id : (await resProd.json()).id

        // 2. Guardar o actualizar Stock
        if (esEdicion && stockId) {
          await fetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/stocks/${stockId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: stockId,
              productoId: pId,
              variante: variante,
              cantidad: parseInt(cantidad) || 0,
              producto: null
            })
          })
        } else {
          await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/stocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: 0,
              productoId: pId,
              variante: variante,
              cantidad: parseInt(cantidad) || 0,
              producto: null
            })
          })
        }

        alert(esEdicion ? '¡Producto y stock actualizados!' : '¡Producto guardado con éxito!')
        if (onProductoCreado) onProductoCreado()
      } else if (resProd.status === 409) {
        const confirmar = window.confirm('¡Código duplicado! ¿Deseas usarlo de todas formas?')
        if (confirmar) enviarFormulario(true)
      } else {
        const errData = await resProd.statusText
        console.error("Error validación producto:", errData)
      }
    } catch (err) {
      console.error('Error al procesar el formulario:', err)
    }
  }

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee' }}>
      <h3>{esEdicion ? `Editar: ${nombre}` : 'Cargar Nuevo Producto'}</h3>
      <form onSubmit={(e) => { e.preventDefault(); enviarFormulario(false); }}>
        
        <label style={labelStyle}>Código de Producto</label>
        <input type="number" value={codigo} onChange={e => setCodigo(e.target.value)} required style={inputStyle} disabled={esEdicion} />
        
        <label style={labelStyle}>Nombre del Producto</label>
        <input type="text" placeholder="Ej: Campera de Jean" value={nombre} onChange={e => setNombre(e.target.value)} required style={inputStyle} />
        
        <label style={labelStyle}>Descripción</label>
        <textarea placeholder="Detalles del producto..." value={descripcion} onChange={e => setDescripcion(e.target.value)} required style={inputStyle} />
        
        <label style={labelStyle}>Categoría / Rubro de Rentabilidad</label>
        <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} style={inputStyle}>
          <option value="">Sin Categoría (Aplica 30% Base Global)</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre} ({(cat.rentabilidadPorDefecto * 100).toFixed(0)}% Markup)</option>
          ))}
        </select>

        <label style={labelStyle}>Precio de Costo ($)</label>
        <input type="number" step="0.01" placeholder="0.00" value={costo} onChange={e => setCosto(e.target.value)} required style={inputStyle} />
        
        <label style={labelStyle}>Rentabilidad Excepcional Manual (% - Opcional)</label>
        <input type="number" placeholder="Ej: 65 (Ignora el rubro anterior)" value={rentabilidadManual} onChange={e => setRentabilidadManual(e.target.value)} style={inputStyle} />

        {/* Visor simulador en tiempo real */}
        <div style={{ backgroundColor: '#e2f0d9', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #a9d08e' }}>
          <span style={{ fontSize: '14px', color: '#385723', fontWeight: 'bold' }}>💰 Precio sugerido de venta al público: </span>
          <span style={{ fontSize: '18px', color: '#385723', fontWeight: 'extrabold' }}>${calcularPrecioVentaSugerido().toFixed(2)}</span>
        </div>

        <label style={labelStyle}>Enlace de la Imagen (URL de Google)</label>
        <input type="text" placeholder="https://..." value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} style={inputStyle} />
        
        <div style={previewContainerStyle}>
          {imagenUrl ? (
            <img 
              src={imagenUrl} 
              alt="Previsualización" 
              style={imageStyle} 
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
          ) : null}
          <div style={{ ...errorBadgeStyle, display: imagenUrl ? 'none' : 'block' }}>
            📷 Esperando URL de imagen válida...
          </div>
        </div>

        <h4 style={{ margin: '20px 0 5px 0', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          {esEdicion ? 'Ajustar Inventario' : 'Stock Inicial'}
        </h4>
        
        <label style={labelStyle}>Variante</label>
        <input type="text" placeholder="Ej: General" value={variante} onChange={e => setVariante(e.target.value)} required style={inputStyle} />
        
        <label style={labelStyle}>Cantidad Disponible</label>
        <input type="number" placeholder="0" value={cantidad} onChange={e => setCantidad(e.target.value)} required style={inputStyle} />
        
        <button type="submit" style={{ ...btnStyle, backgroundColor: '#28a745', marginTop: '15px' }}>
          {esEdicion ? 'Guardar Cambios' : 'Guardar Producto'}
        </button>
        
        <button type="button" onClick={onCancelar} style={{ ...btnStyle, backgroundColor: '#6c757d', marginTop: '8px' }}>
          Cancelar
        </button>
      </form>
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '13px', color: '#555', fontWeight: 'bold' }
const inputStyle = { width: '100%', padding: '10px', marginBottom: '12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }
const btnStyle = { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
const previewContainerStyle = { width: '100%', height: '180px', backgroundColor: '#e9ecef', borderRadius: '8px', border: '2px dashed #ced4da', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '15px' }
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' }
const errorBadgeStyle = { color: '#6c757d', fontSize: '14px', textAlign: 'center', padding: '10px' }

export default FormularioProducto