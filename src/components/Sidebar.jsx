function Sidebar({ isOpen, onClose, onSeleccionarVista, onCerrarSesion, usuarioRol }) {
  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} style={overlayStyle} />
      <div style={sidebarStyle}>
        
        {/* Cabecera fija del menú */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <h3 style={{ margin: 0 }}>Menú</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#333333', padding: '5px' }}>✕</button>
        </div>
        
        {/* Contenedor con scroll para los botones del menú */}
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '80px', paddingRight: '4px' }}>
          <button onClick={() => { onSeleccionarVista('catalogo'); onClose(); }} style={btnMenuNomad}>
            <span style={{ marginRight: '10px' }}>📦</span>Catálogo
          </button>
          <button onClick={() => { onSeleccionarVista('cargar'); onClose(); }} style={btnMenuNomad}>
            <span style={{ marginRight: '10px' }}>➕</span>Cargar Producto
          </button>
          <button onClick={() => { onSeleccionarVista('rentabilidad'); onClose(); }} style={btnMenuNomad}>
            <span style={{ marginRight: '10px' }}>📈</span>Configurar Márgenes
          </button> 
          <button onClick={() => { onSeleccionarVista('historial'); onClose(); }} style={btnMenuNomad}>
            <span style={{ marginRight: '10px' }}>📋</span>Historial Ventas
          </button>
          <button onClick={() => { onSeleccionarVista('gestionVentas'); onClose(); }} style={btnMenuNomad} >
            <span style={{ marginRight: '10px' }}>📊</span>Gestionar Ventas
          </button>

          <button onClick={() => { onSeleccionarVista('controlCaja'); onClose(); }} style={btnMenuNomad} >
            <span style={{ marginRight: '10px' }}>🏪</span>Control de Caja
          </button>

          <button onClick={() => { onSeleccionarVista('vendedores'); onClose(); }} style={btnMenuNomad} >
            <span style={{ marginRight: '10px' }}>👤</span>Vendedores
          </button>
          <button onClick={() => { onSeleccionarVista('mediosPago'); onClose(); }} style={btnMenuNomad} >
            <span style={{ marginRight: '10px' }}>⚙️</span>Configurar Pagos
          </button>
          <button onClick={() => { onSeleccionarVista('reporteCompras'); onClose(); }} style={btnMenuNomad}>
            <span style={{ marginRight: '10px' }}>📋</span>Lista de Compras
          </button>
          <button onClick={() => { onSeleccionarVista('reporteVendedores'); onClose(); }} style={btnMenuNomad}>
            <span style={{ marginRight: '10px' }}>📊</span>Ranking Vendedores
          </button>

          {/* AGREGADO: Opciones exclusivas para el rol Master */}
          {usuarioRol === 'master' && (
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #edf2f7' }}>
              <p style={{ margin: '0 0 10px 5px', fontSize: '12px', color: '#a0aec0', fontWeight: 'bold', letterSpacing: '0.5px' }}>SAAS ADMIN</p>
              <button onClick={() => { onSeleccionarVista('abmTiendas'); onClose(); }} style={btnMenuNomad}>
                <span style={{ marginRight: '10px' }}>🏢</span>Administrar Tiendas
              </button>
              <button onClick={() => { onSeleccionarVista('abmUsuarios'); onClose(); }} style={btnMenuNomad}>
                <span style={{ marginRight: '10px' }}>👥</span>Administrar Usuarios
              </button>
            </div>
          )}
        </div>

        {/* Botón de Cerrar Sesión fijado firmemente en la base */}
        <div style={footerStyle}>
          <button onClick={onCerrarSesion} style={{ ...btnMenuNomad, margin: 0, color: '#dc3545', fontWeight: 'bold' }}>
            <span style={{ marginRight: '10px' }}>🚪</span>Cerrar Sesión
          </button>
        </div>

      </div>
    </>
  )
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998 }
const sidebarStyle = { position: 'fixed', top: 0, left: 0, width: '250px', height: '100vh', backgroundColor: '#fff', boxShadow: '2px 0 5px rgba(0,0,0,0.2)', padding: '20px', zIndex: 999, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }
const btnMenuNomad = { width: '100%', padding: '12px', textAlign: 'left', marginBottom: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', color: '#333333' }

const footerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  padding: '20px',
  backgroundColor: '#fff',
  borderTop: '1px solid #edf2f7',
  boxSizing: 'border-box'
}

export default Sidebar