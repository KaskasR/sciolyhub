import { useState } from 'react'
import { supabase } from '../supabase'
import './Auth.css'

function Auth({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      return { available: false, message: 'Username must be at least 3 characters long' }
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { available: false, message: 'Username can only contain letters, numbers, and underscores' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { available: false, message: 'Error checking username availability' }
    }

    if (data) {
      return { available: false, message: 'Username is already taken' }
    }

    return { available: true, message: 'Username is available!' }
  }

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      // Validate username before proceeding
      if (!username.trim()) {
        setMessage('Please enter a username')
        setLoading(false)
        return
      }

      const usernameCheck = await checkUsernameAvailability(username.trim())
      if (!usernameCheck.available) {
        setMessage(usernameCheck.message)
        setLoading(false)
        return
      }

      const result = await supabase.auth.signUp({ email, password })

      if (result.error) {
        setMessage(result.error.message)
        setLoading(false)
        return
      }

      // Check if user was created successfully
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user || sessionError) {
        setMessage("Account created! Please check your email to confirm your account before signing in.")
        setLoading(false)
        return
      }

      // Insert profile with username
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username: username.trim(),
        },
      ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setMessage('Account created but failed to save username. Please contact support.')
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
          {mode === 'signup' && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="auth-input"
                required
                minLength={3}
                maxLength={20}
              />
              <span className="input-icon">👤</span>
            </div>
          )}

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
              minLength={6}
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
            <div className={`auth-message ${message.includes('error') || message.includes('Invalid') || message.includes('taken') || message.includes('failed') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button 
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setMessage('')
              setUsername('')
            }}
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
