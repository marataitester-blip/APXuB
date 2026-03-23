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

// Получение одного проекта по ID
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

// Создание нового проекта
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
