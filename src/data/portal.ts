// Данные портала: типы, доступ к golden-файлу portal.json и выборки по нему.
// Всё про проекты, модели и датасеты — в одном месте.
import raw from './portal.json';
import { formatParams, slugify } from '@/lib/format';

// ---------------------------------------------------------------------------
// Типы
// ---------------------------------------------------------------------------

export type ProjectId = 'traffic' | 'road' | 'siren' | 'diag';

export interface Dataset {
  name: string;
  slug: string;
  hours: string;
  clips: string;
  sampleRate: string;
  channels: string;
  split: string;
  note: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface Project {
  id: ProjectId;
  code: string;
  name: string;
  short: string;
  sub: string;
  description: string;
  classes: string[];
  outClasses: number;
  dataset: Dataset;
}

export interface ModelInput {
  mel: number;
  frames: number;
}

export interface ModelWeights {
  pt: string | null;
  onnx: string | null;
}

export interface Model {
  id: string;
  name: string;
  arch: string;
  params: number;
  accuracy: number;
  input: ModelInput;
  weights: ModelWeights;
}

export type ModelsByProject = Record<ProjectId, Model[]>;

export interface ModelStats {
  count: number;
  best: string;
  min: string;
}

export interface PortalProject extends Project {
  models: Model[];
}

export interface PortalData {
  schemaVersion: number;
  updatedAt: string;
  projects: PortalProject[];
}

// ---------------------------------------------------------------------------
// Доступ к данным
// ---------------------------------------------------------------------------

const data = raw as unknown as PortalData;

function validatePortalData(portal: PortalData) {
  if (portal.schemaVersion !== 1) {
    throw new Error(`portal.json: unsupported schema version ${portal.schemaVersion}`);
  }
  if (!Array.isArray(portal.projects) || portal.projects.length === 0) {
    throw new Error('portal.json: projects must not be empty');
  }

  const projectIds = new Set<string>();
  const modelIds = new Set<string>();

  for (const project of portal.projects) {
    if (projectIds.has(project.id)) {
      throw new Error(`portal.json: duplicate project id "${project.id}"`);
    }
    projectIds.add(project.id);

    if (project.models.length === 0) {
      throw new Error(`portal.json: project "${project.id}" has no models`);
    }
    if (!project.dataset?.name) {
      throw new Error(`portal.json: project "${project.id}" has no dataset`);
    }

    for (const model of project.models) {
      const expectedId = `${project.id}-${slugify(model.name)}`;
      if (model.id !== expectedId) {
        throw new Error(
          `portal.json: model "${model.name}" has id "${model.id}", expected "${expectedId}"`,
        );
      }
      if (modelIds.has(model.id)) {
        throw new Error(`portal.json: duplicate model id "${model.id}"`);
      }
      modelIds.add(model.id);

      if (!model.weights || !('pt' in model.weights) || !('onnx' in model.weights)) {
        throw new Error(`portal.json: model "${model.name}" has no weights links`);
      }
    }
  }
}

if (import.meta.env.DEV) validatePortalData(data);

export function getPortalData(): PortalData {
  return data;
}

// ---------------------------------------------------------------------------
// Проекты
// ---------------------------------------------------------------------------

export function getProjects(): PortalProject[] {
  return data.projects;
}

export function getProject(id: string | null | undefined): PortalProject {
  const project = data.projects.find((item) => item.id === id) ?? data.projects[0];
  if (!project) throw new Error('portal.json: projects must not be empty');
  return project;
}

export function isProjectId(value: string | null | undefined): value is ProjectId {
  return data.projects.some((project) => project.id === value);
}

export function getProjectStats(project: Project): Stat[] {
  return [
    { label: 'Объём', value: project.dataset.hours },
    { label: 'Клипов', value: project.dataset.clips },
    { label: 'Классов', value: String(project.classes.length) },
    { label: 'Частота', value: project.dataset.sampleRate },
    { label: 'Каналы', value: project.dataset.channels },
    { label: 'Train / val / test', value: project.dataset.split },
  ];
}

// ---------------------------------------------------------------------------
// Модели
// ---------------------------------------------------------------------------

export function getModels(projectId: ProjectId): Model[] {
  return getProject(projectId).models;
}

export function getModelId(projectId: ProjectId, model: Model): string {
  return model.id || `${projectId}-${slugify(model.name)}`;
}

export function getBestAccuracy(models: Model[]): number {
  return models.reduce((best, model) => Math.max(best, model.accuracy), 0);
}

export function getMinParams(models: Model[]): number {
  return models.reduce((min, model) => Math.min(min, model.params), Number.POSITIVE_INFINITY);
}

export function getModelsByAccuracy(models: Model[]): Model[] {
  return [...models].sort((a, b) => b.accuracy - a.accuracy);
}

export function getModelStats(projectId: ProjectId): ModelStats {
  const models = getModels(projectId);
  return {
    count: models.length,
    best: getBestAccuracy(models).toFixed(3),
    min: formatParams(getMinParams(models)),
  };
}
