import { useSearchParams } from 'react-router-dom';
import type { ProjectId } from '@/entities/project/types';
import { getProject, isProjectId } from '@/entities/project/selectors';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Hero } from '@/widgets/hero/Hero';
import { Teams } from '@/widgets/teams/Teams';
import { ProjectModal } from '@/widgets/project-modal/ProjectModal';

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
