'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Blocks, Component, Database, KeyRound, Sparkles, Copy, CheckCircle, TerminalSquare } from 'lucide-react';

// --- БАЗА ЗОЛОТЫХ ШАБЛОНОВ И МОДУЛЕЙ ---
const TEMPLATES_DB = [
  {
    category: 'Модули "Живое Таро"',
    icon: Component,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-900/30',
    items: [
      {
        id: 'tarot-card-of-day',
        title: 'Моно-приложение: Карта Дня',
        description: 'Промпт для быстрой генерации микросервиса "Карта Дня".',
        code: `Мне нужен каркас для моно-приложения "Карта Дня" (Next.js 14, Tailwind).

Архитектура:
1. Фронтенд: Клиентский компонент с 3D-анимацией переворота карты (CSS transform). 
2. Логика: При клике вызывается серверный экшен (Server Action), который рандомно выбирает один из 78 арканов.
3. ИИ: После выбора карты отправляется запрос к Gemini API для генерации короткого предсказания на день.

Напиши структуру компонентов и базовый код для page.js.`
      },
      {
        id: 'tarot-3d-table',
        title: 'Интерфейс: 3D-стол расклада',
        description: 'Промпт для создания интерактивного стола с картами.',
        code: `Разработай UI-компонент "Интерактивный стол для раскладов" на React/Tailwind.

Требования:
1. Темный мистический фон (deep black & gold).
2. Сетка для размещения от 3 до 5 карт (рубашкой вверх).
3. При клике на карту она плавно переворачивается и "подсвечивается" золотым свечением (box-shadow).
4. Карты должны быть адаптивными (уменьшаться на мобилках).

Напиши чистый код компонента без лишних зависимостей.`
      }
    ]
  },
  {
    category: 'Золотые Интеграции (AI)',
    icon: Sparkles,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
    borderColor: 'border-emerald-900/30',
    items: [
      {
        id: 'ai-flux-schnell',
        title: 'Генератор: Flux Schnell + Переводчик',
        description: 'Идеальный серверный маршрут для генерации картинок с автопереводом промпта.',
        code: `// Требования к реализации API-маршрута генерации (app/api/generate/route.js):

1. Используем fal.ai (модель flux/schnell).
2. Обязательно встраиваем функцию \`translateRuToEn\` через Google Translate API (client=gtx), так как модель понимает только английский.
3. Промпт-инъекция: к переведенному запросу жестко добавляем теги качества: "masterpiece, highly detailed, 8k resolution, cinematic lighting".
4. Отключаем кэширование (dynamic = 'force-dynamic', revalidate = 0, fetch cache: 'no-store').
5. Возвращаем клиенту чистый { imageUrl }.`
      }
    ]
  },
  {
    category: 'Фундамент (Core)',
    icon: Database,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-900/30',
    items: [
      {
        id: 'core-supabase-chat',
        title: 'Чат: Supabase Realtime',
        description: 'Бронебойная архитектура реалтайм-чата без задвоения сообщений.',
        code: `// Требования к реалтайм-чату на Supabase:

1. База данных: Таблица \`messages\` (content: text, sender: text, image_url: text, is_mine: bool).
2. Идентификация: Генерируем UUID устройства и сохраняем в localStorage (deviceId).
3. Подписка: Используем \`supabase.channel('room').on('postgres_changes'...)\`.
4. Защита от дублей: При получении сообщения из БД проверяем, нет ли уже сообщения с таким ID на экране.
5. Защита памяти: Загружаем из базы только \`.limit(50)\` последних сообщений, чтобы не обрушить браузер.
6. Разделение UI: Если \`msg.sender === deviceId\` -> сообщение справа (мое). Иначе -> слева.`
      },
      {
        id: 'core-pin-auth',
        title: 'Защита: PIN-код + Таймер',
        description: 'Шаблон стартового экрана с ПИН-кодом и защитой от бездействия.',
        code: `// Требования к модулю авторизации:

1. Состояние: \`currentView\` ('landing', 'login', 'app').
2. Landing: Центральная кнопка/логотип, по клику переход на login.
3. Login: Невидимый \`input type="tel" maxLength={4}\`, фокус на нем. Визуально - 4 пустых кружка, которые заполняются цветом при вводе.
4. Проверка: Если пин верен (напр. '7019') -> пишем токен в sessionStorage, пускаем в 'app'. Если нет -> красная анимация ошибки, сброс.
5. Безопасность (Таймер): Слушаем события мыши/клавиатуры/тача. Если нет активности 3 минуты -> удаляем sessionStorage, кидаем на 'login'.`
      }
    ]
  }
];

export default function TemplatesPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full font-sans text-gray-200">
      
      {/* ШАПКА */}
      <header className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors mb-6 text-sm font-light">
          <ArrowLeft className="w-4 h-4" />
          Вернуться в Хаб
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-900/20 rounded-full border border-emerald-900/30">
            <Blocks className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-emerald-300 tracking-wide">Интеграции & Сборка</h1>
            <p className="text-sm mt-1 text-gray-400 font-light">Библиотека промптов и архитектурных шаблонов</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: ВЫБОР ШАБЛОНА */}
        <div className="lg:col-span-1 space-y-8">
          {TEMPLATES_DB.map((category, idx) => (
            <div key={idx}>
              <h3 className={`text-sm font-semibold tracking-wider uppercase mb-4 flex items-center gap-2 ${category.color}`}>
                <category.icon className="w-4 h-4" />
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedItem?.id === item.id
                        ? `bg-[#1a1a1a] ${category.borderColor} shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                        : `bg-[#111] border-gray-800 hover:border-gray-600`
                    }`}
                  >
                    <div className="font-medium text-gray-200 mb-1">{item.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{item.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ПРАВАЯ КОЛОНКА: ПРОСМОТР И КОПИРОВАНИЕ */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-[#111] border border-emerald-900/30 rounded-2xl p-6 md:p-8 animate-fade-in relative overflow-hidden">
              
              <div className="flex items-start gap-4 mb-8 pb-8 border-b border-gray-800">
                <div className="p-3 bg-gray-800/50 text-emerald-400 rounded-full shrink-0 mt-1">
                  <TerminalSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-100 mb-2">{selectedItem.title}</h2>
                  <p className="text-sm text-gray-400">{selectedItem.description}</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <h3 className="text-lg font-light text-gray-300">Архитектурный промпт / Код:</h3>
                  <button
                    onClick={() => handleCopy(selectedItem.code)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 rounded-lg text-sm text-emerald-400 transition-colors"
                  >
                    {isCopied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Скопировано!' : 'Копировать'}
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 rounded-l-lg"></div>
                  <pre className="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
                    {selectedItem.code}
                  </pre>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  * Отправь этот блок текста ИИ для быстрого развертывания модуля без ошибок.
                </p>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-800 rounded-2xl text-gray-500 bg-[#0a0a0a]/50">
              <Blocks className="w-12 h-12 text-gray-700 mb-4 opacity-50" />
              <p className="text-lg font-light">Выберите модуль из списка слева,</p>
              <p className="text-sm">чтобы просмотреть архитектуру и скопировать промпт.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
