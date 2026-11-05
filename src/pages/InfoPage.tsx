import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import type { Model } from '@/entities/model/types';
import type { ProjectId } from '@/entities/project/types';
import { getModelId, getModelStats } from '@/entities/model/selectors';
import { getProject, getProjects, isProjectId } from '@/entities/project/selectors';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Pill } from '@/shared/ui/Pill';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { DatasetCard } from '@/widgets/datasets-grid/DatasetCard';
import { ModelScatter } from '@/widgets/model-scatter/ModelScatter';
import ui from '@/shared/ui/ui.module.css';
import styles from './info.module.css';

export function InfoPage() {
  useDocumentTitle('Карта моделей — Компьютерный слух');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const projects = getProjects();

  const rawProject = searchParams.get('project');
  const projectId = isProjectId(rawProject) ? rawProject : 'traffic';
  const project = getProject(projectId);
  const stats = getModelStats(projectId);

  const selectProject = (id: ProjectId) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'traffic') next.delete('project');
    else next.set('project', id);
    setSearchParams(next);
  };

  const selectModel = (model: Model) => {
    navigate(`/models?project=${projectId}&model=${getModelId(projectId, model)}`);
  };

  return (
    <section className={`${ui.page} ${ui.pageGapLg}`}>
      <div className={ui.headerRow}>
        <div className={ui.headerMain}>
          <SectionHeader
            as="h1"
            title="Карта моделей"
            lead="Каждая точка — модель. По оси X — число параметров, по оси Y — accuracy на тестовой выборке."
          />
        </div>
        <div className={ui.pills} role="group" aria-label="Подпроект">
          {projects.map((item) => (
            <Pill
              key={item.id}
              active={item.id === projectId}
              onClick={() => selectProject(item.id)}
            >
              {item.short}
            </Pill>
          ))}
        </div>
      </div>

      <div className={styles.scatterCard}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>{project.name}</span>
          <div className={styles.stats}>
            <span>
              моделей: <b>{stats.count}</b>
            </span>
            <span>
              лучшая acc: <b>{stats.best}</b>
            </span>
            <span>
              мин. размер: <b>{stats.min}</b>
            </span>
          </div>
        </div>

        <ModelScatter projectId={projectId} onSelectModel={selectModel} />

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} />
            модель
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBest} />
            на парето-фронте (лучшая точность при своём размере)
          </span>
          <span>Клик по точке открывает карточку модели.</span>
        </div>
      </div>

      <SectionHeader
        as="h2"
        size="md"
        title="Подпроекты и датасеты"
        lead="Описания и цифры — заглушки, заполните реальными данными."
      />

      <div className={styles.datasetGrid}>
        {projects.map((item) => (
          <DatasetCard key={item.id} project={item} active={item.id === projectId} />
        ))}
      </div>
    </section>
  );
}
