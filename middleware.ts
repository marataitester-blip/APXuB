import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('arxub_session');
  const url = req.nextUrl.clone();

  // Если сессии нет и пользователь не на странице логина, отправляем логиниться
  if (!session && url.pathname !== '/login') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Если сессия есть, а пользователь лезет на страницу логина, отправляем на главную
  if (session && url.pathname === '/login') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Защищаем всё, кроме статики и картинок
export const config = {
  matcher: ['/((?!_next/static|_next/image|manifest.json|favicon.ico).*)'],
};
