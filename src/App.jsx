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

function App() {
  const [vistaActual, setVistaActual] = useState('catalogo')
  const [productoAEditar, setProductoAEditar] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Estados para el módulo de vendedores en el carrito
  const [listaVendedores, setListaVendedores] = useState([])
  const [vendedorSeleccionadoId, setVendedorSeleccionadoId] = useState('')
  
  const [sesionIniciada, setSesionIniciada] = useState(() => {
    return localStorage.getItem('martina_sesion_activa') === 'true'
  })

  // Carga los vendedores activos al inicializar o cambiar al carrito
  useEffect(() => {
    if (sesionIniciada) {
      fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/vendedores')
        .then(res => res.json())
        .then(data => {
          setListaVendedores(data.filter(v => v.activo))
        })
        .catch(err => console.error("Error al traer vendedores:", err))
    }
  }, [sesionIniciada, vistaActual])

  const iniciarSesion = (token) => {
    localStorage.setItem('martina_sesion_activa', 'true')
    localStorage.setItem('martina_user_token', token) 
    setSesionIniciada(true)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('martina_sesion_activa')
    localStorage.removeItem('martina_user_token')
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

    const detallesMapeados = carrito.map(item => ({
      id: 0,
      ventaId: 0,
      productoId: item.id,
      cantidad: item.cantidad,
      precioUnitario: parseFloat(item.precioFinalCobrado) || 0
    }))

    try {
      const res = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 0,
          fecha: new Date().toISOString(),
          total: 0,
          vendedorId: vendedorSeleccionadoId ? parseInt(vendedorSeleccionadoId) : null,
          detalles: detallesMapeados
        })
      })

      if (res.ok) {
        alert('¡Venta registrada con éxito en caja!')
        setCarrito([])
        setVendedorSeleccionadoId('')
        setVistaActual('catalogo')
      } else {
        alert('Error al procesar la venta.')
      }
    } catch (err) {
      console.error("Error al cerrar venta:", err)
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
            onCerrarSesion={cerrarSesion} 
          />

          <main style={{ maxWidth: '800px', margin: '0 auto', padding: '15px', boxSizing: 'border-box' }}>

            {vistaActual === 'reporteCompras' && <ReporteCompras />}

            {vistaActual === 'gestionVentas' && <GestionVentas />}
            
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

            {vistaActual === 'rentabilidad' && (
              <AdminCategorias />
            )}

            {vistaActual === 'historial' && (
              <HistorialVentas />
            )}

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

                    {/* Selector de Vendedores para el mostrador */}
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>👤 ¿Quién realizó esta venta?</label>
                      <select 
                        value={vendedorSeleccionadoId} 
                        onChange={e => setVendedorSeleccionadoId(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff' }}
                      >
                        <option value="">Ninguno / Venta Directa del Local</option>
                        {listaVendedores.map(v => (
                          <option key={v.id} value={v.id}>{v.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Total Neto a Cobrar:</h4>
                      <h3 style={{ color: '#28a745', margin: 0, fontSize: '22px', fontWeight: 'extrabold' }}>
                        ${carrito.reduce((acc, item) => acc + (item.cantidad * item.precioFinalCobrado), 0).toFixed(2)}
                      </h3>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button onClick={finalizarVenta} style={{ width: '100%', padding: '14px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
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

export default App