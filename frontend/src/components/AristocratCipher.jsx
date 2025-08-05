import { useState, useEffect } from 'react'
import './AristocratCipher.css'

function AristocratCipher({ user, profile, onBack, theme }) {
  const [currentQuote, setCurrentQuote] = useState(null)
  const [cipherMapping, setCipherMapping] = useState({})
  const [userGuesses, setUserGuesses] = useState({})
  const [letterFrequencies, setLetterFrequencies] = useState({})
  const [loading, setLoading] = useState(true)
  const [availableQuotes, setAvailableQuotes] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [checkResult, setCheckResult] = useState(null)
  const [assistedFill, setAssistedFill] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Fetch quotes from backend
  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      const data = await response.json()
      
      if (data.quotes && data.quotes.length > 0) {
        setAvailableQuotes(data.quotes)
      } else if (data.fallbackQuotes) {
        setAvailableQuotes(data.fallbackQuotes)
      } else {
        // Use hardcoded fallback if all else fails
        setAvailableQuotes(sampleQuotes)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setAvailableQuotes(sampleQuotes)
    }
  }

  // Generate a random substitution cipher mapping
  const generateCipherMapping = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const shuffled = alphabet.split('').sort(() => Math.random() - 0.5)
    const mapping = {}
    
    for (let i = 0; i < alphabet.length; i++) {
      mapping[alphabet[i]] = shuffled[i]
    }
    
    return mapping
  }

  // Calculate letter frequencies in the ciphertext
  const calculateFrequencies = (cipherText) => {
    const frequencies = {}
    const letters = cipherText.replace(/[^A-Z]/g, '')
    
    // Count occurrences
    for (const letter of letters) {
      frequencies[letter] = (frequencies[letter] || 0) + 1
    }
    
    return frequencies
  }

  // Convert text to cipher using the mapping
  const encryptText = (text, mapping) => {
    return text.toUpperCase().split('').map(char => {
      if (/[A-Z]/.test(char)) {
        return mapping[char] || char
      }
      return char // Keep punctuation and spaces
    }).join('')
  }

  // Sample quotes (since we can't read the Excel file directly in frontend)
  // In a real implementation, you'd fetch this from your backend
  const sampleQuotes = [
    { author: "Albert Einstein", quote: "Imagination is more important than knowledge." },
    { author: "Maya Angelou", quote: "You will face many defeats in life, but never let yourself be defeated." },
    { author: "Winston Churchill", quote: "Success is not final, failure is not fatal: it is the courage to continue that counts." },
    { author: "Steve Jobs", quote: "Innovation distinguishes between a leader and a follower." },
    { author: "Nelson Mandela", quote: "The greatest glory in living lies not in never falling, but in rising every time we fall." },
    { author: "Oprah Winfrey", quote: "The biggest adventure you can take is to live the life of your dreams." },
    { author: "Martin Luther King Jr.", quote: "Darkness cannot drive out darkness; only light can do that." },
    { author: "Theodore Roosevelt", quote: "Believe you can and you're halfway there." },
    { author: "Oscar Wilde", quote: "Be yourself; everyone else is already taken." },
    { author: "Franklin D. Roosevelt", quote: "The only thing we have to fear is fear itself." }
  ]

  // Load a new quote
  const loadNewQuote = () => {
    if (availableQuotes.length === 0) return
    
    setLoading(true)
    const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)]
    const mapping = generateCipherMapping()
    const cipherText = encryptText(randomQuote.quote, mapping)
    const frequencies = calculateFrequencies(cipherText)
    
    setCurrentQuote({
      original: randomQuote.quote,
      author: randomQuote.author,
      cipherText: cipherText
    })
    setCipherMapping(mapping)
    setLetterFrequencies(frequencies)
    setUserGuesses({})
    setShowAnswer(false)
    setCheckResult(null)
    setShowSuccessModal(false)
    setLoading(false)
  }

  // Handle user input for letter guesses
  const handleLetterGuess = (cipherLetter, guessedLetter) => {
    if (guessedLetter && /[A-Za-z]/.test(guessedLetter)) {
      const upperGuess = guessedLetter.toUpperCase()
      
      // Remove any existing mapping to this guessed letter
      const newGuesses = { ...userGuesses }
      Object.keys(newGuesses).forEach(key => {
        if (newGuesses[key] === upperGuess) {
          delete newGuesses[key]
        }
      })
      
      // Set the new mapping
      newGuesses[cipherLetter] = upperGuess
      setUserGuesses(newGuesses)
    } else if (guessedLetter === '') {
      // Remove guess if input is cleared
      setUserGuesses(prev => {
        const newGuesses = { ...prev }
        delete newGuesses[cipherLetter]
        return newGuesses
      })
    }
  }

  // Check if puzzle is solved
  const isPuzzleSolved = () => {
    if (!currentQuote) return false
    
    const cipherText = currentQuote.cipherText.replace(/[^A-Z]/g, '')
    const uniqueCipherLetters = [...new Set(cipherText)]
    
    // Check if all cipher letters have been guessed correctly
    return uniqueCipherLetters.every(cipherLetter => {
      const originalLetter = Object.keys(cipherMapping).find(key => cipherMapping[key] === cipherLetter)
      return userGuesses[cipherLetter] === originalLetter
    })
  }

  // Check user's current answer (Hint Check)
  const hintCheck = () => {
    if (!currentQuote) return

    const cipherText = currentQuote.cipherText.replace(/[^A-Z]/g, '')
    const uniqueCipherLetters = [...new Set(cipherText)]
    
    let correctGuesses = 0
    let totalGuesses = 0
    const incorrectLetters = []
    
    uniqueCipherLetters.forEach(cipherLetter => {
      const originalLetter = Object.keys(cipherMapping).find(key => cipherMapping[key] === cipherLetter)
      const userGuess = userGuesses[cipherLetter]
      
      if (userGuess) {
        totalGuesses++
        if (userGuess === originalLetter) {
          correctGuesses++
        } else {
          incorrectLetters.push({
            cipher: cipherLetter,
            guessed: userGuess,
            correct: originalLetter
          })
        }
      }
    })

    const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0
    
    setCheckResult({
      accuracy,
      correctGuesses,
      totalGuesses,
      incorrectLetters,
      totalLetters: uniqueCipherLetters.length
    })
  }

  // Check if puzzle is completely solved (Check Answer)
  const checkAnswer = () => {
    if (!currentQuote) return

    const cipherText = currentQuote.cipherText.replace(/[^A-Z]/g, '')
    const uniqueCipherLetters = [...new Set(cipherText)]
    
    // Check if all letters have been filled
    const allFilled = uniqueCipherLetters.every(cipherLetter => userGuesses[cipherLetter])
    
    if (!allFilled) {
      alert("Please fill out all the boxes before checking your answer!")
      return
    }
    
    // Check if all are correct
    const allCorrect = uniqueCipherLetters.every(cipherLetter => {
      const originalLetter = Object.keys(cipherMapping).find(key => cipherMapping[key] === cipherLetter)
      return userGuesses[cipherLetter] === originalLetter
    })
    
    if (allCorrect) {
      setShowSuccessModal(true)
    } else {
      alert("Your answer is incorrect. Keep working on it!")
    }
  }

  // Reveal the complete answer
  const revealAnswer = () => {
    if (!currentQuote || !cipherMapping) return
    
    const correctGuesses = {}
    Object.keys(cipherMapping).forEach(originalLetter => {
      const cipherLetter = cipherMapping[originalLetter]
      correctGuesses[cipherLetter] = originalLetter
    })
    
    setUserGuesses(correctGuesses)
    setShowAnswer(true)
    setCheckResult(null)
  }

  // Render the cipher puzzle
  const renderCipherPuzzle = () => {
    if (!currentQuote) return null

    const words = currentQuote.cipherText.split(' ')
    
    return (
      <div className="cipher-puzzle">
        {words.map((word, wordIndex) => (
          <div key={wordIndex} className="cipher-word">
            {word.split('').map((char, charIndex) => {
              if (/[A-Z]/.test(char)) {
                const correctLetter = Object.keys(cipherMapping).find(key => cipherMapping[key] === char)
                const userGuess = userGuesses[char]
                const isCorrect = userGuess === correctLetter
                const isIncorrect = userGuess && !isCorrect
                
                return (
                  <div key={charIndex} className="cipher-letter-container">
                    <div className="cipher-letter">{char}</div>
                    <div className="frequency-number">
                      {letterFrequencies[char] || 0}
                    </div>
                    <input
                      type="text"
                      maxLength="1"
                      className={`guess-input ${assistedFill && isCorrect ? 'correct' : ''} ${assistedFill && isIncorrect ? 'incorrect' : ''} ${showAnswer ? 'revealed' : ''}`}
                      value={userGuesses[char] || ''}
                      onChange={(e) => handleLetterGuess(char, e.target.value)}
                      placeholder=""
                      disabled={showAnswer}
                    />
                  </div>
                )
              } else {
                // Punctuation - display as is with no input box
                return (
                  <div key={charIndex} className="cipher-punctuation">
                    {char}
                  </div>
                )
              }
            })}
          </div>
        ))}
      </div>
    )
  }

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !currentQuote) return null

    return (
      <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
        <div className="success-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🎉 Congratulations!</h2>
            <button className="close-btn" onClick={() => setShowSuccessModal(false)}>×</button>
          </div>
          <div className="modal-content">
            <p className="success-text">You solved the cipher perfectly!</p>
            <div className="revealed-quote">
              <p className="quote-text">"{currentQuote.original}"</p>
              <p className="quote-author">— {currentQuote.author}</p>
            </div>
            <div className="modal-actions">
              <button className="next-puzzle-btn" onClick={() => {
                setShowSuccessModal(false)
                loadNewQuote()
              }}>
                Next Puzzle
              </button>
              <button className="close-modal-btn" onClick={() => setShowSuccessModal(false)}>
                Stay Here
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  useEffect(() => {
    if (availableQuotes.length > 0) {
      loadNewQuote()
    }
  }, [availableQuotes])

  if (loading) {
    return (
      <div className={`aristocrat-cipher ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner-large">🔐</div>
          <p>Loading cipher puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`aristocrat-cipher ${theme}`}>
      <div className="cipher-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <h1 className="cipher-title">Aristocrat Cipher 🔤</h1>
      </div>

      <div className="cipher-content">
        {currentQuote && (
          <>
            <div className="puzzle-layout">
              {/* Main puzzle area */}
              <div className="puzzle-area">
                <div className="puzzle-container">
                  {renderCipherPuzzle()}
                </div>

                {/* Check result under puzzle */}
                {checkResult && (
                  <div className="check-result-main">
                    <h3 className="result-title">Hint Check Results</h3>
                    <div className="result-stats">
                      <div className="stat">
                        <span className="stat-value">{checkResult.accuracy}%</span>
                        <span className="stat-label">Accuracy</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{checkResult.correctGuesses}/{checkResult.totalGuesses}</span>
                        <span className="stat-label">Correct</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{checkResult.totalLetters - checkResult.totalGuesses}</span>
                        <span className="stat-label">Remaining</span>
                      </div>
                    </div>
                    {checkResult.incorrectLetters.length > 0 && (
                      <div className="incorrect-letters">
                        <h4>Incorrect Guesses:</h4>
                        <div className="incorrect-list">
                          {checkResult.incorrectLetters.map((item, index) => (
                            <div key={index} className="incorrect-item">
                              <span className="cipher-char">{item.cipher}</span>
                              <span className="guessed-char wrong">{item.guessed}</span>
                              <span className="correct-char">→ {item.correct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar with controls */}
              <div className="control-sidebar">
                <div className="sidebar-container">
                  <h3 className="sidebar-main-title">Game Controls</h3>
                  
                  <div className="control-buttons">
                    <button onClick={loadNewQuote} className="new-puzzle-btn">
                      🔄 New Puzzle
                    </button>
                    <button 
                      onClick={hintCheck} 
                      className="hint-check-btn"
                      disabled={Object.keys(userGuesses).length === 0 || showAnswer}
                    >
                      💡 Hint Check
                    </button>
                    <button 
                      onClick={checkAnswer} 
                      className="check-answer-btn"
                      disabled={showAnswer}
                    >
                      ✅ Check Answer
                    </button>
                    <button 
                      onClick={revealAnswer} 
                      className="reveal-answer-btn"
                      disabled={showAnswer}
                    >
                      👁️ Reveal Answer
                    </button>
                  </div>

                  <div className="sidebar-divider"></div>
                  
                  <div className="toggle-container">
                    <span className="toggle-label">Assisted Fill</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={assistedFill}
                        onChange={(e) => setAssistedFill(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="sidebar-divider"></div>

                  <div className="author-container">
                    <span className="author-label">Author</span>
                    <span className="author-name">{currentQuote.author}</span>
                  </div>

                  <div className="sidebar-divider"></div>

                  <div className="instructions">
                    <h4 className="instructions-title">How to Play:</h4>
                    <ul>
                      <li>Each cipher letter = one alphabet letter</li>
                      <li>Numbers show letter frequency</li>
                      <li>Type guesses in boxes below</li>
                      <li>Use patterns and frequency analysis</li>
                      <li><strong>Hint:</strong> Check partial progress</li>
                      <li><strong>Check:</strong> Verify complete solution</li>
                      <li><strong>Assisted:</strong> See correct/incorrect</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Status messages */}
            <div className="status-messages">
              {isPuzzleSolved() && !showAnswer && (
                <div className="success-message">
                  🎉 Puzzle Solved! Great work!
                </div>
              )}
              {showAnswer && (
                <div className="revealed-message">
                  📖 Answer Revealed
                </div>
              )}
            </div>
          </>
        )}
        <SuccessModal />
      </div>
    </div>
  )
}

export default AristocratCipher
