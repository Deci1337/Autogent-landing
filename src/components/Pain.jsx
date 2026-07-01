import { Reveal, Section, SectionHeader } from './shared';
import BorderGlow from './BorderGlow';

const PAINS = [
  {
    n: '01',
    t: 'Руководитель тратит время на ответ на одни и те же вопросы',
    cost: 'Онбординг 1 человека = 30–40% его годовой зарплаты',
    d: 'Новый сотрудник выходит в продуктив 1–2 месяца. Всё это время: вопросы, объяснения, отвлечения. Вы платите дважды: оклад новичка и время менеджера.',
  },
  {
    n: '02',
    t: 'Сотрудники ошибаются снова и снова',
    cost: '1 ошибка в документах = 3–8 часов на исправление',
    d: 'Обучали, разговаривали, но опять ошибка. Человеческий фактор не лечится повторным объяснением.',
  },
  {
    n: '03',
    t: 'РОП не знает что происходит в отделе продаж',
    cost: 'Более 4 часов в день на прослушку = рабочая неделя в месяц впустую',
    d: 'Менеджеры сливают сделки, РОП узнаёт постфактум. Без контроля диалогов в реальном времени роста конверсии нет.',
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
    d: 'Менеджер занят, заявка висит. Клиент не отвечает и никто не напомнил. До 30% выручки теряется на таких ситуациях.',
  },
  {
    n: '06',
    t: 'Растёт ФОТ на менеджеров',
    cost: 'С помощью ИИ-агентов можно масштабироваться без увеличения количества сотрудников',
    d: 'Только на ФОТе можно ежемесячно экономить от 1 млн рублей.',
  },
];

export default function Pain() {
  return (
    <Section id="pain" className="py-20 md:py-28">
      <SectionHeader
        kicker="Проверьте себя"
        title={<>Если узнали себя, значит, есть потенциал <span className="text-orange">увеличить прибыль</span> внедрив ИИ-агентов</>}
        intro={<>
          <span className="block whitespace-nowrap">Шесть ситуаций, которые обходятся бизнесу минимум в 200 тыс. ₽ в месяц.</span>
          <span className="block whitespace-nowrap">Если хотя бы две из них про ваш бизнес, аудит окупится за первую неделю.</span>
        </>}
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PAINS.map((p, i) => (
          <Reveal key={p.n} delay={i * 80} className="transition-all duration-500 hover:-translate-y-1">
            <BorderGlow
              backgroundColor="#fffaf5"
              glowColor="30 90 65"
              colors={['#ea8a08', '#f5a83a', '#c45c00']}
              borderRadius={20}
              glowRadius={35}
              glowIntensity={1.2}
              coneSpread={22}
            >
              <div className="flex flex-col p-8 gap-3 h-full">
                <span className="font-mono text-[13px] text-orange">{p.n}</span>
                <h3 className="font-display text-[1.2rem] font-bold text-ink leading-snug">{p.t}</h3>
                <p className="text-[0.82rem] font-semibold text-orange leading-snug">{p.cost}</p>
                <p className="mt-auto text-[0.95rem] leading-relaxed text-ink/60">{p.d}</p>
              </div>
            </BorderGlow>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
