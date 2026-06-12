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

  const dark = !solid; // поверх тёмного Hero

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid ? 'py-3' : 'py-5'}`}>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <div className={`flex items-center justify-between rounded-full px-5 sm:px-6 py-3 transition-all duration-500 ${solid ? 'glass shadow-softer ring-1 ring-ink/5' : ''}`}>
          <a href="#top" className={`flex items-center gap-2.5 font-sans font-extrabold text-[20px] tracking-tight transition-colors duration-300 ${dark ? 'text-white' : 'text-ink'}`}>
            <span>Auto<span className="text-orange">gent</span></span>
          </a>
          <nav className={`hidden items-center gap-8 text-[14.5px] font-medium md:flex transition-colors duration-300 ${dark ? 'text-white/65' : 'text-ink/65'}`}>
            <a href="#pain" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Зачем</a>
            <a href="#stack" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Интеграции</a>
            <a href="#how" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Как это работает</a>
            <a href="#faq" className={`transition-colors ${dark ? 'hover:text-white' : 'hover:text-ink'}`}>Вопросы</a>
          </nav>
          <Pill href="#audit" variant="primary" className="!px-5 !py-3 !text-[14px]">Разобрать мой бизнес бесплатно</Pill>
        </div>
      </div>
    </header>
  );
}
