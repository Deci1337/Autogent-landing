import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const AGENT_URL = import.meta.env.VITE_AGENT_URL || '';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/25"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.875rem] leading-relaxed ${
        isBot
          ? 'rounded-tl-sm bg-white text-ink shadow-sm ring-1 ring-black/[0.05]'
          : 'rounded-tr-sm bg-orange text-white'
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

function BudgetChips({ onSelect }) {
  const opts = ['до 50 000 ₽', '50–100 000 ₽', '150–300 000 ₽', '300 000 ₽+', 'Не знаю'];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => onSelect(o)}
          className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-[12px] font-medium text-ink/60 transition-all hover:border-orange/50 hover:text-orange">
          {o}
        </button>
      ))}
    </div>
  );
}

function genSessionId() {
  return (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));
}

export default function LeadChat() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [contact, setContact]       = useState('');
  const [showBudget, setShowBudget] = useState(false);
  const [error, setError]           = useState('');

  const sessionId  = useRef(genSessionId());
  const listRef    = useRef(null);   // контейнер сообщений — скроллим только его
  const inputRef   = useRef(null);
  const textareaRef = useRef(null);

  // Скроллим ТОЛЬКО внутренний контейнер, не страницу
  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, showBudget]);

  // Приветствие — три сообщения с печатающим индикатором между ними
  useEffect(() => {
    const msgs = [
      'Привет! Я задам несколько вопросов о вашем бизнесе.',
      'Это нужно, чтобы мы заранее подготовили конкретные процессы и цифры экономии до звонка с вами. Так 25 минут аудита будут максимально полезны.',
      'Для начала: чем занимается ваша компания и что продаёте? Чем подробнее — тем точнее будет анализ.',
    ];

    const timers = [];

    // msg 1: сразу печатаем → показываем
    setLoading(true);
    timers.push(setTimeout(() => {
      setLoading(false);
      setMessages([{ role: 'assistant', content: msgs[0] }]);

      // msg 2: пауза → печатаем → показываем
      timers.push(setTimeout(() => {
        setLoading(true);
        timers.push(setTimeout(() => {
          setLoading(false);
          setMessages((p) => [...p, { role: 'assistant', content: msgs[1] }]);

          // msg 3: пауза → печатаем → показываем
          timers.push(setTimeout(() => {
            setLoading(true);
            timers.push(setTimeout(() => {
              setLoading(false);
              setMessages((p) => [...p, { role: 'assistant', content: msgs[2] }]);
            }, 900));
          }, 400));
        }, 900));
      }, 400));
    }, 600));

    return () => timers.forEach(clearTimeout);
  }, []);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading || done) return;

    setMessages((p) => [...p, { role: 'user', content: trimmed }]);
    setInput('');
    setShowBudget(false);
    setError('');
    setLoading(true);

    // Сброс высоты textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (!AGENT_URL) {
        await new Promise((r) => setTimeout(r, 700));
        setMessages((p) => [...p, {
          role: 'assistant',
          content: 'Агент пока настраивается. Оставьте контакт — свяжемся в ближайший рабочий день.'
        }]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId.current, message: trimmed }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((p) => [...p, { role: 'assistant', content: data.reply }]);
      if (data.show_budget) setShowBudget(true);
      if (data.done) { setContact(data.contact || ''); setDone(true); }
    } catch {
      setError('Ошибка связи. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [loading, done]);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  // Экран завершения
  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-8 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-orange/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#FF6A00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="mt-3 font-display text-[1.1rem] font-bold text-ink">Отлично, спасибо!</p>
        <p className="mt-2 max-w-[200px] text-[13px] leading-relaxed text-ink/50">
          Команда свяжется в течение рабочего дня и назначит аудит-звонок.
        </p>
        {contact && (
          <p className="mt-3 rounded-lg bg-orange/8 px-3 py-1.5 text-[12px] text-ink/50">
            Контакт: <span className="font-semibold text-ink/70">{contact}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Шапка */}
      <div className="mb-3 flex shrink-0 items-center gap-2 border-b border-ink/[0.08] pb-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange/10 ring-1 ring-orange/20">
          <span className="text-[10px] font-bold text-orange">AI</span>
        </div>
        <p className="text-[13px] font-semibold leading-tight text-ink">Autogent AI</p>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-emerald-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          онлайн
        </span>
      </div>

      {/* Лента сообщений — скролл только здесь */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-2.5 pr-0.5"
        style={{ overscrollBehavior: 'contain' }}
      >
        {messages.map((m, i) => <Message key={i} msg={m} />)}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 ring-1 ring-black/[0.05] shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {showBudget && !loading && (
          <BudgetChips onSelect={(v) => send(v)} />
        )}

        {error && (
          <p className="text-center text-[12px] text-red-400">
            {error}{' '}
            <button className="underline opacity-70 hover:opacity-100" onClick={() => setError('')}>ок</button>
          </p>
        )}
      </div>

      {/* Поле ввода */}
      <div className="mt-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 88) + 'px';
            }}
            onKeyDown={onKey}
            disabled={loading || done}
            placeholder="Напишите сообщение..."
            rows={1}
            maxLength={500}
            className="flex-1 resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-[0.875rem] text-ink placeholder:text-ink/30 focus:border-orange/60 focus:outline-none focus:ring-2 focus:ring-orange/15 disabled:opacity-40"
            style={{ minHeight: '42px', maxHeight: '88px' }}
          />
          <button
            type="button"
            disabled={!input.trim() || loading || done}
            onClick={() => send(input)}
            className="mb-0 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-orange transition-all hover:bg-orange2 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10.5px] text-ink/25">
          Продолжая, вы соглашаетесь с{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink/40 transition-colors">политикой обработки ПД</a>
        </p>
      </div>
    </div>
  );
}
