import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    let mounted = true

    const checkAuthState = async () => {
      try {
        console.log('AuthCallback: Checking authentication state...')
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hasCode = urlParams.has('code')
        const hasError = urlParams.has('error')
        
        if (hasError) {
          const error = urlParams.get('error')
          console.error('AuthCallback: OAuth error:', error)
          if (mounted) {
            setStatus('Authentication failed')
            navigate(`/?error=${error}`)
          }
          return
        }
        
        if (hasCode) {
          console.log('AuthCallback: Auth code detected, waiting for Supabase to process...')
          if (mounted) setStatus('Completing sign-in...')
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
        }
        
        // Wait for Supabase auth state to settle
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthCallback: Session error:', error)
          if (mounted) {
            setStatus('Session error')
            navigate('/?error=session_error')
          }
          return
        }
        
        if (!session) {
          console.log('AuthCallback: No session found')
          if (mounted) {
            setStatus('No session found, redirecting...')
            navigate('/?error=no_session')
          }
          return
        }
        
        console.log('AuthCallback: Session found! User:', session.user.email)
        if (mounted) setStatus('Checking your profile...')
        
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', session.user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // No profile exists, redirect to username setup
          console.log('AuthCallback: New user - redirecting to username setup')
          if (mounted) {
            setStatus('Welcome! Setting up your profile...')
            setTimeout(() => navigate('/auth'), 500)
          }
        } else if (profileError) {
          console.error('AuthCallback: Profile check error:', profileError)
          if (mounted) {
            setStatus('Profile check failed, redirecting...')
            setTimeout(() => navigate('/'), 1000)
          }
        } else {
          // Profile exists, redirect to home
          console.log('AuthCallback: Existing user - redirecting to dashboard')
          if (mounted) {
            setStatus(`Welcome back, ${profile.username || profile.full_name}!`)
            setTimeout(() => navigate('/'), 500)
          }
        }
        
      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error)
        if (mounted) {
          setStatus('Something went wrong, redirecting...')
          setTimeout(() => navigate('/?error=unexpected_error'), 2000)
        }
      }
    }

    // Start checking auth state after a brief delay
    const timer = setTimeout(checkAuthState, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
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
