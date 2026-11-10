import type { MouseEvent } from 'react';
import type { Project } from '@/data/portal';
import { getProjectStats } from '@/data/portal';
import { Chip, LinkButton, StatGrid, cn } from '@/ui/ui';
import styles from './info.module.css';

const stopPlaceholder = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
};

interface DatasetCardProps {
  project: Project;
  active?: boolean;
}

export function DatasetCard({ project, active = false }: DatasetCardProps) {
  const stats = getProjectStats(project);

  return (
    <article className={cn(styles.card, active && styles.active)}>
      <div className={styles.head}>
        <span className={styles.code}>{project.code}</span>
        <h3 className={styles.name}>{project.name}</h3>
      </div>

      <p className={styles.description}>{project.description}</p>

      <div className={styles.dataset}>
        <span className={styles.datasetLabel}>ДАТАСЕТ · {project.dataset.name}</span>
        <StatGrid stats={stats} />
        <p className={styles.note}>{project.dataset.note}</p>
        <div className={styles.chips}>
          {project.classes.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <LinkButton href="#" onClick={stopPlaceholder}>
          Kaggle · {project.dataset.slug}
        </LinkButton>
        <LinkButton href="#" onClick={stopPlaceholder}>
          Google Drive · сырые записи
        </LinkButton>
      </div>
    </article>
  );
}
