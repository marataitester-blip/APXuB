const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function scanRepoAndGeneratePassport(repoUrl: string) {
  if (!GITHUB_TOKEN || !OPENROUTER_API_KEY) {
    throw new Error("Системная ошибка: Не настроены ключи GitHub или OpenRouter.");
  }

  const urlParts = repoUrl.replace('https://github.com/', '').replace('.git', '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];

  if (!owner || !repo) {
    throw new Error("Неверный формат ссылки на GitHub.");
  }

  try {
    let treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });

    if (!treeRes.ok) {
      treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
      });
    }

    if (!treeRes.ok) {
      throw new Error("Не удалось получить доступ к ветке.");
    }

    const treeData = await treeRes.json();

    // --- ЭВОЛЮЦИЯ: Сохраняем чистую структуру дерева для Дворецкого ---
    // Очищаем от тяжелого мусора, оставляем только пути файлов
    const cleanFileTree = treeData.tree
      .filter((f: any) => f.type === 'blob' || f.type === 'tree')
      .map((f: any) => ({ path: f.path, type: f.type }));

    const importantFiles = treeData.tree.filter((file: any) => {
      if (file.type !== 'blob') return false;
      const path = file.path;
      if (path.includes('node_modules') || path.includes('.next') || path.includes('public/')) return false;
      if (path.includes('package-lock.json')) return false;
      return path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.json') || path.endsWith('.prisma') || path.endsWith('.md');
    }).slice(0, 15);

    let codeContext = `Структура репозитория:\n\n`;
    for (const file of importantFiles) {
      const fileRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
      });
      const fileContent = fileRes.ok ? await fileRes.text() : await (await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${file.path}`, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } })).text();
      codeContext += `--- ФАЙЛ: ${file.path} ---\n${fileContent.substring(0, 3000)}\n\n`;
    }

    const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });

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
            content: `Ты архитектор. Изучи код и составь 'Технический паспорт'. ОБЯЗАТЕЛЬНО начни ответ со строки: "**Версия:** 1.0.0 | **Сгенерировано:** ${currentDate}". Далее пиши структуру: 1. Суть проекта 2. Стек технологий 3. Архитектура базы данных 4. Ключевая логика.` 
          },
          { 
            role: "user", 
            content: `Составь техпаспорт по этому коду:\n\n${codeContext}` 
          }
        ]
      })
    });

    const aiData = await aiRes.json();
    const passportText = aiData.choices[0].message.content;

    // --- ИЗМЕНЕНИЕ: Возвращаем объект с паспортом И деревом файлов ---
    return {
      passportText,
      fileTree: cleanFileTree
    };

  } catch (error) {
    console.error("Ошибка сканирования:", error);
    throw new Error("Сбой при анализе репозитория или запросе к ИИ.");
  }
}
