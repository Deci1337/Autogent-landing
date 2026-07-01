import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const AGENT_URL = import.meta.env.VITE_AGENT_URL || '';

function BotAvatar() {
  return (
    <div className="shrink-0 h-7 w-7 rounded-full bg-orange/15 ring-1 ring-orange/30 grid place-items-center">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
          fill="#FF6A00" opacity="0"/>
        <circle cx="12" cy="12" r="10" stroke="#FF6A00" strokeWidth="1.5"/>
        <path d="M8 12h8M12 8v8" stroke="#FF6A00" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/30"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && <BotAvatar />}
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[0.875rem] leading-relaxed ${
        isBot
          ? 'rounded-tl-sm bg-white/80 text-ink shadow-sm ring-1 ring-ink/[0.06]'
          : 'rounded-tr-sm bg-orange text-white'
      }`}>
        {msg.content}
      </div>
    </motion.div>
  );
}

function BudgetChips({ onSelect }) {
  const opts = ['до 50 000 ₽', '50–100 000 ₽', '150–300 000 ₽', '300 000 ₽+', 'Не знаю'];
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-1.5 pt-1">
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => onSelect(o)}
          className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[12px] font-medium text-ink/65 transition-all hover:border-orange/40 hover:bg-orange/5 hover:text-ink">
          {o}
        </button>
      ))}
    </motion.div>
  );
}

function ContactSuccess({ contact }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-orange/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#FF6A00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="mt-3 font-display text-[1.1rem] font-bold text-ink">Отлично, спасибо!</p>
      <p className="mt-1.5 max-w-[220px] text-[13px] leading-relaxed text-ink/55">
        Команда свяжется в течение рабочего дня и согласует время аудита.
      </p>
      {contact && (
        <div className="mt-3 rounded-lg bg-orange/[0.07] px-3 py-2 text-[12px] text-ink/50">
          Контакт: <span className="font-semibold text-ink/70">{contact}</span>
        </div>
      )}
    </motion.div>
  );
}

function genSessionId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export default function LeadChat() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [contact, setContact]     = useState('');
  const [showBudget, setShowBudget] = useState(false);
  const [error, setError]         = useState('');
  const sessionId = useRef(genSessionId());
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollBottom(); }, [messages, loading]);

  // Приветственное сообщение агента при монтировании
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: 'Привет! Я помогу разобраться, как ИИ может сэкономить деньги именно в вашем бизнесе. Расскажите — чем занимается ваша компания и что продаёте? Чем подробнее, тем точнее будет анализ.'
    }]);
  }, []);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading || done) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setShowBudget(false);
    setError('');
    setLoading(true);

    try {
      if (!AGENT_URL) {
        // Режим заглушки — агент не подключён
        await new Promise((r) => setTimeout(r, 800));
        setMessages((p) => [...p, {
          role: 'assistant',
          content: 'Агент пока настраивается. Оставьте контакт — мы свяжемся с вами в ближайший рабочий день.'
        }]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: trimmed,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = { role: 'assistant', content: data.reply };
      setMessages((p) => [...p, reply]);

      // Флаг от бэкенда — сбор бюджетных вариантов
      if (data.show_budget) setShowBudget(true);

      // Флаг — диалог завершён, контакт получен
      if (data.done) {
        setContact(data.contact || '');
        setDone(true);
      }
    } catch (e) {
      if (e.name === 'TimeoutError') {
        setError('Время ожидания истекло. Попробуйте ещё раз.');
      } else {
        setError('Что-то пошло не так. Попробуйте повторить.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [loading, done]);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  if (done) return <ContactSuccess contact={contact} />;

  return (
    <div className="flex flex-col" style={{ height: '420px' }}>
      {/* Шапка */}
      <div className="mb-3 flex items-center gap-2.5 border-b border-ink/[0.07] pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange/10 ring-1 ring-orange/20">
          <span className="text-[11px] font-bold text-orange">AI</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">Autogent AI</p>
          <p className="text-[11px] text-ink/40">Квалификация за 2 минуты</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          онлайн
        </span>
      </div>

      {/* Лента сообщений */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => <Message key={i} msg={m} />)}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
            <BotAvatar />
            <div className="rounded-2xl rounded-tl-sm bg-white/80 px-3.5 py-2.5 ring-1 ring-ink/[0.06] shadow-sm">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {showBudget && !loading && (
          <BudgetChips onSelect={(v) => send(v)} />
        )}

        {error && (
          <p className="text-center text-[12px] text-orange2">{error}
            <button className="ml-2 underline" onClick={() => setError('')}>ок</button>
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Поле ввода */}
      <div className="mt-3 flex gap-2 border-t border-ink/[0.07] pt-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading || done}
          placeholder="Напишите сообщение..."
          rows={1}
          maxLength={500}
          className="flex-1 resize-none rounded-xl border border-ink/15 bg-white/80 px-3.5 py-2.5 text-[0.875rem] text-ink placeholder:text-ink/30 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 disabled:opacity-40"
          style={{ maxHeight: '96px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
          }}
        />
        <button
          type="button"
          disabled={!input.trim() || loading || done}
          onClick={() => send(input)}
          className="shrink-0 grid h-[42px] w-[42px] place-items-center rounded-xl bg-orange transition-all hover:bg-orange2 disabled:opacity-30 disabled:cursor-not-allowed self-end"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10.5px] text-ink/25 leading-snug">
        Продолжая, вы соглашаетесь с{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink/40">политикой обработки ПД</a>
      </p>
    </div>
  );
}
