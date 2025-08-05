import { useState } from 'react'
import { supabase } from '../supabase'
import './Auth.css'

function Auth({ onAuth, user }) {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUsernameInput, setShowUsernameInput] = useState(!!user) // Show username input if user exists but no profile

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

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setMessage('Redirecting to Google...')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
        setLoading(false)
        return
      }

      // The redirect will happen automatically
    } catch (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
    }
  }

  const handleUsernameSubmit = async () => {
    if (!username.trim()) {
      setMessage('Please enter a username')
      return
    }

    setLoading(true)
    const usernameCheck = await checkUsernameAvailability(username.trim())
    
    if (!usernameCheck.available) {
      setMessage(usernameCheck.message)
      setLoading(false)
      return
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setMessage('Authentication error. Please try signing in again.')
      setLoading(false)
      return
    }

    // Create profile with username
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        username: username.trim(),
        full_name: user.user_metadata?.full_name || username.trim(),
        avatar_url: user.user_metadata?.avatar_url,
        email: user.email
      },
    ])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      setMessage('Failed to save username. Please try again.')
      setLoading(false)
      return
    }

    setMessage('Welcome to SciOly Hub! 🧬')
    onAuth(user)
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

        {!showUsernameInput ? (
          <div className="auth-form">
            <button 
              onClick={handleGoogleSignIn}
              className={`google-auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">⚡</span>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {message && (
              <div className={`auth-message ${message.includes('Error') || message.includes('error') || message.includes('failed') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="auth-divider">
              <span>Secure • Fast • No Passwords</span>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleUsernameSubmit(); }} className="auth-form">
            <div className="username-setup">
              <h3>Choose Your Username</h3>
              <p>Pick a unique username for your SciOly Hub profile</p>
            </div>

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
                autoFocus
              />
              <span className="input-icon">�</span>
            </div>

            <button 
              type="submit" 
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">⚡</span>
              ) : (
                'Complete Setup 🧪'
              )}
            </button>

            {message && (
              <div className={`auth-message ${message.includes('Error') || message.includes('error') || message.includes('taken') || message.includes('failed') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default Auth
