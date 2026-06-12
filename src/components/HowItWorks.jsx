import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const STEPS = [
  { n: '01', t: 'Аудит процессов', d: 'Разбираем, где теряются деньги и время. Считаем потенциальную экономию до старта работ.' },
  { n: '02', t: 'Проектирование агента', d: 'Описываем зону ответственности, сценарии и интеграции. Согласовываем, как агент общается.' },
  { n: '03', t: 'Интеграция', d: 'Подключаем к вашим каналам и системам. Настраиваем доступы и безопасность данных.' },
  { n: '04', t: 'Запуск и поддержка', d: 'Выводим в работу поэтапно, под контролем. Дорабатываем по реальным диалогам. Передаём материалы для команды, чтобы сотрудники сразу знали, как работать с агентом.' },
];

export default function HowItWorks() {
  return (
    <Section id="how" className="py-20 md:py-28">
      <SectionHeader
        index="06" kicker="Процесс"
        title={<>Внедрение <span className="text-orange">без хаоса</span> и остановки работы</>}
        intro="Контролируемый поэтапный запуск. Вы видите результат на каждом шаге."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 80} className="transition-all duration-500 hover:-translate-y-1 h-full">
            <BorderGlow
              className="h-full"
              backgroundColor="#fffaf5"
              glowColor="30 90 65"
              colors={['#ea8a08', '#f5a83a', '#c45c00']}
              borderRadius={20}
              glowRadius={35}
              glowIntensity={1.2}
              coneSpread={22}
            >
              <div className="p-7 h-full">
                <span className="font-display text-[3.4rem] font-extrabold leading-none text-orange/30 display-tight">{s.n}</span>
                <h3 className="mt-4 font-display text-[1.3rem] font-bold text-ink">{s.t}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-ink/60">{s.d}</p>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
