import { Reveal, Pill } from './shared';
import Beams from './Beams';

export default function Hero() {
  return (
    <section id="top" className="relative flex flex-col justify-center px-5 pt-20 pb-32 sm:px-8 sm:pt-28 sm:pb-48" style={{ background: '#000000', minHeight: 'calc(100svh + 120px)' }}>
      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-[1]" style={{
        height: '120px',
        background: 'linear-gradient(to bottom, rgba(255,245,238,0) 0%, #FFF5EE 100%)'
      }} />
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

      <div className="relative z-10 mx-auto w-full max-w-[1100px] text-center">
        <Reveal as="h1" delay={80} className="mx-auto mt-7 font-display font-extrabold text-[clamp(2rem,4.8vw,4rem)] text-white leading-[1.15]" style={{ letterSpacing: '-0.01em' }}>
          <span className="text-orange">Сократите ФОТ</span> и перестаньте<br />тушить пожары вручную
        </Reveal>

        <Reveal delay={180} className="mx-auto mt-7 max-w-[600px] text-[clamp(1.05rem,2vw,1.2rem)] leading-relaxed text-white/55">
          ИИ-агенты берут на себя рутину и экономят 200–900 тыс. ₽/мес.
          <span className="block my-3 mx-auto w-8 border-t border-white/15" aria-hidden="true" />
          За 25 минут получите список из 2-5 процессов в вашем бизнесе,<br />которые можно автоматизировать ИИ-агентами, и расчёт экономии.
        </Reveal>

        <Reveal delay={260} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:mt-10">
          <Pill href="#audit" variant="primary" arrow className="w-full sm:w-auto">
            Получить разбор от команды
          </Pill>
        </Reveal>

        <Reveal delay={320} className="mt-4 text-[12.5px] text-white/30 leading-snug">
          Разбор ни к чему не обязывает: дадим конкретный план, даже если решите не работать с нами.
        </Reveal>
      </div>
    </section>
  );
}
