import { useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('login') // or 'signup'
  const [message, setMessage] = useState('')

const handleAuth = async () => {
  setMessage('Loading...')

  if (mode === 'signup') {
    const result = await supabase.auth.signUp({ email, password })

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    // Wait for Supabase to confirm session and get user ID
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const user = sessionData?.session?.user

    if (!user || sessionError) {
      setMessage("Signed up, but can't get user ID yet.")
      return
    }

    // Insert profile with correct user ID
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        username: email.split('@')[0],
      },
    ])

    if (profileError) {
      setMessage('Signup succeeded, but failed to create profile.')
      console.error(profileError)
      return
    }

    setMessage('Signup and profile created!')
    setUser(user)

  } else {
    const result = await supabase.auth.signInWithPassword({ email, password })

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage('Login successful!')
    setUser(result.data.user)
  }
}



  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{mode === 'signup' ? 'Sign Up' : 'Log In'}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={handleAuth}>
        {mode === 'signup' ? 'Sign Up' : 'Log In'}
      </button>

      <p>{message}</p>

      <br />
      <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
        Switch to {mode === 'signup' ? 'Login' : 'Signup'}
      </button>

      {user && <p>Welcome, {user.email}!</p>}
    </div>
  )
}

export default App
