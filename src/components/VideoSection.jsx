import { useState } from 'react';
import { Reveal, Section, Pill } from './shared';

// Kinescope: ID видео из личного кабинета (ссылка kinescope.io/embed/<ID>).
// Пусто — на месте видео показывается заглушка «Видео скоро».
const KINESCOPE_ID = '0TzSmADrfbGydwwdqAmfwN';

function PlayButton() {
  return (
    <span className="h-16 w-16 rounded-full bg-orange ring-4 ring-white/40 grid place-items-center shadow-lg transition-transform duration-200 group-hover:scale-110">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polygon points="6,4 20,12 6,20" fill="#fff" />
      </svg>
    </span>
  );
}

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <Section id="story" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl">

        <div className="mx-auto max-w-2xl text-center">
          <Reveal as="h2" delay={0} className="font-display font-extrabold display-tight text-[clamp(2rem,4.2vw,3.2rem)] text-ink text-balance">
            Не знаете, <span className="text-orange">с чего начать</span>?
          </Reveal>
          <Reveal delay={120} className="mt-5 text-[clamp(1.05rem,1.5vw,1.2rem)] leading-relaxed text-ink/60 max-w-xl mx-auto">
            Специально для вас подготовили короткое видео: расскажем честно, как работает автоматизация, кому подходит и почему большинство внедрений окупаются за 2–3 месяца.
          </Reveal>
        </div>

        {/* видео */}
        <Reveal delay={80}>
          <div className="relative mt-12 w-full rounded-xl3 overflow-hidden aspect-video ring-1 ring-ink/[0.07]" style={{ background: '#FFF5EE' }}>
            {!KINESCOPE_ID ? (
              // Заглушка, пока видео не загружено в Kinescope
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#fff3e8] to-[#fde8cc]">
                <div className="h-16 w-16 rounded-full bg-orange/15 ring-2 ring-orange/30 grid place-items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" fill="#FF6A00" />
                  </svg>
                </div>
                <p className="text-ink/35 text-[0.875rem] font-medium tracking-wide">Видео скоро</p>
              </div>
            ) : playing ? (
              // Плеер Kinescope грузится только после клика
              <iframe
                src={`https://kinescope.io/embed/${KINESCOPE_ID}?autoplay=1`}
                title="О нас"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              // Фасад: фирменный градиент + кнопка play (iframe ещё не загружен)
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Смотреть видео"
                className="group absolute inset-0 w-full h-full cursor-pointer focus:outline-none bg-gradient-to-br from-[#2a1a10] via-[#3a2414] to-[#1a1208]"
              >
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  <PlayButton />
                </span>
                <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[13px] font-medium text-white/70">
                  Смотреть · 9 минут
                </span>
              </button>
            )}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={160} className="mt-8 flex justify-center">
          <Pill href="#audit" variant="primary" arrow>
            Получить разбор за 25 минут
          </Pill>
        </Reveal>

      </div>
    </Section>
  );
}
