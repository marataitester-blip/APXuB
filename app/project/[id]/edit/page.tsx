import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { getProjectById, updateProject } from '../../../actions';
import { notFound } from 'next/navigation';

export default async function EditProject({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  if (!project) notFound();

  return (
    <main className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full">
      <header className="mb-12 border-b border-gold/20 pb-6 flex items-center gap-4">
        <Link href={`/project/${project.id}`} className="p-2 bg-gold/10 rounded-full border border-gold/30 hover:bg-gold/20 transition-colors text-gold">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-light text-gold tracking-wide">Редактирование</h1>
          <p className="text-sm mt-1 text-gold-light/70 font-light">{project.name}</p>
        </div>
      </header>

      <form action={updateProject} className="space-y-6">
        <input type="hidden" name="id" value={project.id} />
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-light text-gold">Название проекта *</label>
          <input type="text" id="name" name="name" required defaultValue={project.name} className="w-full bg-[#111] border border-gold/30 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-colors font-light" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-light text-gold">Краткое описание</label>
          <textarea id="description" name="description" rows={3} defaultValue={project.description || ''} className="w-full bg-[#111] border border-gold/30 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-colors font-light resize-none"></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="appUrl" className="block text-sm font-light text-gold">Ссылка на рабочее приложение</label>
          <input type="url" id="appUrl" name="appUrl" defaultValue={project.appUrl || ''} className="w-full bg-[#111] border border-gold/30 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-colors font-light" />
        </div>

        <div className="space-y-2">
          <label htmlFor="repoUrl" className="block text-sm font-light text-gold">Ссылка на репозиторий GitHub</label>
          <input type="url" id="repoUrl" name="repoUrl" defaultValue={project.repoUrl || ''} className="w-full bg-[#111] border border-gold/30 rounded-xl p-4 text-white focus:outline-none focus:border-gold transition-colors font-light" />
        </div>

        <button type="submit" className="w-full mt-8 flex items-center justify-center gap-2 bg-gold text-[#0a0a0a] py-4 rounded-xl font-medium hover:bg-gold-light transition-colors">
          <Save className="w-5 h-5" />
          Сохранить изменения
        </button>
      </form>
    </main>
  );
}
