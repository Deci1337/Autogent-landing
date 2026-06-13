import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reveal, Section, Arrow } from './shared';

const NICHES = [
  'Услуги / консалтинг',
  'Интернет-торговля',
  'Производство',
  'Строительство / недвижимость',
  'IT / SaaS',
  'Другое',
];

const TASKS = [
  'Продажи и обработка лидов',
  'Поддержку клиентов 24/7',
  'Документооборот и КП',
  'HR и онбординг',
  'Аналитику и отчёты',
  'Что-то другое',
];

const TOTAL = 3;

function Progress({ step }) {
  return (
    <div className="mb-7 flex items-center gap-2">
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div key={i} className="relative h-1 flex-1 rounded-full bg-ink/10 overflow-hidden">
          <motion.div
            className="absolute inset-0 rounded-full bg-orange origin-left"
            initial={false}
            animate={{ scaleX: i < step ? 1 : 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      ))}
      <span className="shrink-0 text-[12px] font-semibold text-ink/40">{step}&thinsp;/&thinsp;{TOTAL}</span>
    </div>
  );
}

function SelectChip({ label, selected, multi, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[0.88rem] font-medium transition-all duration-200
        ${selected
          ? 'border-orange bg-orange text-white'
          : 'border-ink/12 bg-white/70 text-ink/75 hover:border-orange/40 hover:bg-orange/5'
        }`}
    >
      {multi && (
        <span className={`h-4 w-4 shrink-0 rounded grid place-items-center border transition-colors ${selected ? 'border-white/60 bg-white/20' : 'border-ink/20'}`}>
          {selected && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
      )}
      {label}
    </button>
  );
}

function Field({ label, name, value, onChange, error, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13.5px] font-semibold text-ink/70">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl2 bg-seashell px-5 py-4 text-[1rem] text-ink ring-1 transition-all duration-200 placeholder:text-ink/35 focus:outline-none focus:ring-2 ${error ? 'ring-orange2/70 focus:ring-orange2' : 'ring-ink/10 focus:ring-orange'}`}
      />
      {error && <span className="mt-1.5 block text-[12px] font-medium text-orange2">{error}</span>}
    </label>
  );
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir) => ({ opacity: 0, x: dir * -36 }),
};

