import type { MouseEvent } from 'react';
import type { Model, Project } from '@/data/portal';
import { getModelId } from '@/data/portal';
import { formatAccuracy, formatParams, slugify } from '@/lib/format';
import { LinkButton, cn } from '@/ui/ui';
import { ChevronDown, DownloadIcon } from '@/ui/icons';
import styles from './models.module.css';

const stopPlaceholder = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
};

interface ModelCardProps {
  model: Model;
  project: Project;
  open: boolean;
  onToggle: () => void;
}

export function ModelCard({ model, project, open, onToggle }: ModelCardProps) {
  const id = getModelId(project.id, model);
  const slug = slugify(model.name);
  const detailsId = `${id}-details`;

  return (
    <article id={`model-${id}`} className={cn(styles.card, open && styles.cardOpen)}>
      <button
        type="button"
        className={styles.head}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailsId}
      >
        <span className={styles.headTop}>
          <span className={styles.headInfo}>
            <span className={styles.name}>{model.name}</span>
            <span className={styles.arch}>{model.arch}</span>
          </span>
          <ChevronDown className={cn(styles.chevron, open && styles.chevronOpen)} />
        </span>

        <span className={styles.metrics}>
          <span className={styles.metric}>
            <span className={styles.metricLabel}>Accuracy</span>
            <span className={cn(styles.metricValue, styles.metricAccent)}>
              {formatAccuracy(model.accuracy)}
            </span>
          </span>
          <span className={styles.metric}>
            <span className={styles.metricLabel}>Параметры</span>
            <span className={styles.metricValue}>{formatParams(model.params)}</span>
          </span>
          <span className={styles.metric}>
            <span className={styles.metricLabel}>Датасет</span>
            <span className={cn(styles.metricValue, styles.metricDataset)}>
              {project.dataset.name}
            </span>
          </span>
        </span>
      </button>

      {open ? (
        <div id={detailsId} className={styles.details}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Ноутбук обучения</span>
            <a
              className={styles.rowLink}
              href="#"
              onClick={stopPlaceholder}
              title="Ссылка-заглушка"
            >
              notebooks/{project.id}/{slug}.ipynb
            </a>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Датасет</span>
            <a
              className={styles.rowLink}
              href="#"
              onClick={stopPlaceholder}
              title="Ссылка-заглушка"
            >
              kaggle · {project.dataset.slug}
            </a>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Вход (мел × кадры)</span>
            <span className={styles.rowValue}>
              [1, 1, {model.input.mel}, {model.input.frames}]
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Выход (классы)</span>
            <span className={styles.rowValue}>[1, {project.outClasses}]</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>ID для API</span>
            <span className={styles.rowValue}>{id}</span>
          </div>
        </div>
      ) : null}

      <div className={styles.actions}>
        <LinkButton
          className={styles.download}
          href="#"
          onClick={stopPlaceholder}
          title="Ссылка-заглушка"
        >
          <DownloadIcon />
          Веса .pt
        </LinkButton>
        <LinkButton
          className={styles.download}
          variant="accent"
          href="#"
          onClick={stopPlaceholder}
          title="Ссылка-заглушка"
        >
          <DownloadIcon />
          ONNX
        </LinkButton>
      </div>
    </article>
  );
}
