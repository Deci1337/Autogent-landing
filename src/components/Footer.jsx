import { Pill } from './shared';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-10 border-t border-ink/[0.08]">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="#top" className="font-display text-[1.6rem] font-extrabold tracking-tight text-ink">
              <span>Auto<span className="text-orange">gent</span></span>
            </a>
            <p className="mt-4 max-w-sm text-[1.02rem] leading-relaxed text-ink/55">
              Проектируем и внедряем ИИ-агентов для внутренних операций бизнеса.
            </p>
            <div className="mt-6">
              <Pill href="#audit" variant="primary" arrow className="!px-6 !py-3.5 !text-[14.5px]">Получить бесплатный аудит</Pill>
            </div>
          </div>
          <div className="font-mono text-[13px] leading-relaxed text-ink/45">
            <p>Autogent</p>
            <p>ИНН: 000000000000</p>
            <p>г. [Город]</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-ink/[0.08] pt-6 text-[13px] text-ink/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Autogent. Все права защищены.</p>
          <a href="/privacy" className="hover:text-ink/60 transition-colors underline underline-offset-2">
            Политика конфиденциальности и обработки ПД
          </a>
        </div>
      </div>
    </footer>
  );
}
