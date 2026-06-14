import { useState, useEffect } from 'react'

function GestionVentas() {
  const [ventas, setVentas] = useState([])
  const [ventaEditando, setVentaEditando] = useState(null)

  const cargarVentas = () => {
    fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas')
      .then(res => res.json())
      .then(data => {
        const ordenadas = data.sort((a, b) => b.id - a.id)
        setVentas(ordenadas)
      })
      .catch(err => console.error("Error al traer ventas:", err))
  }

  useEffect(() => { cargarVentas() }, [])

  const handleAnular = async (id) => {
    if (!confirm('¿Seguro que querés ANULAR esta venta? El stock se devolverá automáticamente.')) return
    
    try {
      const res = await fetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas/${id}/anular`, { 
        method: 'PUT' 
      })
      if (res.ok) {
        alert('Venta Anulada correctamente.');
        cargarVentas();
      } else {
        alert('No se pudo anular la venta.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleGuardarEdicion = async () => {
    try {
      const res = await fetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas/${ventaEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaEditando)
      })
      if (res.ok) {
        alert('Venta modified y stock recalculado.');
        setVentaEditando(null);
        cargarVentas();
      } else {
        alert('Error al guardar. Verifique si hay stock suficiente del producto.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (ventaEditando) {
    return (
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>✏️ Modificar Cantidades - Venta #{ventaEditando.id}</h3>
        
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
                
                {/* MODIFICADO: Estructura interna reforzada para evitar herencias invisibles de color */}
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

export default GestionVentas