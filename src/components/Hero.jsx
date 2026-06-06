import { Reveal, Pill, Chip } from './shared';
import Beams from './Beams';
import TextType from './TextType';

export default function Hero() {
  return (
    <section id="top" className="relative px-5 pt-24 pb-40 sm:px-8 sm:pt-32" style={{ background: '#000000', zIndex: 1 }}>
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
      {/* bottom half fades to seashell */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-[1]" style={{
        height: '10%',
        background: 'linear-gradient(to bottom, rgba(255,245,238,0) 0%, rgba(255,245,238,1) 100%)'
      }} />
      <div className="relative z-10 mx-auto w-full max-w-[1100px] text-center">
        <Reveal as="h1" delay={80} className="mx-auto mt-7 max-w-[15ch] font-display font-extrabold display-tight text-[clamp(2.3rem,5.6vw,4.7rem)] text-white text-balance">
          <span style={{ color: '#FFF5EE' }}>ИИ-агенты, которые </span><span className="text-orange">забирают рутину</span><span style={{ color: '#FFF5EE' }}> вашей команды и работают </span><span className="text-orange">без выходных</span>
        </Reveal>

        <Reveal delay={160} className="mx-auto mt-8 max-w-[58ch] text-[clamp(1.1rem,1.9vw,1.4rem)] leading-relaxed text-white/60 min-h-[2.2em] flex items-center justify-center">
          <TextType
            text={['Продажи', 'Поддержка', 'Внутренние знания', 'Скорость', 'Ведение CRM', 'Работа 24/7']}
            typingSpeed={45}
            deletingSpeed={25}
            pauseDuration={1000}
            cursorCharacter="|"
            cursorClassName="text-orange"
            cursorBlinkDuration={0.9}
            className="text-white/70 text-[clamp(1.4rem,2.8vw,2.2rem)] font-semibold"
          />
        </Reveal>

        <Reveal delay={240} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Pill href="#audit" variant="primary" arrow className="w-full sm:w-auto">Получить бесплатный аудит</Pill>
          <Pill href="#how" variant="link" className="!text-white/70 hover:!text-white">Как это работает →</Pill>
        </Reveal>

        <Reveal delay={320} className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Chip className="!bg-white/10 !text-white/80 !ring-white/15">Работаем 24/7</Chip>
          <Chip className="!bg-white/10 !text-white/80 !ring-white/15">Гибко настраиваем ИИ-агента под Ваш бизнес</Chip>
        </Reveal>
      </div>
    </section>
  );
}
