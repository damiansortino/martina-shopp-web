import { useState, useEffect } from 'react'

function HistorialVentas() {
  const [ventas, setVentas] = useState([])

  useEffect(() => {
    fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/ventas')
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(err => console.error("Error al traer ventas:", err))
  }, [])

  return (
    <div style={{ marginTop: '10px' }}>
      <h3>Historial de Ventas</h3>
      {ventas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No hay ventas registradas todavía.</p>
      ) : (
        ventas.map(v => (
          <div key={v.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold' }}>
              <span style={{ color: '#555' }}>📅 {new Date(v.fecha).toLocaleDateString()}</span>
              <span style={{ color: '#28a745', fontSize: '16px' }}>Total: ${v.total.toFixed(2)}</span>
            </div>
            {v.detalles.map(d => (
              <div key={d.id} style={{ fontSize: '14px', color: '#666', padding: '4px 0', borderTop: '1px dashed #eee' }}>
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