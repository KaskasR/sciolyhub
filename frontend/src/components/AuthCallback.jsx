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
        console.log('Starting auth callback handling...')
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        
        console.log('URL params:', { code: code ? 'present' : 'missing', error })
        
        if (error) {
          console.error('OAuth error in URL:', error)
          setStatus('Authentication failed')
          navigate(`/?error=${error}`)
          return
        }
        
        if (code) {
          console.log('Found auth code, exchanging for session...')
          setStatus('Exchanging authorization code...')
          
          try {
            // Try the modern approach first
            let result = await supabase.auth.exchangeCodeForSession(code)
            console.log('Exchange result:', { data: !!result.data, session: !!result.data?.session, error: result.error })
            
            // If exchangeCodeForSession doesn't work, fall back to setSession
            if (result.error || !result.data?.session) {
              console.log('Trying alternative session handling...')
              // Alternative: Let Supabase handle the callback automatically
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
              console.log('Fallback session check:', { session: !!sessionData?.session, error: sessionError })
              
              if (sessionError) {
                console.error('Session error:', sessionError)
                setStatus('Session handling failed')
                navigate('/?error=session_failed')
                return
              }
              
              if (sessionData?.session) {
                result = { data: sessionData, error: null }
              }
            }
            
            if (result.error) {
              console.error('Auth code exchange error:', result.error)
              setStatus('Failed to exchange authorization code')
              navigate('/?error=auth_failed')
              return
            }
            
            if (result.data?.session) {
              console.log('Auth callback success, user:', result.data.session.user.email)
              setStatus('Authentication successful! Redirecting...')
              // Clear the URL parameters
              window.history.replaceState({}, document.title, window.location.pathname)
              // Give a moment for the session to be established
              setTimeout(() => {
                navigate('/')
              }, 1000)
              return
            } else {
              console.warn('No session returned from code exchange')
              setStatus('No session created')
            }
          } catch (exchangeErr) {
            console.error('Exception during code exchange:', exchangeErr)
            setStatus('Error during authentication')
            navigate('/?error=exchange_failed')
            return
          }
        }
        
        // Fallback: try to get existing session
        console.log('Checking for existing session...')
        setStatus('Checking session...')
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Session check result:', { session: !!sessionData?.session, error: sessionError })
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setStatus('Session check failed')
          navigate('/?error=session_check_failed')
          return
        }

        if (sessionData.session) {
          console.log('Found existing session, user:', sessionData.session.user.email)
          setStatus('Session found! Redirecting...')
          setTimeout(() => {
            navigate('/')
          }, 1000)
        } else {
          console.log('No session found, redirecting to home')
          setStatus('No session found, redirecting...')
          setTimeout(() => {
            navigate('/?error=no_session')
          }, 2000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('Authentication failed')
        setTimeout(() => {
          navigate('/?error=callback_failed')
        }, 2000)
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
