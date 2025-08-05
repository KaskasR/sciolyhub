import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './LoggedOutDashboard.css'

function LoggedOutDashboard({ theme }) {
  const navigate = useNavigate()

  useEffect(() => {
    // Add class to body to override default styles
    document.body.classList.add('logged-out-page')
    
    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('logged-out-page')
    }
  }, [])

  const handleLoginClick = () => {
    navigate('/auth')
  }

  return (
    <div className={`logged-out-dashboard ${theme}`}>
      {/* Header with Login Button */}
      <header className="logged-out-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🔬</span>
            <span className="logo-text">SciOly Hub</span>
          </div>
          <button 
            className="login-button"
            onClick={handleLoginClick}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to SciOly Hub</h1>
            <p className="hero-subtitle">
              Your ultimate platform for Science Olympiad preparation, collaboration, and competition tracking.
            </p>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">📚</span>
                <span>Study Resources</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Team Collaboration</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏆</span>
                <span>Competition Tracking</span>
              </div>
            </div>
            <button 
              className="cta-button"
              onClick={handleLoginClick}
            >
              Get Started
            </button>
          </div>
        </section>

        <section className="features-section">
          <div className="features-container">
            <h2>Why Choose SciOly Hub?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="card-icon">📖</div>
                <h3>Comprehensive Resources</h3>
                <p>Access study materials, practice tests, and preparation guides for all Science Olympiad events.</p>
              </div>
              <div className="feature-card">
                <div className="card-icon">🤝</div>
                <h3>Team Management</h3>
                <p>Organize your team, track member progress, and coordinate practice sessions efficiently.</p>
              </div>
              <div className="feature-card">
                <div className="card-icon">📊</div>
                <h3>Performance Analytics</h3>
                <p>Monitor your performance, identify strengths and weaknesses, and track improvement over time.</p>
              </div>
              <div className="feature-card">
                <div className="card-icon">🌐</div>
                <h3>Community Support</h3>
                <p>Connect with other Science Olympiad participants, share knowledge, and learn together.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="logged-out-footer">
        <div className="footer-content">
          <p>&copy; 2025 SciOly Hub. Empowering Science Olympiad excellence.</p>
        </div>
      </footer>
    </div>
  )
}

export default LoggedOutDashboard
