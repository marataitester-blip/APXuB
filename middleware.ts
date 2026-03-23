import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Получаем пин-код из переменных окружения Vercel
  const PIN = process.env.HUB_PIN;

  // Если пин не задан в настройках, пускаем всех (защита от поломки)
  if (!PIN) return NextResponse.next();

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === 'admin' && pwd === PIN) {
      return NextResponse.next();
    }
  }

  const url = req.nextUrl;
  url.pathname = '/api/auth';

  return new NextResponse('Требуется авторизация', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="APXuB Secure Hub"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
