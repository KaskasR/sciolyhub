import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { uploadAvatar, deleteAvatar } from '../utils/avatarUpload'
import './ProfileDashboard.css'

function ProfileDashboard({ user, profile, onBack, theme }) {
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
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false)
  const [showUsernameEdit, setShowUsernameEdit] = useState(false)
  const [editingUsername, setEditingUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')

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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.avatar-dropdown')) {
        setShowAvatarDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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

      // Use the avatar upload utility
      const result = await uploadAvatar(file, user.id)

      if (result.success) {
        // Update user profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: result.url })
          .eq('id', user.id)

        if (updateError) {
          throw updateError
        }

        setUploadMessage('Profile picture updated successfully! 🎉')
        
        // Refresh the page after a short delay to show the new image
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setUploadMessage(`Upload failed: ${result.error}`)
      }

    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setUploadMessage('Failed to upload profile picture. Please try again.')
    } finally {
      setUploading(false)
      // Clear the file input
      event.target.value = ''
    }
  }

  const removeProfilePicture = async () => {
    try {
      setUploading(true)
      setUploadMessage('')

      // Delete the avatar file from storage
      const result = await deleteAvatar(user.id)

      if (result.success) {
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
      } else {
        setUploadMessage(`Failed to remove picture: ${result.error}`)
      }

    } catch (error) {
      console.error('Error removing profile picture:', error)
      setUploadMessage('Failed to remove profile picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      return { available: false, message: 'Username must be at least 3 characters long' }
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { available: false, message: 'Username can only contain letters, numbers, and underscores' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .neq('id', user.id) // Exclude current user

    if (error) {
      return { available: false, message: 'Error checking username availability' }
    }

    if (data && data.length > 0) {
      return { available: false, message: 'Username is already taken' }
    }

    return { available: true, message: 'Username is available!' }
  }

  const handleUsernameEdit = () => {
    setEditingUsername(profile?.username || '')
    setShowUsernameEdit(true)
    setUsernameMessage('')
  }

  const handleUsernameCancel = () => {
    setShowUsernameEdit(false)
    setEditingUsername('')
    setUsernameMessage('')
  }

  const handleUsernameSave = async () => {
    if (!editingUsername.trim()) {
      setUsernameMessage('Please enter a username')
      return
    }

    if (editingUsername.trim() === profile?.username) {
      setShowUsernameEdit(false)
      setUsernameMessage('')
      return
    }

    setUploading(true)
    
    try {
      const usernameCheck = await checkUsernameAvailability(editingUsername.trim())
      
      if (!usernameCheck.available) {
        setUsernameMessage(usernameCheck.message)
        setUploading(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username: editingUsername.trim() })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating username:', error)
        setUsernameMessage('Failed to update username. Please try again.')
      } else {
        setUsernameMessage('Username updated successfully! 🎉')
        setShowUsernameEdit(false)
        
        // Refresh the page after a short delay to show the new username
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Error updating username:', error)
      setUsernameMessage('Failed to update username. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`profile-dashboard ${theme}`}>
      <div className="dashboard-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="dashboard-title">Profile Dashboard</h1>
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
              
              <div className="avatar-dropdown">
                <button 
                  className="dropdown-trigger"
                  onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                  disabled={uploading}
                >
                  Edit Avatar
                </button>
                
                {showAvatarDropdown && (
                  <div className="avatar-dropdown-menu">
                    <button 
                      className="avatar-dropdown-item"
                      onClick={() => {
                        setShowAvatarDropdown(false)
                        document.getElementById('avatar-upload').click()
                      }}
                      type="button"
                    >
                      Upload Image
                    </button>
                    
                    {profile?.avatar_url && (
                      <button 
                        onClick={() => {
                          removeProfilePicture()
                          setShowAvatarDropdown(false)
                        }}
                        className="avatar-dropdown-item"
                        disabled={uploading}
                        type="button"
                      >
                        Delete Avatar
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {uploadMessage && (
                <div className={`upload-message ${uploadMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {uploadMessage}
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-details">
            <div className="username-section">
              {!showUsernameEdit ? (
                <div 
                  className="username-bubble"
                  onMouseEnter={() => setShowUsernameEdit(false)}
                  onClick={handleUsernameEdit}
                  title="Click to edit username"
                >
                  @{profile?.username || 'username'}
                  <span className="edit-hint">✏️</span>
                </div>
              ) : (
                <div className="username-edit-form">
                  <input
                    type="text"
                    value={editingUsername}
                    onChange={(e) => setEditingUsername(e.target.value)}
                    className="username-input"
                    placeholder="Enter username"
                    disabled={uploading}
                  />
                  <div className="username-actions">
                    <button 
                      onClick={handleUsernameSave}
                      disabled={uploading}
                      className="save-btn"
                    >
                      {uploading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={handleUsernameCancel}
                      disabled={uploading}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {usernameMessage && (
                <div className={`username-message ${usernameMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {usernameMessage}
                </div>
              )}
            </div>
            
            <p className="profile-fullname">{profile?.full_name || 'No full name set'}</p>
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
