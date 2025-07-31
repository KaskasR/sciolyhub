import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './Home.css'

function Home({ user, profile, onSignOut, onNavigate, onProfileUpdate, theme }) {
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    // Ensure we have a profile
    if (user && !profile) {
      fetchOrCreateProfile()
    }
  }, [user, profile])

  const fetchOrCreateProfile = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Create default profile
        const defaultUsername = user.email.split('@')[0]
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: defaultUsername,
          }])

        if (!insertError) {
          onProfileUpdate(user.id)
        }
      } else if (!error) {
        // Profile exists, no need to update
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

  const handleDropdownClick = (action) => {
    setShowDropdown(false)
    
    switch (action) {
      case 'profile':
        onNavigate('profile')
        break
      case 'settings':
        onNavigate('settings')
        break
      case 'signout':
        handleSignOut()
        break
      default:
        break
    }
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
    <div className={`home-container ${theme}`}>
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">🔬</span>
          <span className="nav-title">SciOly Hub</span>
        </div>
        <div className="nav-user">
          <div 
            className="user-dropdown"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="user-trigger">
              <div className="nav-avatar">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`${profile.username || 'User'}'s profile`}
                    className="nav-avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="nav-avatar-fallback" 
                  style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
                >
                  {profile?.username?.charAt(0).toUpperCase() || '👤'}
                </div>
              </div>
              <span className="welcome-text">
                Hey, {profile?.username || 'Scientist'}! 👋
              </span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={() => handleDropdownClick('profile')}
                >
                  <span className="dropdown-icon">�</span>
                  Profile Dashboard
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleDropdownClick('settings')}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item danger"
                  onClick={() => handleDropdownClick('signout')}
                >
                  <span className="dropdown-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to Your Science Lab, {profile?.username}! 
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
            <div className="feature-icon">🤖</div>
            <h3>SciBot Assistant</h3>
            <p>Chat with our AI-powered study companion for instant help with science concepts and competition strategies.</p>
            <button className="feature-btn active" onClick={() => onNavigate('chatbot')}>Chat Now!</button>
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
