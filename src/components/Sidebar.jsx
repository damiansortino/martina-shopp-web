function Sidebar({ isOpen, onClose, onSeleccionarVista, onCerrarSesion }) {
  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} style={overlayStyle} />
      <div style={sidebarStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Menú</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#333333', padding: '5px' }}>✕</button>
        </div>
        
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
        <button onClick={() => { onSeleccionarVista('reporteCompras'); onClose(); }} style={btnMenuNomad}>
          <span style={{ marginRight: '10px' }}>📋</span>Lista de Compras
        </button>
        
        {/* Este botón ejecuta directamente el flujo de limpieza del App.jsx */}
        <button onClick={onCerrarSesion} style={{ ...btnMenuNomad, marginTop: 'auto', color: '#dc3545' }}>
          <span style={{ marginRight: '10px' }}>🚪</span>Cerrar Sesión
        </button>
      </div>
    </>
  )
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998 }
const sidebarStyle = { position: 'fixed', top: 0, left: 0, width: '250px', height: '100vh', backgroundColor: '#fff', boxShadow: '2px 0 5px rgba(0,0,0,0.2)', padding: '20px', zIndex: 999, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }
const btnMenuNomad = { width: '100%', padding: '12px', textAlign: 'left', marginBottom: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', color: '#333333' }

export default Sidebar