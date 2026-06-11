import { useState, useRef, useEffect, useCallback } from 'react';
import { Reveal, Section, SectionHeader } from './shared';

/* ── данные кейсов ─────────────────────────────────────────────── */
const CASES = [
  {
    id: 1,
    tag: 'Сервисный аутсорсинг',
    title: 'ИИ-отдел продаж: с 3 часов до 40 секунд',
    result: '+30% к конверсии входящих, РОП освобождён от рутины',
    agents: ['ИИ-продажник', 'ИИ-РОП'],
    problem: 'Два менеджера не справлялись с потоком входящих. Заявки висели 2–4 часа без ответа — особенно вечером и в выходные. РОП тратил 60% времени на прослушку и ручные отчёты вместо работы с командой.',
    stat: 'MIT Sloan: вероятность квалифицировать лид падает в 21 раз, если ответ приходит через 30 минут вместо 5.',
    path: ['Аудит воронки продаж', 'Выявили: 67% заявок — вне рабочих часов', 'Спроектировали ИИ-менеджера под сценарии продаж', 'Обучили на скриптах, возражениях, прайсе', 'Запустили ИИ-РОП: авторепорты + мониторинг диалогов', '2 недели тестовой эксплуатации', 'Полный запуск'],
    solution: 'ИИ-менеджер принимает входящие в Telegram 24/7, квалифицирует по BANT, работает с возражениями, передаёт горячих с готовой карточкой. ИИ-РОП ежедневно формирует срез по диалогам — без прослушки.',
    results: [
      { label: 'Скорость первого ответа', before: '2–4 часа', after: '< 1 мин' },
      { label: 'Охват нерабочих часов', before: '0%', after: '100%' },
      { label: 'Время РОПа на отчёты', before: '~3 ч/день', after: '~20 мин' },
    ],
  },
  {
    id: 2,
    tag: 'B2B SaaS · Платформа',
    title: 'Каждый клиент платформы получил своего ИИ-ассистента',
    result: 'База знаний разворачивается за 15 минут вместо дней',
    agents: ['ИИ-онбординг', 'RAG-конструктор'],
    problem: 'Клиенты платформы хотели чат-бота со своей базой знаний, но создавать каждый вручную — дорого и долго. Поддержка тонула в одинаковых вопросах.',
    stat: 'McKinsey: сотрудники тратят в среднем 1,8 часа в день только на поиск информации.',
    path: ['Аудит онбординга клиентов', 'Выявили: 80% вопросов — типовые, ответы есть в документах', 'Спроектировали no-code RAG-конструктор', 'Клиент загружает файлы → агент обучается → готов', 'Пилот на 10 клиентах', 'Релиз как встроенная функция платформы'],
    solution: 'Встроенный RAG-конструктор: владелец бизнеса загружает прайс, регламенты, FAQ — получает готового ассистента. Отвечает со ссылкой на источник. Никакого кода, настройка за 15 минут.',
    results: [
      { label: 'Создание базы знаний', before: 'Дни / не делали', after: '~15 минут' },
      { label: 'Нагрузка на поддержку платформы', before: '100%', after: '−40%' },
      { label: 'Новая фича в продукте', before: '—', after: 'Конкурентное преимущество' },
    ],
  },
  {
    id: 3,
    tag: 'Велнес · Дистрибуция',
    title: 'ИИ-менеджер закрывает 400+ SKU — без участия людей',
    result: '0 пропущенных обращений, ответ за 20 секунд',
    agents: ['ИИ-продажник', 'ИИ-онбординг'],
    problem: 'Менеджеры вручную консультировали по огромному каталогу. Один и тот же вопрос — десятки раз в день. Ошибки в рекомендациях, потеря клиентов ночью.',
    stat: 'Tidio Research: 80% клиентов, взаимодействовавших с ИИ-поддержкой, оценивают опыт положительно.',
    path: ['Аудит входящих за 3 месяца', 'Выявили: 78% вопросов — типовые консультации по каталогу', 'Структурировали базу: 400+ SKU + показания + состав', 'Обучили ИИ-менеджера на сценариях подбора', 'Интеграция в Telegram-канал', '3 недели дообучения по реальным диалогам'],
    solution: 'ИИ-менеджер консультирует по каталогу: задаёт уточняющие вопросы, подбирает продукты, объясняет состав. Передаёт живому специалисту только нестандартные случаи.',
    results: [
      { label: 'Пропущенные обращения', before: 'Есть', after: '~0' },
      { label: 'Скорость ответа', before: '1–5 часов', after: '< 30 сек' },
      { label: 'Нагрузка на менеджеров', before: '100% консультаций', after: 'Только сложные' },
    ],
  },
  {
    id: 4,
    tag: 'E-commerce · Электротехника',
    title: '5 человек → 1 РОП + ИИ. Объём продаж не упал',
    result: 'Экономия ФОТ ~300 тыс. ₽/мес, заказ оформляется за 3 мин',
    agents: ['ИИ-продажник', 'ИИ-РОП'],
    problem: '4 менеджера занимались ответами на Авито, сверкой наличия в МойСклад, оформлением доставки через СДЭК и переносом данных в CRM. 70% работы — механика, не требующая человека.',
    stat: 'Harvard Business Review: компании, отвечающие в течение 1 часа, в 7 раз чаще квалифицируют лид.',
    path: ['Хронометраж работы менеджеров за 2 недели', 'Выявили: 3 из 4 менеджеров — на механических операциях', 'Интеграция: Авито → ИИ-менеджер → МойСклад', 'Интеграция: оформление доставки → СДЭК API', 'ИИ-РОП: контроль диалогов, ежедневный отчёт', 'Постепенный вывод менеджеров, РОП остался'],
    solution: 'ИИ-менеджер в Авито: отвечает, проверяет наличие в МойСклад в реальном времени, оформляет доставку через СДЭК, создаёт сделку в CRM. ИИ-РОП сигнализирует при нестандартных ситуациях.',
    results: [
      { label: 'Штат отдела продаж', before: '4 менеджера + РОП', after: '1 РОП + ИИ' },
      { label: 'Скорость оформления заказа', before: '15–40 мин', after: '< 3 мин' },
      { label: 'Ошибки при переносе данных', before: 'Есть', after: '~0' },
    ],
  },
  {
    id: 5,
    tag: 'Производство · FMCG',
    title: 'Графовая база знаний: регламент за 15 секунд вместо 20 минут',
    result: 'Онбординг новых сотрудников быстрее на 40%',
    agents: ['ИИ-онбординг', 'Корпоративный RAG'],
    problem: 'Сотрудники тратили часы на поиск нужного регламента. Коллеги отвлекали друг друга. Когда уходил опытный человек — уходили и знания вместе с ним.',
    stat: 'McKinsey: сотрудники тратят 1,8 ч/день только на поиск информации — это 9 часов рабочей недели впустую.',
    path: ['Аудит: откуда сотрудники берут информацию', 'Выявили: 3 разных хранилища, нет единого источника', 'Построили графовую базу знаний (связи между документами)', 'Обучили агента: отвечает со ссылкой на источник', 'Права доступа по отделам', 'Запуск в Telegram — без новых приложений'],
    solution: 'Корпоративный RAG-агент в Telegram: вопрос голосом или текстом → ответ со ссылкой на документ. Графовая структура понимает связи между процессами, а не просто ищет по ключевым словам.',
    results: [
      { label: 'Время поиска информации', before: '15–30 мин', after: '< 1 мин' },
      { label: 'Потеря знаний при увольнении', before: 'Критическая', after: 'Знания в системе' },
      { label: 'Время онбординга', before: '100%', after: '−40%' },
    ],
  },
  {
    id: 6,
    tag: 'Финансы · Банк',
    title: 'Оператор тратит на ответное письмо в 4 раза меньше времени',
    result: 'Автогенерация ответов + авторасределение по отделам',
    agents: ['ИИ-онбординг', 'Почтовый ассистент'],
    problem: 'Операторы обрабатывали сотни входящих писем ежедневно: прочесть, определить тему, найти отдел, составить ответ в корпоративном стиле. 60–70% времени — набор текста по шаблонам.',
    stat: 'Deloitte: автоматизация обработки документов сокращает время на задачу до 37%.',
    path: ['Анализ: типология входящих писем за месяц', 'Выявили: 5 категорий покрывают 80% обращений', 'Разработали интерфейс: аналог почты с профилем оператора', 'ИИ читает письмо → определяет отдел → генерирует ответ', 'Оператор проверяет и отправляет', 'Интеграция YandexGPT / Qwen 3 235B'],
    solution: 'Пока оператор открывает письмо — ИИ уже генерирует ответ в корпоративном стиле. Автоопределяет профильный отдел. Оператор редактирует если нужно и отправляет — не пишет с нуля.',
    results: [
      { label: 'Время на 1 ответ', before: '8–12 мин', after: '2–3 мин' },
      { label: 'Ошибки маршрутизации', before: 'Есть', after: '~0' },
      { label: 'Соответствие корпстилю', before: 'Зависит от оператора', after: 'Стабильное' },
    ],
  },
  {
    id: 7,
    tag: 'GovTech · Маркетплейс',
    title: 'Умный поиск: поставщик находит нужное за секунды',
    result: 'Нулевая выдача упала с 35% до 5–8%',
    agents: ['ИИ-поиск', 'Семантический RAG'],
    problem: 'Поставщики не находили нужные позиции: вводили "не те" слова, не знали терминов, уходили ни с чем. Классический поиск не понимал синонимов и смысла запроса.',
    stat: 'Forrester: улучшение поиска на сайте повышает конверсию на 43% и снижает процент отказов.',
    path: ['Анализ: топ-500 поисковых запросов пользователей', 'Выявили: 35% запросов — нулевая выдача', 'Внедрили семантический поиск с embeddings', 'Обучили на каталоге + синонимах + запросах', 'A/B тест: старый поиск vs ИИ-поиск', 'Полный переход на новую модель'],
    solution: 'Семантический ИИ-поиск понимает смысл запроса. "Крепёж для дерева" находит то же, что "саморезы по дереву". Персонализация по истории запросов.',
    results: [
      { label: 'Нулевая выдача', before: '~35%', after: '~5–8%' },
      { label: 'Время до первого результата', before: '~45 сек', after: '~8 сек' },
      { label: 'Релевантность выдачи', before: 'Ключевые слова', after: 'Семантика + контекст' },
    ],
  },
  {
    id: 8,
    tag: 'Транспорт · Крупный бизнес',
    title: 'Агент внутреннего контура заменил поддержку и отчётность',
    result: 'Время подготовки отчёта о проверке — в 4 раза меньше',
    agents: ['ИИ-онбординг', 'Внутренний ассистент'],
    problem: 'Сотрудники поддержки ежедневно отвечали на типовые внутренние вопросы. Составление отчётов по итогам проверок — ручной труд, занимало часы, с риском ошибок.',
    stat: 'McKinsey: компании с развитым knowledge management на 25% эффективнее в принятии решений.',
    path: ['Аудит: типология внутренних запросов за квартал', 'Выявили: 75% запросов — повторяющиеся', 'Собрали базу знаний: регламенты, формы, инструкции', 'Развернули агента во внутреннем контуре', 'Добавили модуль автогенерации отчётов по проверкам', 'Разграничили права по подразделениям'],
    solution: 'Агент внутреннего контура: отвечает на вопросы по регламентам, автоматически генерирует черновики отчётов по итогам проверок. Работает без интернета, данные не покидают контур.',
    results: [
      { label: 'Время подготовки отчёта', before: '2–4 часа', after: '20–40 мин' },
      { label: 'Нагрузка на внутреннюю поддержку', before: '100%', after: '−60%' },
      { label: 'Ошибки в отчётах', before: 'Есть', after: 'Минимизированы' },
    ],
  },
  {
    id: 9,
    tag: 'Телеком · Крупный бизнес',
    title: 'Единая точка знаний для тысяч сотрудников в мессенджере',
    result: 'Онбординг быстрее на 35%, вопросы руководителям −50%',
    agents: ['ИИ-онбординг', 'Корпоративный RAG'],
    problem: 'Новые сотрудники месяцами выходили на продуктивность. Документация раздроблена, единой точки входа нет. Руководители тратили время на повторные объяснения одного и того же.',
    stat: 'SHRM: стоимость онбординга одного сотрудника — до 50–60% его годовой зарплаты. Ускорение — прямая экономия.',
    path: ['Аудит: откуда новые сотрудники берут информацию', 'Выявили: 4 разных источника без приоритизации', 'Собрали единую базу знаний, структурировали по ролям', 'Развернули агента в корпоративном мессенджере', 'Права доступа по уровню и отделу', 'Запуск + 4 недели дообучения'],
    solution: 'ИИ-онбординг агент: новый сотрудник задаёт вопрос — получает ответ со ссылкой на источник, без отвлечения коллег. Агент знает отдел сотрудника и показывает только релевантное.',
    results: [
      { label: 'Время выхода на продуктивность', before: '100%', after: '−35%' },
      { label: 'Вопросы руководителям', before: 'N в день', after: '−50%' },
      { label: 'Единая база знаний', before: 'Нет', after: 'Есть, актуальная' },
    ],
  },
  {
    id: 10,
    tag: 'Ретейл · Telegram-коммерция',
    title: 'ИИ-агент убрал менеджеров из операционки магазина',
    result: 'Магазин работает 24/7, конверсия выросла за счёт скорости',
    agents: ['ИИ-продажник', 'Операционный агент'],
    problem: 'Менеджеры вели клиента от первого сообщения до доставки вручную. Масштабирование упиралось в людей — хочешь больше заказов, нанимай нового менеджера.',
    stat: 'Tidio: AI-поддержка увеличивает средний чек до +47% за счёт персонализированных рекомендаций.',
    path: ['Хронометраж: что делает менеджер в течение дня', 'Выявили: 80% задач — алгоритмические', 'Автоматизировали: ответы → наличие → заказ → доставка', 'Интегрировали склад (наличие в реальном времени)', 'Подключили маршрутизацию для курьеров', 'Настроили авторепорты: заказы, клиенты, частые товары'],
    solution: 'ИИ-продажник ведёт клиента от приветствия до оформления заказа. Операционный агент обновляет склад, строит маршруты курьерам, отправляет отчёты владельцу, напоминает о незавершённых заказах.',
    results: [
      { label: 'Участие менеджера в типовом заказе', before: 'Полное', after: '~0' },
      { label: 'Скорость ответа клиенту', before: '10–60 мин', after: '< 30 сек' },
      { label: 'Работа в нерабочее время', before: 'Нет', after: '24/7' },
    ],
  },
  {
    id: 11,
    tag: 'Строительство · Фундаменты',
    title: 'Ни одной потерянной заявки в сезон — ИИ отвечает первым',
    result: '+20% к записям на замер, 0 пропущенных обращений',
    agents: ['ИИ-продажник'],
    problem: 'В сезон поток заявок из Авито, ВКонтакте, WhatsApp превышал возможности менеджера. Часть заявок висела без ответа 4–6 часов — клиент уже подписал договор с конкурентом.',
    stat: 'Lead Response Management Study: 21-кратное снижение квалификации, если ответ пришёл через 30 минут вместо 5.',
    path: ['Аудит: откуда приходят заявки и сколько теряется', 'Выявили: 30% заявок без ответа в первые 2 часа уходят', 'Подключили все каналы к единому ИИ-менеджеру', 'Обучили: услуги, прайс, запись на замер', 'Передача горячих заявок в мессенджер руководителю', 'Запуск до начала сезона'],
    solution: 'ИИ-менеджер одновременно ведёт диалоги во всех каналах. Консультирует по типам фундаментов, считает примерную стоимость, записывает на выезд геодезиста.',
    results: [
      { label: 'Время первого ответа', before: '1–6 часов', after: '< 1 мин' },
      { label: 'Пропущенные заявки в сезон', before: '~30%', after: '~0' },
      { label: 'Загрузка менеджера', before: 'Всё подряд', after: 'Только тёплые' },
    ],
  },
  {
    id: 12,
    tag: 'Медицина · Стоматология',
    title: 'ИИ-квалификатор: администратор работает только с целевыми',
    result: 'Конверсия запись → приход +20%, нецелевые отфильтрованы',
    agents: ['ИИ-квалификатор', 'ИИ-продажник'],
    problem: 'Администраторы одинаково тратили время на всех: и на ищущих "подешевле", и на тех, кто готов к имплантации. Запись часто не конвертилась в приход.',
    stat: 'Salesforce: компании с квалификацией лидов закрывают на 30% больше сделок при тех же затратах на привлечение.',
    path: ['Аудит: анализ входящих за 2 месяца по источникам', 'Выявили: 40% лидов — нецелевые', 'Разработали сценарий квалификации: 4 вопроса', 'ИИ-агент квалифицирует → передаёт только целевых', 'Для целевых: предлагает слот в расписании', 'Интеграция с расписанием клиники'],
    solution: 'ИИ-квалификатор мягко задаёт 4 вопроса (услуга, срочность, бюджет, район). Нецелевых вежливо направляет. Целевым — сразу предлагает запись. Администратор видит только готовых к визиту.',
    results: [
      { label: 'Доля нецелевых у администратора', before: '~40%', after: '~0' },
      { label: 'Конверсия запись → приход', before: '100%', after: '+20%' },
      { label: 'Загрузка администратора', before: 'Все входящие', after: 'Только целевые' },
    ],
  },
  {
    id: 13,
    tag: 'Строительство · Сваи',
    title: 'КП за 3 минуты вместо часа — ИИ пишет документы сам',
    result: 'Менеджер освобождён от бумаг, сделок в работе в 2 раза больше',
    agents: ['ИИ-продажник', 'ИИ-документооборот'],
    problem: 'Менеджер совмещал консультации с подготовкой КП и договоров. Каждый документ — вручную, с риском ошибок. На одну сделку уходило 40–90 минут только на бумаги.',
    stat: 'Deloitte: автоматизация подготовки документов сокращает время на 60–80% и почти исключает ошибки.',
    path: ['Хронометраж: от заявки до отправки договора', 'Выявили: 55% времени менеджера — документы, не продажи', 'Автоматизировали: данные из диалога → КП за 2 мин', 'Шаблоны договоров с автоподстановкой параметров', 'ИИ-менеджер собирает параметры → передаёт в документы', 'Менеджер проверяет и отправляет'],
    solution: 'ИИ-менеджер консультирует и собирает параметры объекта в диалоге. ИИ-документооборот автоматически формирует КП и договор — менеджер только проверяет и подписывает.',
    results: [
      { label: 'Время подготовки КП', before: '30–60 мин', after: '< 3 мин' },
      { label: 'Время подготовки договора', before: '20–40 мин', after: '< 2 мин' },
      { label: 'Сделок в работе одновременно', before: 'N', after: '~2× больше' },
    ],
  },
];

