import { Reveal, Pill, Chip } from './shared';
import Beams from './Beams';

export default function Hero() {
  return (
    <section id="top" className="relative px-5 pt-20 pb-28 sm:px-8 sm:pt-32 sm:pb-40" style={{ background: '#000000', zIndex: 1 }}>
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Beams
          beamWidth={2.2}
          beamHeight={20}
          beamNumber={30}
          lightColor="#ea8a08"
          speed={3.8}
          noiseIntensity={1}
          scale={0.18}
          rotation={40}
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-[1] h-[8%] sm:h-[10%]" style={{
        background: 'linear-gradient(to bottom, rgba(255,245,238,0) 0%, rgba(255,245,238,1) 100%)'
      }} />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] text-center">
        <Reveal as="h1" delay={80} className="mx-auto mt-7 max-w-[20ch] font-display font-extrabold display-tight text-[clamp(2rem,5.6vw,4.7rem)] text-white text-balance leading-[1.08]">
          Внедрите ИИ в свой бизнес{' '}
          <span className="text-orange">раньше конкурентов</span>
        </Reveal>

        <Reveal delay={180} className="mx-auto mt-7 max-w-[50ch] text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed text-white/55">
          Первые компании уже сократили ФОТ на 200–900 тыс./мес и утроили скорость работы команды. Мы помогаем войти в эту группу.
        </Reveal>

        <Reveal delay={260} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:mt-10">
          <Pill href="#audit" variant="primary" arrow className="w-full sm:w-auto">
            Получить разбор за 45 минут
          </Pill>
          <Pill href="#how" variant="link" className="!text-white/65 hover:!text-white">
            Узнать, что автоматизировать первым →
          </Pill>
        </Reveal>

        <Reveal delay={320} className="mt-4 text-[12.5px] text-white/30 leading-snug">
          Разбор ни к чему не обязывает&nbsp;·&nbsp;Дадим бесплатные ИИ-инструменты&nbsp;·&nbsp;Предложим услуги без давления
        </Reveal>

        <Reveal delay={390} className="mt-7 sm:mt-8 flex flex-row flex-wrap items-center justify-center gap-2">
          <Chip className="!bg-white/10 !text-white/75 !ring-white/15 !text-[13px]">13 кейсов</Chip>
          <Chip className="!bg-white/10 !text-white/75 !ring-white/15 !text-[13px]">Кастом под процессы</Chip>
          <Chip className="!bg-white/10 !text-white/75 !ring-white/15 !text-[13px]">Запуск от 3 недель</Chip>
        </Reveal>
      </div>
    </section>
  );
}
