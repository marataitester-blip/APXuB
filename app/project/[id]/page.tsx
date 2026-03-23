import { ArrowLeft, Github, Globe, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { getProjectById } from '../../actions';
import { notFound } from 'next/navigation';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  // Если проект не найден в базе — показываем системную ошибку 404
  if (!project) {
    notFound();
  }

  return (
    <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
      {/* Навигация и заголовок */}
      <header className="mb-12 border-b border-gold/20 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gold-light/70 hover:text-gold transition-colors mb-6 font-light text-sm">
          <ArrowLeft className="w-4 h-4" />
          Назад в библиотеку
        </Link>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-gold tracking-wide">{project.name}</h1>
            <p className="text-lg mt-4 text-gray-300 font-light max-w-2xl">{project.description || 'Описание отсутствует'}</p>
          </div>
          
          {/* Кнопки быстрых переходов */}
          <div className="flex gap-3">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#111] rounded-xl border border-gold/30 hover:border-gold transition-colors text-gold flex items-center gap-2">
                <Github className="w-5 h-5" />
                <span className="text-sm font-light">Репозиторий</span>
              </a>
            )}
            {project.appUrl && (
              <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-gold text-[#0a0a0a] rounded-xl font-medium hover:bg-gold-light transition-colors flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm">Открыть App</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Блок Технического паспорта */}
      <section className="bg-[#111] border border-gold/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-gold/10 pb-6 mb-6">
          <h2 className="text-2xl font-light text-gold flex items-center gap-3">
            <FileText className="w-6 h-6" />
            Технический паспорт
          </h2>
          {/* Кнопка генерации (пока это заглушка визуальная) */}
          <button className="flex items-center gap-2 text-sm text-[#0a0a0a] bg-gold px-4 py-2 rounded-lg font-medium hover:bg-gold-light transition-colors">
            <Activity className="w-4 h-4" />
            Сгенерировать
          </button>
        </div>

        <div className="font-light text-gray-300">
          {project.techPassport ? (
            <div className="whitespace-pre-wrap">{project.techPassport}</div>
          ) : (
            <div className="text-center py-12 text-gold/40">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Технический паспорт еще не создан.</p>
              <p className="text-sm mt-2">Нажмите «Сгенерировать», чтобы ИИ проанализировал репозиторий и составил карту архитектуры.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
