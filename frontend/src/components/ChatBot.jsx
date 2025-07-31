import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'

function ChatBot({ user, profile, onBack, theme }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm SciBot, your Science Olympiad study companion! 🤖🔬 Ask me anything about science topics, competition strategies, or study tips!",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai-api-key') || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai-api-key', apiKey.trim())
      setShowApiKeyInput(false)
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem('openai-api-key')
    setApiKey('')
    setShowApiKeyInput(true)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    if (!apiKey) {
      setShowApiKeyInput(true)
      return
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using the latest, most cost-effective model
          messages: [
            {
              role: 'system',
              content: `You are SciBot, a helpful Science Olympiad study assistant. You specialize in helping students with:
              - Science Olympiad events and competitions
              - Physics, Chemistry, Biology, Earth Science concepts
              - Study strategies and test-taking tips
              - Laboratory techniques and safety
              - Scientific problem-solving
              
              Keep responses helpful, engaging, and appropriate for high school students. Use emojis occasionally to make it fun! Always encourage scientific curiosity and learning.`
            },
            {
              role: 'user',
              content: userMessage.text
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const botResponse = data.choices[0]?.message?.content || "Sorry, I couldn't process that request."

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      
      let errorMessage = "Sorry, I'm having trouble connecting right now. "
      
      if (error.message.includes('401')) {
        errorMessage += "Please check your API key."
        setShowApiKeyInput(true)
      } else if (error.message.includes('429')) {
        errorMessage += "Rate limit exceeded. Please try again in a moment."
      } else {
        errorMessage += "Please try again later."
      }

      const errorBotMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorBotMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Chat cleared! How can I help you with Science Olympiad today? 🧪",
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <button onClick={onBack} className="back-btn">← Back to Hub</button>
        <div className="header-content">
          <h1 className="chatbot-title">SciBot Assistant 🤖</h1>
          <div className="header-actions">
            <button onClick={clearChat} className="clear-chat-btn" title="Clear Chat">
              🗑️
            </button>
            <button 
              onClick={() => setShowApiKeyInput(!showApiKeyInput)} 
              className="api-key-btn"
              title="API Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {showApiKeyInput && (
        <div className="api-key-section">
          <div className="api-key-info">
            <h3>🔑 OpenAI API Key Required</h3>
            <p>To use SciBot, you need an OpenAI API key. Get one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></p>
          </div>
          <div className="api-key-input">
            <input
              type="password"
              placeholder="Enter your OpenAI API key (sk-...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="api-input"
            />
            <div className="api-actions">
              <button onClick={saveApiKey} className="save-key-btn">Save Key</button>
              {apiKey && (
                <button onClick={clearApiKey} className="clear-key-btn">Clear Key</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-section">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={apiKey ? "Ask SciBot about Science Olympiad..." : "Please set your API key first"}
            className="chat-input"
            rows="1"
            disabled={!apiKey || isLoading}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || !apiKey || isLoading}
            className="send-btn"
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
        
        <div className="input-tips">
          <span>💡 Try asking: "Explain Newton's laws" or "Tips for Chemistry Lab event"</span>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
