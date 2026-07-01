import { Reveal, Section } from './shared';
import LeadChat from './LeadChat';

const BULLETS = [
  'Разберём бизнес и покажем, где ИИ окупается — за 25 минут',
  'Найдём точки роста и скрытый потенциал автоматизации',
  'Посчитаем экономику и честно скажем, есть ли смысл',
  'Дадим список процессов для старта — что автоматизировать первым',
];

export default function AuditCTA() {
  return (
    <Section id="audit" className="py-20 md:py-28">
      <div className="relative overflow-hidden rounded-xl4 bg-ink p-8 shadow-soft sm:p-12 md:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />

        <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">

          {/* ── Левая колонка ── */}
          <div>
            <span className="eyebrow text-[12px] text-orange">Аудит бесплатно</span>

            <Reveal as="h2" delay={60}
              className="mt-5 font-display text-[clamp(1.9rem,4vw,3.1rem)] font-extrabold leading-[1.12] text-seashell">
              Разберём ваш бизнес и найдём{' '}
              <span className="text-orange">2–5 процессов</span>{' '}
              для автоматизации
            </Reveal>

            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-seashell/60">
              Рассчитаем экономию —{' '}
              <span className="font-semibold text-seashell/85">от 500 000 ₽ в месяц</span>.
              Честно скажем, есть ли смысл внедрения.
            </p>

            <ul className="mt-8 space-y-3.5">
              {BULLETS.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[0.97rem] text-seashell/75">
                  <span className="mt-[7px] h-1.5 w-4 shrink-0 rounded-full bg-orange" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Правая колонка — чат с агентом ── */}
          <div className="rounded-xl3 bg-seashell p-5 sm:p-6">
            <LeadChat />
          </div>

        </div>
      </div>
    </Section>
  );
}
