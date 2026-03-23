'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { scanRepoAndGeneratePassport } from '../lib/scanner'
import { cookies } from 'next/headers'

// Базовые функции работы с проектами
export async function getProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  } catch (error) {
    console.error("Ошибка при получении проектов:", error)
    return []
  }
}

export async function getProjectById(id: string) {
  try {
    return await prisma.project.findUnique({ where: { id } })
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
    data: { name, description: description || null, repoUrl: repoUrl || null, appUrl: appUrl || null }
  });

  revalidatePath('/');
  redirect('/');
}

export async function generatePassportAction(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  if (!projectId) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !project.repoUrl) return;

  try {
    const generatedText = await scanRepoAndGeneratePassport(project.repoUrl);
    await prisma.project.update({ where: { id: projectId }, data: { techPassport: generatedText } });
    revalidatePath(`/project/${projectId}`);
  } catch (error) {
    console.error("Ошибка при генерации:", error);
  }
}

export async function deleteProject(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  if (!projectId) return;
  try {
    await prisma.project.delete({ where: { id: projectId } });
  } catch (error) {
    console.error("Ошибка при удалении проекта:", error);
  }
  revalidatePath('/');
  redirect('/');
}

// --- НОВАЯ ЛОГИКА АУТЕНТИФИКАЦИИ ---

export async function authenticateAction(prevState: any, formData: FormData) {
  const pin = formData.get('pin') as string;
  const correctPin = process.env.HUB_PIN;

  if (!correctPin) {
    return { error: 'Системная ошибка: HUB_PIN не настроен в Vercel.' };
  }

  if (pin === correctPin) {
    // Устанавливаем зашифрованную куку на 30 дней
    cookies().set('arxub_session', 'authenticated', {
      httpOnly: true, // Защита от XSS атак
      secure: true,   // Только через HTTPS
      sameSite: 'strict', // Защита от CSRF
      maxAge: 60 * 01 * 00 * 00, // 1 минута
      path: '/',
    });
    redirect('/'); // Успех -> на главную
  } else {
    return { error: 'Неверный ПИН-код. Доступ закрыт.' };
  }
}
