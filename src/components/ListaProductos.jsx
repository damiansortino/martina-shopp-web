import { useState, useEffect } from 'react'

function ListaProductos({ onEditarProducto, onAgregarAlCarrito }) {
  const [productos, setProductos] = useState([])
  const [stocks, setStocks] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/productos').then(res => res.json()),
      fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/stocks').then(res => res.json())
    ])
      .then(([dataProductos, dataStocks]) => {
        setProductos(dataProductos)
        setStocks(dataStocks)
      })
      .catch(err => console.error("Error al sincronizar datos:", err))
  }, [])

  const obtenerStockTotal = (productoId) => {
    return stocks
      .filter(s => s.productoId === productoId)
      .reduce((acumulado, actual) => acumulado + actual.cantidad, 0)
  }

  const productosFiltrados = productos.filter(p => {
    const termino = busqueda.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(termino) ||
      p.descripcion.toLowerCase().includes(termino) ||
      p.codigoNumerico.toString().includes(termino) ||
      (p.nombreCategoria && p.nombreCategoria.toLowerCase().includes(termino))
    )
  })

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ position: 'sticky', top: '55px', backgroundColor: '#f8f9fa', padding: '10px 0', zIndex: 100 }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, código o detalle..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={inputBuscarStyle}
        />
      </div>

      <h3>Catálogo ({productosFiltrados.length})</h3>
      
      {productosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777', marginTop: '20px' }}>No se encontraron productos.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
          {productosFiltrados.map(p => {
            const cantidadStock = obtenerStockTotal(p.id)
            const tieneStock = cantidadStock > 0
            const stockColor = cantidadStock <= 3 ? '#dc3545' : '#6c757d'

            return (
              <div 
                key={p.id} 
                style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div onClick={() => onEditarProducto(p)} style={{ cursor: 'pointer', flexGrow: 1 }}>
                  {p.imagenUrl ? (
                    <img src={p.imagenUrl} alt={p.nombre} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '110px', backgroundColor: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '12px' }}>Sin foto</div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', padding: '0 2px' }}>
                    {/* INCORPORADO: Muestra el código numérico del producto */}
                    <span style={{ fontSize: '10px', color: '#6c757d', fontWeight: 'bold' }}>
                      Ref: {p.codigoNumerico}
                    </span>
                    <span style={{ fontSize: '10px', color: '#007bff', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {p.nombreCategoria || 'General'}
                    </span>
                  </div>

                  <h4 style={{ margin: '4px 0', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{p.nombre}</h4>
                  
                  <strong style={{ color: '#28a745', fontSize: '15px', display: 'block', textAlign: 'left' }}>
                    ${p.precioVenta ? p.precioVenta.toFixed(2) : '0.00'}
                  </strong>
                  
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: stockColor, marginTop: '6px', backgroundColor: '#f1f3f5', padding: '4px', borderRadius: '4px' }}>
                    {tieneStock ? `Stock: ${cantidadStock} u.` : '⚠️ Sin Stock'}
                  </div>
                </div>

                <button 
                  onClick={() => onAgregarAlCarrito(p)}
                  disabled={!tieneStock}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '10px',
                    backgroundColor: tieneStock ? '#007bff' : '#ced4da',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: tieneStock ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  {tieneStock ? 'Agregar 🛒' : 'Agotado'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const inputBuscarStyle = { width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: '#fff' }

export default ListaProductos