import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { projectId, message, history } = await req.json();

    if (!projectId || !message) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Проект не найден' }, { status: 404 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Ключ OpenRouter не настроен' }, { status: 500 });
    }

    // Жестко подготавливаем идеальную ссылку для GitHub на сервере
    let githubBaseUrl = 'ССЫЛКА_НЕ_УКАЗАНА';
    if (project.repoUrl) {
      // Убираем .git на конце и лишний слэш, затем добавляем путь к файлам
      const cleanUrl = project.repoUrl.replace(/\.git$/, '').replace(/\/$/, '');
      githubBaseUrl = `${cleanUrl}/blob/main/`;
    }

    // Обновленный промпт с жестким шаблоном для ИИ
    const systemPrompt = `Ты - "Дворецкий", элитный ИИ-архитектор и верный помощник синьор-разработчика (Марата).
Твоя задача - помогать ориентироваться в кодовой базе проекта "${project.name}".

ДОСТУПНЫЙ КОНТЕКСТ ЭТОГО ПРОЕКТА:
Базовый URL для файлов: ${githubBaseUrl}
Технический паспорт:
${project.techPassport || 'Паспорт еще не сгенерирован.'}

Дерево файлов (Структура репозитория):
${project.fileTree ? JSON.stringify(project.fileTree) : 'Дерево файлов отсутствует.'}

ТВОИ ПРАВИЛА:
1. Отвечай лаконично, четко и по делу. Обращайся к пользователю уважительно (Синьор).
2. Если нужно вытащить логику, ищи по названиям файлов в Дереве файлов.
3. КРИТИЧЕСКОЕ ПРАВИЛО: Каждое упоминание пути к файлу должно быть АБСОЛЮТНОЙ КЛИКАБЕЛЬНОЙ ССЫЛКОЙ в формате Markdown.
Строгий шаблон: [путь/к/файлу](Базовый URL для файлов + путь/к/файлу).
Пример: Если Базовый URL это "https://github.com/user/repo/blob/main/", а файл "src/app.js", ты ОБЯЗАН написать: [src/app.js](https://github.com/user/repo/blob/main/src/app.js)
ЗАПРЕЩЕНО писать файлы без ссылок. ЗАПРЕЩЕНО использовать относительные ссылки.
4. Если пользователь просит подготовить промпт для ИИ, напиши его в отдельном блоке кода.`;

    // Формируем историю сообщений
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://apxub.vercel.app",
        "X-Title": "APXuB Butler"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Ошибка Дворецкого:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
