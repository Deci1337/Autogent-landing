import { useState } from 'react';
import { Reveal, Section, Arrow } from './shared';

function Field({ label, name, type = 'text', value, onChange, error, placeholder, textarea }) {
  const base = `w-full rounded-xl2 bg-seashell px-5 py-4 text-[1.02rem] text-ink ring-1 transition-all duration-200 placeholder:text-ink/35 focus:outline-none focus:ring-2 ${error ? 'ring-orange2/70 focus:ring-orange2' : 'ring-ink/10 focus:ring-orange'}`;
  return (
    <label className="block">
      <span className="mb-2 block text-[13.5px] font-semibold text-ink/70">{label}</span>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3} className={base + ' resize-none'} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={base} />
      )}
      {error && <span className="mt-1.5 block text-[12.5px] font-medium text-orange2">{error}</span>}
    </label>
  );
}

export default function AuditCTA() {
  const [form, setForm] = useState({ name: '', company: '', contact: '', task: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Укажите имя';
    if (!form.company.trim()) er.company = 'Укажите компанию';
    const c = form.contact.trim();
    const okPhone = /^[+()\d\s-]{7,}$/.test(c);
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    if (!c) er.contact = 'Телефон или email';
    else if (!okPhone && !okEmail) er.contact = 'Проверьте телефон или email';
    return er;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length === 0) setSent(true);
  };

  return (
    <Section id="audit" className="py-20 md:py-28">
      <div className="relative overflow-hidden rounded-xl4 bg-ink p-8 shadow-soft sm:p-12 md:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <span className="eyebrow text-[12px] text-orange">09 — Аудит</span>
            <Reveal as="h2" delay={60} className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold display-tight text-seashell">
              Бесплатный аудит процессов
            </Reveal>
            <p className="mt-6 max-w-md text-[1.12rem] leading-relaxed text-seashell/70">
              Разберём ваши процессы, покажем, где агент окупается, и посчитаем экономию под ваш бизнес. Без обязательств.
            </p>
            <ul className="mt-9 space-y-3.5">
              {['Считаем потенциальную экономию', 'Честно скажем, есть ли смысл внедрять', 'Запуск в среднем за 2–5 недель'].map((t) => (
                <li key={t} className="flex items-center gap-3.5 text-[1.02rem] text-seashell/85">
                  <span className="h-1.5 w-6 shrink-0 rounded-full bg-orange" />{t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl3 bg-seashell p-6 shadow-soft sm:p-8">
            {sent ? (
              <div className="flex h-full min-h-[340px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-orange/[0.12]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#E85D04" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="mt-6 font-display text-[1.6rem] font-extrabold text-ink">Успешно отправлено</h3>
                <p className="mt-3 max-w-xs text-[1.02rem] leading-relaxed text-ink/60">
                  Спасибо, {form.name.trim() || 'мы'}! Свяжемся в течение рабочего дня и согласуем время аудита.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', company: '', contact: '', task: '' }); }}
                  className="mt-7 text-[14px] font-semibold text-orange2 hover:underline focusring"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Имя" name="name" value={form.name} onChange={onChange} error={errors.name} placeholder="Как к вам обращаться" />
                  <Field label="Компания" name="company" value={form.company} onChange={onChange} error={errors.company} placeholder="Название" />
                </div>
                <Field label="Телефон или email" name="contact" value={form.contact} onChange={onChange} error={errors.contact} placeholder="+7 ··· или you@company.ru" />
                <Field label="Кратко о задаче" name="task" value={form.task} onChange={onChange} placeholder="Что хотите автоматизировать (необязательно)" textarea />
                <button type="submit" className="group mt-2 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-orange px-7 py-4 text-base font-semibold text-seashell shadow-glow transition-all duration-300 hover:bg-orange2 hover:-translate-y-0.5 focusring">
                  Оставить заявку на аудит
                  <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="pt-1 text-center text-[13px] text-ink/45">Аудит бесплатный, без обязательств.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
