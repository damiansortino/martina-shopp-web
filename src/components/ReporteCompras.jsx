import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function ReporteCompras() {
  const [productos, setProductos] = useState([])
  const [stocks, setStocks] = useState([])

  const cargarDatos = () => {
    Promise.all([
      fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/productos').then(res => res.json()),
      fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/stocks').then(res => res.json())
    ])
      .then(([dataProductos, dataStocks]) => {
        setProductos(dataProductos)
        setStocks(dataStocks)
      })
      .catch(err => console.error("Error al cargar datos de reporte:", err))
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const obtenerStockTotal = (productoId) => {
    return stocks
      .filter(s => s.productoId === productoId)
      .reduce((acumulado, actual) => acumulado + actual.cantidad, 0)
  }

  const productosCriticos = productos.filter(p => obtenerStockTotal(p.id) <= 3)
  const inversionEstimada = productosCriticos.reduce((acum, p) => acum + p.precioCosto, 0)

  const descargarPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('MARTINA SHOPP - LISTA DE COMPRAS', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 26)
    doc.text(`Productos en alerta crítica: ${productosCriticos.length}`, 14, 32)
    doc.text(`Inversión estimada base: $${inversionEstimada.toFixed(2)}`, 14, 38)

    const columnas = ['Ref', 'Producto', 'Rubro', 'Stock Act.', 'Costo Unit.']
    const filas = productosCriticos.map(p => [
      p.codigoNumerico,
      p.nombre,
      p.nombreCategoria || 'General',
      `${obtenerStockTotal(p.id)} u.`,
      `$${p.precioCosto.toFixed(2)}`
    ])

    autoTable(doc, {
      startY: 44,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 75 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      }
    })

    doc.save(`Lista_Compras_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Faltantes y Reposición de Stock</h3>
        {productosCriticos.length > 0 && (
          <button 
            onClick={descargarPDF} 
            style={{ padding: '10px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📄 Descargar PDF de Compras
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '13px', color: '#718096', fontWeight: 'bold' }}>PRODUCTOS CRÍTICOS</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#e53e3e' }}>{productosCriticos.length}</h2>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '13px', color: '#718096', fontWeight: 'bold' }}>INVERSIÓN ESTIMADA DE REPOSICIÓN</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#2d3748' }}>${inversionEstimada.toFixed(2)}</h2>
        </div>
      </div>

      {productosCriticos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777', marginTop: '30px' }}>¡Impecable! No hay productos con bajo stock actualmente.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Ref</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'center' }}>Stock Disponible</th>
              <th style={{ textAlign: 'right', paddingRight: '12px' }}>Precio Costo</th>
            </tr>
          </thead>
          <tbody>
            {productosCriticos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.codigoNumerico}</td>
                <td style={{ fontWeight: '500' }}>{p.nombre}</td>
                <td><span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#4a5568', fontWeight: '600' }}>{p.nombreCategoria || 'General'}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: '#e53e3e', fontWeight: 'bold', backgroundColor: '#fff5f5', padding: '4px 8px', borderRadius: '4px' }}>
                    {obtenerStockTotal(p.id)} u.
                  </span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: '12px', fontWeight: '600' }}>${p.precioCosto.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ReporteCompras