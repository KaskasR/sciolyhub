import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './Home.css'

function Home({ user, onSignOut }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onSignOut()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large">🧬</div>
        <p>Loading your lab...</p>
      </div>
    )
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">🔬</span>
          <span className="nav-title">SciOly Hub</span>
        </div>
        <div className="nav-user">
          <span className="welcome-text">Hey, {profile?.username || 'Scientist'}! 👋</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out 🚪
          </button>
        </div>
      </nav>

      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to Your Science Lab! 
              <span className="hero-emoji">🧪</span>
            </h1>
            <p className="hero-subtitle">
              Your one-stop hub for Science Olympiad practice, resources, and competition prep.
              Time to turn those theories into victories! 🏆
            </p>
          </div>
          <div className="hero-visual">
            <div className="floating-icon icon-1">⚛️</div>
            <div className="floating-icon icon-2">🧬</div>
            <div className="floating-icon icon-3">🔬</div>
            <div className="floating-icon icon-4">📊</div>
            <div className="floating-icon icon-5">⚗️</div>
            <div className="floating-icon icon-6">🌟</div>
          </div>
        </section>

        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Study Materials</h3>
            <p>Access comprehensive study guides, practice tests, and resources for all Science Olympiad events.</p>
            <button className="feature-btn">Coming Soon!</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Practice Tests</h3>
            <p>Take unlimited practice tests with instant feedback to sharpen your skills and track progress.</p>
            <button className="feature-btn">Coming Soon!</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Team Collaboration</h3>
            <p>Connect with teammates, share resources, and coordinate your preparation strategies.</p>
            <button className="feature-btn">Coming Soon!</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement across different events with detailed analytics and insights.</p>
            <button className="feature-btn">Coming Soon!</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Competition Prep</h3>
            <p>Get ready for tournaments with official-style tests and time management tools.</p>
            <button className="feature-btn">Coming Soon!</button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Lab Simulations</h3>
            <p>Practice laboratory skills with virtual experiments and interactive demonstrations.</p>
            <button className="feature-btn">Coming Soon!</button>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">23</div>
              <div className="stat-label">Science Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Practice Questions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">🧠</div>
              <div className="stat-label">Knowledge Gained</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with ❤️ for Science Olympiad champions everywhere! 🌟</p>
      </footer>
    </div>
  )
}

export default Home