export default function AuditCTA() {
  const [step, setStep] = useState(1);
  const [dir, setDir]   = useState(1);
  const [niche, setNiche]   = useState('');
  const [tasks, setTasks]   = useState([]);
  const [form, setForm]     = useState({ name: '', contact: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent]     = useState(false);

  const go = (next) => { setDir(next > step ? 1 : -1); setStep(next); };

  const toggleTask = (t) =>
    setTasks((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Укажите имя';
    const c = form.contact.trim();
    if (!c) er.contact = 'Telegram или телефон';
    else if (!/^(@[\w\d_.]{3,}|[+()\d\s-]{7,})$/.test(c)) er.contact = 'Проверьте формат';
    return er;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (!Object.keys(er).length) setSent(true);
  };

  return (
    <Section id="audit" className="py-20 md:py-28">
      <div className="relative overflow-hidden rounded-xl4 bg-ink p-8 shadow-soft sm:p-12 md:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />

        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">

          {/* левая колонка */}
          <div>
            <span className="eyebrow text-[12px] text-orange">Аудит бесплатно</span>
            <Reveal as="h2" delay={60} className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold display-tight text-seashell">
              Разберём бизнес и покажем, где ИИ окупается
            </Reveal>
            <p className="mt-6 max-w-md text-[1.08rem] leading-relaxed text-seashell/65">
              25 минут: найдём точки автоматизации, посчитаем экономию и честно скажем, есть ли смысл.
            </p>
            <ul className="mt-8 space-y-3.5">
              {['Считаем потенциальную экономию до старта', 'Честно скажем, подойдёт ли вам ИИ', 'Без обязательств — только польза'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[1rem] text-seashell/80">
                  <span className="h-1.5 w-5 shrink-0 rounded-full bg-orange" />{t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['ЕМ','АК','СТ','РН'].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-orange/25 ring-2 ring-ink grid place-items-center text-[10px] font-bold text-orange">{i}</div>
                ))}
              </div>
              <p className="text-[13px] text-seashell/50">
                <span className="font-semibold text-seashell/75">247+ компаний</span> уже прошли аудит
              </p>
            </div>
          </div>

          {/* форма */}
          <div className="rounded-xl3 bg-seashell p-6 sm:p-8 overflow-hidden">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-orange/10">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#E85D04" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-[1.55rem] font-extrabold text-ink">Заявка принята!</h3>
                <p className="mt-3 max-w-[260px] text-[0.97rem] leading-relaxed text-ink/60">
                  Свяжемся в течение рабочего дня и согласуем время аудита.
                </p>
                <div className="mt-5 rounded-xl2 bg-orange/[0.07] px-5 py-3 text-[13px] text-ink/55">
                  Ждите в <span className="font-semibold text-ink/75">{form.contact}</span>
                </div>
              </motion.div>
            ) : (
              <>
                <Progress step={step} />
                <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
                  <AnimatePresence mode="wait" custom={dir} initial={false}>

                    {step === 1 && (
                      <motion.div key="s1" custom={dir} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="absolute inset-0">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/35 mb-2">Шаг 1 — тип бизнеса</p>
                        <h3 className="font-display text-[1.25rem] font-bold text-ink">Какой у вас бизнес?</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {NICHES.map((n) => (
                            <SelectChip key={n} label={n} selected={niche === n} onClick={() => setNiche(n)} />
                          ))}
                        </div>
                        <button type="button" disabled={!niche} onClick={() => go(2)}
                          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange px-7 py-3.5 text-[0.95rem] font-semibold text-seashell shadow-glow transition-all hover:bg-orange2 disabled:opacity-35 disabled:cursor-not-allowed">
                          Продолжить <Arrow />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div key="s2" custom={dir} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="absolute inset-0">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/35 mb-2">Шаг 2 — задачи</p>
                        <h3 className="font-display text-[1.25rem] font-bold text-ink">Что хотите автоматизировать?</h3>
                        <p className="text-[12.5px] text-ink/40 mt-0.5">Можно выбрать несколько</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {TASKS.map((t) => (
                            <SelectChip key={t} label={t} selected={tasks.includes(t)} multi onClick={() => toggleTask(t)} />
                          ))}
                        </div>
                        <div className="mt-7 flex gap-3">
                          <button type="button" onClick={() => go(1)}
                            className="rounded-full px-4 py-3.5 text-[0.9rem] font-semibold text-ink/45 hover:text-ink transition-colors">
                            ← Назад
                          </button>
                          <button type="button" disabled={!tasks.length} onClick={() => go(3)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-orange px-7 py-3.5 text-[0.95rem] font-semibold text-seashell shadow-glow transition-all hover:bg-orange2 disabled:opacity-35 disabled:cursor-not-allowed">
                            Продолжить <Arrow />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div key="s3" custom={dir} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="absolute inset-0">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/35 mb-2">Шаг 3 — контакт</p>
                        <h3 className="font-display text-[1.25rem] font-bold text-ink">Как с вами связаться?</h3>
                        <p className="text-[12.5px] text-ink/40 mt-0.5">Только для согласования времени звонка</p>
                        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
                          <Field label="Ваше имя" name="name" value={form.name} onChange={onChange} error={errors.name} placeholder="Как к вам обращаться" />
                          <Field label="Telegram или телефон" name="contact" value={form.contact} onChange={onChange} error={errors.contact} placeholder="@username или +7 900 ···" />
                          <div className="flex gap-3 pt-1">
                            <button type="button" onClick={() => go(2)}
                              className="rounded-full px-4 py-3.5 text-[0.9rem] font-semibold text-ink/45 hover:text-ink transition-colors">
                              ← Назад
                            </button>
                            <button type="submit"
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-orange px-7 py-3.5 text-[0.95rem] font-semibold text-seashell shadow-glow transition-all hover:bg-orange2">
                              Записаться на аудит <Arrow />
                            </button>
                          </div>
                          <p className="text-center text-[12px] text-ink/35">Бесплатно. Без спама и навязчивых звонков.</p>
                        </form>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
