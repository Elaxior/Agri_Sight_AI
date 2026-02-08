import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';
import { getLocalAIResponse, getWelcomeMessage, getQuickQuestions } from '../utils/localAI';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && !isInitialized) {
      loadWelcomeMessage();
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  const loadWelcomeMessage = () => {
    setMessages([{
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date().toISOString()
    }]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Add user message to UI
    setMessages(prev => [...prev, userMessage]);
    const question = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Simulate thinking delay for better UX
    setTimeout(() => {
      const aiResponse = getLocalAIResponse(question);
      
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 500); // Small delay to simulate processing
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([]);
    setIsInitialized(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatbot-container">
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        title="AI Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
        {!isOpen && <span className="chat-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-status-indicator"></div>
              <div>
                <h3>🤖 AgriDrone AI Assistant</h3>
                <p>Local AI Knowledge Base</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button 
                onClick={clearChat} 
                className="chat-action-btn"
                title="Clear conversation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <button 
                onClick={toggleChat} 
                className="chat-action-btn"
                title="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && !isLoading && (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">🤖</div>
                <p>Loading assistant...</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`chat-message ${message.role} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-text typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-container" onSubmit={sendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about diseases, ROI, usage, troubleshooting..."
              className="chat-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={isLoading || !inputMessage.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>

          {/* Quick Actions */}
          <div className="chat-quick-actions">
            {getQuickQuestions().slice(0, 4).map((question, index) => (
              <button 
                key={index}
                onClick={() => setInputMessage(question)}
                className="quick-action-btn"
                title={question}
              >
                {question.split(' ').slice(0, 3).join(' ')}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
