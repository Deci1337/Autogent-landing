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
    <div className="mb-6 flex items-center gap-2">
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
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.85rem] font-medium transition-all duration-200
        ${selected
          ? 'border-orange bg-orange text-white'
          : 'border-ink/12 bg-white/70 text-ink/70 hover:border-orange/40 hover:bg-orange/5'
        }`}
    >
      {multi && (
        <span className={`h-3.5 w-3.5 shrink-0 rounded grid place-items-center border transition-colors ${selected ? 'border-white/60 bg-white/20' : 'border-ink/25'}`}>
          {selected && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.8 1.8L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
      )}
      {label}
    </button>
  );
}

function Field({ label, name, value, onChange, error, placeholder, required }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-ink/65">
        {label}
        {required && <span className="text-orange">*</span>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-white/80 px-4 py-3 text-[0.95rem] text-ink ring-1 transition-all duration-200 placeholder:text-ink/30 focus:outline-none focus:ring-2 ${error ? 'ring-orange2/60 focus:ring-orange2' : 'ring-ink/10 focus:ring-orange'}`}
      />
      {error && <p className="mt-1 text-[11.5px] font-medium text-orange2">{error}</p>}
    </div>
  );
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir) => ({ opacity: 0, x: dir * -32 }),
};

const StepLabel = ({ text }) => (
  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink/30">{text}</p>
);

export default function AuditCTA() {
  const [step, setStep]     = useState(1);
  const [dir, setDir]       = useState(1);
  const [niche, setNiche]   = useState('');
  const [tasks, setTasks]   = useState([]);
  const [form, setForm]     = useState({ name: '', phone: '', company: '' });
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
    const p = form.phone.trim();
    if (!p) er.phone = 'Укажите номер телефона';
    else if (!/^[+()\d\s-]{7,}$/.test(p)) er.phone = 'Проверьте формат номера';
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
          <div className="rounded-xl3 bg-seashell p-6 sm:p-7">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-orange/10">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#E85D04" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-[1.5rem] font-extrabold text-ink">Заявка принята!</h3>
                <p className="mt-3 max-w-[260px] text-[0.95rem] leading-relaxed text-ink/60">
                  Свяжемся в течение рабочего дня и согласуем время аудита.
                </p>
                <div className="mt-4 rounded-xl bg-orange/[0.07] px-4 py-2.5 text-[13px] text-ink/55">
                  Позвоним на <span className="font-semibold text-ink/75">{form.phone}</span>
                </div>
              </motion.div>
            ) : (
              <>
                <Progress step={step} />

                {/* Контейнер без абсолютного позиционирования — высота по контенту */}
                <div className="overflow-hidden">
                  <AnimatePresence mode="wait" custom={dir} initial={false}>

                    {/* ШАГ 1 */}
                    {step === 1 && (
                      <motion.div key="s1" custom={dir} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2, ease: 'easeInOut' }}>
                        <StepLabel text="Шаг 1 из 3 — тип бизнеса" />
                        <h3 className="font-display text-[1.2rem] font-bold text-ink">Какой у вас бизнес?</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {NICHES.map((n) => (
                            <SelectChip key={n} label={n} selected={niche === n} onClick={() => setNiche(n)} />
                          ))}
                        </div>
                        <button type="button" disabled={!niche} onClick={() => go(2)}
                          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-3.5 text-[0.95rem] font-semibold text-seashell shadow-glow transition-all hover:bg-orange2 disabled:opacity-30 disabled:cursor-not-allowed">
                          Продолжить <Arrow />
                        </button>
                      </motion.div>
                    )}

                    {/* ШАГ 2 */}
                    {step === 2 && (
                      <motion.div key="s2" custom={dir} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2, ease: 'easeInOut' }}>
                        <StepLabel text="Шаг 2 из 3 — задачи" />
                        <h3 className="font-display text-[1.2rem] font-bold text-ink">Что хотите автоматизировать?</h3>
                        <p className="mt-0.5 text-[12px] text-ink/40">Можно выбрать несколько</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {TASKS.map((t) => (
                            <SelectChip key={t} label={t} selected={tasks.includes(t)} multi onClick={() => toggleTask(t)} />
                          ))}
                        </div>
                        <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
                          <button type="button" onClick={() => go(1)}
                            className="rounded-full border border-ink/10 bg-white/60 px-5 py-3.5 text-[0.9rem] font-semibold text-ink/50 hover:text-ink hover:border-ink/20 transition-all">
                            ← Назад
                          </button>
                          <button type="button" disabled={!tasks.length} onClick={() => go(3)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange px-6 py-3.5 text-[0.95rem] font-semibold text-seashell shadow-glow transition-all hover:bg-orange2 disabled:opacity-30 disabled:cursor-not-allowed">
                            Продолжить <Arrow />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ШАГ 3 */}
                    {step === 3 && (
                      <motion.div key="s3" custom={dir} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2, ease: 'easeInOut' }}>
                        <StepLabel text="Шаг 3 из 3 — контакт" />
                        <h3 className="font-display text-[1.2rem] font-bold text-ink">Как с вами связаться?</h3>
                        <p className="mt-0.5 text-[12px] text-ink/40">Для согласования времени звонка</p>
                        <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-3">
                          <Field label="Ваше имя" name="name" value={form.name} onChange={onChange} error={errors.name} placeholder="Как к вам обращаться" required />
                          <Field label="Номер телефона" name="phone" value={form.phone} onChange={onChange} error={errors.phone} placeholder="+7 900 000 00 00" required />
                          <Field label="Название компании" name="company" value={form.company} onChange={onChange} placeholder="Необязательно" />
                          <p className="text-[11px] text-ink/30">* — обязательные поля</p>
                          <div className="grid grid-cols-[auto_1fr] gap-3 pt-1">
                            <button type="button" onClick={() => go(2)}
                              className="rounded-full border border-ink/10 bg-white/60 px-5 py-3.5 text-[0.9rem] font-semibold text-ink/50 hover:text-ink hover:border-ink/20 transition-all">
                              ← Назад
                            </button>
                            <button type="submit"
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange px-6 py-3.5 text-[0.95rem] font-semibold text-seashell shadow-glow transition-all hover:bg-orange2">
                              Записаться на аудит <Arrow />
                            </button>
                          </div>
                          <p className="text-center text-[11.5px] text-ink/30">Бесплатно. Без спама и навязчивых звонков.</p>
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
