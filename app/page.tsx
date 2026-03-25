import { FolderArchive, Download, Search, Terminal, Activity, Blocks } from 'lucide-react';
import { getProjects } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-center mb-12 border-b border-gold/20 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-light text-gold tracking-wide">APXuB</h1>
          <p className="text-sm mt-2 text-gold-light/70 font-light">Хаб проектов & Техпаспорта</p>
        </div>
        <button className="p-3 bg-gold/10 rounded-full border border-gold/30 hover:bg-gold/20 transition-colors">
          <Search className="w-6 h-6 text-gold" />
        </button>
      </header>

      {/* --- СЕКЦИЯ 1: УПРАВЛЕНИЕ ПРОЕКТАМИ --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link href="/new" className="flex items-center gap-4 p-6 bg-[#111111] border border-gold/30 rounded-2xl hover:border-gold transition-all text-left group cursor-pointer block">
          <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold/20 transition-colors">
            <FolderArchive className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-light text-gold mb-1">Добавить проект</h2>
            <p className="text-sm font-light text-gray-400">Сгенерировать техпаспорт из GitHub</p>
          </div>
        </Link>

        <a href="/api/backup" download="arxub_backup.json" className="flex items-center gap-4 p-6 bg-[#111111] border border-gold/30 rounded-2xl hover:border-gold transition-all text-left group cursor-pointer block">
          <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold/20 transition-colors">
            <Download className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-light text-gold mb-1">Резервная копия</h2>
            <p className="text-sm font-light text-gray-400">Скачать базу хаба (JSON)</p>
          </div>
        </a>
      </section>

      {/* --- НОВАЯ СЕКЦИЯ 2: ЛАБОРАТОРИЯ (ИНЖЕНЕРНЫЕ ТУЛЗЫ) --- */}
      <section className="mb-12">
        <h2 className="text-2xl font-light text-gold-light mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Инженерная панель (Лаборатория)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Кнопка Диагностики */}
          <Link href="/diagnostics" className="relative overflow-hidden flex items-center gap-4 p-6 bg-[#111] border border-blue-900/30 rounded-2xl hover:border-blue-500/50 transition-all text-left group cursor-pointer block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-4 bg-blue-900/20 rounded-full group-hover:bg-blue-900/40 transition-colors relative z-10">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-light text-blue-300 mb-1">Диагностика багов</h2>
              <p className="text-sm font-light text-gray-400">Определить проблемный узел и получить инструкции</p>
            </div>
          </Link>

          {/* Кнопка Интеграций / Шаблонов */}
          <Link href="/templates" className="relative overflow-hidden flex items-center gap-4 p-6 bg-[#111] border border-emerald-900/30 rounded-2xl hover:border-emerald-500/50 transition-all text-left group cursor-pointer block">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-4 bg-emerald-900/20 rounded-full group-hover:bg-emerald-900/40 transition-colors relative z-10">
              <Blocks className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-light text-emerald-300 mb-1">Сборка & Интеграции</h2>
              <p className="text-sm font-light text-gray-400">Готовые модули Таро и золотые шаблоны кода</p>
            </div>
          </Link>
        </div>
      </section>

      {/* --- СЕКЦИЯ 3: БИБЛИОТЕКА ПРОЕКТОВ --- */}
      <section>
        <h2 className="text-2xl font-light text-gold-light mb-6 flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Моя библиотека
        </h2>
        
        {projects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gold/30 rounded-xl text-gold/50 font-light bg-[#111]">
            Библиотека пока пуста. Добавьте свой первый проект.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link href={`/project/${project.id}`} key={project.id} className="p-5 bg-[#111] border border-gold/20 rounded-xl hover:border-gold/60 transition-colors cursor-pointer flex flex-col justify-between min-h-[160px] block">
                <div>
                  <h3 className="text-lg font-light text-gold mb-2">{project.name}</h3>
                  <p className="text-sm font-light text-gray-400 line-clamp-2">
                    {project.description || 'Описание отсутствует'}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold/10">
                  <span className="text-xs text-gold/50">
                    {project.techPassport ? 'Техпаспорт готов' : 'Паспорт не сгенерирован'}
                  </span>
                  <span className="text-xs text-gold underline underline-offset-4 tracking-wider">Открыть</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
