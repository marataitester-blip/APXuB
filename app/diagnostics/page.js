'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Database, Layout, Server, AlertCircle, CheckCircle, Copy } from 'lucide-react';

// --- БАЗА ЗНАНИЙ СИМПТОМОВ ---
const DIAGNOSTICS_DB = [
  {
    category: 'База Данных',
    icon: Database,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-900/30',
    issues: [
      {
        id: 'db-no-save',
        title: 'Данные не сохраняются / Исчезают',
        action: 'Нужен код компонента + скриншот БД',
        prompt: 'У меня проблема: данные не сохраняются в базу (или исчезают при обновлении). \n\n1. Вот код моего файла (где происходит отправка):\n[ВСТАВЬ КОД СЮДА]\n\n2. Я прикрепил скриншот структуры моей таблицы из Supabase/Prisma.\n\nПожалуйста, проверь, совпадают ли типы данных и названия полей в коде с реальной схемой базы. Нет ли отправки лишних полей?'
      },
      {
        id: 'db-duplicate',
        title: 'Двоятся сообщения / записи',
        action: 'Нужен код useEffect и функции сохранения',
        prompt: 'У меня задваиваются данные на экране при отправке. Вероятно, конфликт Оптимистичного UI и Realtime подписки (или React Strict Mode). \n\nВот код моего компонента:\n[ВСТАВЬ КОД СЮДА]\n\nПомоги убрать дублирование.'
      }
    ]
  },
  {
    category: 'API и Сеть',
    icon: Server,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
    borderColor: 'border-emerald-900/30',
    issues: [
      {
        id: 'api-500',
        title: 'Ошибка 500 / API не отвечает',
        action: 'Нужен файл route.js + логи Vercel',
        prompt: 'Мой API-маршрут падает с ошибкой (500 или другая). \n\n1. Вот код моего файла API (app/api/.../route.js):\n[ВСТАВЬ КОД СЮДА]\n\n2. Вот текст ошибки из консоли Vercel (или терминала):\n[ВСТАВЬ ЛОГИ СЮДА]\n\nВ чем причина падения?'
      },
      {
        id: 'api-ai-bad',
        title: 'Нейросеть выдает мусор / Пятна',
        action: 'Нужен код API (генератора)',
        prompt: 'Интеграция с ИИ работает, статус 200, но в ответ приходит мусор (или черный/зеленый экран). \n\nВот код моего API-маршрута:\n[ВСТАВЬ КОД СЮДА]\n\nПроверь параметры генерации: возможно, сработал Safety Checker, не хватает шагов (num_inference_steps) или проблема в языке промпта.'
      }
    ]
  },
  {
    category: 'Интерфейс (UI)',
    icon: Layout,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-900/30',
    issues: [
      {
        id: 'ui-black-screen',
        title: 'Черный экран / Фатальная ошибка',
        action: 'Скриншот красной ошибки из браузера (F12)',
        prompt: 'Приложение упало в "черный экран" (Application error: a client-side exception has occurred). \n\n1. Вот код последнего файла, который я менял:\n[ВСТАВЬ КОД СЮДА]\n\n2. Я прикрепил скриншот из консоли браузера (F12) с красным текстом ошибки.\n\nПомоги расшифровать ошибку и исправить код.'
      },
      {
        id: 'ui-hydration',
        title: 'Сломалась верстка / Гидратация',
        action: 'Код компонента',
        prompt: 'У меня сломалась верстка или вылезла ошибка гидратации (Hydration Mismatch). \n\nВот код компонента:\n[ВСТАВЬ КОД СЮДА]\n\nГде я допустил ошибку в тегах или состояниях?'
      }
    ]
  }
];

export default function DiagnosticsPage() {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full font-sans text-gray-200">
      
      {/* ШАПКА */}
      <header className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6 text-sm font-light">
          <ArrowLeft className="w-4 h-4" />
          Вернуться в Хаб
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900/20 rounded-full border border-blue-900/30">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-blue-300 tracking-wide">Диагностика</h1>
            <p className="text-sm mt-1 text-gray-400 font-light">Выберите симптом для получения инструкций</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: ВЫБОР ПРОБЛЕМЫ */}
        <div className="lg:col-span-1 space-y-8">
          {DIAGNOSTICS_DB.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
                <category.icon className="w-4 h-4" />
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.issues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedIssue?.id === issue.id
                        ? `bg-[#1a1a1a] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]`
                        : `bg-[#111] border-gray-800 hover:border-gray-600`
                    }`}
                  >
                    <div className="font-medium text-gray-200">{issue.title}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ПРАВАЯ КОЛОНКА: РЕШЕНИЕ И ПРОМПТ */}
        <div className="lg:col-span-2">
          {selectedIssue ? (
            <div className="bg-[#111] border border-blue-900/30 rounded-2xl p-6 md:p-8 animate-fade-in">
              
              <div className="flex items-start gap-4 mb-8 pb-8 border-b border-gray-800">
                <div className="p-3 bg-red-900/20 text-red-400 rounded-full shrink-0 mt-1">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-gray-100 mb-2">{selectedIssue.title}</h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 text-blue-300 text-sm rounded-lg border border-blue-900/30">
                    <CheckCircle className="w-4 h-4" />
                    <strong>Требуется:</strong> {selectedIssue.action}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-lg font-light text-blue-300">Сгенерированный промпт для ИИ:</h3>
                  <button
                    onClick={() => handleCopy(selectedIssue.prompt)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {isCopied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Скопировано!' : 'Копировать промпт'}
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 rounded-l-lg"></div>
                  <pre className="bg-[#0a0a0a] p-6 rounded-lg border border-gray-800 text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
                    {selectedIssue.prompt}
                  </pre>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  * Скопируй этот текст, замени блоки [ВСТАВЬ КОД СЮДА] на свой реальный код, прикрепи нужные скриншоты и отправь в чат.
                </p>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-gray-800 rounded-2xl text-gray-500 bg-[#0a0a0a]/50">
              <Activity className="w-12 h-12 text-gray-700 mb-4 opacity-50" />
              <p className="text-lg font-light">Выберите проблему из списка слева,</p>
              <p className="text-sm">чтобы получить инструкции и промпт для ИИ.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
