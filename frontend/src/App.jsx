import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Home from './components/Home'
import ProfileDashboard from './components/ProfileDashboard'
import CodebustersHub from './components/CodebustersHub'
import Settings from './components/Settings'
import Layout from './components/Layout'
import LoggedOutDashboard from './components/LoggedOutDashboard'
import AuthCallback from './components/AuthCallback'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('light')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('scioly-theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      }
      
      setLoading(false)
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          await fetchProfile(currentUser.id)
          // Don't auto-redirect from auth/callback - let AuthCallback handle it
          // After successful login, if they don't have a profile, they'll be redirected to username setup
          if (location.pathname === '/auth') {
            navigate('/')
          }
        } else {
          setProfile(null)
          // Keep user on their current page after logout, unless they're on protected pages
          if (location.pathname === '/profile' || location.pathname === '/settings') {
            navigate('/')
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate, location.pathname])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No profile exists, will be created when needed
        setProfile(null)
      } else if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
      setProfile(null)
    }
  }

  const handleAuth = async (user) => {
    setUser(user)
    await fetchProfile(user.id)
    // After authentication (especially after username setup), go to home
    navigate('/')
  }

  const handleUsernameRequired = () => {
    // This will be called when a user signs in with Google but doesn't have a username
    // The Auth component will handle the username setup
    return
  }

  const handleSignOut = () => {
    setUser(null)
    setProfile(null)
    navigate('/')
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '600',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}>
        Loading SciOly Hub... 🔬
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          // If user is authenticated but has no profile, redirect to auth to set up username
          user && !profile ? (
            <Auth onAuth={handleAuth} user={user} needsUsername={true} />
          ) : (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <Home 
                user={user} 
                profile={profile}
                onSignOut={handleSignOut}
                onProfileUpdate={fetchProfile}
                theme={theme}
              />
            </Layout>
          )
        } 
      />
      <Route 
        path="/home" 
        element={
          user && !profile ? (
            <Auth onAuth={handleAuth} user={user} needsUsername={true} />
          ) : (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <Home 
                user={user} 
                profile={profile}
                onSignOut={handleSignOut}
                onProfileUpdate={fetchProfile}
                theme={theme}
              />
            </Layout>
          )
        } 
      />
      <Route 
        path="/profile" 
        element={
          user && profile ? (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <ProfileDashboard 
                user={user} 
                profile={profile}
                onBack={() => navigate('/')}
                theme={theme}
              />
            </Layout>
          ) : user && !profile ? (
            <Auth onAuth={handleAuth} user={user} needsUsername={true} />
          ) : (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <Home 
                user={user} 
                profile={profile}
                onSignOut={handleSignOut}
                onProfileUpdate={fetchProfile}
                theme={theme}
              />
            </Layout>
          )
        } 
      />
      <Route 
        path="/settings" 
        element={
          user && profile ? (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <Settings 
                user={user} 
                profile={profile}
                onBack={() => navigate('/')}
                theme={theme}
                onThemeChange={handleThemeChange}
              />
            </Layout>
          ) : user && !profile ? (
            <Auth onAuth={handleAuth} user={user} needsUsername={true} />
          ) : (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <Home 
                user={user} 
                profile={profile}
                onSignOut={handleSignOut}
                onProfileUpdate={fetchProfile}
                theme={theme}
              />
            </Layout>
          )
        } 
      />
      <Route 
        path="/codebusters" 
        element={
          user && !profile ? (
            <Auth onAuth={handleAuth} user={user} needsUsername={true} />
          ) : (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <CodebustersHub 
                user={user} 
                profile={profile}
                onBack={() => navigate('/')}
                theme={theme}
              />
            </Layout>
          )
        } 
      />
      <Route 
        path="/auth" 
        element={<Auth onAuth={handleAuth} user={user} needsUsername={user && !profile} />} 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />
      <Route 
        path="*" 
        element={
          user && !profile ? (
            <Auth onAuth={handleAuth} user={user} needsUsername={true} />
          ) : (
            <Layout user={user} profile={profile} onSignOut={handleSignOut} theme={theme} onThemeChange={handleThemeChange}>
              <Home 
                user={user} 
                profile={profile}
                onSignOut={handleSignOut}
                onProfileUpdate={fetchProfile}
                theme={theme}
              />
            </Layout>
          )
        } 
      />
    </Routes>
  )
}

export default App
