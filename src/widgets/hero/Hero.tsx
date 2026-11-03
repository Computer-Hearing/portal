import { lazy, Suspense, useRef, useState } from 'react';
import { PROJECTS } from '@/entities/project/data';
import type { ProjectId } from '@/entities/project/types';
import { ProjectCard } from './ProjectCard';
import styles from './hero.module.css';

const CarViewer = lazy(() =>
  import('@/widgets/car-viewer/CarViewer').then((module) => ({ default: module.CarViewer })),
);

interface HeroProps {
  onOpenProject: (projectId: ProjectId) => void;
}

export function Hero({ onOpenProject }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blockRefs = useRef<Array<HTMLElement | null>>([]);
  const [hovered, setHovered] = useState<ProjectId | null>(null);

  return (
    <section>
      <div ref={heroRef} className={styles.hero}>
        <div className={styles.left}>
          <div className={styles.intro}>
            <span className={styles.kicker}>АКУСТИЧЕСКОЕ ВОСПРИЯТИЕ · ADS</span>
            <h1 className={styles.title}>Автомобиль, который слышит</h1>
            <p className={styles.lead}>
              Массив микрофонов и нейросети распознают, что происходит вокруг машины и с самой
              машиной, и передают это в модули слияния данных и планирования движения.
            </p>
          </div>

          <div className={styles.projects}>
            <span className={styles.label}>ПОДПРОЕКТЫ</span>
            {PROJECTS.map((project, index) => (
              <ProjectCard
                key={project.id}
                ref={(element) => {
                  blockRefs.current[index] = element;
                }}
                project={project}
                active={hovered === project.id}
                onHover={setHovered}
                onOpen={onOpenProject}
              />
            ))}
            <span className={styles.hint}>
              Нажмите на блок или на пунктир, чтобы открыть подпроект.
            </span>
          </div>
        </div>

        <Suspense fallback={<div className={styles.viewerPlaceholder} aria-hidden="true" />}>
          <CarViewer
            heroRef={heroRef}
            hostRef={hostRef}
            canvasRef={canvasRef}
            blockRefs={blockRefs}
            hovered={hovered}
            onHover={setHovered}
            onOpen={onOpenProject}
          />
        </Suspense>
      </div>
    </section>
  );
}
