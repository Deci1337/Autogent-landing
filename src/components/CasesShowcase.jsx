import { Reveal, Section, SectionHeader } from './shared';

export default function CasesShowcase() {
  const cards = Array.from({ length: 9 });
  return (
    <Section id="cases" className="py-20 md:py-28">
      <SectionHeader
        index="05" kicker="Портфолио"
        title={<>Кейсы</>}
        intro="Собираем витрину внедрений с измеримыми результатами. Скоро здесь появятся первые истории."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((_, i) => (
          <Reveal key={i} delay={(i % 4) * 70}
            className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-xl3 bg-white/45 p-6 ring-1 ring-dashed ring-ink/[0.12] backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-softer">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-ink/35">К/{String(i + 1).padStart(2, '0')}</span>
              <span className="h-7 w-7 rounded-full border border-dashed border-ink/20" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-24 rounded-lg bg-ink/5" />
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-ink/[0.08]" />
                <div className="h-3 w-1/2 rounded-full bg-ink/[0.06]" />
              </div>
              <p className="pt-1 text-[13.5px] font-medium text-ink/40">Кейс скоро будет добавлен</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
