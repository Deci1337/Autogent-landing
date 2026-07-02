import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const STEPS = [
  { img: '/steps/01.png', t: 'Аудит процессов', d: 'Разбираем, где теряются деньги и время. Считаем потенциальную экономию до старта работ.' },
  { img: '/steps/02.png', t: 'Проектирование агента', d: 'Описываем зону ответственности, сценарии и интеграции. Согласовываем, как агент общается.' },
  { img: '/steps/03.png', t: 'Интеграция', d: 'Подключаем к вашим каналам и системам. Настраиваем доступы и безопасность данных.' },
  { img: '/steps/04.png', t: 'Запуск и поддержка', d: 'Выводим в работу поэтапно, под контролем. Передаём материалы для команды, чтобы сотрудники сразу знали, как работать с агентом.' },
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
          <Reveal key={s.t} delay={i * 80} className="transition-all duration-500 hover:-translate-y-1 h-full">
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
              <div className="p-6 h-full flex flex-col" style={{ minHeight: 320 }}>
                <div className="flex-shrink-0">
                  <h3 className="font-display text-[1.25rem] font-bold text-ink">{s.t}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/60">{s.d}</p>
                </div>
                <div className="mt-auto pt-4 flex items-end justify-center overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.t}
                    className="w-full object-contain"
                    style={{
                      maxHeight: 180,
                      WebkitMaskImage: 'radial-gradient(ellipse 92% 88% at 50% 48%, black 28%, transparent 62%)',
                      maskImage: 'radial-gradient(ellipse 92% 88% at 50% 48%, black 28%, transparent 62%)',
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
