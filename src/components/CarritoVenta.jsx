import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

function CarritoVenta({ carrito, setCarrito, listaVendedores, setVistaActual }) {
  const [listaMediosPago, setListaMediosPago] = useState([])
  const [pagosVenta, setPagosVenta] = useState([{ medioPagoId: '', monto: '' }])
  const [vendedorSeleccionadoId, setVendedorSeleccionadoId] = useState('')
  const [procesando, setProcesando] = useState(false)

  const totalVenta = carrito.reduce((acc, item) => acc + (item.cantidad * item.precioFinalCobrado), 0)
  const totalAsignadoEnPagos = pagosVenta.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0)

  useEffect(() => {
    apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago')
      .then(data => {
        const activos = data.filter(m => m.activo)
        setListaMediosPago(activos)
        if (activos.length > 0) {
          setPagosVenta([{ medioPagoId: activos[0].id.toString(), monto: totalVenta.toString() }])
        }
      })
      .catch(err => console.error("Error al traer medios de pago:", err))
  }, [])

  useEffect(() => {
    if (pagosVenta.length === 1 && totalVenta > 0) {
      setPagosVenta([{ ...pagosVenta[0], monto: totalVenta.toString() }])
    }
  }, [totalVenta])

  const agregarMedioPago = () => {
    const restante = Math.max(0, totalVenta - totalAsignadoEnPagos)
    setPagosVenta([...pagosVenta, { medioPagoId: '', monto: restante > 0 ? restante.toFixed(2) : '' }])
  }

  const quitarMedioPago = (index) => {
    setPagosVenta(pagosVenta.filter((_, i) => i !== index))
  }

  const handlePagoChange = (index, campo, valor) => {
    const nuevosPagos = [...pagosVenta]
    nuevosPagos[index][campo] = valor
    setPagosVenta(nuevosPagos)
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  const finalizarVenta = async () => {
    if (Math.abs(totalAsignadoEnPagos - totalVenta) > 0.01) {
      alert(`La suma de los montos ($${totalAsignadoEnPagos.toFixed(2)}) debe coincidir con el total ($${totalVenta.toFixed(2)}).`)
      return
    }

    if (pagosVenta.some(p => !p.medioPagoId || (parseFloat(p.monto) || 0) <= 0)) {
      alert('Completa correctamente los medios de pago y montos.')
      return
    }

    setProcesando(true)

    const detallesMapeados = carrito.map(item => ({
      id: 0,
      ventaId: 0,
      productoId: item.id,
      cantidad: item.cantidad,
      precioUnitario: parseFloat(item.precioFinalCobrado) || 0
    }))

    const pagosMapeados = pagosVenta.map(p => ({
      id: 0,
      ventaId: 0,
      medioPagoId: parseInt(p.medioPagoId),
      monto: parseFloat(p.monto)
    }))

    try {
      await apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/ventas', {
        method: 'POST',
        body: JSON.stringify({
          id: 0,
          fecha: new Date().toISOString(),
          total: totalVenta,
          vendedorId: vendedorSeleccionadoId ? parseInt(vendedorSeleccionadoId) : null,
          detalles: detallesMapeados,
          pagos: pagosMapeados
        })
      })

      alert('¡Venta registrada con éxito en caja!')
      setCarrito([])
      setVistaActual('catalogo')
    } catch (err) {
      console.error(err)
      alert('Error al procesar la venta.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Resumen del Carrito</h3>
      
      {carrito.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ flex: 1, paddingRight: '10px' }}>
            <h5 style={{ margin: 0, fontSize: '15px' }}>{item.nombre}</h5>
            <small style={{ color: '#888' }}>Sugerido PVP: ${item.precioVenta?.toFixed(2)}</small>
          </div>

          <div style={{ marginRight: '15px', fontSize: '14px', minWidth: '70px' }}>
            <span>Cant: <strong>{item.cantidad}</strong></span>
          </div>

          <div style={{ width: '105px', marginRight: '15px' }}>
            <label style={{ fontSize: '11px', display: 'block', color: '#555', fontWeight: 'bold' }}>Precio Final ($):</label>
            <input 
              type="number" 
              step="0.01"
              value={item.precioFinalCobrado} 
              onChange={(e) => {
                const nuevoPrecio = parseFloat(e.target.value) || 0
                setCarrito(carrito.map(c => c.id === item.id ? { ...c, precioFinalCobrado: nuevoPrecio } : c))
              }}
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #a0aec0', boxSizing: 'border-box', fontSize: '14px', fontWeight: 'bold', color: '#212529', backgroundColor: '#f8f9fa' }}
            />
          </div>

          <div style={{ minWidth: '75px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
            ${(item.cantidad * item.precioFinalCobrado).toFixed(2)}
          </div>

          <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '18px', cursor: 'pointer', marginLeft: '15px' }}>✕</button>
        </div>
      ))}

      {/* Selector Vendedor */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>👤 ¿Quién realizó esta venta?</label>
        <select value={vendedorSeleccionadoId} onChange={e => setVendedorSeleccionadoId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#ffffff', color: '#212529', fontWeight: 'bold' }}>
          <option value="">Ninguno / Venta Directa del Local</option>
          {listaVendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
        </select>
      </div>

      {/* Desglose de Medios de Pago */}
      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>Core 💳 Desglose de Medios de Pago:</label>
        {pagosVenta.map((pago, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
            <select value={pago.medioPagoId} onChange={e => handlePagoChange(idx, 'medioPagoId', e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff', color: '#212529', fontWeight: 'bold' }}>
              <option value="">-- Elegir Medio --</option>
              {listaMediosPago.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <input type="number" step="0.01" value={pago.monto} onChange={e => handlePagoChange(idx, 'monto', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', color: '#212529', backgroundColor: '#ffffff' }} />
            {pagosVenta.length > 1 && <button type="button" onClick={() => quitarMedioPago(idx)} style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>}
          </div>
        ))}
        <button type="button" onClick={agregarMedioPago} style={{ marginTop: '5px', padding: '6px 12px', backgroundColor: '#4a5568', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>➕ Dividir Pago / Agregar Medio</button>
      </div>

      <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Total Neto a Cobrar:</h4>
        <h3 style={{ color: '#28a745', margin: 0, fontSize: '22px', fontWeight: 'extrabold' }}>${totalVenta.toFixed(2)}</h3>
      </div>

      <div style={{ marginTop: '15px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', backgroundColor: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#e2f0d9' : '#fff5f5', color: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#385723' : '#c53030', border: `1px solid ${Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#a9d08e' : '#feb2b2'}` }}>
        Total Asignado en Medios: ${totalAsignadoEnPagos.toFixed(2)} {Math.abs(totalAsignadoEnPagos - totalVenta) >= 0.01 && ` (Diferencia: $${(totalVenta - totalAsignadoEnPagos).toFixed(2)})`}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={finalizarVenta} disabled={procesando || Math.abs(totalAsignadoEnPagos - totalVenta) >= 0.01} style={{ width: '100%', padding: '14px', backgroundColor: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#28a745' : '#ced4da', color: 'white', border: 'none', borderRadius: '6px', cursor: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? 'pointer' : 'not-allowed', fontSize: '16px', fontWeight: 'bold' }}>
          {procesando ? 'Registrando...' : '✓ Confirmar y Registrar Venta'}
        </button>
        <button onClick={() => setVistaActual('catalogo')} style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Volver al Catálogo</button>
      </div>
    </div>
  )
}

export default CarritoVenta;