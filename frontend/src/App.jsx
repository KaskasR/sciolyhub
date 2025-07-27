import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Home from './components/Home'
import ProfileDashboard from './components/ProfileDashboard'
import Settings from './components/Settings'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [theme, setTheme] = useState('light')

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
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
          setCurrentPage('home')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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
  }

  const handleUsernameRequired = () => {
    // This will be called when a user signs in with Google but doesn't have a username
    // The Auth component will handle the username setup
    return
  }

  const handleSignOut = () => {
    setUser(null)
    setProfile(null)
    setCurrentPage('home')
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        Loading SciOly Hub... 🔬
      </div>
    )
  }

  if (!user) {
    return <Auth onAuth={handleAuth} />
  }

  // Check if user needs to set up username (signed in with Google but no profile)
  if (user && !profile) {
    return <Auth onAuth={handleAuth} user={user} />
  }

  // Render different pages based on currentPage state
  switch (currentPage) {
    case 'profile':
      return (
        <ProfileDashboard 
          user={user} 
          profile={profile}
          onBack={() => navigateTo('home')}
        />
      )
    case 'settings':
      return (
        <Settings 
          user={user} 
          profile={profile}
          onBack={() => navigateTo('home')}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      )
    default:
      return (
        <Home 
          user={user} 
          profile={profile}
          onSignOut={handleSignOut}
          onNavigate={navigateTo}
          onProfileUpdate={fetchProfile}
          theme={theme}
        />
      )
  }
}

export default App
