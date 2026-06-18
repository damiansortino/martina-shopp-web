import { useState, useEffect } from 'react'
import ListaProductos from './components/ListaProductos'
import FormularioProducto from './components/FormularioProducto'
import HistorialVentas from './components/HistorialVentas'
import AdminCategorias from './components/AdminCategorias'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import GestionVentas from './components/GestionVentas'
import ReporteCompras from './components/ReporteCompras'
import GestionVendedores from './components/GestionVendedores'
import ReporteVendedores from './components/ReporteVendedores'
import ControlCaja from './components/ControlCaja'
import GestionMediosPago from './components/GestionMediosPago'
import { apiFetch } from './api'

function App() {
  const [vistaActual, setVistaActual] = useState('catalogo')
  const [productoAEditar, setProductoAEditar] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [listaVendedores, setListaVendedores] = useState([])
  const [vendedorSeleccionadoId, setVendedorSeleccionadoId] = useState('')

  const [listaMediosPago, setListaMediosPago] = useState([])
  const [pagosVenta, setPagosVenta] = useState([{ medioPagoId: '', monto: '' }])
  
  const [sesionIniciada, setSesionIniciada] = useState(() => {
    return localStorage.getItem('martina_sesion_activa') === 'true'
  })

  const totalVenta = carrito.reduce((acc, item) => acc + (item.cantidad * item.precioFinalCobrado), 0)

  useEffect(() => {
    if (sesionIniciada) {
      apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/vendedores')
        .then(data => {
          setListaVendedores(data.filter(v => v.activo))
        })
        .catch(err => console.error("Error al traer vendedores:", err))

      apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/Caja/medios-pago')
        .then(data => {
          const activos = data.filter(m => m.activo)
          setListaMediosPago(activos)
          if (activos.length > 0) {
            setPagosVenta([{ medioPagoId: activos[0].id.toString(), monto: totalVenta > 0 ? totalVenta.toString() : '' }])
          }
        })
        .catch(err => console.error("Error al traer medios de pago:", err))
    }
  }, [sesionIniciada, vistaActual])

  useEffect(() => {
    if (pagosVenta.length === 1 && totalVenta > 0) {
      setPagosVenta([{ ...pagosVenta[0], monto: totalVenta.toString() }])
    }
  }, [totalVenta])

  const agregarMedioPago = () => {
    const yaAsignado = pagosVenta.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
    const restante = Math.max(0, totalVenta - yaAsignado);
    setPagosVenta([
      ...pagosVenta, 
      { medioPagoId: '', monto: restante > 0 ? restante.toFixed(2) : '' }
    ]);
  }

  const quitarMedioPago = (index) => {
    setPagosVenta(pagosVenta.filter((_, i) => i !== index))
  }

  const handlePagoChange = (index, campo, valor) => {
    const nuevosPagos = [...pagosVenta]
    nuevosPagos[index][campo] = valor
    setPagosVenta(nuevosPagos)
  }

  const totalAsignadoEnPagos = pagosVenta.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0)

  const iniciarSesion = (token, username) => {
    localStorage.setItem('martina_sesion_activa', 'true')
    localStorage.setItem('martina_user_token', token) 
    localStorage.setItem('martina_user_username', username)
    setSesionIniciada(true)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('martina_sesion_activa')
    localStorage.removeItem('martina_user_token')
    localStorage.removeItem('martina_user_username')
    setCarrito([])
    setIsSidebarOpen(false)
    setVistaActual('catalogo')
    setSesionIniciada(false)
  }

  const agregarAlCarrito = (producto) => {
    setCarrito(carritoActual => {
      const existe = carritoActual.find(item => item.id === producto.id)
      
      if (existe) {
        return carritoActual.map(item => 
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      
      return [...carritoActual, { 
        ...producto, 
        fancyCantidad: 1, 
        cantidad: 1, 
        precioFinalCobrado: producto.precioVenta || producto.precioCosto 
      }]
    })
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id))
  }

  const finalizarVenta = async () => {
    if (carrito.length === 0) return

    if (Math.abs(totalAsignadoEnPagos - totalVenta) > 0.01) {
      alert(`La suma de los montos ($${totalAsignadoEnPagos.toFixed(2)}) debe coincidir exactamente con el total neto ($${totalVenta.toFixed(2)}).`)
      return
    }

    if (pagosVenta.some(p => !p.medioPagoId || (parseFloat(p.monto) || 0) <= 0)) {
      alert('Por favor, completa correctamente el medio de pago y el monto para todas las líneas.')
      return
    }

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
      setVendedorSeleccionadoId('')
      if (listaMediosPago.length > 0) {
        setPagosVenta([{ medioPagoId: listaMediosPago[0].id.toString(), monto: '' }])
      }
      setVistaActual('catalogo')
    } catch (err) {
      console.error("Error al cerrar venta:", err)
      alert('Error al procesar la venta. Verifique la consistencia de los datos.')
    }
  }

  const iniciarEdicion = (producto) => {
    setProductoAEditar(producto)
    setVistaActual('cargar')
  }

  const cancelarFormulario = () => {
    setProductoAEditar(null)
    setVistaActual('catalogo')
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '30px' }}>
      
      {!sesionIniciada ? (
        <Login onLoginExitoso={iniciarSesion} />
      ) : (
        <>
          <header style={{ display: 'flex', alignItems: 'center', background: '#007bff', color: 'white', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 90 }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', marginRight: '15px' }}>☰</button>
            <h2 style={{ margin: 0, fontSize: '20px', flexGrow: 1 }}>MartinaShopp Dashboard</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  👤 {localStorage.getItem('martina_user_username') || 'Usuario'}
                </span>
              </div>
              <button 
                onClick={cerrarSesion} 
                style={{ backgroundColor: '#dc3545', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#bd2130'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                🚪 Salir
              </button>
            </div>

            {vistaActual !== 'carrito' && carrito.length > 0 && (
              <button onClick={() => setVistaActual('carrito')} style={{ backgroundColor: '#28a745', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                🛒 Ver Carrito ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})
              </button>
            )}
          </header>

          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onSeleccionarVista={(vista) => { setVistaActual(vista); setProductoAEditar(null); }}
          />

          <main style={{ maxWidth: '800px', margin: '0 auto', padding: '15px', boxSizing: 'border-box' }}>
            
            {vistaActual === 'ControlCaja' && <ControlCaja />}
            {vistaActual === 'mediosPago' && <GestionMediosPago />}
            {vistaActual === 'reporteVendedores' && <ReporteVendedores />}
            {vistaActual === 'reporteCompras' && <ReporteCompras />}
            {vistaActual === 'gestionVentas' && <GestionVendedores />}
            {vistaActual === 'vendedores' && <GestionVendedores />}

            {vistaActual === 'catalogo' && (
              <ListaProductos onEditarProducto={iniciarEdicion} onAgregarAlCarrito={agregarAlCarrito} />
            )}

            {vistaActual === 'cargar' && (
              <FormularioProducto 
                productoAEditar={productoAEditar} 
                onProductoCreado={() => setVistaActual('catalogo')} 
                onCancelar={cancelarFormulario} 
              />
            )}

            {vistaActual === 'rentabilidad' && <AdminCategorias />}
            {vistaActual === 'historial' && <HistorialVentas />}

            {vistaActual === 'carrito' && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Resumen del Carrito</h3>
                
                {carrito.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <p style={{ color: '#777' }}>El carrito está vacío.</p>
                    <button onClick={() => setVistaActual('catalogo')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Volver al Catálogo</button>
                  </div>
                ) : (
                  <>
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
                            style={{ 
                              width: '100%', 
                              padding: '6px', 
                              borderRadius: '4px', 
                              border: '1px solid #a0aec0', 
                              boxSizing: 'border-box', 
                              fontSize: '14px', 
                              fontWeight: 'bold', 
                              color: '#212529', 
                              backgroundColor: '#f8f9fa' 
                            }}
                          />
                        </div>

                        <div style={{ minWidth: '75px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                          ${(item.cantidad * item.precioFinalCobrado).toFixed(2)}
                        </div>

                        <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '18px', cursor: 'pointer', marginLeft: '15px' }}>✕</button>
                      </div>
                    ))}

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>👤 ¿Quién realizó esta venta?</label>
                      <select 
                        value={vendedorSeleccionadoId} 
                        onChange={e => setVendedorSeleccionadoId(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#ffffff', color: '#212529', fontWeight: 'bold' }}
                      >
                        <option value="" style={{ color: '#212529', backgroundColor: '#ffffff' }}>Ninguno / Venta Directa del Local</option>
                        {listaVendedores.map(v => (
                          <option key={v.id} value={v.id} style={{ color: '#212529', backgroundColor: '#ffffff' }}>{v.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>💳 Desglose de Medios de Pago:</label>
                      
                      {pagosVenta.map((pago, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                          <select 
                            value={pago.medioPagoId} 
                            onChange={e => handlePagoChange(idx, 'medioPagoId', e.target.value)} 
                            style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff', color: '#212529', fontWeight: 'bold' }}
                          >
                            <option value="" style={{ color: '#212529', backgroundColor: '#ffffff' }}>-- Elegir Medio --</option>
                            {listaMediosPago.map(m => (
                              <option key={m.id} value={m.id} style={{ color: '#212529', backgroundColor: '#ffffff' }}>{m.nombre}</option>
                            ))}
                          </select>

                          <input 
                            type="number" 
                            step="0.01" 
                            placeholder="Monto"
                            value={pago.monto} 
                            onChange={e => handlePagoChange(idx, 'monto', e.target.value)} 
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', color: '#212529', backgroundColor: '#ffffff' }}
                          />

                          {pagosVenta.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => quitarMedioPago(idx)} 
                              style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >✕</button>
                          )}
                        </div>
                      ))}

                      <button 
                        type="button" 
                        onClick={agregarMedioPago} 
                        style={{ marginTop: '5px', padding: '6px 12px', backgroundColor: '#4a5568', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        ➕ Dividir Pago / Agregar Medio
                      </button>
                    </div>

                    <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Total Neto a Cobrar:</h4>
                      <h3 style={{ color: '#28a745', margin: 0, fontSize: '22px', fontWeight: 'extrabold' }}>
                        ${totalVenta.toFixed(2)}
                      </h3>
                    </div>

                    <div style={{ 
                      marginTop: '15px', 
                      padding: '10px 14px', 
                      borderRadius: '6px', 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      backgroundColor: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#e2f0d9' : '#fff5f5',
                      color: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#385723' : '#c53030',
                      border: `1px solid ${Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#a9d08e' : '#feb2b2'}`
                    }}>
                      Total Asignado en Medios: ${totalAsignadoEnPagos.toFixed(2)}
                      {Math.abs(totalAsignadoEnPagos - totalVenta) >= 0.01 && ` (Diferencia: $${(totalVenta - totalAsignadoEnPagos).toFixed(2)})`}
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                        onClick={finalizarVenta} 
                        disabled={Math.abs(totalAsignadoEnPagos - totalVenta) >= 0.01}
                        style={{ 
                          width: '100%', 
                          padding: '14px', 
                          backgroundColor: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? '#28a745' : '#ced4da', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: Math.abs(totalAsignadoEnPagos - totalVenta) < 0.01 ? 'pointer' : 'not-allowed', 
                          fontSize: '16px', 
                          fontWeight: 'bold' 
                        }}
                      >
                        ✓ Confirmar y Registrar Venta
                      </button>
                      <button onClick={() => setVistaActual('catalogo')} style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                        Volver al Catálogo
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}

export default App;