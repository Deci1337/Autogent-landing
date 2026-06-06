import { Reveal, Section, SectionHeader } from './shared';

const STACK = [
  { group: 'Каналы', items: ['Telegram', 'ВКонтакте', 'Авито'] },
  { group: 'CRM и учёт', items: ['AmoCRM', 'МойСклад'] },
  { group: 'Доставка', items: ['СДЭК'] },
  { group: 'Данные и знания', items: ['Google Sheets', 'RAG / база знаний', 'Qdrant', 'FAQ Вашей компании'] },
  { group: 'Голос', items: ['Yandex SpeechKit'] },
  { group: 'Актуальные ИИ модели', items: ['GPT-4o', 'YandexGPT', 'Gigachat и другие'] },
];

export default function Integrations() {
  return (
    <Section id="stack" className="py-20 md:py-28">
      <SectionHeader
        index="03" kicker="Интеграции"
        title={<>Работаем в вашем <span className="text-orange">контуре</span></>}
        intro="Встраиваемся в действующие инструменты — без замены инфраструктуры."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {STACK.map((s, i) => (
          <Reveal key={s.group} delay={i * 60} className="rounded-xl3 bg-white/55 p-7 ring-1 ring-ink/[0.06] shadow-softer backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-soft">
            <span className="font-mono text-[12px] text-orange2">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 font-display text-[1.15rem] font-bold leading-snug text-ink">{s.group}</h3>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/70">{s.items.join(', ')}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
