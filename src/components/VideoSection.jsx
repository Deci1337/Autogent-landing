import { useState } from 'react';
import { Reveal, Section, Pill } from './shared';

// Kinescope: ID видео (ссылка kinescope.io/embed/<ID>).
const KINESCOPE_ID = '0TzSmADrfbGydwwdqAmfwN';
// Собственная заставка (положить файл в public/video-poster.jpg). Показывается мгновенно,
// плеер Kinescope грузится только по клику play.
const POSTER_SRC = '/video-poster.jpg';

function PlayButton() {
  return (
    <span className="h-[68px] w-[68px] rounded-full bg-orange ring-4 ring-white/40 grid place-items-center shadow-xl transition-transform duration-200 group-hover:scale-110">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polygon points="6,4 20,12 6,20" fill="#fff" />
      </svg>
    </span>
  );
}

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const [posterOk, setPosterOk] = useState(true);

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
          <div className="relative mt-12 w-full rounded-xl3 overflow-hidden aspect-video ring-1 ring-ink/[0.07]" style={{ background: '#0d0d0d' }}>
            {playing ? (
              <iframe
                src={`https://kinescope.io/embed/${KINESCOPE_ID}?autoplay=1`}
                title="О нас"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Смотреть видео"
                className="group absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
              >
                {posterOk ? (
                  <img
                    src={POSTER_SRC}
                    alt="Смотреть видео"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setPosterOk(false)}
                  />
                ) : (
                  <span className="absolute inset-0 bg-gradient-to-br from-[#2a1a10] via-[#3a2414] to-[#1a1208]" />
                )}
                <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/5" />
                <span className="absolute inset-0 grid place-items-center">
                  <PlayButton />
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
