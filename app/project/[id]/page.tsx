import { ArrowLeft, Github, Globe, FileText, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { getProjectById, generatePassportAction, deleteProject } from '../../actions';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import CopyButton from '../../components/CopyButton';
import UpdateButton from '../../components/UpdateButton';
import ButlerChat from '../../components/ButlerChat';

// ВОТ ЗДЕСЬ Я ВЕРНУЛ ТИПИЗАЦИЮ ДЛЯ PARAMS
export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  if (!project) notFound();

  const hasFileTree = project.fileTree && Array.isArray(project.fileTree) && project.fileTree.length > 0;

  return (
    <main className="flex-1 p-6 md:p-12 max-w-[1400px] mx-auto w-full">
      <header className="mb-8 border-b border-gold/20 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gold-light/70 hover:text-gold transition-colors mb-6 font-light text-sm">
          <ArrowLeft className="w-4 h-4" />
          Назад в библиотеку
        </Link>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-light text-gold tracking-wide">{project.name}</h1>
              
              <Link href={`/project/${project.id}/edit`} className="p-2 text-gold/50 hover:text-gold hover:bg-gold/10 rounded-full transition-colors ml-2" title="Редактировать проект">
                <Edit2 className="w-5 h-5" />
              </Link>

              <form action={deleteProject}>
                <input type="hidden" name="projectId" value={project.id} />
                <button type="submit" className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Удалить проект из хаба">
                  <Trash2 className="w-5 h-5" />
                </button>
              </form>
            </div>
            <p className="text-base mt-2 text-gray-300 font-light max-w-2xl">{project.description || 'Описание отсутствует'}</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#111] rounded-xl border border-gold/30 hover:border-gold transition-colors text-gold flex items-center gap-2">
                <Github className="w-4 h-4" />
                <span className="text-sm font-light">Репозиторий</span>
              </a>
            )}
            {project.appUrl && (
              <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gold text-[#0a0a0a] rounded-xl font-medium hover:bg-gold-light transition-colors flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Открыть App</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <section className="lg:col-span-2 bg-[#111] border border-gold/20 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-gold/10 pb-6 mb-6">
            <h2 className="text-2xl font-light text-gold flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Технический паспорт
            </h2>
            <div className="flex items-center gap-3">
              {project.techPassport && <CopyButton text={project.techPassport} />}
              {project.repoUrl && (
                <form action={generatePassportAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <UpdateButton />
                </form>
              )}
            </div>
          </div>

          <div className="font-light text-gray-300 leading-relaxed">
            {project.techPassport ? (
               <div className="markdown-container space-y-4">
                 <ReactMarkdown
                   components={{
                     h1: ({node, ...props}) => <h1 className="text-2xl font-medium text-gold mt-6 mb-3" {...props} />,
                     h2: ({node, ...props}) => <h2 className="text-xl font-medium text-gold-light mt-5 mb-2" {...props} />,
                     h3: ({node, ...props}) => <h3 className="text-lg font-medium text-gold-light/80 mt-4 mb-2" {...props} />,
                     p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                     ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                     ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                     strong: ({node, ...props}) => <strong className="font-medium text-gold-light" {...props} />,
                     code: ({node, ...props}) => <code className="bg-[#0a0a0a] text-gold/80 px-1.5 py-0.5 rounded text-sm font-mono border border-gold/10" {...props} />,
                   }}
                 >
                   {project.techPassport}
                 </ReactMarkdown>
               </div>
            ) : (
              <div className="text-center py-12 text-gold/40">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Технический паспорт еще не создан.</p>
                {!project.repoUrl && <p className="text-sm mt-2 text-red-400/80">Невозможно сгенерировать: не указана ссылка на GitHub.</p>}
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-1 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <ButlerChat projectId={project.id} hasFileTree={hasFileTree} />
        </section>

      </div>
    </main>
  );
}
