import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './Settings.css'

function Settings({ user, profile, onBack, theme, onThemeChange }) {
  const [username, setUsername] = useState(profile?.username || '')
  const [updateMessage, setUpdateMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setUsername(profile?.username || '')
  }, [profile])

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      return { available: false, message: 'Username must be at least 3 characters long' }
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { available: false, message: 'Username can only contain letters, numbers, and underscores' }
    }

    if (username === profile?.username) {
      return { available: true, message: 'That\'s your current username' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { available: false, message: 'Error checking username availability' }
    }

    if (data) {
      return { available: false, message: 'Username is already taken' }
    }

    return { available: true, message: 'Username is available!' }
  }

  const updateUsername = async () => {
    if (!username.trim()) {
      setUpdateMessage('Please enter a username')
      return
    }

    if (username === profile?.username) {
      setUpdateMessage('Username is the same as current')
      return
    }

    setIsUpdating(true)
    const usernameCheck = await checkUsernameAvailability(username.trim())
    
    if (!usernameCheck.available) {
      setUpdateMessage(usernameCheck.message)
      setIsUpdating(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id)

    if (error) {
      setUpdateMessage('Failed to update username')
      console.error('Update error:', error)
    } else {
      setUpdateMessage('Username updated successfully! 🎉')
      setTimeout(() => setUpdateMessage(''), 3000)
    }
    setIsUpdating(false)
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    onThemeChange(newTheme)
    localStorage.setItem('scioly-theme', newTheme)
  }

  return (
    <div className={`settings ${theme}`}>
      <div className="settings-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="settings-title">Settings ⚙️</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="section-title">Account Settings 👤</h2>
          
          <div className="setting-item">
            <label className="setting-label">Username</label>
            <div className="username-update">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="setting-input"
                placeholder="Enter new username"
                maxLength={20}
                minLength={3}
              />
              <button 
                onClick={updateUsername} 
                className={`update-btn ${isUpdating ? 'loading' : ''}`}
                disabled={isUpdating || username === profile?.username}
              >
                {isUpdating ? '⏳' : 'Update'}
              </button>
            </div>
            {updateMessage && (
              <div className={`update-message ${updateMessage.includes('successfully') ? 'success' : 'error'}`}>
                {updateMessage}
              </div>
            )}
          </div>

          <div className="setting-item">
            <label className="setting-label">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="setting-input disabled"
              disabled
            />
            <p className="setting-hint">Email cannot be changed from here</p>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Appearance Settings 🎨</h2>
          
          <div className="setting-item">
            <div className="theme-toggle-container">
              <div className="theme-info">
                <label className="setting-label">Theme</label>
                <p className="setting-hint">Choose your preferred theme</p>
              </div>
              <button 
                onClick={handleThemeToggle}
                className={`theme-toggle ${theme}`}
              >
                <div className="toggle-slider">
                  <span className="toggle-icon">
                    {theme === 'light' ? '☀️' : '🌙'}
                  </span>
                </div>
                <span className="theme-label">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Preferences 🔧</h2>
          
          <div className="setting-item">
            <label className="setting-label">Notifications</label>
            <div className="checkbox-container">
              <input type="checkbox" id="email-notifications" defaultChecked />
              <label htmlFor="email-notifications">Email notifications</label>
            </div>
            <div className="checkbox-container">
              <input type="checkbox" id="push-notifications" defaultChecked />
              <label htmlFor="push-notifications">Push notifications</label>
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">Study Reminders</label>
            <select className="setting-select">
              <option value="daily">Daily</option>
              <option value="weekly" selected>Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        <div className="settings-section danger">
          <h2 className="section-title">Danger Zone ⚠️</h2>
          
          <div className="setting-item">
            <div className="danger-actions">
              <button className="danger-btn secondary">Reset Progress</button>
              <button className="danger-btn">Delete Account</button>
            </div>
            <p className="setting-hint">These actions cannot be undone</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
