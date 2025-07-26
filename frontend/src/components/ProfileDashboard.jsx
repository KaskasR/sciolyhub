import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './ProfileDashboard.css'

function ProfileDashboard({ user, profile, onBack }) {
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    studyHours: 0,
    rank: 'Novice Scientist',
    favoriteEvent: 'Not Set',
    joinDate: 'Unknown'
  })

  useEffect(() => {
    // For now, we'll use mock data. Later this can be replaced with real data from the database
    const mockStats = {
      testsCompleted: Math.floor(Math.random() * 50) + 1,
      averageScore: Math.floor(Math.random() * 40) + 60,
      studyHours: Math.floor(Math.random() * 100) + 10,
      rank: getRank(),
      favoriteEvent: getFavoriteEvent(),
      joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'
    }
    setStats(mockStats)
  }, [profile])

  const getRank = () => {
    const ranks = [
      'Novice Scientist 🧪',
      'Lab Assistant 🔬',
      'Researcher 📊',
      'Expert Analyst 🧬',
      'Science Master 🏆',
      'Olympiad Champion 🌟'
    ]
    return ranks[Math.floor(Math.random() * ranks.length)]
  }

  const getFavoriteEvent = () => {
    const events = [
      'Anatomy & Physiology',
      'Chemistry Lab',
      'Physics',
      'Biology',
      'Astronomy',
      'Environmental Science',
      'Forensics',
      'Disease Detectives'
    ]
    return events[Math.floor(Math.random() * events.length)]
  }

  return (
    <div className="profile-dashboard">
      <div className="dashboard-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="dashboard-title">Profile Dashboard 📊</h1>
      </div>

      <div className="dashboard-content">
        <div className="profile-info-card">
          <div className="profile-avatar">
            {profile?.username?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div className="profile-details">
            <h2 className="profile-name">{profile?.username || 'Unknown User'}</h2>
            <p className="profile-email">{user?.email || 'No email'}</p>
            <p className="profile-rank">{stats.rank}</p>
            <p className="join-date">Joined: {stats.joinDate}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.testsCompleted}</div>
            <div className="stat-label">Tests Completed</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-value">{stats.studyHours}h</div>
            <div className="stat-label">Study Hours</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.favoriteEvent}</div>
            <div className="stat-label">Favorite Event</div>
          </div>
        </div>

        <div className="progress-section">
          <h3>Recent Activity 📋</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🧪</span>
              <span className="activity-text">Completed Chemistry Lab practice test</span>
              <span className="activity-time">2 hours ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📚</span>
              <span className="activity-text">Studied Anatomy & Physiology materials</span>
              <span className="activity-time">1 day ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🏆</span>
              <span className="activity-text">Achieved new high score in Physics</span>
              <span className="activity-time">3 days ago</span>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h3>Achievements 🏅</h3>
          <div className="achievements-grid">
            <div className="achievement-badge earned">
              <span className="badge-icon">🔬</span>
              <span className="badge-name">First Test</span>
            </div>
            <div className="achievement-badge earned">
              <span className="badge-icon">📚</span>
              <span className="badge-name">Study Streak</span>
            </div>
            <div className="achievement-badge">
              <span className="badge-icon">🎯</span>
              <span className="badge-name">Perfect Score</span>
            </div>
            <div className="achievement-badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-name">Champion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileDashboard
