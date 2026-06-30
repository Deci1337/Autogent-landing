import { Reveal, Section, Pill } from './shared';

// TODO: заменить src на реальную ссылку после съёмки
const VIDEO_SRC = null; // например: 'https://www.youtube.com/embed/XXXX'

export default function VideoSection() {
  return (
    <Section id="story" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl">

        <Reveal delay={0} className="mb-8 text-center">
          <p className="text-[0.95rem] font-medium text-ink/40 tracking-wide uppercase mb-3">
            Не знаете с чего начать?
          </p>
          <p className="font-display text-[clamp(1.2rem,2.5vw,1.55rem)] font-bold text-ink leading-snug text-balance">
            Специально для вас подготовили небольшое видео
          </p>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink/60 max-w-[48ch] mx-auto">
            Расскажем честно: как работает автоматизация, кому подходит и почему большинство внедрений окупаются за 2–3 месяца..
          </p>
        </Reveal>

        {/* видео */}
        <Reveal delay={80}>
          <div className="relative w-full rounded-xl3 overflow-hidden aspect-video ring-1 ring-ink/[0.07]" style={{ background: '#FFF5EE' }}>
            {VIDEO_SRC ? (
              <iframe
                src={VIDEO_SRC}
                title="О нас"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#fff3e8] to-[#fde8cc]">
                <div className="h-16 w-16 rounded-full bg-orange/15 ring-2 ring-orange/30 grid place-items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" fill="#FF6A00" />
                  </svg>
                </div>
                <p className="text-ink/35 text-[0.875rem] font-medium tracking-wide">Видео скоро</p>
              </div>
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
