import { useState, useEffect } from 'react'

function ControlCaja() {
  const [resumen, setResumen] = useState(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [cargando, setCargando] = useState(false)

  const cargarResumenCaja = () => {
    setCargando(true)
    // Pasamos la fecha seleccionada tanto para 'desde' como para 'hasta' para auditar ese día completo
    fetch(`https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/resumen?desde=${fecha}&hasta=${fecha}`)
      .then(res => res.json())
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
  }, [fecha])

  return (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🏪 Control de Caja y Arqueo Diario</h3>

      {/* Selector de Fecha */}
      <div style={{ marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568' }}>Filtrar Día:</label>
        <input 
          type="date" 
          value={fecha} 
          onChange={e => setFecha(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#333333', fontWeight: '600', fontSize: '15px' }}
        />
        <button 
          onClick={cargarResumenCaja} 
          style={{ padding: '8px 15px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Cargando datos de la caja...</p>
      ) : resumen ? (
        <div>
          {/* Tarjeta Caja General */}
          <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '14px', textTransform: 'uppercase', tracking: 'wide', opacity: 0.8, fontWeight: 'bold' }}>
              💰 Balance Neto General Total
            </span>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#38a169' }}>
              ${resumen.totalGeneral.toFixed(2)}
            </h2>
          </div>

          <h4 style={{ color: '#4a5568', marginBottom: '12px' }}>Desglose por Medios de Pago:</h4>

          {/* Listado de Medios de Pago */}
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
                    💳 {medio.nombreMedio}
                  </span>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>
                    <span>Ingresos:</span>
                    <span style={{ color: '#38a169', fontWeight: '600' }}>+${medio.totalIngresos.toFixed(2)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4a5568', marginBottom: '8px' }}>
                    <span>Anulaciones:</span>
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