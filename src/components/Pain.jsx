import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const PAINS = [
  { n: '01', t: 'Заявки теряются', d: 'Клиент пишет ночью или в выходной — ответа нет до утра. Лид уходит к тем, кто ответил первым.' },
  { n: '02', t: 'Менеджеры тонут в переписках', d: 'Одни и те же вопросы, ручная сверка наличия и статусов. Скорость падает, ошибки растут.' },
  { n: '03', t: 'Рутина стоит дорого', d: 'Команда тратит часы на то, что можно автоматизировать. Вы платите за повторяющиеся действия.' },
  { n: '04', t: 'Знания уходят с людьми', d: 'Уволился сотрудник — вместе с ним ушёл контекст. Новичкам неоткуда быстро узнать «как у нас принято».' },
];

export default function Pain() {
  return (
    <Section id="pain" className="py-20 md:py-28">
      <SectionHeader
        index="01" kicker="Боль"
        title={<>Где могут быть <span className="text-orange">ежедневные потери</span> в бизнесе</>}
        intro="Четыре сценария, в которых бизнес теряет деньги и время — тихо и постоянно."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {PAINS.map((p, i) => (
          <Reveal key={p.n} delay={i * 80} className="transition-all duration-500 hover:-translate-y-1">
            <BorderGlow
              backgroundColor="#fffaf5"
              glowColor="30 90 65"
              colors={['#ea8a08', '#f5a83a', '#c45c00']}
              borderRadius={20}
              glowRadius={35}
              glowIntensity={1.2}
              coneSpread={22}
            >
              <div className="flex items-start gap-5 p-8">
                <span className="font-mono text-[13px] text-orange pt-1">{p.n}</span>
                <div>
                  <h3 className="font-display text-[1.45rem] font-bold text-ink">{p.t}</h3>
                  <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/60">{p.d}</p>
                </div>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
