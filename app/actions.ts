'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { scanRepoAndGeneratePassport } from '../lib/scanner'

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return projects
  } catch (error) {
    console.error("Ошибка при получении проектов:", error)
    return []
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id }
    })
    return project
  } catch (error) {
    console.error("Ошибка при получении проекта:", error)
    return null
  }
}

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const repoUrl = formData.get('repoUrl') as string;
  const appUrl = formData.get('appUrl') as string;

  if (!name) return;

  await prisma.project.create({
    data: {
      name,
      description: description || null,
      repoUrl: repoUrl || null,
      appUrl: appUrl || null,
    }
  });

  revalidatePath('/');
  redirect('/');
}

// Новая функция: генерация и сохранение техпаспорта
export async function generatePassportAction(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  
  if (!projectId) return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  
  if (!project || !project.repoUrl) {
    console.error("Проект не найден или нет ссылки на GitHub");
    return;
  }

  try {
    // Вызываем наш ИИ-сканер
    const generatedText = await scanRepoAndGeneratePassport(project.repoUrl);

    // Сохраняем результат в базу данных
    await prisma.project.update({
      where: { id: projectId },
      data: { techPassport: generatedText }
    });

    // Обновляем кэш страницы, чтобы сразу показать результат
    revalidatePath(`/project/${projectId}`);
  } catch (error) {
    console.error("Ошибка при генерации:", error);
  }
}
