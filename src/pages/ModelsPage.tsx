import { useSearchParams } from 'react-router-dom';
import type { Model } from '@/entities/model/types';
import type { ProjectId } from '@/entities/project/types';
import { getModelId, getModels, getModelsByAccuracy } from '@/entities/model/selectors';
import { PROJECTS } from '@/entities/project/data';
import { getProject, isProjectId } from '@/entities/project/selectors';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Pill } from '@/shared/ui/Pill';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ApiDocsCard } from '@/widgets/api-docs/ApiDocsCard';
import { ModelCard } from '@/widgets/models-grid/ModelCard';
import ui from '@/shared/ui/ui.module.css';
import styles from '@/widgets/models-grid/models.module.css';

export function ModelsPage() {
  useDocumentTitle('Модели — Компьютерный слух');
  const [searchParams, setSearchParams] = useSearchParams();

  const rawProject = searchParams.get('project');
  const projectId: ProjectId = isProjectId(rawProject) ? rawProject : 'traffic';
  const project = getProject(projectId);
  const models = getModelsByAccuracy(getModels(projectId));

  const rawModel = searchParams.get('model');
  const openModel = models.find((model) => getModelId(projectId, model) === rawModel) ?? null;

  const selectProject = (id: ProjectId) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'traffic') next.delete('project');
    else next.set('project', id);
    next.delete('model');
    setSearchParams(next);
  };

  const toggleModel = (model: Model) => {
    const next = new URLSearchParams(searchParams);
    const id = getModelId(projectId, model);
    if (rawModel === id) next.delete('model');
    else next.set('model', id);
    setSearchParams(next);
  };

  return (
    <section className={ui.page}>
      <div className={ui.headerRow}>
        <div className={ui.headerMain}>
          <SectionHeader
            as="h1"
            title="Модели"
            lead="Веса PyTorch (.pt) и ONNX для каждой модели. Нажмите на карточку, чтобы увидеть детали обучения и размерности."
          />
        </div>
        <div className={ui.pills} role="group" aria-label="Подпроект">
          {PROJECTS.map((item) => (
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

      <div className={styles.grid}>
        {models.map((model) => (
          <ModelCard
            key={model.name}
            model={model}
            project={project}
            open={openModel?.name === model.name}
            onToggle={() => toggleModel(model)}
          />
        ))}
      </div>

      <ApiDocsCard />
    </section>
  );
}
