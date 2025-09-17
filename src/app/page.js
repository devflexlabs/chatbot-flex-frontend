'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Bot,
  User,
  RefreshCw,
  Search,
  BarChart3,
  Trophy,
  Building2,
  MapPin,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  Send,
  Loader2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export default function Page() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content:
        'Olá! Sou seu assistente para análise da planilha de clientes.\n\n' +
        '• Buscar informações de clientes específicos\n' +
        '• Mostrar estatísticas gerais\n' +
        '• Analisar endereços e casos\n' +
        '• Fornecer análises contábeis\n\n' +
        'Como posso ajudar você hoje?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('Selecione uma opção acima para ativar o input');
  const [stats, setStats] = useState({});
  const [meta, setMeta] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

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

  useEffect(() => {
    loadStats();
    preloadMeta();
    const id = setInterval(loadStats, 30000);
    return () => clearInterval(id);
  }, []);

  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      const data = await res.json();
      setStats(data || {});
      if ((data?.totalClients || 0) === 0) {
        setTimeout(() => refreshData(true), 500);
      }
    } catch (e) {
      // silent
    }
  }

  async function preloadMeta() {
    try {
      const res = await fetch(`${API_BASE}/api/meta`);
      const data = await res.json();
      setMeta(data);
    } catch {
      // silent
    }
  }

  async function refreshData(silent = false) {
    try {
      if (!silent) addMessage('bot', 'Atualizando dados da planilha, por favor aguarde...');
      const res = await fetch(`${API_BASE}/api/refresh`);
      await res.json();
      if (!silent) addMessage('bot', 'Dados atualizados com sucesso.');
      loadStats();
    } catch {
      if (!silent) addMessage('bot', 'Falha ao atualizar dados. Tente novamente.');
    }
  }

  function addMessage(sender, content) {
    setMessages(prev => [...prev, { sender, content }]);
  }

  function enableInput(mode) {
    setInputEnabled(true);
    switch (mode) {
      case 'cliente':
        setPlaceholder('Ex.: Detalhes do cliente <Nome> | <email> | <CPF>');
        setInputValue('');
        break;
      case 'enderecos':
        setPlaceholder("Ex.: Endereços em <cidade/estado/bairro> | Endereço de <cliente>");
        setInputValue('Endereços em ');
        break;
      case 'casos_banco':
        setPlaceholder('Ex.: Casos do banco <nome do banco> acima de <valor>');
        setInputValue('Casos do banco');
        break;
      case 'casos_produto':
        setPlaceholder('Ex.: Casos do produto <nome do produto> acima de <valor>');
        setInputValue('Casos do produto  ');
        break;
      case 'casos_cliente':
        setPlaceholder('Ex.: Casos de <nome do cliente> no banco <banco> acima de <valor>');
        setInputValue('Casos de ');
        break;
      case 'casos_valor':
        setPlaceholder('Ex.: Casos acima de <valor> | Casos entre <min> e <max>');
        setInputValue('Casos acima de ');
        break;
      default:
        setPlaceholder('Digite sua pergunta e clique Enviar');
        setInputValue('');
    }
  }

  async function sendMessage(explicit) {
    if (isLoading) return;
    const text = (explicit ?? inputValue).trim();
    if (!text) return;

    addMessage('user', text);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      addMessage('bot', data?.answer || 'Sem resposta.');
      if (data?.type === 'statistics') {
        loadStats();
      }
    } catch {
      addMessage('bot', 'Desculpe, ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
      setInputValue('');
      setInputEnabled(false);
      setPlaceholder('Selecione uma opção acima para ativar o input');
    }
  }

  const topChips = useMemo(() => {
    const banks = meta?.banks?.slice(0, 6) ?? [];
    const products = meta?.products?.slice(0, 6) ?? [];
    return { banks, products };
  }, [meta]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.status} />
          <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={28} />
            FlexBot
          </h1>
          <p style={{ opacity: 0.9, fontSize: 14 }}>Faça perguntas sobre clientes do Cadastro Único</p>
          <div style={{ position: 'absolute', top: 16, left: 20 }}>
            <button onClick={() => refreshData()} style={styles.refreshBtn}>
              <RefreshCw size={16} style={{ marginRight: 6 }} />
              Atualizar dados
            </button>
          </div>
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
          <div style={styles.suggestionsRow}>
            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'cliente' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'cliente' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                enableInput('cliente');
                setSelectedOption('cliente');
              }}
            >
              <Search size={16} style={{ marginRight: 6 }} />
              Buscar cliente
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'estatisticas' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'estatisticas' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                sendMessage('Quantos clientes temos no total?');
                setSelectedOption('estatisticas');
              }}
            >
              <BarChart3 size={16} style={{ marginRight: 6 }} />
              Estatísticas
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'top_produtos' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'top_produtos' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                sendMessage('Quais são os produtos mais comuns?');
                setSelectedOption('top_produtos');
              }}
            >
              <Trophy size={16} style={{ marginRight: 6 }} />
              Top produtos
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'top_bancos' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'top_bancos' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                sendMessage('Quais bancos mais comuns?');
                setSelectedOption('top_bancos');
              }}
            >
              <Building2 size={16} style={{ marginRight: 6 }} />
              Top bancos
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'enderecos' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'enderecos' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                enableInput('enderecos');
                setSelectedOption('enderecos');
              }}
            >
              <MapPin size={16} style={{ marginRight: 6 }} />
              Endereços
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'casos_banco' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'casos_banco' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                enableInput('casos_banco');
                setSelectedOption('casos_banco');
              }}
            >
              <Building2 size={16} style={{ marginRight: 6 }} />
              Casos por banco
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'casos_produto' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'casos_produto' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                enableInput('casos_produto');
                setSelectedOption('casos_produto');
              }}
            >
              <CreditCard size={16} style={{ marginRight: 6 }} />
              Casos por produto
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'casos_cliente' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'casos_cliente' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                enableInput('casos_cliente');
                setSelectedOption('casos_cliente');
              }}
            >
              <FileText size={16} style={{ marginRight: 6 }} />
              Casos por cliente
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'casos_valor' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'casos_valor' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                enableInput('casos_valor');
                setSelectedOption('casos_valor');
              }}
            >
              <DollarSign size={16} style={{ marginRight: 6 }} />
              Casos por valor
            </button>

            <button
              style={{
                ...styles.suggestion,
                background: selectedOption === 'analise_contabil' ? '#3b82f6' : '#eef2ff',
                color: selectedOption === 'analise_contabil' ? '#fff' : '#1e293b',
              }}
              onClick={() => {
                sendMessage('Mostre informações sobre análise contábil');
                setSelectedOption('analise_contabil');
              }}
            >
              <TrendingUp size={16} style={{ marginRight: 6 }} />
              Análise contábil
            </button>
          </div>

          {(inputEnabled && (placeholder.includes('banco') || placeholder.includes('produto'))) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 4px' }}>
              {placeholder.includes('banco') &&
                topChips.banks.map((b) => {
                  const isSelected = selectedChip === b;
                  return (
                    <button
                      key={b}
                      style={{
                        ...styles.chip,
                        background: isSelected ? '#3b82f6' : '#dbeafe',
                        color: isSelected ? '#fff' : '#1e293b',
                      }}
                      onClick={() => {
                        setInputValue(`Casos do banco ${b} `);
                        setSelectedChip(b); // marca como selecionado
                      }}
                    >
                      {b}
                    </button>
                  );
                })}
              {placeholder.includes('produto') &&
                topChips.products.map((p) => {
                  const isSelected = selectedChip === p;
                  return (
                    <button
                      key={p}
                      style={{
                        ...styles.chip,
                        background: isSelected ? '#3b82f6' : '#dbeafe',
                        color: isSelected ? '#fff' : '#1e293b',
                      }}
                      onClick={() => {
                        setInputValue(`Casos do produto ${p} `);
                        setSelectedChip(p);
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
            </div>
          )}

          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) sendMessage();
              }}
              disabled={!inputEnabled}
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
              disabled={!inputEnabled || isLoading}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #203a43 0%, #2c5364 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 25,
                cursor: (!inputEnabled || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (!inputEnabled || isLoading) ? 0.6 : 1,
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

        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.totalClients ?? '-'}</div>
            <div>Clientes</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.totalAddresses ?? '-'}</div>
            <div>Endereços</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.totalCases ?? '-'}</div>
            <div>Casos</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>
              {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </div>
            <div>Atualizado</div>
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
  status: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#4CAF50',
    animation: 'pulse 2s infinite',
  },
  refreshBtn: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    background: '#ffffff33',
    color: '#fff',
    fontWeight: 500,
    backdropFilter: 'blur(4px)',
    transition: '0.2s',
    display: 'flex',
    alignItems: 'center',
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
  suggestionsRow: {
    position: 'sticky',
    top: 0,
    background: '#fff',
    paddingBottom: 10,
    borderBottom: '1px solid #eee',
    zIndex: 4,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  suggestion: {
    padding: '8px 14px',
    background: '#eef2ff',
    border: '1px solid #3b82f6',
    borderRadius: 18,
    cursor: 'pointer',
    fontSize: 14,
    transition: '0.2s',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
  },
  chip: {
    padding: '6px 10px',
    background: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 12,
    color: '#1e293b',
  },
  inputWrapper: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    color: '#1e293b'
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 20px',
    background: '#f0f4f8',
    borderTop: '1px solid #d1d5db',
    fontSize: 13,
    color: '#475569',
  },
  statItem: { textAlign: 'center' },
  statNumber: { fontWeight: 'bold', color: '#3b82f6', fontSize: 16 },
};