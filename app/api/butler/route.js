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

    // Собираем контекст для ИИ, добавили базовую ссылку на GitHub
    const systemPrompt = `Ты - "Дворецкий", элитный ИИ-архитектор и верный помощник синьор-разработчика (Марата).
Твоя задача - помогать ориентироваться в кодовой базе проекта "${project.name}".

ДОСТУПНЫЙ КОНТЕКСТ ЭТОГО ПРОЕКТА:
Базовая ссылка на GitHub: ${project.repoUrl || 'Ссылка не указана'}
Технический паспорт:
${project.techPassport || 'Паспорт еще не сгенерирован.'}

Дерево файлов (Структура репозитория):
${project.fileTree ? JSON.stringify(project.fileTree) : 'Дерево файлов отсутствует.'}

ТВОИ ПРАВИЛА:
1. Отвечай лаконично, четко и по делу. Обращайся к пользователю уважительно (Синьор).
2. Если нужно вытащить логику, ищи по названиям файлов в Дереве файлов.
3. ВСЕГДА генерируй кликабельные ссылки на файлы в формате Markdown, используя Базовую ссылку на GitHub. Пример формата: [имя_файла](базовая_ссылка/blob/main/путь/к/файлу).
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
