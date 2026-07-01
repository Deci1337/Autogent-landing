import { useRef } from 'react';
import { Section, SectionHeader } from './shared';

const PAINS = [
  {
    n: '01',
    t: 'Руководитель тратит время на ответ на одни и те же вопросы',
    cost: 'Онбординг 1 человека — это 30–40% его годовой зарплаты',
    d: 'Новый сотрудник выходит в продуктив через 1–2 месяца. Всё это время: вопросы, объяснения, отвлечения, а вы платите дважды: оклад новичка и время менеджера.',
  },
  {
    n: '02',
    t: 'Сотрудники ошибаются снова и снова',
    cost: '1 ошибка в работе с клиентом может привести к разрыву партнёрства или потере репутации',
    d: 'Обучали, разговаривали, но опять ошибка. Человеческий фактор будет всегда.',
  },
  {
    n: '03',
    t: 'РОП не успевает развивать отдел продаж',
    cost: 'Физически РОП не может прослушать все звонки и дать обратную связь каждому менеджеру',
    d: 'Менеджеры сливают сделки, совершают ошибки и тратят маркетинговый бюджет. Без контроля отдела продаж в реальном времени роста конверсии нет.',
  },
  {
    n: '04',
    t: 'Отчёты и документы делаются вручную',
    cost: '4–6 часов в неделю на рутинную генерацию',
    d: 'КП, акты, сводки по воронке каждый раз с нуля. Это потеря времени квалифицированных людей.',
  },
  {
    n: '05',
    t: 'Лиды теряются и не дожимаются',
    cost: '80% лидов уходит к конкуренту если не дожидается своего ответа',
    d: 'Даже на идеальной воронке продаж лиды из неё выходят если клиенту отвечают медленно и не напоминают о продукте. До 30% выручки теряется на таких ситуациях.',
  },
  {
    n: '06',
    t: 'Растёт ФОТ на менеджеров',
    cost: 'С помощью ИИ-агентов можно масштабироваться без увеличения количества сотрудников',
    d: 'Только на ФОТе можно ежемесячно экономить от 1 млн рублей.',
  },
];

const CARD_W = 380;
const GAP = 20;

export default function Pain() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * (CARD_W + GAP), behavior: 'smooth' });
  };

  return (
    <Section id="pain" className="py-20 md:py-28">
      <SectionHeader
        kicker="Проверьте себя"
        title={<>Если узнали себя, значит, есть потенциал <span className="text-orange">увеличить прибыль</span> внедрив ИИ-агентов</>}
        intro={<>
          <span className="block whitespace-nowrap">Шесть ситуаций, которые обходятся бизнесу минимум в сотни тысяч рублей в месяц.</span>
          <span className="block whitespace-nowrap">Если хотя бы две из них про ваш бизнес, аудит окупится за первую неделю.</span>
        </>}
      />

      <div className="relative mt-14">
        <button
          onClick={() => scroll(-1)}
          aria-label="Назад"
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white border border-ink/10 flex items-center justify-center shadow-sm hover:bg-orange hover:border-orange hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div
          ref={scrollRef}
          style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-5" style={{ width: 'max-content' }}>
            {PAINS.map((p) => (
              <div key={p.n} className="flex-shrink-0" style={{ width: CARD_W }}>
                <div className="flex flex-col p-8 gap-3 rounded-[20px] border border-ink/[0.08] bg-white" style={{ height: 300 }}>
                  <span className="font-mono text-[13px] text-orange">{p.n}</span>
                  <h3 className="font-display text-[1.2rem] font-bold text-ink leading-snug">{p.t}</h3>
                  <p className="text-[0.82rem] font-semibold text-orange leading-snug">{p.cost}</p>
                  <p className="mt-auto text-[0.95rem] leading-relaxed text-ink/60">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => scroll(1)}
          aria-label="Вперёд"
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white border border-ink/10 flex items-center justify-center shadow-sm hover:bg-orange hover:border-orange hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </Section>
  );
}
