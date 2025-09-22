'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Loader2
} from 'lucide-react';

const PY_API_BASE = 'http://127.0.0.1:5000';

export default function Page() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content:
        'Olá! Sou o Flequinho. Pode me perguntar qualquer coisa sobre os dados.\n\nComo posso ajudar você hoje?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Ref para o container de mensagens
  const messagesEndRef = useRef(null);

  // Função para rolar automaticamente para o final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rola automaticamente quando há mudanças nas mensagens ou loading
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  function addMessage(sender, content) {
    setMessages(prev => [...prev, { sender, content }]);
  }

  const placeholder = 'Digite sua mensagem e pressione Enter';

  async function sendMessage(explicit) {
    if (isLoading) return;
    const text = (explicit ?? inputValue).trim();
    if (!text) return;

    addMessage('user', text);
    setIsLoading(true);

    try {
      const res = await fetch(`${PY_API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();

      addMessage('bot', data?.response || 'Sem resposta.');
    } catch {
      addMessage('bot', 'Desculpe, ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={28} />
            FlexBot
          </h1>
          <p style={{ opacity: 0.9, fontSize: 14 }}>Converse com a IA</p>
        </div>

        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.message, justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...styles.avatar, ...(m.sender === 'user' ? styles.avatarUser : styles.avatarBot) }}>
                {m.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div style={{ ...styles.bubble, ...(m.sender === 'user' ? styles.bubbleUser : styles.bubbleBot) }}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={styles.typing}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>Processando...</span>
            </div>
          )}
          {/* Elemento invisível para rolagem automática */}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          {/* Campo de entrada simples */}
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) sendMessage();
              }}
              disabled={false}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 25,
                fontSize: 16,
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #203a43 0%, #2c5364 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 25,
                cursor: (isLoading) ? 'not-allowed' : 'pointer',
                opacity: (isLoading) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 900,
    height: '85vh',
    background: '#f7f9fc',
    borderRadius: 20,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    position: 'relative',
    background: 'linear-gradient(135deg, #203a43 0%, #2c5364 100%)',
    color: '#fff',
    padding: 20,
    textAlign: 'center',
  },
  messages: {
    flex: 1,
    padding: 20,
    overflowY: 'auto',
    background: '#e6ecf3',
  },
  message: {
    marginBottom: 15,
    display: 'flex',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    margin: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarUser: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  avatarBot: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#fff',
  },
  bubble: {
    maxWidth: '70%',
    padding: '14px 18px',
    borderRadius: 20,
    wordWrap: 'break-word',
    whiteSpace: 'pre-line',
    fontSize: 15,
    lineHeight: 1.5,
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #556cd6 0%, #6b46c1 100%)',
    color: '#fff',
    borderBottomRightRadius: 5,
  },
  bubbleBot: {
    background: '#f1f5f9',
    color: '#111',
    border: '1px solid #cbd5e1',
    borderBottomLeftRadius: 5,
  },
  typing: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 20,
    marginBottom: 15,
    maxWidth: '70%',
  },
  inputContainer: {
    padding: 20,
    background: '#fff',
    borderTop: '1px solid #d1d5db',
    position: 'sticky',
    bottom: 0,
    zIndex: 5,
  },
  inputWrapper: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    color: '#1e293b'
  },
};