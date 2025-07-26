import { useState } from 'react'
import { supabase } from '../supabase'
import './Auth.css'

function Auth({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const result = await supabase.auth.signUp({ email, password })

      if (result.error) {
        setMessage(result.error.message)
        setLoading(false)
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user || sessionError) {
        setMessage("Signed up! Please check your email to confirm your account.")
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username: email.split('@')[0],
        },
      ])

      if (profileError) {
        setMessage('Signup succeeded, but failed to create profile.')
        console.error(profileError)
        setLoading(false)
        return
      }

      setMessage('Welcome to SciOly Hub! 🧬')
      onAuth(user)

    } else {
      const result = await supabase.auth.signInWithPassword({ email, password })

      if (result.error) {
        setMessage(result.error.message)
        setLoading(false)
        return
      }

      setMessage('Welcome back, scientist! 🔬')
      onAuth(result.data.user)
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="molecule molecule-1">⚛️</div>
        <div className="molecule molecule-2">🧬</div>
        <div className="molecule molecule-3">🔬</div>
        <div className="molecule molecule-4">⚗️</div>
        <div className="molecule molecule-5">🌟</div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="brand-name">SciOly Hub</span>
            <span className="subtitle">Where Science Meets Victory! 🏆</span>
          </h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="auth-input"
              required
            />
            <span className="input-icon">📧</span>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <span className="input-icon">🔐</span>
          </div>

          <button 
            type="submit" 
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">⚡</span>
            ) : (
              mode === 'signup' ? 'Join the Lab! 🧪' : 'Enter the Lab! 🔬'
            )}
          </button>

          {message && (
            <div className={`auth-message ${message.includes('error') || message.includes('Invalid') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button 
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="auth-switch"
          >
            {mode === 'signup' ? 'Already have an account? Sign in!' : 'New to SciOly Hub? Join us!'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Auth
