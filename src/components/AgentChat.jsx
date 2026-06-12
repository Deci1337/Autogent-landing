import { useState, useRef, useEffect } from 'react';
import { Reveal, Section, SectionHeader } from './shared';

const QUICK = [
  { label: 'Сколько стоит внедрение?',           id: 'price'    },
  { label: 'Как долго длится разработка?',        id: 'time'     },
  { label: 'Подойдёт ли для моего бизнеса?',      id: 'fit'      },
  { label: 'Мои данные будут в безопасности?',    id: 'security' },
  { label: 'Чем отличаетесь от обычных ботов?',   id: 'diff'     },
];

const MOCK = {
  price:    'Стоимость зависит от сложности процессов и количества интеграций. Стартовый проект — от 80 000 ₽. На разборе за 25 минут покажем что именно автоматизировать и назовём точную цифру.',
  time:     'Первый агент запускаем за 2–3 недели. Полный проект с несколькими агентами — 4–6 недель. Начинаем с того, что даст быстрый результат и окупится первым.',
  fit:      'Если в бизнесе есть повторяющиеся задачи — ответы на заявки, документооборот, поддержка сотрудников — агент это закроет. Работаем с бизнесом любого размера: от небольшого автосервиса до федеральных компаний.',
  security: 'Да. Знаем 152-ФЗ и соблюдаем его на каждом проекте. При необходимости разворачиваем агента в изолированном контуре — данные не покидают ваш периметр.',
  diff:     'Обычный бот отвечает по скрипту и ломается при нестандартном вопросе. Наш агент понимает контекст, интегрируется с вашими системами — CRM, склад, расписание — и обучается на ваших данных.',
  fallback: 'Хороший вопрос. Сейчас я работаю в режиме демо — на сложные вопросы отвечаем лично. Запишитесь на разбор, и за 25 минут разберём вашу ситуацию подробно.',
};

// TODO: заменить на реальный API-вызов
async function getReply(text) {
  const t = text.toLowerCase();
  if (/цен|стоит|бюджет|дорого|руб/.test(t))              return MOCK.price;
  if (/долго|недел|срок|быстро|когда/.test(t))            return MOCK.time;
  if (/подойд|подход|мой бизнес|наш бизнес|ниш/.test(t)) return MOCK.fit;
  if (/дан|безопас|152|утечк|фз/.test(t))                 return MOCK.security;
  if (/отлич|бот|чем вы|чат.бот|шаблон/.test(t))         return MOCK.diff;
  return MOCK.fallback;
}

const GREETING = 'Привет! Спрашивайте всё об ИИ-агентах и автоматизации — отвечу честно. Или выберите один из частых вопросов ниже.';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-orange/60"
          style={{ animation: `bounce 1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

export default function AgentChat() {
  const [messages, setMessages] = useState([{ role: 'agent', text: GREETING }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  async function send(text) {
    const q = text.trim();
    if (!q || typing) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 500));
    const reply = await getReply(q);
    setTyping(false);
    setMessages(m => [...m, { role: 'agent', text: reply }]);
  }

  return (
    <Section id="ask" className="py-20 md:py-28">
      <SectionHeader
        index="07"
        kicker="Спросите агента"
        title={<>Остались вопросы? <span className="text-orange">Спросите прямо здесь</span></>}
        intro="Задайте любой вопрос об ИИ-агентах, сроках, стоимости или безопасности данных."
      />

      <Reveal delay={80} className="mt-10 mx-auto max-w-2xl">
        <div className="rounded-xl3 overflow-hidden ring-1 ring-ink/[0.08] shadow-softer bg-white/70">

          {/* messages */}
          <div ref={listRef} className="flex flex-col gap-3 px-5 py-5 max-h-[340px] overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'agent' && (
                  <div className="shrink-0 h-7 w-7 rounded-full bg-orange/15 grid place-items-center text-orange">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="8" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M8 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="9" cy="14" r="1.2" fill="currentColor"/>
                      <circle cx="15" cy="14" r="1.2" fill="currentColor"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[0.9rem] leading-relaxed ${
                  m.role === 'agent'
                    ? 'bg-[#FFF5EE] text-ink/80 rounded-bl-sm'
                    : 'bg-ink text-white/90 rounded-br-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2.5">
                <div className="shrink-0 h-7 w-7 rounded-full bg-orange/15 grid place-items-center text-orange">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="8" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M8 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="9" cy="14" r="1.2" fill="currentColor"/>
                    <circle cx="15" cy="14" r="1.2" fill="currentColor"/>
                  </svg>
                </div>
                <div className="bg-[#FFF5EE] rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* quick questions */}
          <div className="px-5 pb-3 flex flex-wrap gap-2 border-t border-ink/[0.06] pt-3">
            {QUICK.map(q => (
              <button
                key={q.id}
                onClick={() => send(q.label)}
                disabled={typing}
                className="text-[12px] font-medium text-ink/60 bg-ink/[0.05] hover:bg-orange/[0.1] hover:text-orange rounded-full px-3 py-1.5 transition-colors duration-150 disabled:opacity-40"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* input */}
          <div className="px-4 pb-4 pt-2">
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 rounded-full bg-ink/[0.05] ring-1 ring-ink/[0.08] px-4 py-2.5 focus-within:ring-orange/40 transition-shadow"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Напишите свой вопрос..."
                className="flex-1 bg-transparent text-[0.9rem] text-ink placeholder:text-ink/30 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="shrink-0 h-7 w-7 grid place-items-center rounded-full bg-orange text-white disabled:opacity-30 transition-opacity hover:bg-orange2"
                aria-label="Отправить"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
