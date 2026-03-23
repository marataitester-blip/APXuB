import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Отключаем кэширование, чтобы всегда качать свежий бэкап
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Формируем красивый JSON-документ с отступами
    const backupData = JSON.stringify(projects, null, 2);

    return new NextResponse(backupData, {
      headers: {
        'Content-Disposition': 'attachment; filename="arxub_backup.json"',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Ошибка при создании бэкапа:', error);
    return new NextResponse('Ошибка создания бэкапа', { status: 500 });
  }
}
