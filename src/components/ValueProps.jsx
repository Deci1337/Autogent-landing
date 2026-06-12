import { Reveal, Section } from './shared';

const PROPS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Кастом, не шаблон',
    body: 'Шаблонный бот не знает ваш прайс, возражения и каналы. Каждый агент строится под ваши процессы с нуля — без готовых конструкторов.',
    accent: true,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'От аудита до запуска',
    body: 'Аудит → разработка → интеграция → запуск → поддержка. Вам не нужно быть техническим специалистом — мы берём это на себя.',
    accent: false,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Соответствие 152-ФЗ',
    body: 'Знаем закон о персональных данных и соблюдаем его на каждом проекте. Данные клиентов в безопасности — никаких юридических рисков.',
    accent: false,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '13 реальных внедрений',
    body: 'От небольшого автосервиса до федеральных компаний. Публичные кейсы с реальными цифрами — без воды и округлений.',
    accent: false,
  },
];

export default function ValueProps() {
  return (
    <Section id="why" className="py-16 md:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {PROPS.map((p, i) => (
          <Reveal key={p.title} delay={i * 70}>
            <div className={`group relative h-full rounded-xl2 p-7 ring-1 transition-shadow duration-300 hover:shadow-softer ${
              p.accent
                ? 'bg-orange/[0.06] ring-orange/25'
                : 'bg-white/60 ring-ink/[0.08]'
            }`}>
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl2 ${
                p.accent ? 'bg-orange/15 text-orange' : 'bg-ink/[0.06] text-ink/50'
              }`}>
                {p.icon}
              </div>
              <h3 className="font-display font-bold text-[1.05rem] text-ink leading-snug mb-2">
                {p.title}
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-ink/55">
                {p.body}
              </p>
              {p.accent && (
                <span className="absolute top-5 right-5 text-[11px] font-semibold text-orange bg-orange/10 px-2.5 py-1 rounded-full">
                  Наше УТП
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
