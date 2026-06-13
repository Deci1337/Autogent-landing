import { useState, useEffect } from 'react';
import { Pill } from './shared';

export default function Header() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const heroEl = document.getElementById('top');
    const onScroll = () => {
      const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
      setSolid(heroBottom < 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dark = !solid;

  return (
    <>
      {/* SVG-фильтр для эффекта жидкого стекла */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="liquid-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="3" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid ? 'py-3' : 'py-5'}`}>
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
          <div className={`relative flex items-center justify-between rounded-full px-5 sm:px-6 py-3 transition-all duration-500 ${solid ? 'liquid-glass' : ''}`}>

            {/* Слой жидкого стекла: blur + дисторсия */}
            {solid && (
              <span className="liquid-glass-bg" aria-hidden="true" />
            )}

            <a href="#top" className={`relative z-10 flex items-center gap-2.5 font-sans font-extrabold text-[20px] tracking-tight transition-colors duration-300 ${dark ? 'text-white' : 'text-ink'}`}>
              <span>Auto<span className="text-orange">gent</span></span>
            </a>
            <nav className={`relative z-10 hidden items-center gap-8 text-[14.5px] font-medium md:flex transition-colors duration-300 ${dark ? 'text-white/65' : 'text-ink/65'}`}>
              <a href="#pain" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Зачем</a>
              <a href="#cases" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Кейсы</a>
              <a href="#stack" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Интеграции</a>
              <a href="#how" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Как это работает</a>
              <a href="#faq" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Вопросы</a>
            </nav>
            <div className="relative z-10">
              <Pill href="#audit" variant="primary" className="!px-4 !py-2.5 !text-[13px] sm:!px-5 sm:!py-3 sm:!text-[14px]">
                <span className="sm:hidden">Получить разбор</span>
                <span className="hidden sm:inline">Разобрать мой бизнес бесплатно</span>
              </Pill>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
