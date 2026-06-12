import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const AGENTS = [
  {
    k: 'Управление продажами',
    t: 'ИИ-РОП',
    d: 'Следит за воронкой и каждый день присылает отчёт без прослушки звонков и ручного сбора данных. Видит каждый диалог, считает конверсию, фиксирует узкие места.',
    big: 'без прослушки',
    result: 'РОП занимается ростом, а не разбором полётов',
  },
  {
    k: 'Продажи и лиды',
    t: 'ИИ-продажник',
    d: 'Принимает заявки из Telegram, ВКонтакте, Авито и сайта 24/7. Консультирует, отрабатывает возражения, оформляет заказ и передаёт готового клиента в CRM.',
    big: 'ответ < 1 мин',
    result: 'Ноль потерянных заявок, даже ночью и в выходные',
  },
  {
    k: 'База знаний',
    t: 'ИИ-Онбординг',
    d: 'Хранит регламенты, инструкции и корпоративные знания. Новый сотрудник получает точный ответ за секунды, не отвлекая коллег и не теряя контекст при увольнениях.',
    big: 'онбординг −40%',
    result: 'Знания компании остаются внутри, а не уходят с людьми',
  },
  {
    k: 'Внутренние операции',
    t: 'Агент внутреннего контура',
    d: 'Работает в закрытой инфраструктуре без выхода в интернет. Отвечает на внутренние запросы, генерирует отчёты по проверкам, соблюдает 152-ФЗ.',
    big: 'данные внутри',
    result: 'Для финансовых компаний, производств и госструктур',
  },
];

export default function Capabilities() {
  return (
    <Section id="build" className="py-20 md:py-28">
      <SectionHeader
        kicker="Наши агенты"
        title={<>Что мы строим <span className="text-orange">для вашего бизнеса</span></>}
        intro="Каждый агент проектируется под конкретную зону ответственности и интегрируется в ваши процессы."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {AGENTS.map((a, i) => (
          <Reveal key={a.t} delay={i * 70} className="transition-all duration-500 hover:-translate-y-1">
            <BorderGlow
              backgroundColor="#fffaf5"
              glowColor="30 90 65"
              colors={['#ea8a08', '#f5a83a', '#c45c00']}
              borderRadius={20}
              glowRadius={35}
              glowIntensity={1.2}
              coneSpread={22}
            >
              <div className="flex flex-col p-7 md:p-9 gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="eyebrow text-[11px] text-orange">{a.k}</span>
                  <span className="font-display text-[1.1rem] font-extrabold text-orange/85 display-tight text-right leading-tight">{a.big}</span>
                </div>
                <h3 className="font-display text-[1.5rem] font-bold display-tight text-ink">{a.t}</h3>
                <p className="text-[1rem] leading-relaxed text-ink/60">{a.d}</p>
                <p className="text-[0.875rem] font-semibold text-orange/80 mt-1">{a.result}</p>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
