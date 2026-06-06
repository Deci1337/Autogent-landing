import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const ARCH = [
  {
    tag: 'Архетип 01',
    title: 'ИИ-агент отдела продаж',
    lead: 'Заменяет работу нескольких менеджеров. Отвечает за секунды, 24/7.',
    points: [
      'Обрабатывает входящие из Telegram, ВКонтакте и Авито',
      'Консультирует, работает с возражениями, дожимает до заказа',
      'Оформляет доставку через СДЭК, проверяет наличие в МойСклад',
      'Ведёт сделки в AmoCRM без ручного переноса',
    ],
    dark: false,
  },
  {
    tag: 'Архетип 02',
    title: 'Внутренний ИИ-ассистент компании',
    lead: 'Единая точка знаний для сотрудников прямо в Telegram.',
    points: [
      'Отвечает голосом и текстом по базе знаний и истории чатов',
      'Указывает источник ответа — без догадок и фантазий',
      'Права доступа разграничены по отделам',
      'Управление через привычную Telegram-админку',
    ],
    dark: true,
  },
];

export default function CaseArchetypes() {
  return (
    <Section id="archetypes" className="py-20 md:py-28">
      <SectionHeader
        index="04" kicker="Сценарии"
        title={<>Два агента, которые <span className="text-orange">окупаются первыми</span></>}
        intro="С них чаще всего начинают. Реальная зона ответственности — не демо."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-2 items-stretch">
        {ARCH.map((a, i) => (
          <Reveal key={a.title} delay={i * 100} className="transition-all duration-500 hover:-translate-y-1.5 h-full">
            <BorderGlow
              className="h-full"
              backgroundColor="#fffaf5"
              glowColor="30 90 65"
              colors={['#ea8a08', '#f5a83a', '#c45c00']}
              borderRadius={24}
              glowRadius={40}
              glowIntensity={1.3}
              coneSpread={22}
            >
              <div className="relative flex flex-col h-full p-9 md:p-11">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange/20 blur-2xl pointer-events-none" />
                <span className="eyebrow text-[11px] text-orange">{a.tag}</span>
                <h3 className="mt-4 font-display text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold display-tight text-ink">{a.title}</h3>
                <p className="mt-4 text-[1.1rem] leading-relaxed text-ink/65">{a.lead}</p>
                <ul className="mt-7 space-y-3.5">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-3.5">
                      <span className="mt-2 h-1.5 w-5 shrink-0 rounded-full bg-orange" />
                      <span className="text-[1.02rem] leading-relaxed text-ink/75">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
