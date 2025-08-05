import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
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
        // No profile exists - user needs to set username
        setProfile(null)
      } else if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    setUser(null)
    setProfile(null)
  }

  const createProfile = async (username) => {
    if (!user) {
      throw new Error('No authenticated user')
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        username: username.trim(),
        full_name: user.user_metadata?.full_name || username.trim(),
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      throw error
    }

    setProfile(data)
    return data
  }

  const checkUsernameAvailability = async (username) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.trim())
      .single()

    if (error && error.code === 'PGRST116') {
      // No user found with this username - it's available
      return { available: true }
    } else if (error) {
      console.error('Error checking username:', error)
      return { available: false, error: 'Error checking username availability' }
    } else {
      // User found with this username - it's taken
      return { available: false, error: 'Username is already taken' }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    createProfile,
    checkUsernameAvailability,
    refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
