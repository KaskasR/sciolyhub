import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './SetupUsername.css'

function SetupUsername() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(null)
  
  const { user, createProfile, checkUsernameAvailability } = useAuth()
  const navigate = useNavigate()

  // If no user, redirect to login
  if (!user) {
    navigate('/login')
    return null
  }

  const handleUsernameChange = async (value) => {
    setUsername(value)
    setError('')
    setAvailable(null)

    if (value.trim().length < 3) {
      return
    }

    setChecking(true)
    try {
      const result = await checkUsernameAvailability(value.trim())
      setAvailable(result.available)
      if (!result.available && result.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error('Username check error:', err)
      setError('Error checking username availability')
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    if (available === false) {
      setError('Username is not available')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createProfile(username.trim())
      navigate('/')
    } catch (err) {
      console.error('Profile creation error:', err)
      setError('Failed to create profile. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-background">
        <div className="molecule molecule-1">⚛️</div>
        <div className="molecule molecule-2">🧬</div>
        <div className="molecule molecule-3">🔬</div>
        <div className="molecule molecule-4">⚗️</div>
        <div className="molecule molecule-5">🌟</div>
      </div>
      
      <div className="setup-card">
        <div className="setup-header">
          <div className="welcome-icon">👋</div>
          <h1 className="setup-title">Welcome to SciOly Hub!</h1>
          <p className="setup-description">
            Let's set up your profile. Choose a username that fellow Science Olympians will see.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="input-group">
            <label htmlFor="username" className="input-label">
              Username
            </label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Enter your username"
                className={`username-input ${available === true ? 'available' : available === false ? 'unavailable' : ''}`}
                disabled={loading}
                autoFocus
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
              <div className="input-status">
                {checking && <div className="checking">Checking...</div>}
                {available === true && <div className="available">✓ Available</div>}
                {available === false && <div className="unavailable">✗ Taken</div>}
              </div>
            </div>
            <div className="input-help">
              3-20 characters, letters, numbers, underscores, and hyphens only
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${loading ? 'loading' : ''}`}
            disabled={loading || !username.trim() || available === false || checking}
          >
            {loading ? (
              <>
                <div className="loading-spinner">⚡</div>
                Creating Profile...
              </>
            ) : (
              <>
                <span>Complete Setup</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="setup-footer">
          <p>You can change your username later in settings</p>
        </div>
      </div>
    </div>
  )
}

export default SetupUsername
