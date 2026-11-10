import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Model, ProjectId } from '@/data/portal';
import { getModelId, getModels, getModelsByAccuracy, getProject, getProjects, isProjectId } from '@/data/portal';
import { useDocumentTitle } from '@/lib/hooks';
import { Pill, SectionHeader } from '@/ui/ui';
import { ModelCard } from './ModelCard';
import ui from '@/ui/ui.module.css';
import styles from './models.module.css';

function ApiDocsCard() {
  const host = import.meta.env.VITE_API_HOST ?? '[API_HOST]';

  return (
    <div className={styles.apiCard}>
      <div className={styles.text}>
        <span className={styles.eyebrow}>REST API</span>
        <h3 className={styles.title}>Модели можно скачивать через API</h3>
        <p className={styles.description}>
          Список моделей подпроекта, веса PyTorch и ONNX доступны по HTTP — удобно для CI и для
          обновления моделей на борту. Хост и токен — заглушки.
        </p>
      </div>

      <div className={styles.codeWrap}>
        <pre className={styles.pre}>
          <span className={styles.comment}>
            # Список моделей подпроекта (traffic | road | siren | diag)
          </span>
          {`\nGET  https://${host}/api/v1/models?project=road\n\n`}
          <span className={styles.comment}># Скачать веса или ONNX по ID модели</span>
          {`\nGET  https://${host}/api/v1/models/{model_id}/weights   `}
          <span className={styles.comment}>→ .pt</span>
          {`\nGET  https://${host}/api/v1/models/{model_id}/onnx      `}
          <span className={styles.comment}>→ .onnx</span>
          {`\n\ncurl -H "Authorization: Bearer $TOKEN" -o model.onnx \\\n  https://${host}/api/v1/models/road-tirespeccnn/onnx`}
        </pre>
      </div>
    </div>
  );
}

export function ModelsPage() {
  useDocumentTitle('Модели — Компьютерный слух');
  const projects = getProjects();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawProject = searchParams.get('project');
  const projectId: ProjectId = isProjectId(rawProject) ? rawProject : 'traffic';
  const project = getProject(projectId);
  const models = getModelsByAccuracy(getModels(projectId));

  const rawModel = searchParams.get('model');
  const openModel = models.find((model) => getModelId(projectId, model) === rawModel) ?? null;

  // Deep link (?model=...) from the scatter or the project modal: bring the
  // opened card into view. Runs once on mount, after ScrollToTop in AppShell.
  useEffect(() => {
    if (!rawModel) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`model-${rawModel}`)
        ?.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

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
