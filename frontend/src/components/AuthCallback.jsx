import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    let mounted = true
    let authSubscription = null

    const processAuthResult = async (session) => {
      if (!mounted) return

      if (!session) {
        console.log('AuthCallback: No session found')
        setStatus('No session found, redirecting...')
        setTimeout(() => navigate('/?error=no_session'), 1000)
        return
      }

      console.log('AuthCallback: Session found! User:', session.user.email)
      setStatus('Checking your profile...')
      
      try {
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', session.user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // No profile exists, redirect to username setup
          console.log('AuthCallback: New user - redirecting to username setup')
          setStatus('Welcome! Setting up your profile...')
          setTimeout(() => navigate('/auth'), 500)
        } else if (profileError) {
          console.error('AuthCallback: Profile check error:', profileError)
          setStatus('Profile check failed, redirecting...')
          setTimeout(() => navigate('/'), 1000)
        } else {
          // Profile exists, redirect to home
          console.log('AuthCallback: Existing user - redirecting to dashboard')
          setStatus(`Welcome back, ${profile.username || profile.full_name}!`)
          setTimeout(() => navigate('/'), 500)
        }
      } catch (error) {
        console.error('AuthCallback: Profile check error:', error)
        setStatus('Something went wrong, redirecting...')
        setTimeout(() => navigate('/'), 2000)
      }
    }

    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback handling...')
        
        // Check URL parameters for errors
        const urlParams = new URLSearchParams(window.location.search)
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
        
        // Clear URL parameters immediately to prevent reprocessing
        if (urlParams.has('code') || urlParams.has('error')) {
          console.log('AuthCallback: Cleaning URL parameters...')
          window.history.replaceState({}, document.title, window.location.pathname)
        }
        
        if (mounted) setStatus('Completing sign-in...')
        
        // Listen for auth state changes (this will catch when Supabase processes the auth code)
        authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('AuthCallback: Auth state change:', event)
          if (event === 'SIGNED_IN' && session && mounted) {
            // Clean up the subscription since we got what we need
            if (authSubscription) {
              authSubscription.data.subscription.unsubscribe()
              authSubscription = null
            }
            await processAuthResult(session)
          }
        })
        
        // Also check current session in case the auth change already happened
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (mounted) {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('AuthCallback: Session error:', error)
            setStatus('Session error')
            navigate('/?error=session_error')
            return
          }
          
          if (session) {
            // Clean up the subscription since we have a session
            if (authSubscription) {
              authSubscription.data.subscription.unsubscribe()
              authSubscription = null
            }
            await processAuthResult(session)
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

    // Start the auth callback handling
    handleAuthCallback()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.data.subscription.unsubscribe()
      }
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
