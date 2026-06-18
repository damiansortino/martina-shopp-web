import { useState, useEffect } from 'react'
import { apiFetch } from '../api' // Valida que la ruta relativa sea correcta según tu estructura

function GestionVentas() {
  const [ventas, setVentas] = useState([])
  const [ventaEditando, setVentaEditando] = useState(null)
  const [mediosPago, setMediosPago] = useState([])

  const cargarVentas = () => {
    apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas')
      .then(data => {
        const ordenadas = data.sort((a, b) => b.id - a.id)
        setVentas(ordenadas)
      })
      .catch(err => console.error("Error al traer ventas:", err))
  }

  const cargarMediosPago = () => {
    apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago')
      .then(data => setMediosPago(data))
      .catch(err => console.error("Error al traer medios de pago:", err))
  }

  useEffect(() => { 
    cargarVentas() 
    cargarMediosPago()
  }, [])

  const handleAnular = async (id) => {
    if (!confirm('¿Seguro que querés ANULAR esta venta? El stock se devolverá automáticamente.')) return
    
    try {
      await apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas/${id}/anular`, { 
        method: 'PUT' 
      })
      alert('Venta Anulada correctamente.');
      cargarVentas();
    } catch (err) {
      console.error(err);
      alert('No se pudo anular la venta o la sesión expiró.');
    }
  }

  const handleGuardarEdicion = async () => {
    try {
      await apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas/${ventaEditando.id}`, {
        method: 'PUT',
        body: JSON.stringify(ventaEditando)
      })
      alert('Venta modificada y stock recalculado.');
      setVentaEditando(null);
      cargarVentas();
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Verifique si hay stock suficiente del producto o si la sesión caducó.');
    }
  }

  if (ventaEditando) {
    return (
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>✏️ Modificar Cantidades - Venta #{ventaEditando.id}</h3>
        
        {/* Mostrar advertencia explicativa sobre la edición de pagos combinados en el historial */}
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#4a5568', fontWeight: 'bold', marginBottom: '6px' }}>Medios de Pago Registrados:</label>
          <div style={{ fontSize: '14px', color: '#333' }}>
            {ventaEditando.pagos && ventaEditando.pagos.length > 0 ? (
              ventaEditando.pagos.map((p, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  • <strong>{p.medioPago?.nombre || 'Desconocido'}:</strong> ${p.monto.toFixed(2)}
                </div>
              ))
            ) : (
              <span style={{ fontStyle: 'italic', color: '#777' }}>No se encontraron registros de pago.</span>
            )}
          </div>
        </div>

        {ventaEditando.detalles.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '12px', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dotted #eee' }}>
            <span style={{ flex: 2, fontWeight: '500', color: '#2d3748' }}>
              {item.producto?.nombre || `Producto ID: ${item.productoId}`}
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <label style={{ fontSize: '13px', color: '#4a5568', fontWeight: 'bold' }}>Cant:</label>
              <input 
                type="number" 
                min="1"
                value={item.cantidad} 
                onChange={e => {
                  const nuevaCant = parseInt(e.target.value) || 1;
                  const nuevosDets = [...ventaEditando.detalles];
                  nuevosDets[idx].cantidad = nuevaCant;
                  setVentaEditando({ ...ventaEditando, detalles: nuevosDets });
                }}
                style={{ width: '65px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333333', fontWeight: 'bold' }}
              />
            </div>

            <span style={{ flex: 1, textAlign: 'right', color: '#28a745', fontWeight: 'bold' }}>
              ${(item.precioUnitario * item.cantidad).toFixed(2)}
            </span>

            <button 
              onClick={() => {
                const nuevosDets = ventaEditando.detalles.filter((_, i) => i !== idx);
                setVentaEditando({ ...ventaEditando, detalles: nuevosDets });
              }}
              style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}
              title="Quitar producto"
            >✕</button>
          </div>
        ))}

        <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
          <button onClick={handleGuardarEdicion} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Guardar Cambios
          </button>
          <button onClick={() => setVentaEditando(null)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>Historial y Gestión de Ventas ({ventas.length})</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', color: '#4a5568' }}>ID</th>
              <th style={{ color: '#4a5568' }}>Fecha</th>
              <th style={{ color: '#4a5568' }}>Vendedor</th>
              <th style={{ color: '#4a5568' }}>Medios de Pago / Distribución</th>
              <th style={{ color: '#4a5568' }}>Total</th>
              <th style={{ color: '#4a5568' }}>Estado</th>
              <th style={{ textAlign: 'center', color: '#4a5568' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#2d3748' }}>#{v.id}</td>
                <td style={{ color: '#2d3748' }}>{new Date(v.fecha).toLocaleDateString()}</td>
                
                <td style={{ padding: '12px' }}>
                  {v.vendedor?.nombre ? (
                    <strong style={{ color: '#1e293b', fontSize: '14px', display: 'block' }}>
                      {v.vendedor.nombre}
                    </strong>
                  ) : (
                    <span style={{ color: '#4a5568', fontSize: '13px', fontStyle: 'italic', backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontWeight: '500' }}>
                      Directa
                    </span>
                  )}
                </td>

                {/* Renderizar dinámicamente la lista de pagos de la venta */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {v.pagos && v.pagos.length > 0 ? (
                      v.pagos.map((p, idx) => (
                        <span key={idx} style={{ 
                          color: '#1e293b', 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          backgroundColor: '#e2e8f0', 
                          padding: '3px 6px', 
                          borderRadius: '4px',
                          display: 'inline-block',
                          width: 'fit-content'
                        }}>
                          💳 {p.medioPago?.nombre || 'Medio Desconocido'}: ${p.monto.toFixed(2)}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#777', fontSize: '12px', fontStyle: 'italic' }}>Efectivo</span>
                    )}
                  </div>
                </td>
                
                <td style={{ fontWeight: '600', color: '#2d3748' }}>${v.total?.toFixed(2)}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: v.estado === 'Anulada' ? '#fff5f5' : '#f0fff4',
                    color: v.estado === 'Anulada' ? '#c53030' : '#38a169'
                  }}>
                    {v.estado || 'Completada'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {v.estado !== 'Anulada' ? (
                    <>
                      <button onClick={() => setVentaEditando(JSON.parse(JSON.stringify(v)))} style={{ marginRight: '15px', color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>✏️ Editar</button>
                      <button onClick={() => handleAnular(v.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>🚫 Anular</button>
                    </>
                  ) : (
                    <span style={{ color: '#a0aec0', fontSize: '13px', fontStyle: 'italic' }}>Sin acciones</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GestionVentas;