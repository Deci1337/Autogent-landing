import { Reveal, Section, Pill } from './shared';

// TODO: заменить src на реальную ссылку после съёмки
const VIDEO_SRC = null; // например: 'https://www.youtube.com/embed/XXXX'

export default function VideoSection() {
  return (
    <Section id="story" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl">

        <div className="mx-auto max-w-2xl text-center">
          <Reveal className="flex items-center justify-center gap-3">
            <span className="eyebrow text-[12px] text-ink/45">Видео</span>
          </Reveal>
          <Reveal as="h2" delay={60} className="mt-5 font-display font-extrabold display-tight text-[clamp(2rem,4.2vw,3.2rem)] text-ink text-balance">
            Не знаете, <span className="text-orange">с чего начать</span>?
          </Reveal>
          <Reveal delay={120} className="mt-5 text-[clamp(1.05rem,1.5vw,1.2rem)] leading-relaxed text-ink/60 max-w-xl mx-auto">
            Специально для вас подготовили короткое видео — расскажем честно, как работает автоматизация, кому подходит и почему большинство внедрений окупаются за 2–3 месяца.
          </Reveal>
        </div>

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
