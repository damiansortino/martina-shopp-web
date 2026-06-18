import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

function ControlCaja() {
  const [resumen, setResumen] = useState(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [cargando, setCargando] = useState(false)
  const [listaMediosPago, setListaMediosPago] = useState([])

  // Estado para el formulario de movimientos manuales
  const [tipoMovimiento, setTipoMovimiento] = useState('Ingreso')
  const [medioPagoId, setMedioPagoId] = useState('')
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  const [guardandoMov, setGuardandoMov] = useState(false)

  const cargarResumenCaja = () => {
    setCargando(true)
    apiFetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/resumen?desde=${fecha}&hasta=${fecha}`)
      .then(data => {
        setResumen(data)
        setCargando(false)
      })
      .catch(err => {
        console.error("Error al traer resumen de caja:", err)
        setCargando(false)
      })
  }

  useEffect(() => {
    cargarResumenCaja()
    
    // Cargar medios de pago para el formulario manual
    apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago')
      .then(data => {
        const activos = data.filter(m => m.activo)
        setListaMediosPago(activos)
        if (activos.length > 0) setMedioPagoId(activos[0].id.toString())
      })
      .catch(err => console.error("Error al traer medios de pago:", err))
  }, [fecha])

  const handleRegistrarMovimiento = async (e) => {
    e.preventDefault()
    if (!monto || parseFloat(monto) <= 0 || !medioPagoId) {
      alert("Por favor completa los campos correctamente.")
      return
    }

    setGuardandoMov(true)
    try {
      await apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/movimiento', {
        method: 'POST',
        body: JSON.stringify({
          id: 0,
          fecha: new Date().toISOString(),
          tipo: tipoMovimiento, // "Ingreso" o "Egreso"
          medioPagoId: parseInt(medioPagoId),
          monto: parseFloat(monto),
          concepto: concepto || `${tipoMovimiento} manual de caja`
        })
      })

      alert("Movimiento registrado con éxito")
      setMonto('')
      setConcepto('')
      cargarResumenCaja()
    } catch (err) {
      console.error("Error al registrar movimiento:", err)
      alert("Error al registrar movimiento en la base de datos.")
    } finally {
      setGuardandoMov(false)
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🏪 Control de Caja y Arqueo Diario</h3>

      {/* Selector de Fecha y botón de actualización */}
      <div style={{ marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568' }}>Filtrar Día:</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={e => setFecha(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#212529', fontWeight: '600', fontSize: '15px' }}
          />
        </div>
        <button 
          onClick={cargarResumenCaja} 
          style={{ padding: '8px 15px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Formulario para registrar Ingresos / Egresos Manuales */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#4a5568' }}>➕ Registrar Ajuste Manual (Ingreso / Egreso)</h4>
        <form onSubmit={handleRegistrarMovimiento} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Tipo:</label>
            <select value={tipoMovimiento} onChange={e => setTipoMovimiento(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#212529', fontWeight: 'bold' }}>
              <option value="Ingreso">📈 Ingreso (+)</option>
              <option value="Egreso">📉 Egreso (-)</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Medio:</label>
            <select value={medioPagoId} onChange={e => setMedioPagoId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#212529', fontWeight: 'bold' }}>
              {listaMediosPago.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Monto ($):</label>
            <input type="number" step="0.01" placeholder="0.00" value={monto} onChange={e => setMonto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#212529', fontWeight: 'bold' }} />
          </div>

          <div style={{ flex: '2 1 200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Concepto / Descripción:</label>
            <input type="text" placeholder="Ej: Cambio inicial, Retiro de efectivo..." value={concepto} onChange={e => setConcepto(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#212529' }} />
          </div>

          <button type="submit" disabled={guardandoMov} style={{ padding: '9px 15px', backgroundColor: tipoMovimiento === 'Ingreso' ? '#28a745' : '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {guardandoMov ? 'Guardando...' : 'Asignar'}
          </button>
        </form>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Cargando datos de la caja...</p>
      ) : resumen ? (
        <div>
          {/* Tarjeta Caja General */}
          <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '14px', textTransform: 'uppercase', opacity: 0.8, fontWeight: 'bold' }}>
              💰 Balance Neto General Total (Arqueo)
            </span>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: resumen.totalGeneral >= 0 ? '#48bb78' : '#f56565' }}>
              ${resumen.totalGeneral.toFixed(2)}
            </h2>
          </div>

          <h4 style={{ color: '#4a5568', marginBottom: '12px' }}>Desglose por Medios de Pago:</h4>

          {resumen.detallePorMedio.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              No se registraron movimientos de caja en esta fecha.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
              {resumen.detallePorMedio.map(medio => (
                <div 
                  key={medio.medioPagoId} 
                  style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a202c', display: 'block', borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '10px' }}>
                    Análisis: {medio.nombreMedio}
                  </span>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>
                    <span>Ingresos (+):</span>
                    <span style={{ color: '#38a169', fontWeight: '600' }}>+${medio.totalIngresos.toFixed(2)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a5568', marginBottom: '8px' }}>
                    <span>Egresos (-):</span>
                    <span style={{ color: '#e53e3e', fontWeight: '600' }}>-${medio.totalEgresos.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#2d3748' }}>Saldo Neto:</span>
                    <span style={{ color: medio.netoAcumulado >= 0 ? '#2b6cb0' : '#c53030' }}>
                      ${medio.netoAcumulado.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#777' }}>Error al procesar el arqueo.</p>
      )}
    </div>
  )
}

export default ControlCaja