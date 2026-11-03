import { forwardRef } from 'react';
import type { Project } from '@/entities/project/types';
import { getBestAccuracy, getModels } from '@/entities/model/selectors';
import { ChevronRight } from '@/shared/ui/icons';
import { cn } from '@/shared/lib/cn';
import styles from './hero.module.css';

interface ProjectCardProps {
  project: Project;
  active: boolean;
  onHover: (projectId: Project['id'] | null) => void;
  onOpen: (projectId: Project['id']) => void;
}

export const ProjectCard = forwardRef<HTMLButtonElement, ProjectCardProps>(
  function ProjectCard({ project, active, onHover, onOpen }, ref) {
    const models = getModels(project.id);
    const best = getBestAccuracy(models);

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.project, active && styles.projectOn)}
        onClick={() => onOpen(project.id)}
        onMouseEnter={() => onHover(project.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(project.id)}
        onBlur={() => onHover(null)}
        aria-haspopup="dialog"
      >
        <span className={styles.code}>{project.code}</span>
        <span className={styles.projectBody}>
          <span className={styles.projectName}>{project.name}</span>
          <span className={styles.projectSub}>{project.sub}</span>
          <span className={styles.projectMeta}>
            {models.length} моделей · лучшая acc {best.toFixed(3)}
          </span>
        </span>
        <ChevronRight className={styles.arrow} />
      </button>
    );
  },
);
