import { useState } from 'react'

function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    const usuarioLimpio = email.trim().toLowerCase();

    // --- BYPASS DE SEGURIDAD LOCAL ---
    if ((usuarioLimpio === 'damiansortino@gmail.com' || usuarioLimpio === 'master@martinashopp.com') && password === 'Damian12@') {
      setCargando(false)
      onLoginExitoso('TOKEN_DESARROLLO_LOCAL_BYPASS', 'master')
      return
    }

    try {
      const res = await fetch('https://martinashoppapi-amckexfrdfgeb3e8.canadacentral-01.azurewebsites.net/login', {
        method: 'POST',
        headers: { 
          'accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          email: usuarioLimpio, 
          password: password 
        })
      })

      if (res.ok) {
        const data = await res.json()
        const token = data.accessToken || data.token

        let rolUsuario = 'vendedor' 
        
        if (usuarioLimpio === 'damiansortino@gmail.com' || usuarioLimpio === 'master@martinashopp.com') {
          rolUsuario = 'master'
        }

        onLoginExitoso(token, rolUsuario) 
      } else {
        setError('Credenciales incorrectas. Verifique e intente nuevamente.')
      }
    } catch (err) {
      console.error("Error en el login:", err)
      setError('Error de conexión con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={contenedorStyle}>
      <div style={tarjetaStyle}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛍️</div>
        <h2 style={{ margin: '0 0 8px 0', color: '#1a202c', fontSize: '24px' }}>MartinaShopp</h2>
        <p style={{ margin: '0 0 25px 0', color: '#718096', fontSize: '14px' }}>Ingresá tus credenciales para administrar el sistema</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={manejarSubmit}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={labelStyle}>Usuario o Correo</label>
            <input type="text" placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" disabled={cargando} style={{ ...btnSubmitStyle, backgroundColor: cargando ? '#a0aec0' : '#007bff', cursor: cargando ? 'not-allowed' : 'pointer' }}>
            {cargando ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

const contenedorStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '20px', boxSizing: 'border-box' }
const tarjetaStyle = { background: '#fff', padding: '40px 30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '400px', width: '100%', boxSizing: 'border-box' }
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#4a5568' }
const inputStyle = { width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '15px', backgroundColor: '#f7fafc', color: '#2d3748' }
const btnSubmitStyle = { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }
const errorStyle = { backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '6px', border: '1px solid #fed7d7', fontSize: '14px', marginBottom: '20px', fontWeight: '500' }

export default Login