/* ── иконка закрытия ─────────────────────────────────────────── */
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── иконка стрелки ──────────────────────────────────────────── */
function ChevronIcon({ dir = 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── модал с детальным кейсом ────────────────────────────────── */
function CaseModal({ c, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-[#FFF5EE] shadow-2xl flex flex-col">

        {/* sticky header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-7 pt-7 pb-5 bg-[#FFF5EE] border-b border-ink/[0.07]">
          <div>
            <span className="eyebrow text-[11px] text-orange">{c.tag}</span>
            <h2 className="mt-2 font-display text-[1.35rem] sm:text-[1.6rem] font-extrabold display-tight text-ink leading-tight">
              {c.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-1 shrink-0 grid h-9 w-9 place-items-center rounded-full bg-ink/[0.07] text-ink/60 hover:bg-ink/[0.12] hover:text-ink transition-colors focusring"
            aria-label="Закрыть"
          >
            <CloseIcon />
          </button>
        </div>

        {/* body */}
        <div className="px-7 py-7 space-y-8">

          {/* проблема */}
          <div>
            <p className="eyebrow text-[11px] text-ink/40 mb-3">Проблема</p>
            <p className="text-[1.05rem] leading-relaxed text-ink/75">{c.problem}</p>
            <div className="mt-4 rounded-xl2 bg-orange/[0.08] border-l-2 border-orange px-5 py-4">
              <p className="text-[0.93rem] leading-relaxed text-ink/65 italic">{c.stat}</p>
            </div>
          </div>

          {/* путь внедрения */}
          <div>
            <p className="eyebrow text-[11px] text-ink/40 mb-4">Путь внедрения</p>
            <div className="flex flex-col gap-0">
              {c.path.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-7 w-7 rounded-full bg-orange/[0.12] border border-orange/30 grid place-items-center">
                      <span className="font-mono text-[11px] font-bold text-orange">{i + 1}</span>
                    </div>
                    {i < c.path.length - 1 && (
                      <div className="w-px flex-1 min-h-[24px] bg-orange/20 my-1" />
                    )}
                  </div>
                  <p className="pt-1 pb-5 text-[0.97rem] leading-relaxed text-ink/70">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* решение */}
          <div>
            <p className="eyebrow text-[11px] text-ink/40 mb-3">Решение</p>
            <p className="text-[1.05rem] leading-relaxed text-ink/75">{c.solution}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.agents.map((a) => (
                <span key={a} className="inline-flex items-center gap-2 rounded-full bg-ink/[0.06] px-4 py-2 text-[13px] font-semibold text-ink/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange" />{a}
                </span>
              ))}
            </div>
          </div>

          {/* результаты */}
          <div>
            <p className="eyebrow text-[11px] text-ink/40 mb-4">Результат</p>
            <div className="rounded-xl2 overflow-hidden border border-ink/[0.08]">
              <div className="grid grid-cols-3 bg-ink/[0.04] px-5 py-3 text-[12px] font-semibold text-ink/45 uppercase tracking-wider">
                <span>Метрика</span>
                <span className="text-center">До</span>
                <span className="text-center text-orange">После</span>
              </div>
              {c.results.map((r, i) => (
                <div key={i} className={`grid grid-cols-3 px-5 py-4 text-[0.95rem] items-center ${i % 2 === 0 ? 'bg-white/50' : 'bg-transparent'}`}>
                  <span className="text-ink/70 pr-3">{r.label}</span>
                  <span className="text-center text-ink/45 line-through decoration-ink/25">{r.before}</span>
                  <span className="text-center font-semibold text-orange">{r.after}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 pb-2">
            <a
              href="#audit"
              onClick={onClose}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-orange px-7 py-4 text-base font-semibold text-seashell shadow-glow transition-all duration-300 hover:bg-orange2 hover:-translate-y-0.5"
            >
              Хочу так же — записаться на аудит
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── карточка кейса ──────────────────────────────────────────── */
function CaseCard({ c, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group snap-start shrink-0 w-[260px] sm:w-[300px] flex flex-col justify-between text-left rounded-[20px] bg-white/60 ring-1 ring-ink/[0.08] p-6 shadow-[0_2px_16px_rgba(10,10,10,.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(10,10,10,.10)] hover:bg-white/90 focusring"
    >
      <div className="flex-1 flex flex-col">
        <span className="eyebrow text-[11px] text-orange">{c.tag}</span>
        <h3 className="mt-3 font-display text-[1.1rem] font-bold display-tight text-ink leading-snug">
          {c.title}
        </h3>
        <p className="mt-3 text-[0.93rem] leading-relaxed text-ink/55 line-clamp-2">{c.result}</p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {c.agents.map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-orange/[0.09] px-3 py-1 text-[12px] font-medium text-orange">
              {a}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-orange group-hover:gap-3 transition-all duration-200">
          Подробнее
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/* ── основной компонент ──────────────────────────────────────── */
export default function CasesShowcase() {
  const [active, setActive] = useState(null);
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <>
      <Section id="cases" className="py-20 md:py-28">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            index="05" kicker="Кейсы"
            title={<>Что уже <span className="text-orange">работает</span> у клиентов</>}
            intro="Реальные внедрения с измеримыми результатами — от аудита до запуска."
          />
          {/* nav arrows desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 pb-1">
            <button
              onClick={() => scroll(-1)}
              disabled={!canLeft}
              className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-ink/10 bg-white/70 text-ink/60 transition-all duration-200 hover:bg-white hover:text-ink disabled:opacity-25 disabled:cursor-not-allowed focusring"
              aria-label="Прокрутить влево"
            >
              <ChevronIcon dir="left" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canRight}
              className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-ink/10 bg-white/70 text-ink/60 transition-all duration-200 hover:bg-white hover:text-ink disabled:opacity-25 disabled:cursor-not-allowed focusring"
              aria-label="Прокрутить вправо"
            >
              <ChevronIcon dir="right" />
            </button>
          </div>
        </div>

        {/* полоска с карточками */}
        <div className="relative mt-10">
          {/* fade left */}
          <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-300 ${canLeft ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(to right, #FFF5EE, transparent)' }} />
          {/* fade right */}
          <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 transition-opacity duration-300 ${canRight ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(to left, #FFF5EE, transparent)' }} />

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 sm:-mx-8 sm:px-8"
            style={{ scrollbarWidth: 'none' }}
          >
            {CASES.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i, 4) * 60} className="shrink-0">
                <CaseCard c={c} onClick={() => setActive(c)} />
              </Reveal>
            ))}
            {/* trailing space */}
            <div className="shrink-0 w-1" aria-hidden="true" />
          </div>
        </div>

        {/* nav arrows mobile */}
        <div className="flex sm:hidden items-center justify-center gap-3 mt-5">
          <button
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-ink/10 bg-white/70 text-ink/60 disabled:opacity-25 focusring"
            aria-label="Прокрутить влево"
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canRight}
            className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-ink/10 bg-white/70 text-ink/60 disabled:opacity-25 focusring"
            aria-label="Прокрутить вправо"
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
      </Section>

      {/* модал */}
      {active && <CaseModal c={active} onClose={() => setActive(null)} />}
    </>
  );
}
