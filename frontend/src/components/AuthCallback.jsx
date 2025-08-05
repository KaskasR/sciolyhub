import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle hash-based authentication (which is what Supabase uses by default)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        if (accessToken) {
          // If there's an access token in the URL, let Supabase handle the session
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Auth callback error:', error)
            navigate('/?error=auth_failed')
            return
          }

          if (data.session) {
            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname)
            // User is authenticated, redirect to main app
            navigate('/')
            return
          }
        }

        // Fallback: try to get session normally
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/?error=auth_failed')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to main app
          navigate('/')
        } else {
          // No session, redirect to login
          navigate('/?error=no_session')
        }
      } catch (error) {
        console.error('Callback error:', error)
        navigate('/?error=callback_failed')
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
        <div>Completing sign-in...</div>
      </div>
    </div>
  )
}

export default AuthCallback
