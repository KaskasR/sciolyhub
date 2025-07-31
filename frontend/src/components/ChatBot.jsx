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
  const [connectionError, setConnectionError] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Backend API URL - adjust this for production
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setConnectionError(false)

    try {
      // Get conversation history for context (last 5 messages)
      const conversationHistory = messages
        .slice(-5)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          conversation: conversationHistory
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      const botResponse = data.response || "Sorry, I couldn't process that request."

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      console.error('Error calling backend API:', error)
      
      let errorMessage = "Sorry, I'm having trouble connecting right now. "
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage += "Unable to connect to the server. Please make sure the backend is running."
        setConnectionError(true)
      } else if (error.message.includes('quota exceeded')) {
        errorMessage += "Service temporarily unavailable due to high usage. Please try again later."
      } else if (error.message.includes('rate_limit_exceeded')) {
        errorMessage += "Too many requests. Please wait a moment and try again."
      } else {
        errorMessage += error.message || "Please try again later."
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
            {connectionError && (
              <div className="connection-status error" title="Backend connection issue">
                ⚠️
              </div>
            )}
          </div>
        </div>
      </div>

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
            placeholder="Ask SciBot about Science Olympiad..."
            className="chat-input"
            rows="1"
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
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
