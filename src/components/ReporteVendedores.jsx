import { useState, useEffect } from 'react'
import { apiFetch } from '../api' // Valida que la ruta relativa sea correcta

function ReporteVendedores() {
  const [ventas, setVentas] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [reporte, setReporte] = useState([])
  
  // Estados de filtros de fecha (por defecto los últimos 30 días)
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [fechaHasta, setFechaHasta] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    // Reemplazado por apiFetch para heredar la inyección del Bearer token
    Promise.all([
      apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Ventas'),
      apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/vendedores')
    ])
    .then(([dataVentas, dataVendedores]) => {
      setVentas(dataVentas)
      setVendedores(dataVendedores)
    })
    .catch(err => console.error("Error al cargar datos del reporte:", err))
  }, [])

  useEffect(() => {
    if (!ventas.length) return

    // 1. Filtrar ventas por fecha y que no estén anuladas
    const ventasFiltradas = ventas.filter(v => {
      if (v.estado === 'Anulada') return false
      const fVenta = v.fecha.split('T')[0]
      return fVenta >= fechaDesde && fVenta <= fechaHasta
    })

    // 2. Agrupar totales por vendedor
    const mapaReporte = {}

    // Inicializar todos los vendedores existentes (así tengan 0 ventas contadas)
    vendedores.forEach(v => {
      mapaReporte[v.id] = { nombre: v.nombre, totalFacturado: 0, cantidadVentas: 0 }
    })
    // Clave para ventas directas sin vendedor asignado
    mapaReporte[null] = { nombre: 'Venta Directa (Local)', totalFacturado: 0, cantidadVentas: 0 }

    // Sumar métricas
    ventasFiltradas.forEach(v => {
      const vId = v.vendedorId
      if (mapaReporte[vId]) {
        mapaReporte[vId].totalFacturado += v.total || 0
        mapaReporte[vId].cantidadVentas += 1
      } else {
        // Por si existe un ID de vendedor colgado que ya no figure en la lista
        mapaReporte[vId] = { nombre: v.vendedor?.nombre || 'Desconocido', totalFacturado: v.total || 0, cantidadVentas: 1 }
      }
    })

    // 3. Convertir a Array y ordenar de Mayor a Menor (Ranking)
    const rankingOrdenado = Object.values(mapaReporte)
      .sort((a, b) => b.totalFacturado - a.totalFacturado)

    setReporte(rankingOrdenado)
  }, [ventas, vendedores, fechaDesde, fechaHasta])

  // Accesos rápidos de fechas
  const aplicarFiltroRapido = (tipo) => {
    const hoy = new Date()
    const hastaStr = hoy.toISOString().split('T')[0]
    let desde = new Date()

    if (tipo === 'hoy') {
      desde = hoy
    } else if (tipo === 'semana') {
      desde.setDate(hoy.getDate() - 7)
    } else if (tipo === 'mes') {
      desde.setMonth(hoy.getMonth() - 1)
    }

    setFechaDesde(desde.toISOString().split('T')[0])
    setFechaHasta(hastaStr)
  }

  return (
    <div>
      <h3 style={{ marginBottom: '5px' }}>📊 Ranking y Reporte de Ventas</h3>
      <p style={{ color: '#666', fontSize: '14px', marginTop: 0 }}>Considera únicamente transacciones completadas.</p>

      {/* Panel de Filtros */}
      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button onClick={() => aplicarFiltroRapido('hoy')} style={btnFiltroRapidoStyle}>Hoy</button>
          <button onClick={() => aplicarFiltroRapido('semana')} style={btnFiltroRapidoStyle}>Últimos 7 Días</button>
          <button onClick={() => aplicarFiltroRapido('mes')} style={btnFiltroRapidoStyle}>Últimos 30 Días</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>Desde:</label>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={inputDateStyle} />
          </div>
          <div>
            <label style={labelStyle}>Hasta:</label>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={inputDateStyle} />
          </div>
        </div>
      </div>

      {/* Tabla del Ranking */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', width: '60px', textAlign: 'center' }}>Pos</th>
              <th>Vendedor</th>
              <th style={{ textAlign: 'center' }}>Cant. Ventas</th>
              <th style={{ textAlign: 'right', paddingRight: '12px' }}>Total Facturado</th>
            </tr>
          </thead>
          <tbody>
            {reporte.map((item, idx) => {
              if (item.cantidadVentas === 0 && item.totalFacturado === 0) return null // No listar vacíos
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', backgroundColor: idx === 0 ? '#f0fff4' : 'transparent' }}>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: idx === 0 ? '#38a169' : '#4a5568' }}>
                    {idx === 0 ? '👑 1°' : `${idx + 1}°`}
                  </td>
                  <td style={{ fontWeight: '500', color: '#2d3748' }}>{item.nombre}</td>
                  <td style={{ textAlign: 'center', color: '#4a5568' }}>{item.cantidadVentas}</td>
                  <td style={{ textAlign: 'right', paddingRight: '12px', fontWeight: 'bold', color: idx === 0 ? '#276749' : '#2d3748' }}>
                    ${item.totalFacturado.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', color: '#4a5568', fontWeight: 'bold', marginBottom: '2px' }
const inputDateStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }
const btnFiltroRapidoStyle = { padding: '6px 12px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#334155' }

export default ReporteVendedores;