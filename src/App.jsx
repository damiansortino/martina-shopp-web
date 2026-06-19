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
import GestionUsuarios from './components/GestionUsuarios'
import CarritoVenta from './components/CarritoVenta' 
import { apiFetch } from './api'

function App() {
  const [vistaActual, setVistaActual] = useState('inicio')
  const [productoAEditar, setProductoAEditar] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [listaVendedores, setListaVendedores] = useState([])
  
  const [sesionIniciada, setSesionIniciada] = useState(() => {
    return localStorage.getItem('martina_sesion_activa') === 'true'
  })

  useEffect(() => {
    if (sesionIniciada) {
      apiFetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/vendedores')
        .then(data => setListaVendedores(data.filter(v => v.activo)))
        .catch(err => console.error("Error al traer vendedores:", err))
    }
  }, [sesionIniciada, vistaActual])

  const iniciarSesion = (token, username, role) => {
    localStorage.setItem('martina_sesion_activa', 'true')
    localStorage.setItem('martina_user_token', token) 
    localStorage.setItem('martina_user_username', username)
    localStorage.setItem('martina_user_role', role || '') 
    setSesionIniciada(true)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('martina_sesion_activa')
    localStorage.removeItem('martina_user_token')
    localStorage.removeItem('martina_user_username')
    localStorage.removeItem('martina_user_role')
    setCarrito([])
    setIsSidebarOpen(false)
    setVistaActual('inicio')
    setSesionIniciada(false)
  }

  const agregarAlCarrito = (producto) => {
    setCarrito(carritoActual => {
      const existe = carritoActual.find(item => item.id === producto.id)
      if (existe) {
        return carritoActual.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)
      }
      return [...carritoActual, { ...producto, cantidad: 1, precioFinalCobrado: producto.precioVenta || producto.precioCosto }]
    })
  }

  const iniciarEdicion = (producto) => {
    setProductoAEditar(producto)
    setVistaActual('cargar')
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '30px' }}>
      
      {vistaActual === 'inicio' && !sesionIniciada && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1e293b', color: '#fff', textAlign: 'center', padding: '20px' }}>
          <h1>MartinaShopp Enterprise</h1>
          <p style={{ opacity: 0.8, marginBottom: '30px' }}>Sistema integrado para control de stock, facturación compartida, arqueo de cajas y gestión comercial.</p>
          <button onClick={() => setVistaActual('login')} style={{ padding: '15px 40px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Ingresar al Sistema</button>
        </div>
      )}

      {vistaActual === 'login' && !sesionIniciada && (
        <Login 
          onLoginExitoso={(token, user, role) => { iniciarSesion(token, user, role); setVistaActual('catalogo'); }} 
          onUsuarioBloqueado={() => setVistaActual('cuenta-suspendida')}
        />
      )}

      {/* Pantalla informativa de suspensión de accesos */}
      {vistaActual === 'cuenta-suspendida' && !sesionIniciada && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '20px' }}>
          <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', maxWidth: '480px', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
            <h2 style={{ color: '#e53e3e', margin: '0 0 10px 0', fontSize: '24px' }}>Acceso Suspendido</h2>
            <p style={{ color: '#4a5568', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', textAlign: 'left' }}>
              Tu cuenta en <strong>MartinaShopp</strong> ha sido temporalmente inhabilitada debido a falta de pago, regularización de saldo o vencimiento de la suscripción del servicio.
            </p>
            
            <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '8px', border: '1px solid #edf2f7', textAlign: 'left', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>ℹ️ ¿Cómo reactivar el servicio?</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568', fontSize: '14px', lineHeight: '1.5' }}>
                <li>Verificá tus comprobantes de pago pendientes.</li>
                <li>Comunicate con el administrador central del sistema.</li>
                <li>Enviá el aviso correspondiente para la habilitación inmediata.</li>
              </ul>
            </div>

            <button 
              onClick={() => setVistaActual('login')} 
              style={{ width: '100%', padding: '12px', backgroundColor: '#4a5568', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
            >
              Volver al Login
            </button>
          </div>
        </div>
      )}

      {sesionIniciada && (
        <>
          <header style={{ display: 'flex', alignItems: 'center', background: '#007bff', color: 'white', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 90 }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', marginRight: '15px' }}>☰</button>
            <h2 style={{ margin: 0, fontSize: '20px', flexGrow: 1 }}>MartinaShopp Dashboard</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>👤 {localStorage.getItem('martina_user_username')}</span>
              </div>
              <button onClick={cerrarSesion} style={{ backgroundColor: '#dc3545', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>🚪 Salir</button>
            </div>
            {vistaActual !== 'carrito' && carrito.length > 0 && (
              <button onClick={() => setVistaActual('carrito')} style={{ backgroundColor: '#28a745', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🛒 Ver Carrito ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})</button>
            )}
          </header>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSeleccionarVista={(vista) => { setVistaActual(vista); setProductoAEditar(null); }} />

          <main style={{ maxWidth: '800px', margin: '0 auto', padding: '15px', boxSizing: 'border-box' }}>
            {vistaActual === 'ControlCaja' && <ControlCaja />}
            {vistaActual === 'mediosPago' && <GestionMediosPago />}
            {vistaActual === 'reporteVendedores' && <ReporteVendedores />}
            {vistaActual === 'reporteCompras' && <ReporteCompras />}
            {vistaActual === 'gestionVentas' && <GestionVentas />}
            {vistaActual === 'vendedores' && <GestionVendedores />}
            {vistaActual === 'usuarios' && <GestionUsuarios />}
            {vistaActual === 'rentabilidad' && <AdminCategorias />}
            {vistaActual === 'historial' && <HistorialVentas />}

            {vistaActual === 'catalogo' && (
              <ListaProductos onEditarProducto={iniciarEdicion} onAgregarAlCarrito={agregarAlCarrito} />
            )}

            {vistaActual === 'cargar' && (
              <FormularioProducto productoAEditar={productoAEditar} onProductoCreado={() => setVistaActual('catalogo')} onCancelar={() => setVistaActual('catalogo')} />
            )}

            {vistaActual === 'carrito' && (
              <CarritoVenta 
                carrito={carrito} 
                setCarrito={setCarrito} 
                listaVendedores={listaVendedores} 
                setVistaActual={setVistaActual} 
              />
            )}
          </main>
        </>
      )}
    </div>
  )
}

export default App;