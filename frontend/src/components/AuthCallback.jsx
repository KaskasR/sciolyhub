import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Processing authentication...')
        
        // First, handle the auth code exchange if it exists in the URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          setStatus('Exchanging authorization code...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth code exchange error:', error)
            navigate('/?error=auth_failed')
            return
          }
          
          if (data.session) {
            console.log('Auth callback success, user:', data.session.user.email)
            setStatus('Authentication successful! Redirecting...')
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
            // Give a moment for the session to be established
            setTimeout(() => {
              navigate('/')
            }, 500)
            return
          }
        }
        
        // Fallback: try to get existing session
        setStatus('Checking session...')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          navigate('/?error=session_check_failed')
          return
        }

        if (sessionData.session) {
          console.log('Found existing session, user:', sessionData.session.user.email)
          setStatus('Session found! Redirecting...')
          setTimeout(() => {
            navigate('/')
          }, 500)
        } else {
          console.log('No session found, redirecting to home')
          setStatus('No session found, redirecting...')
          setTimeout(() => {
            navigate('/?error=no_session')
          }, 1000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('Authentication failed')
        setTimeout(() => {
          navigate('/?error=callback_failed')
        }, 1000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>🔬</div>
        <div>{status}</div>
      </div>
    </div>
  )
}

export default AuthCallback
