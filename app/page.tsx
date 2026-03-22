import { FolderArchive, Download, Search, Terminal } from 'lucide-react';
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Обернули кнопку в Link */}
        <Link href="/new" className="flex items-center gap-4 p-6 bg-[#111111] border border-gold/30 rounded-2xl hover:border-gold transition-all text-left group cursor-pointer block">
          <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold/20 transition-colors">
            <FolderArchive className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-light text-gold mb-1">Добавить проект</h2>
            <p className="text-sm font-light text-gray-400">Сгенерировать техпаспорт из GitHub</p>
          </div>
        </Link>

        <button className="flex items-center gap-4 p-6 bg-[#111111] border border-gold/30 rounded-2xl hover:border-gold transition-all text-left group">
          <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold/20 transition-colors">
            <Download className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-light text-gold mb-1">Резервная копия</h2>
            <p className="text-sm font-light text-gray-400">Скачать ZIP-архивы на компьютер</p>
          </div>
        </button>
      </section>

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
              <div key={project.id} className="p-5 bg-[#111] border border-gold/20 rounded-xl hover:border-gold/60 transition-colors cursor-pointer flex flex-col justify-between min-h-[160px]">
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
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
