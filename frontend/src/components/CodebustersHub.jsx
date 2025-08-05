import { useState, useEffect } from 'react'
import './CodebustersHub.css'

function CodebustersHub({ user, profile, onBack, theme }) {
  return (
    <div className={`codebusters-hub ${theme}`}>
      <div className="hub-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="hub-title">Codebusters Hub</h1>
      </div>

      <div className="hub-content">
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🔐</div>
          <h2>Codebusters Hub</h2>
          <p>Your gateway to cryptography and code-breaking challenges</p>
          <div className="feature-preview">
            <span className="preview-tag">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodebustersHub
