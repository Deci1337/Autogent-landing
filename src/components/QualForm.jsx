import { useState } from 'react';

const AGENT_URL = import.meta.env.VITE_AGENT_URL || '';

const STEPS = [
  {
    q: 'Чем занимается ваша компания и что продаёте?',
    hint: 'Сфера, продукт или услуга, клиенты',
    type: 'textarea',
    key: 'business',
  },
  {
    q: 'Какую задачу хотите решить с помощью ИИ?',
    hint: 'Продажи, поддержка, документооборот, HR — своими словами',
    type: 'textarea',
    key: 'task',
  },
  {
    q: 'Вы уже пробовали что-то автоматизировать с помощью ИИ?',
    type: 'chips',
    key: 'tried',
    options: ['Да, пробовали', 'Нет, пока нет'],
  },
  {
    q: 'Какой бюджет рассматриваете на внедрение?',
    type: 'chips',
    key: 'budget',
    options: ['до 50 000 ₽', '50–100 000 ₽', '150–300 000 ₽', '300 000 ₽+', 'Не знаю'],
  },
  {
    q: 'Какие инструменты сейчас используете в бизнесе?',
    hint: 'CRM, мессенджеры, 1C, Bitrix, Notion и т.д.',
    type: 'textarea',
    key: 'tools',
  },
];

function ProgressBar({ step, total }) {
  return (
    <div className="mb-6 flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-orange' : 'bg-ink/10'}`} />
      ))}
    </div>
  );
}

export default function QualForm() {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [done, setDone]       = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');

  const total = STEPS.length;
  const current = STEPS[step];
  const val = answers[current?.key] ?? '';

  const canNext = current?.type === 'textarea' ? val.trim().length > 0 : !!val;
  const canSubmit = name.trim() && phone.trim();

  function setVal(v) {
    setAnswers((a) => ({ ...a, [current.key]: v }));
  }

  function next() {
    if (step < total - 1) setStep((s) => s + 1);
    else setStep(total);
  }

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError('');

    const payload = { ...answers, name: name.trim(), phone: phone.trim() };

    try {
      if (AGENT_URL) {
        const res = await fetch(`${AGENT_URL}/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setDone(true);
    } catch {
      setError('Не удалось отправить. Попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-8 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-orange/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#FF6A00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="mt-3 font-display text-[1.1rem] font-bold text-ink">Отлично, спасибо!</p>
        <p className="mt-2 max-w-[220px] text-[13px] leading-relaxed text-ink/50">
          Команда свяжется в течение рабочего дня и назначит аудит-звонок.
        </p>
      </div>
    );
  }

  if (step === total) {
    return (
      <div className="flex h-full flex-col">
        <ProgressBar step={total} total={total} />
        <p className="mb-1 font-display text-[1.05rem] font-bold text-ink">Последний шаг</p>
        <p className="mb-5 text-[0.85rem] text-ink/50">Оставьте контакт, по которому с вами связаться</p>
        <form onSubmit={submit} className="flex flex-1 flex-col gap-3">
          <input
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-[0.875rem] text-ink placeholder:text-ink/35 focus:border-orange/60 focus:outline-none focus:ring-2 focus:ring-orange/15"
          />
          <input
            type="tel"
            placeholder="Телефон или Telegram"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-[0.875rem] text-ink placeholder:text-ink/35 focus:border-orange/60 focus:outline-none focus:ring-2 focus:ring-orange/15"
          />
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit || sending}
            className="mt-auto w-full rounded-xl bg-orange py-3 text-[0.9rem] font-semibold text-white transition-all hover:bg-[#e05e00] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? 'Отправляем...' : 'Получить разбор'}
          </button>
          <p className="text-center text-[10.5px] text-ink/25">
            Продолжая, вы соглашаетесь с{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink/40 transition-colors">политикой обработки ПД</a>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ProgressBar step={step} total={total} />

      <p className="mb-1 text-[10.5px] font-mono text-orange">Вопрос {step + 1} из {total}</p>
      <p className="mb-5 font-display text-[1.05rem] font-bold leading-snug text-ink">{current.q}</p>

      {current.type === 'textarea' && (
        <textarea
          key={current.key}
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={current.hint}
          rows={3}
          maxLength={600}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey && canNext) next(); }}
          className="w-full flex-1 resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-[0.875rem] text-ink placeholder:text-ink/35 focus:border-orange/60 focus:outline-none focus:ring-2 focus:ring-orange/15"
          style={{ minHeight: 90 }}
        />
      )}

      {current.type === 'chips' && (
        <div className="flex flex-wrap gap-2">
          {current.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => { setVal(o); }}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-all ${
                val === o
                  ? 'border-orange bg-orange text-white'
                  : 'border-ink/12 bg-white text-ink/60 hover:border-orange/50 hover:text-orange'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={next}
        disabled={!canNext}
        className="mt-auto w-full rounded-xl bg-orange py-3 text-[0.9rem] font-semibold text-white transition-all hover:bg-[#e05e00] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {step < total - 1 ? 'Далее →' : 'Продолжить →'}
      </button>
    </div>
  );
}
