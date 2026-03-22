'use server'

import prisma from '../lib/prisma'

// Функция для получения всех проектов из базы данных
export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' } // Сортируем: новые сверху
    })
    return projects
  } catch (error) {
    console.error("Ошибка при получении проектов:", error)
    return []
  }
}
