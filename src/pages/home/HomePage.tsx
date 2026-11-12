import { useOutletContext, useSearchParams } from 'react-router-dom';
import type { ProjectId } from '@/data/portal';
import { getProject, isProjectId } from '@/data/portal';
import { useDocumentTitle } from '@/lib/hooks';
import type { StageControl } from '@/stage/support';
import { Hero } from './Hero';
import { Teams } from './Teams';
import { ProjectModal } from './ProjectModal';
import { StageOffer } from './StageOffer';

export function HomePage() {
  useDocumentTitle('Компьютерный слух — главная');

  const stage = useOutletContext<StageControl>();
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
      <Hero stage={stage} openProjectId={project?.id ?? null} onOpenProject={openProject} />
      <Teams />
      {project ? <ProjectModal project={project} onClose={closeProject} /> : null}
      {/* Предложение показывается один раз: пока выбора нет и идёт живая сцена */}
      {stage.mode === 'live' && stage.choice === null ? <StageOffer onChoose={stage.choose} /> : null}
    </>
  );
}
