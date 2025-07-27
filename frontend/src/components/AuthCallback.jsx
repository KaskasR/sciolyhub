import { useEffect } from 'react'
import { supabase } from '../supabase'

function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          window.location.href = '/?error=auth_failed'
          return
        }

        if (data.session) {
          // User is authenticated, redirect to main app
          window.location.href = '/'
        } else {
          // No session, redirect to login
          window.location.href = '/?error=no_session'
        }
      } catch (error) {
        console.error('Callback error:', error)
        window.location.href = '/?error=callback_failed'
      }
    }

    handleAuthCallback()
  }, [])

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
