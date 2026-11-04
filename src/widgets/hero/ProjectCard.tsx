import type { Project } from '@/entities/project/types';
import { cn } from '@/shared/lib/cn';
import styles from './hero.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
  active: boolean;
  onHover: (projectId: Project['id'] | null) => void;
  onOpen: (projectId: Project['id']) => void;
}

const glyphs: Record<Project['id'], string> = {
  traffic: 'M3 11h20m-6-6 6 6-6 6M29 23H9m6-6-6 6 6 6',
  road: 'M10 3 4 29M22 3l6 26M16 4v5m0 5v5m0 5v5',
  siren: 'M9 23v-9a7 7 0 0 1 14 0v9M6 27h20M16 1v2M3 8l3 2m23-2-3 2M4 18H1m27 0h3',
  diag: 'M2 17h6l4-11 7 22 4-11h7',
};

export function ProjectCard({ project, index, active, onHover, onOpen }: ProjectCardProps) {
  return (
    <button type="button" data-project={project.id}
      className={cn(styles.project, active && styles.projectOn)}
      onClick={() => onOpen(project.id)} onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)} onFocus={() => onHover(project.id)}
      onBlur={() => onHover(null)} aria-haspopup="dialog">
      <span className={styles.cardTop}>
        <svg className={styles.projectGlyph} width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[project.id]} /></svg>
        <span className={styles.code}>{project.code} / 0{index + 1}</span>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </span>
      <span className={styles.projectName}>{project.name}</span>
      <span className={styles.projectSub}>{project.sub}</span>
    </button>
  );
}
