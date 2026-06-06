import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const CAPS = [
  { k: 'Продажи', t: 'Отвечает и продаёт', d: 'Консультирует, работает с возражениями, дожимает и оформляет заказ — пока конкурент думает.', big: 'до 24/7' },
  { k: 'Поддержка', t: 'Снимает первую линию', d: 'Закрывает типовые вопросы клиентов и сотрудников, освобождая людей для сложного.', big: 'за секунды' },
  { k: 'Знания', t: 'Помнит всё о компании', d: 'Единая точка правды по регламентам, истории чатов и документам — с указанием источника.', big: 'Источник компании' },
  { k: 'Операции', t: 'Ведёт процессы до конца', d: 'Создаёт сделки, проверяет наличие, оформляет доставку — связывает ваши системы между собой.', big: 'Автоматизация' },
];

export default function Capabilities() {
  return (
    <Section id="build" className="py-20 md:py-28">
      <SectionHeader
        index="02" kicker="Что мы строим"
        title={<>Не «чат-бот». <span className="text-orange">Сотрудник</span>, который доводит дело до результата.</>}
        intro="Мы проектируем агентов по задаче и зоне ответственности — а не по списку фич."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {CAPS.map((c, i) => (
          <Reveal key={c.t} delay={i * 70} className="transition-all duration-500 hover:-translate-y-1">
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
                  <span className="eyebrow text-[11px] text-orange">{c.k}</span>
                  <span className="font-display text-[1.2rem] font-extrabold text-orange/85 display-tight text-right leading-tight">{c.big}</span>
                </div>
                <h3 className="font-display text-[1.5rem] font-bold display-tight text-ink">{c.t}</h3>
                <p className="text-[1rem] leading-relaxed text-ink/60">{c.d}</p>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
