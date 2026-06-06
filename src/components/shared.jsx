import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

/* ---- Reveal ---- */
const _revealReg = new Set();
function _checkReveals() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  _revealReg.forEach((item) => {
    const el = item.el;
    if (!el) { _revealReg.delete(item); return; }
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.bottom > -40) {
      item.show();
      _revealReg.delete(item);
    }
  });
}
let _revealBound = false;
let _rafActive = false;
let _revealFrames = 0;
function _revealPump() {
  _checkReveals();
  _revealFrames -= 1;
  if (_revealReg.size > 0 && _revealFrames > 0) requestAnimationFrame(_revealPump);
  else _rafActive = false;
}
function _revealKick() {
  _revealFrames = 8;
  if (!_rafActive) { _rafActive = true; requestAnimationFrame(_revealPump); }
}
function _bindReveal() {
  if (_revealBound) return;
  _revealBound = true;
  window.addEventListener('scroll', _revealKick, { passive: true });
  window.addEventListener('resize', _revealKick);
  window.addEventListener('load', _revealKick);
  _revealKick();
  [120, 350, 700].forEach((t) => setTimeout(_revealKick, t));
}

export function Reveal({ children, as: Tag = 'div', delay = 0, className = '', style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const item = { el: ref.current, show: () => setShown(true) };
    _revealReg.add(item);
    _bindReveal();
    _revealKick();
    return () => _revealReg.delete(item);
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: delay + 'ms', ...style }}
    >
      {children}
    </Tag>
  );
}

/* ---- Arrow ---- */
export function Arrow({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---- Pill button ---- */
export function Pill({ children, href = '#', variant = 'primary', className = '', onClick, type, arrow = false }) {
  const base = 'group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition-all duration-300 focusring select-none';
  const sizes = 'px-7 py-4 text-[15px] md:text-base';
  const styles = {
    primary: 'bg-orange text-seashell shadow-glow hover:bg-orange2 hover:-translate-y-0.5 active:translate-y-0',
    dark:    'bg-ink text-seashell hover:-translate-y-0.5 active:translate-y-0 shadow-soft',
    ghost:   'bg-white/70 text-ink ring-1 ring-ink/10 hover:bg-white hover:-translate-y-0.5 backdrop-blur',
    link:    'text-ink hover:text-orange2 !px-2',
  };
  const cls = `${base} ${sizes} ${styles[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );
  if (type === 'submit' || (onClick && !href)) {
    return <button type={type || 'button'} onClick={onClick} className={cls}>{inner}</button>;
  }
  return <a href={href} onClick={onClick} className={cls}>{inner}</a>;
}

/* ---- Chip ---- */
export function Chip({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-white/70 ring-1 ring-ink/[0.08] px-4 py-2.5 text-[14px] font-medium text-ink/80 backdrop-blur ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-orange" />
      {children}
    </span>
  );
}

/* ---- SectionHeader ---- */
export function SectionHeader({ index, kicker, title, intro, align = 'left', max = 'max-w-2xl' }) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} ${max}`}>
      <Reveal className="flex items-center gap-3" style={center ? { justifyContent: 'center' } : {}}>
        <span className="eyebrow text-[12px] text-orange2">{index}</span>
        <span className="h-px w-8 bg-orange/40" />
        <span className="eyebrow text-[12px] text-ink/45">{kicker}</span>
      </Reveal>
      <Reveal as="h2" delay={60} className="mt-5 font-display font-extrabold display-tight text-[clamp(2rem,4.6vw,3.5rem)] text-ink">
        {title}
      </Reveal>
      {intro && (
        <Reveal delay={120} className={`mt-5 text-[clamp(1.05rem,1.5vw,1.2rem)] leading-relaxed text-ink/60 ${center ? 'mx-auto' : ''} max-w-xl`}>
          {intro}
        </Reveal>
      )}
    </div>
  );
}

/* ---- Section wrapper ---- */
export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

/* ---- GlowField ---- */
export function GlowField() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const root = ref.current;
        if (!root) return;
        root.querySelectorAll('[data-speed]').forEach((el) => {
          const s = parseFloat(el.dataset.speed);
          el.style.transform = `translate3d(0, ${y * s}px, 0)`;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div data-speed="0.05" className="absolute -top-40 -left-32 h-[680px] w-[680px] blob floaty"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,150,90,.55), rgba(255,150,90,0) 65%)' }} />
      <div data-speed="-0.04" className="absolute -top-24 right-[-12%] h-[560px] w-[560px] blob floaty f2"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,106,0,.30), rgba(255,106,0,0) 62%)' }} />
      <div data-speed="0.07" className="absolute top-[42%] left-[-10%] h-[520px] w-[520px] blob floaty f3"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(252,200,150,.5), rgba(252,200,150,0) 65%)' }} />
      <div data-speed="-0.05" className="absolute bottom-[2%] right-[-8%] h-[620px] w-[620px] blob floaty"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,180,120,.42), rgba(255,180,120,0) 64%)' }} />
    </div>
  );
}

/* ---- AccordionItem ---- */
export function AccordionItem({ q, a, open, onToggle, idx }) {
  const bodyId = `acc-${idx}`;
  const bodyRef = useRef(null);
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (firstRender.current) {
      gsap.set(el, { height: 0, overflow: 'hidden' });
      firstRender.current = false;
      return;
    }
    if (open) {
      gsap.to(el, { height: 'auto', duration: 0.28, ease: 'back.out(1.4)', overflow: 'hidden' });
    } else {
      gsap.to(el, { height: 0, duration: 0.22, ease: 'power3.inOut', overflow: 'hidden' });
    }
  }, [open]);

  return (
    <div className="rounded-xl3 bg-white/55 ring-1 ring-ink/[0.06] shadow-softer backdrop-blur transition-shadow duration-300">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between gap-5 px-7 py-6 text-left focusring"
      >
        <span className="font-display text-[1.12rem] font-bold text-ink">{q}</span>
        <span className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-seashell ring-1 ring-ink/10 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          <span className="absolute h-3.5 w-0.5 rounded bg-orange2" />
          <span className="absolute h-0.5 w-3.5 rounded bg-orange2" />
        </span>
      </button>
      <div id={bodyId} ref={bodyRef}>
        <p className="px-7 pb-7 text-[1.04rem] leading-relaxed text-ink/65">{a}</p>
      </div>
    </div>
  );
}
