import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const [form, setForm] = useState({ email: '', fullName: '', username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          full_name: form.fullName,
        }
      }
    })
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
    }}>

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '8px 10px',
        cursor: 'pointer',
        color: 'var(--text)',
        display: 'flex', alignItems: 'center',
      }}>
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,148,51,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(204,35,102,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>

        <div className="card fade-up" style={{ padding: '40px 36px', marginBottom: 12 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span className="logo" style={{ fontSize: 42, color: 'var(--text)' }}>Finstagram</span>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500, marginBottom: 28 }}>
            Sign up to see photos from your friends.
          </p>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input name="email" type="email" placeholder="Email address"
              value={form.email} onChange={handleChange} className="input-base" required />

            <input name="fullName" type="text" placeholder="Full name"
              value={form.fullName} onChange={handleChange} className="input-base" required />

            <input name="username" type="text" placeholder="Username"
              value={form.username} onChange={handleChange} className="input-base" required />

            <div style={{ position: 'relative' }}>
              <input
                name="password" type={showPassword ? 'text' : 'password'}
                placeholder="Password" value={form.password}
                onChange={handleChange} className="input-base"
                style={{ paddingRight: 42 }} required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex',
              }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px',
                color: '#ef4444', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', fontSize: 12,
            color: 'var(--text-secondary)', marginTop: 20, lineHeight: 1.6,
          }}>
            By signing up, you agree to our{' '}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>Terms</span>,{' '}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>Privacy Policy</span> and{' '}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>Cookies Policy</span>.
          </p>
        </div>

        <div className="card" style={{ padding: '18px', textAlign: 'center', fontSize: 14, color: 'var(--text)' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 24 }}>
          © 2026 Finstagram
        </p>
      </div>
    </div>
  )
}