'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Получение всех проектов
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

// Создание нового проекта
export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const repoUrl = formData.get('repoUrl') as string;
  const appUrl = formData.get('appUrl') as string;

  if (!name) return; // Название обязательно

  await prisma.project.create({
    data: {
      name,
      description: description || null,
      repoUrl: repoUrl || null,
      appUrl: appUrl || null,
    }
  });

  // Обновляем главную страницу и возвращаем пользователя на нее
  revalidatePath('/');
  redirect('/');
}
