import { useState, useEffect } from 'react'
import './CodebustersHub.css'
import AristocratCipher from './AristocratCipher'

function CodebustersHub({ user, profile, onBack, theme }) {
  const [currentView, setCurrentView] = useState('hub')

  const handleNavigateToAristocrat = () => {
    setCurrentView('aristocrat')
  }

  const handleBackToHub = () => {
    setCurrentView('hub')
  }

  if (currentView === 'aristocrat') {
    return (
      <AristocratCipher 
        user={user} 
        profile={profile} 
        onBack={handleBackToHub} 
        theme={theme} 
      />
    )
  }
  return (
    <div className={`codebusters-hub ${theme}`}>
      <div className="hub-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="hub-title">Codebusters Hub 🔐</h1>
      </div>

      <div className="hub-content">
        {/* Practice Cyphers Section */}
        <section className="hub-section">
          <h2 className="section-title">Practice Cyphers</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔤</div>
              <h3>Aristocrat Cipher</h3>
              <p>Practice decoding simple substitution ciphers with letter frequency analysis and pattern recognition.</p>
              <button className="feature-btn" onClick={handleNavigateToAristocrat}>Start Practice</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">�</div>
              <h3>Hill Cipher</h3>
              <p>Master matrix-based encryption techniques and learn to solve polygraphic substitution ciphers.</p>
              <button className="feature-btn">Coming Soon!</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📜</div>
              <h3>Patristocrat Cipher</h3>
              <p>Decode substitution ciphers without word breaks, using advanced cryptanalysis methods.</p>
              <button className="feature-btn">Coming Soon!</button>
            </div>
          </div>
        </section>

        {/* Codebusters Drills Section */}
        <section className="hub-section">
          <h2 className="section-title">Codebusters Drills</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>200 Most Common English Words</h3>
              <p>Practice with the most frequently used words in English to improve your cipher-solving speed.</p>
              <button className="feature-btn">Coming Soon!</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>50 Most Common English Words</h3>
              <p>Quick drill focusing on the top 50 most common words for rapid pattern recognition training.</p>
              <button className="feature-btn">Coming Soon!</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CodebustersHub
