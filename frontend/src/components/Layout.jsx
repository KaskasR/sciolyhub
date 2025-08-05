import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import './Layout.css'

function Layout({ user, profile, onSignOut, children, theme, onThemeChange }) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onSignOut()
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <div className={`layout-container ${theme}`}>
      {/* Persistent Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo">🔬</span>
            <span className="sidebar-title">SciOly Hub</span>
          </div>
        </div>

        {/* Profile Section */}
        <div className="sidebar-profile" onClick={handleProfileClick}>
          <div className="sidebar-avatar">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${profile.username || 'User'}'s profile`}
                className="sidebar-avatar-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="sidebar-avatar-fallback" 
              style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
            >
              {profile?.username?.charAt(0).toUpperCase() || '👤'}
            </div>
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">
              {profile?.username || 'Scientist'}
            </span>
            <span className="sidebar-role">Science Olympian</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <button 
            className="sidebar-nav-item"
            onClick={() => handleNavigation('/home')}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </button>
          <button 
            className="sidebar-nav-item"
            onClick={() => handleNavigation('/codebusters')}
          >
            <span className="nav-icon">🔐</span>
            <span>Codebusters Hub</span>
          </button>
          <button 
            className="sidebar-nav-item"
            onClick={() => handleNavigation('/settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>
          <button 
            className="sidebar-nav-item danger"
            onClick={handleSignOut}
          >
            <span className="nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
