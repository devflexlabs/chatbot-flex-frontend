'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, MessageSquareText, BarChart2, FileText, HelpCircle, Sun, Moon, ChevronDown, ExternalLink, Menu } from 'lucide-react';
import { Send } from 'lucide-react';

const PY_API_BASE = 'https://backeend-ia-cu-production.up.railway.app';

export default function Page() {
  const [messages, setMessages] = useState([]); // { sender: 'user' | 'bot', content: string }
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomTextareaRef = useRef(null);
  const heroTextareaRef = useRef(null);
  const isInitial = messages.length === 0;

  const initialTitle = useMemo(() => {
    const options = [
      'Em que posso ajudar?',
      'Por onde devemos começar?',
      'O que você precisa hoje?',
      'Qual é sua dúvida agora?',
      'Vamos começar?'
    ];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  // auto-scroll quando já há mensagens
  const endRef = useRef(null);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (messages.length > 0) scrollToBottom(); }, [messages, isLoading]);

  function addMessage(sender, content) {
    setMessages(prev => [...prev, { sender, content }]);
  }

  const placeholder = 'Digite sua mensagem (Shift+Enter quebra linha, Enter envia)';

  async function sendMessage(explicit) {
    if (isLoading) return;
    const text = (explicit ?? inputValue).trim();
    if (!text) return;

    setInputValue('');
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
      // reset altura
      const reset = (el) => { if (el) { el.style.height = '48px'; el.style.overflowY = 'hidden'; }};
      reset(bottomTextareaRef.current);
      reset(heroTextareaRef.current);
    }
  }

  // Microfone removido a pedido do usuário

  // autosize textarea
  function autoResize(el) {
    if (!el) return;
    const max = 240;
    el.style.height = 'auto';
    const h = Math.min(max, el.scrollHeight);
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }
  function onChangeTextarea(e) { setInputValue(e.target.value); autoResize(e.target); }

  // formatadores de resposta da IA
  function parseClientsFromText(text) {
    if (!text || typeof text !== 'string') return null;
    // procura blocos numerados: "1. Nome: ..." até linha em branco
    const lines = text.split(/\r?\n/);
    const items = [];
    let current = null;
    const pushCurrent = () => { if (current) { items.push(current); current = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      const startMatch = line.match(/^(\d+)\.\s*Nome:\s*(.+)$/i);
      if (startMatch) {
        pushCurrent();
        current = { nome: startMatch[2].trim(), email: '', telefone: '', valor: '' };
        continue;
      }
      if (!current) continue;
      const emailMatch = line.match(/^Email:\s*(.+)$/i);
      if (emailMatch) { current.email = emailMatch[1].trim(); continue; }
      const telMatch = line.match(/^Telefone:\s*(.+)$/i);
      if (telMatch) { current.telefone = telMatch[1].trim(); continue; }
      const valorMatch = line.match(/^Valor da D[íi]vida:\s*(.+)$/i);
      if (valorMatch) { current.valor = valorMatch[1].trim(); continue; }
    }
    pushCurrent();
    return items.length > 0 ? items : null;
  }

  function parseBanksFromText(text) {
    if (!text || typeof text !== 'string') return null;
    const lines = text.split(/\r?\n/);
    const items = [];
    for (const raw of lines) {
      const match = raw.trim().match(/^(\d+)\.\s*Banco:\s*(.+?)\s+[—-]\s+Contratos:\s*(\d+)/i);
      if (match) {
        items.push({ numero: match[1], banco: match[2].trim(), contratos: match[3].trim() });
      }
    }
    return items.length > 0 ? items : null;
  }
  
  function renderMessageContent(message) {
    if (message.sender === 'bot') {
      // clientes
      const clients = parseClientsFromText(message.content);
      if (clients) {
        return (
          <div className="text-[14px] leading-6">
            <div className="font-semibold mb-2">Resultados</div>
            <ul className="m-0 pl-4 list-disc">
              {clients.map((c, idx) => (
                <li key={idx} className="mb-2">
                  <div><span className="font-medium">Nome:</span> {c.nome || '—'}</div>
                  <div><span className="font-medium">Email:</span> {c.email || '—'}</div>
                  <div><span className="font-medium">Telefone:</span> {c.telefone || '—'}</div>
                  <div><span className="font-medium">Valor:</span> {c.valor || '—'}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      }
  
      // bancos
      const banks = parseBanksFromText(message.content);
      if (banks) {
        return (
          <div className="text-[14px] leading-6">
            <div className="font-semibold mb-2">Top Bancos</div>
            <ol className="m-0 pl-5 list-decimal">
              {banks.map((b) => (
                <li key={b.numero} className="mb-2">
                  <div><span className="font-medium">Banco:</span> {b.banco}</div>
                  <div><span className="font-medium">Contratos:</span> {b.contratos}</div>
                </li>
              ))}
            </ol>
          </div>
        );
      }
    }
  
    return message.content;
  }  

  // theme helpers
  const isDarkTheme = () => typeof document !== 'undefined' && document.documentElement.classList.contains('theme-dark');
  function toggleTheme() {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const nowDark = html.classList.toggle('theme-dark');
    try { localStorage.setItem('theme', nowDark ? 'dark' : 'light'); } catch {}
  }
  useEffect(() => {
    // hydrate theme from storage
    if (typeof document === 'undefined') return;
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.documentElement.classList.add('theme-dark');
    } catch {}
  }, []);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] flex justify-center items-center">
      <div className="w-full min-h-screen bg-[var(--bg)] flex flex-col">
        {/* Fixed hamburger dropdown (outside chat, top-left) */}
        <div className="fixed top-3 left-3 z-50">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--stroke)] bg-[var(--card)] hover:bg-[color-mix(in_oklab,var(--card) 90%,black 10%)] hover:opacity-80 cursor-pointer text-[var(--text)] shadow-sm"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute left-0 mt-2 w-max min-w-[260px] rounded-lg border border-[var(--stroke)] bg-[var(--card)] shadow-2xl p-2">
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[color-mix(in_oklab,var(--card) 80%,black 20%)] hover:opacity-80 cursor-pointer text-[var(--text)] text-base font-medium"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setMenuOpen(false);
                    if (typeof window !== 'undefined') window.open('https://cadastro-unico.grupoflex.com.br/', '_blank', 'noopener,noreferrer');
                  }}
                >
                  <span className="whitespace-nowrap">Ir para o Cadastro Único</span>
                  <ExternalLink size={18} className="ml-auto opacity-70 flex-shrink-0" />
                </button>
                <button
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[color-mix(in_oklab,var(--card) 80%,black 20%)] hover:opacity-80 cursor-pointer text-[var(--text)] text-base font-medium"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                >
                  {isDarkTheme() ? <Sun size={20} /> : <Moon size={20} />}
                  <span>Mudar tema</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Área de mensagens */}
        <div className={`chat-scroll flex-1 bg-[var(--bg)] ${isInitial ? 'flex items-center justify-center overflow-hidden min-h-[calc(100vh-88px)]' : 'pb-[200px]'}`}>
          <div className={`w-full mx-auto px-4 ${isInitial ? '' : 'max-w-[980px]'}`}>
            {isInitial && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} className="flex flex-col items-center gap-5">
                <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[var(--text)] text-4xl font-bold text-center m-0 tracking-tight">{initialTitle}</motion.h1>
                <div className="w-full max-w-[980px] flex justify-center mt-3 mb-1">
                  <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--card)] text-[var(--text)] p-3 w-full overflow-hidden">
                    <textarea
                      ref={heroTextareaRef}
                      placeholder={placeholder}
                      value={inputValue}
                      onChange={onChangeTextarea}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isLoading) sendMessage(); }}}
                      rows={1}
                      className="flex-1 bg-transparent outline-none resize-none text-[15px] leading-6 h-auto min-h-[52px] max-h-60 overflow-hidden pr-14 break-words px-4 py-3"
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={() => sendMessage()}
                        title="Enviar"
                        aria-label="Enviar"
                        disabled={!inputValue.trim() || isLoading}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border border-[var(--stroke)] ${!inputValue.trim() || isLoading ? 'bg-[var(--card)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--card)] hover:bg-[color-mix(in_oklab,var(--card) 70%,black 30%)] hover:opacity-80 cursor-pointer text-[var(--text)] shadow-sm'}`}
                      >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                      
                    </div>
                  </div>
                </div>
                
                <div className="w-full max-w-[980px] mx-auto mt-1 mb-4">
                  <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)]/70 shadow-[0_10px_24px_rgba(0,0,0,0.06)] p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color-mix(in_oklab,var(--primary) 15%,transparent)] text-[var(--primary)]">
                        <Sparkles size={16} />
                      </span>
                      <span className="font-semibold">Sugestões (Cadastro Único • Financeiro)</span>
                    </div>
                    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-start gap-3 p-4 bg-[var(--card)] border border-[var(--stroke)] rounded-xl text-left text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--card) 85%,black 15%)] hover:shadow-md shadow-sm transition cursor-pointer" onClick={() => sendMessage('Liste os clientes com parcelas em atraso acima de 60 dias, agrupados por banco e produto.') }>
                      <BarChart2 size={24} /><div className="text-[13.5px] leading-5">Clientes com atraso {'>'} 60 dias por banco e produto</div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-start gap-3 p-4 bg-[var(--card)] border border-[var(--stroke)] rounded-xl text-left text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--card) 85%,black 15%)] hover:shadow-md shadow-sm transition cursor-pointer" onClick={() => sendMessage('Quais são os top 5 bancos com maior volume de contratos de financiamento veicular ativos?') }>
                      <MessageSquareText size={24} /><div className="text-[13.5px] leading-5">Top 5 bancos por contratos de veículo ativos</div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-start gap-3 p-4 bg-[var(--card)] border border-[var(--stroke)] rounded-xl text-left text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--card) 85%,black 15%)] hover:shadow-md shadow-sm transition cursor-pointer" onClick={() => sendMessage('Mostre o ticket médio por produto (financiamento veicular, empréstimo consignado, não consignado) nos últimos 90 dias.') }>
                      <FileText size={24} /><div className="text-[13.5px] leading-5">Ticket médio por produto nos últimos 90 dias</div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-start gap-3 p-4 bg-[var(--card)] border border-[var(--stroke)] rounded-xl text-left text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--card) 85%,black 15%)] hover:shadow-md shadow-sm transition cursor-pointer" onClick={() => sendMessage('Apresente casos abertos por banco, destacando status e SLA estimado de resolução.') }>
                      <HelpCircle size={24} /><div className="text-[13.5px] leading-5">Casos abertos por banco com status e SLA</div>
                    </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const isUser = m.sender === 'user';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: .18 }} className="flex justify-center py-1">
                  <div className={`flex items-start gap-2 w-full mx-auto px-4 ${messages.length > 0 ? 'max-w-[980px]' : ''}`}>
                    <div className={`p-4 rounded-xl border break-words text-[14px] leading-7 max-w-[85%] ${isUser ? 'bg-[color-mix(in_oklab,var(--card) 30%,black 70%)] text-[var(--text)] border-[var(--stroke)] max-w-[60%] ml-auto' : 'bg-transparent text-[var(--text)] border-0 max-w-[72%] mr-auto'}`}>
                      {renderMessageContent(m)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-1">
                <div className="flex items-center gap-2 w-full mx-auto px-4 max-w-[980px]">
                  <div className="flex items-center gap-2 p-3 bg-[var(--card)] border border-[var(--stroke)] rounded-xl max-w-[60%] mr-auto">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="ml-2 text-sm text-[var(--text-muted)]">Pensando...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input fixo no rodapé somente após a 1ª mensagem */}
        {messages.length > 0 && (
          <div className="fixed left-0 right-0 bottom-0 z-50 bg-[var(--bg)] border-t border-[var(--stroke)] shadow-[0_-12px_22px_rgba(0,0,0,0.28)] py-3">
            <div className="w-full mx-auto px-4 max-w-[980px]">
              <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--card)] text-[var(--text)] p-3 w-full overflow-hidden">
                <textarea
                  ref={bottomTextareaRef}
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={onChangeTextarea}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isLoading) sendMessage(); }}}
                  rows={1}
                  className="flex-1 bg-transparent outline-none resize-none text-[15px] leading-6 h-auto min-h-[52px] max-h-60 overflow-hidden pr-14 break-words px-4 py-3"
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => sendMessage()}
                    title="Enviar"
                    aria-label="Enviar"
                    disabled={!inputValue.trim() || isLoading}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border border-[var(--stroke)] ${!inputValue.trim() || isLoading ? 'bg-[var(--card)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--card)] hover:bg-[color-mix(in_oklab,var(--card) 70%,black 30%)] text-[var(--text)] shadow-sm'}`}
                  >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

