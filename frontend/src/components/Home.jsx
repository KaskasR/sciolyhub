import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './Home.css'

function Home({ user, profile, onProfileUpdate, theme }) {
  const [loading, setLoading] = useState(false)

  // No automatic profile creation - this should be handled by the Auth component
  // useEffect(() => {
  //   // Profile creation is now handled in the Auth component
  // }, [user, profile])

  // Removed loading logic since profile creation is handled in Auth component

  return (
    <div className={`home-page ${theme}`}>
      {/* Content Area */}
      <div className="content-area">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              {user && profile 
                ? `Welcome to Your Science Lab, ${profile.username}!` 
                : 'Welcome to SciOly Hub!'
              }
              <span className="hero-emoji">🧪</span>
            </h1>
            <p className="hero-subtitle">
              {user 
                ? 'Your one-stop hub for Science Olympiad practice, resources, and competition prep. Time to turn those theories into victories! 🏆'
                : 'The ultimate platform for Science Olympiad preparation, collaboration, and competition tracking. Join thousands of students preparing for success! 🏆'
              }
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
      </div>

      <footer className="footer">
        <p>Built with ❤️ for Science Olympiad champions everywhere! 🌟</p>
      </footer>
    </div>
  )
}

export default Home
