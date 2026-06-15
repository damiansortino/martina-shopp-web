import { useState, useEffect } from 'react'

function HistorialVentas() {
  const [ventas, setVentas] = useState([])
  const [topProductos, setTopProductos] = useState([])

  useEffect(() => {
    fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/ventas')
      .then(res => res.json())
      .then(data => {
        setVentas(data)
        
        // Calcular el Top 3 de productos más vendidos
        const conteoProductos = {}

        data.forEach(v => {
          if (v.estado === 'Anulada') return

          v.detalles.forEach(d => {
            const pId = d.productoId
            const nombreProd = d.producto?.nombre || `Prod ID: ${pId}`
            const cantidad = d.cantidad || 0

            if (conteoProductos[pId]) {
              conteoProductos[pId].cantidadTotal += cantidad
            } else {
              conteoProductos[pId] = {
                nombre: nombreProd,
                cantidadTotal: cantidad
              }
            }
          })
        })

        const ranking = Object.values(conteoProductos)
          .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
          .slice(0, 3)

        setTopProductos(ranking)
      })
      .catch(err => console.error("Error al traer ventas:", err))
  }, [])

  return (
    <div style={{ marginTop: '10px' }}>
      
      {/* SECCIÓN SUPERIOR: Top 3 Productos Más Vendidos */}
      {topProductos.length > 0 && (
        <div style={{ marginBottom: '25px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔥 Top 3 Productos Más Vendidos
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {topProductos.map((prod, index) => {
              const medallas = ['👑 1°', '🥈 2°', '🥉 3°']
              const fondos = ['#f0fff4', '#f8fafc', '#fffaf0']
              const bordes = ['#38a169', '#94a3b8', '#dd6b20']
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    flex: 1, 
                    minWidth: '150px', 
                    backgroundColor: fondos[index], 
                    border: `1px solid ${bordes[index]}`, 
                    padding: '10px', 
                    borderRadius: '6px' 
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#4a5568', marginBottom: '2px' }}>
                    {medallas[index]}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prod.nombre}>
                    {prod.nombre}
                  </div>
                  <div style={{ fontSize: '13px', color: '#4a5568', marginTop: '2px' }}>
                    Cant: <strong>{prod.cantidadTotal} u.</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <hr style={{ border: '0', height: '1px', background: '#cbd5e1', margin: '20px 0' }} />

      {/* SECCIÓN INFERIOR: Lista Histórica */}
      <h3 style={{ color: '#2d3748' }}>Historial de Ventas</h3>
      {ventas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No hay ventas registradas todavía.</p>
      ) : (
        ventas.map(v => (
          <div key={v.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', opacity: v.estado === 'Anulada' ? 0.6 : 1 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: '#333333', fontWeight: 'bold' }}>
                📅 {new Date(v.fecha).toLocaleDateString()} {v.estado === 'Anulada' && <span style={{ color: '#dc3545', marginLeft: '5px' }}>(ANULADA)</span>}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* NUEVO: Visualización del Medio de Pago */}
                <span style={{ 
                  color: '#1e293b', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  backgroundColor: '#edf2f7', 
                  padding: '4px 8px', 
                  borderRadius: '4px'
                }}>
                  💳 {v.medioPago?.nombre || 'Efectivo'}
                </span>
                <span style={{ color: '#28a745', fontSize: '16px', fontWeight: 'bold' }}>Total: ${v.total.toFixed(2)}</span>
              </div>
            </div>

            {v.detalles.map(d => (
              <div key={d.id} style={{ fontSize: '14px', color: '#4a5568', padding: '6px 0', borderTop: '1px dashed #eee' }}>
                • {d.producto?.nombre || `Prod ID: ${d.productoId}`} x {d.cantidad} u.
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

export default HistorialVentas