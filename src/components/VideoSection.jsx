import { Reveal, Section, Pill } from './shared';

// TODO: заменить src на реальную ссылку после съёмки
const VIDEO_SRC = null; // например: 'https://www.youtube.com/embed/XXXX'

export default function VideoSection() {
  return (
    <Section id="story" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl">

        {/* видео */}
        <Reveal delay={0}>
          <div className="relative w-full rounded-xl3 overflow-hidden bg-ink aspect-video shadow-soft ring-1 ring-ink/10">
            {VIDEO_SRC ? (
              <iframe
                src={VIDEO_SRC}
                title="О нас"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              /* плейсхолдер */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-ink via-ink to-[#1a1a1a]">
                <div className="h-16 w-16 rounded-full bg-orange/20 ring-2 ring-orange/40 grid place-items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" fill="#FF6A00" />
                  </svg>
                </div>
                <p className="text-white/40 text-[0.875rem] font-medium tracking-wide">Видео скоро</p>
              </div>
            )}
          </div>
        </Reveal>

        {/* текст под видео */}
        <Reveal delay={100} className="mt-8 text-center">
          <p className="text-[1.05rem] leading-relaxed text-ink/60 max-w-[48ch] mx-auto">
            Расскажем честно: как работает автоматизация, кому подходит и почему большинство внедрений окупаются за 2–3 месяца.
          </p>
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
