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
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

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

  const uploadProfilePicture = async (event) => {
    try {
      setUploading(true)
      setUploadMessage('')

      const file = event.target.files[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadMessage('Please select an image file')
        setUploading(false)
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadMessage('Image must be smaller than 5MB')
        setUploading(false)
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setUploadMessage('Profile picture updated successfully! 🎉')
      
      // Refresh the page after a short delay to show the new image
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setUploadMessage('Failed to upload profile picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeProfilePicture = async () => {
    try {
      setUploading(true)
      setUploadMessage('')

      // Update profile to remove custom avatar (will fall back to Google avatar or initials)
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setUploadMessage('Profile picture removed successfully! 🗑️')
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Error removing profile picture:', error)
      setUploadMessage('Failed to remove profile picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="profile-dashboard">
      <div className="dashboard-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="dashboard-title">Profile Dashboard 📊</h1>
      </div>

      <div className="dashboard-content">
        <div className="profile-info-card">
          <div className="avatar-section">
            <div className="profile-avatar">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={`${profile.username || 'User'}'s profile`}
                  className="avatar-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-fallback" 
                style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
              >
                {profile?.username?.charAt(0).toUpperCase() || '👤'}
              </div>
            </div>
            
            <div className="avatar-controls">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={uploadProfilePicture}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <label 
                htmlFor="avatar-upload" 
                className={`upload-btn ${uploading ? 'loading' : ''}`}
              >
                {uploading ? '⏳ Uploading...' : '📷 Change Photo'}
              </label>
              
              {profile?.avatar_url && (
                <button 
                  onClick={removeProfilePicture}
                  className={`remove-btn ${uploading ? 'loading' : ''}`}
                  disabled={uploading}
                >
                  🗑️ Remove Photo
                </button>
              )}
              
              {uploadMessage && (
                <div className={`upload-message ${uploadMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {uploadMessage}
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-details">
            <h2 className="profile-name">{profile?.display_name || profile?.username || 'Unknown User'}</h2>
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
