import { useState } from 'react';
import { Reveal, Section, SectionHeader, AccordionItem } from './shared';

const OBJECTIONS = [
  { q: 'Безопасность данных', a: 'Данные обрабатываются на серверах в РФ, соответствие 152-ФЗ. Персональные данные скрываются до отправки в ИИ, доступы разграничены по отделам.' },
  { q: 'Сложно внедрять', a: 'Внедряем поэтапно и под ключ. Вы не меняете команду и инструменты — мы встраиваемся в то, что уже работает.' },
  { q: 'Непонятная цена и ROI', a: 'На бесплатном аудите считаем потенциальную экономию и стоимость внедрения. Вы видите окупаемость до старта.' },
  { q: 'У нас специфический бизнес', a: 'Если есть повторяющиеся процессы и переписки — агент применим. На аудите честно скажем, есть ли смысл внедрять.' },
];

export default function Objections() {
  const [open, setOpen] = useState(-1);
  return (
    <Section id="objections" className="py-20 md:py-28">
      <SectionHeader
        index="07" kicker="Сомнения"
        title={<>Частые <span className="text-orange">сомнения</span></>}
        intro="Отвечаем коротко и по делу на то, что обычно останавливает."
      />
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        {OBJECTIONS.map((o, i) => (
          <Reveal key={o.q} delay={(i % 2) * 80}>
            <AccordionItem q={o.q} a={o.a} idx={`obj${i}`} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
