import { Reveal, Pill } from './shared';
import Beams from './Beams';

export default function Hero() {
  return (
    <section id="top" className="relative flex flex-col justify-center px-5 pt-20 pb-32 sm:px-8 sm:pt-28 sm:pb-56" style={{ background: '#000000', zIndex: 1, minHeight: 'calc(100svh + 80px)' }}>
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
      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-[1]" style={{
        height: '80px',
        background: 'linear-gradient(to bottom, rgba(255,245,238,0) 0%, rgba(255,245,238,1) 100%)'
      }} />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] text-center mt-16 sm:mt-20">
        <Reveal as="h1" delay={80} className="mx-auto mt-7 max-w-[20ch] font-display font-extrabold display-tight text-[clamp(2.3rem,6.4vw,5.4rem)] text-white text-balance leading-[1.08]">
          Внедрите ИИ в свой бизнес{' '}
          <span className="text-orange">раньше конкурентов</span>
        </Reveal>

        <Reveal delay={180} className="mx-auto mt-7 max-w-[50ch] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-white/55">
          Первые компании уже сократили ФОТ на 200–900 тыс./мес и утроили скорость работы команды. Мы помогаем войти в эту группу.
        </Reveal>

        <Reveal delay={260} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:mt-10">
          <Pill href="#audit" variant="primary" arrow className="w-full sm:w-auto">
            Получить разбор за 25 минут
          </Pill>
          <Pill href="#how" variant="link" className="!text-white/65 hover:!text-white">
            Узнать, что автоматизировать первым →
          </Pill>
        </Reveal>

        <Reveal delay={320} className="mt-4 text-[12.5px] text-white/30 leading-snug">
          Разбор ни к чему не обязывает: дадим бесплатные ИИ-инструменты и предложим наши услуги
        </Reveal>
      </div>
    </section>
  );
}
