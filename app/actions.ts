'use server'

import prisma from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { scanRepoAndGeneratePassport } from '../lib/scanner'
import { cookies } from 'next/headers'

export async function getProjects() {
  try { return await prisma.project.findMany({ orderBy: { createdAt: 'desc' } }) } 
  catch (error) { console.error(error); return []; }
}

export async function getProjectById(id: string) {
  try { return await prisma.project.findUnique({ where: { id } }) } 
  catch (error) { console.error(error); return null; }
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

export async function updateProject(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const repoUrl = formData.get('repoUrl') as string;
  const appUrl = formData.get('appUrl') as string;
  
  if (!id || !name) return;

  await prisma.project.update({
    where: { id },
    data: { name, description: description || null, repoUrl: repoUrl || null, appUrl: appUrl || null }
  });

  revalidatePath(`/project/${id}`);
  redirect(`/project/${id}`);
}

export async function generatePassportAction(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  if (!projectId) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !project.repoUrl) return;
  
  try {
    // Получаем двойной ответ (паспорт + дерево)
    const result = await scanRepoAndGeneratePassport(project.repoUrl);
    
    // Записываем оба значения в базу
    await prisma.project.update({ 
      where: { id: projectId }, 
      data: { 
        techPassport: result.passportText,
        fileTree: result.fileTree // Складываем дерево в кладовку
      } 
    });
    
    revalidatePath(`/project/${projectId}`);
  } catch (error) { 
    console.error(error); 
  }
}

export async function deleteProject(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  if (!projectId) return;
  try { await prisma.project.delete({ where: { id: projectId } }); } 
  catch (error) { console.error(error); }
  revalidatePath('/');
  redirect('/');
}

export async function authenticateAction(prevState: any, formData: FormData) {
  const pin = formData.get('pin') as string;
  const correctPin = process.env.HUB_PIN;
  if (!correctPin) return { error: 'Системная ошибка: HUB_PIN не настроен.' };
  if (pin === correctPin) {
    cookies().set('arxub_session', 'authenticated', {
      httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30, path: '/',
    });
    redirect('/');
  } else {
    return { error: 'Неверный ПИН-код. Доступ закрыт.' };
  }
}
