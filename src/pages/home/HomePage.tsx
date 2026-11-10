import { useSearchParams } from 'react-router-dom';
import type { ProjectId } from '@/data/portal';
import { getProject, isProjectId } from '@/data/portal';
import { useDocumentTitle } from '@/lib/hooks';
import { Hero } from './Hero';
import { Teams } from './Teams';
import { ProjectModal } from './ProjectModal';

export function HomePage() {
  useDocumentTitle('Компьютерный слух — главная');

  const [searchParams, setSearchParams] = useSearchParams();
  const openParam = searchParams.get('open');
  const project = isProjectId(openParam) ? getProject(openParam) : null;

  const openProject = (projectId: ProjectId) => {
    const next = new URLSearchParams(searchParams);
    next.set('open', projectId);
    setSearchParams(next);
  };

  const closeProject = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('open');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <Hero openProjectId={project?.id ?? null} onOpenProject={openProject} />
      <Teams />
      {project ? <ProjectModal project={project} onClose={closeProject} /> : null}
    </>
  );
}
