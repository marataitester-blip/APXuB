import './globals.css';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['cyrillic', 'latin'], 
  weight: ['300', '400', '500'] 
});

export const metadata = {
  title: 'APXuB | Мои проекты',
  description: 'Библиотека проектов и генератор техпаспортов',
  themeColor: '#0a0a0a',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'APXuB',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${montserrat.className} bg-background text-text antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
