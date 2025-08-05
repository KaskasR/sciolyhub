import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback handling...')
        setStatus('Processing authentication...')
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        
        console.log('AuthCallback: URL params:', { code: code ? 'present' : 'missing', error })
        
        if (error) {
          console.error('AuthCallback: OAuth error in URL:', error)
          setStatus('Authentication failed')
          navigate(`/?error=${error}`)
          return
        }
        
        // If we have a code, let Supabase's auth state listener handle the session
        // We just need to wait for the session to be established
        if (code) {
          console.log('AuthCallback: Found auth code, waiting for session...')
          setStatus('Completing sign-in...')
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // Wait a bit for the auth state change to process
          let attempts = 0
          const maxAttempts = 10
          
          const checkForSession = async () => {
            attempts++
            console.log(`AuthCallback: Checking for session (attempt ${attempts})...`)
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.error('AuthCallback: Session check error:', sessionError)
              setStatus('Session check failed')
              navigate('/?error=session_check_failed')
              return
            }
            
            if (session) {
              console.log('AuthCallback: Session found! User:', session.user.email)
              setStatus('Authentication successful! Checking profile...')
              
              // Check if user has a profile
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (profileError && profileError.code === 'PGRST116') {
                // No profile exists, redirect to username setup
                console.log('AuthCallback: No profile found, redirecting to username setup')
                setStatus('Setting up your profile...')
                setTimeout(() => {
                  navigate('/auth')
                }, 500)
              } else if (profileError) {
                console.error('AuthCallback: Profile check error:', profileError)
                setStatus('Profile check failed, redirecting...')
                setTimeout(() => {
                  navigate('/')
                }, 500)
              } else {
                // Profile exists, redirect to home
                console.log('AuthCallback: Profile found, redirecting to home')
                setStatus('Welcome back! Redirecting...')
                setTimeout(() => {
                  navigate('/')
                }, 500)
              }
              return
            }
            
            if (attempts < maxAttempts) {
              console.log('AuthCallback: No session yet, retrying...')
              setTimeout(checkForSession, 500)
            } else {
              console.log('AuthCallback: Max attempts reached, redirecting anyway...')
              setStatus('Redirecting...')
              navigate('/')
            }
          }
          
          // Start checking after a brief delay
          setTimeout(checkForSession, 100)
          return
        }
        
        // If no code, check for existing session
        console.log('AuthCallback: No code, checking for existing session...')
        setStatus('Checking session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('AuthCallback: Session check error:', sessionError)
          setStatus('Session check failed')
          navigate('/?error=session_check_failed')
          return
        }

        if (session) {
          console.log('AuthCallback: Found existing session, user:', session.user.email)
          setStatus('Session found! Checking profile...')
          
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError && profileError.code === 'PGRST116') {
            // No profile exists, redirect to username setup
            console.log('AuthCallback: No profile found, redirecting to username setup')
            setStatus('Setting up your profile...')
            setTimeout(() => {
              navigate('/auth')
            }, 500)
          } else if (profileError) {
            console.error('AuthCallback: Profile check error:', profileError)
            setStatus('Profile check failed, redirecting...')
            setTimeout(() => {
              navigate('/')
            }, 500)
          } else {
            // Profile exists, redirect to home
            console.log('AuthCallback: Profile found, redirecting to home')
            setStatus('Welcome back! Redirecting...')
            setTimeout(() => {
              navigate('/')
            }, 500)
          }
        } else {
          console.log('AuthCallback: No session found, redirecting to home')
          setStatus('No session found, redirecting...')
          setTimeout(() => {
            navigate('/?error=no_session')
          }, 1000)
        }
      } catch (error) {
        console.error('AuthCallback: Callback error:', error)
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
