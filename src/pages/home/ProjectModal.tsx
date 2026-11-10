import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/data/portal';
import { getModelsByAccuracy, getModels, getModelId, getProjectStats } from '@/data/portal';
import { formatAccuracy, formatParams } from '@/lib/format';
import { Button, LinkButton, Chip, IconButton, StatGrid } from '@/ui/ui';
import { Modal } from '@/ui/Modal';
import { CloseIcon } from '@/ui/icons';
import { ModelScatter } from '@/ui/ModelScatter';
import styles from './home.module.css';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

const stopPlaceholder = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
};

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const navigate = useNavigate();
  const models = getModelsByAccuracy(getModels(project.id));
  const stats = getProjectStats(project);

  const openModel = (modelName: string) => {
    const model = models.find((item) => item.name === modelName);
    if (!model) return;
    navigate(`/models?project=${project.id}&model=${getModelId(project.id, model)}`);
  };

  return (
    <Modal onClose={onClose} labelledBy="project-modal-title">
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>{project.code} · ПОДПРОЕКТ</span>
          <h2 id="project-modal-title" className={styles.modalTitle}>
            {project.name}
          </h2>
        </div>
        <IconButton label="Закрыть" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className={styles.body}>
        <div className={styles.modalSummary}>
          <p className={styles.modalDescription}>{project.description}</p>

          <div className={styles.datasetBlock}>
            <span className={styles.sectionLabel}>ДАТАСЕТ · {project.dataset.name}</span>
            <StatGrid stats={stats} compact />
          </div>

          <div className={styles.classesBlock}>
            <span className={styles.sectionLabel}>КЛАССЫ</span>
            <div className={styles.classes}>
              {project.classes.map((item) => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>
          </div>

          <div className={styles.links}>
            <LinkButton href="#" onClick={stopPlaceholder}>
              Kaggle · {project.dataset.slug}
            </LinkButton>
            <LinkButton href="#" onClick={stopPlaceholder}>
              Google Drive
            </LinkButton>
          </div>
        </div>

        <div className={styles.chartColumn}>
          <span className={styles.sectionLabel}>КАРТА МОДЕЛЕЙ · ПАРАМЕТРЫ × ACCURACY</span>
          <ModelScatter
            projectId={project.id}
            size="sm"
            framed
            showAxisTitles={false}
            onSelectModel={(model) => openModel(model.name)}
          />
        </div>
      </div>

      <div className={styles.modelsSection}>
        <span className={styles.sectionLabel}>МОДЕЛИ ПОДПРОЕКТА · {models.length}</span>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th>Модель</th>
                <th>Архитектура</th>
                <th>Accuracy</th>
                <th>Параметры</th>
                <th>Вход</th>
                <th>Выход</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.name} className={styles.tableRow}>
                  <td className={styles.modelName}>{model.name}</td>
                  <td className={styles.mutedCell}>{model.arch}</td>
                  <td className={styles.accuracyCell}>{formatAccuracy(model.accuracy)}</td>
                  <td className={styles.monoCell}>{formatParams(model.params)}</td>
                  <td className={styles.monoCell}>
                    {model.input.mel} × {model.input.frames}
                  </td>
                  <td className={styles.monoCell}>1 × {project.outClasses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => navigate(`/info?project=${project.id}`)}>
            Карта во вкладке «Информация»
          </Button>
          <Button variant="accent" onClick={() => navigate(`/models?project=${project.id}`)}>
            Скачать модели →
          </Button>
        </div>
      </div>
    </Modal>
  );
}
