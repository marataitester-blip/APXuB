const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function scanRepoAndGeneratePassport(repoUrl: string) {
  if (!GITHUB_TOKEN || !OPENROUTER_API_KEY) {
    throw new Error("Системная ошибка: Не настроены ключи GitHub или OpenRouter.");
  }

  // 1. Вытаскиваем владельца и название репозитория из ссылки
  const urlParts = repoUrl.replace('https://github.com/', '').replace('.git', '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];

  if (!owner || !repo) {
    throw new Error("Неверный формат ссылки на GitHub.");
  }

  try {
    // 2. Получаем структуру проекта (пробуем ветку main, если нет - master)
    let treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });

    if (!treeRes.ok) {
      treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
      });
    }

    if (!treeRes.ok) {
      throw new Error("Не удалось получить доступ к ветке main или master. Проверьте токен GitHub.");
    }

    const treeData = await treeRes.json();

    // 3. Отбираем важные файлы для анализа архитектуры, отсеивая мусор
    const importantFiles = treeData.tree.filter((file: any) => {
      if (file.type !== 'blob') return false;
      const path = file.path;
      if (path.includes('node_modules') || path.includes('.next') || path.includes('public/')) return false;
      if (path.includes('package-lock.json')) return false;
      
      return path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || 
             path.endsWith('.json') || path.endsWith('.prisma') || path.endsWith('.md');
    }).slice(0, 15); // Берем топ-15 файлов, чтобы не превысить лимиты времени Vercel

    // 4. Скачиваем содержимое этих файлов
    let codeContext = `Структура репозитория (важные файлы):\n\n`;
    
    for (const file of importantFiles) {
      const fileRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
      });
      
      // Фолбек на master
      const fileContent = fileRes.ok 
        ? await fileRes.text() 
        : await (await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${file.path}`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
          })).text();

      codeContext += `--- ФАЙЛ: ${file.path} ---\n${fileContent.substring(0, 3000)}\n\n`;
    }

    // 5. Отправляем собранный код в OpenRouter (используем Gemini Flash для скорости и дешевизны)
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://apxub.vercel.app",
        "X-Title": "APXuB"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Ты опытный инженер-архитектор. Твоя задача — изучить предоставленный код проекта и составить четкий, структурированный 'Технический паспорт'. Пиши строго по делу. Формат:\n\n1. Суть проекта (1-2 абзаца)\n2. Стек технологий (список)\n3. Архитектура и база данных (какие таблицы, как связаны)\n4. Ключевая логика (основные файлы и за что они отвечают)." 
          },
          { 
            role: "user", 
            content: `Проанализируй этот код и составь техпаспорт:\n\n${codeContext}` 
          }
        ]
      })
    });

    const aiData = await aiRes.json();
    return aiData.choices[0].message.content;

  } catch (error) {
    console.error("Ошибка сканирования:", error);
    throw new Error("Сбой при анализе репозитория или запросе к ИИ.");
  }
}
