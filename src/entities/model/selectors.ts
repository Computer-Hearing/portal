import { formatParams, slugify } from '@/shared/lib/format';
import type { ProjectId } from '@/entities/project/types';
import type { Model, ModelStats } from './types';
import { MODELS } from './data';

export function getModels(projectId: ProjectId): Model[] {
  return MODELS[projectId];
}

export function getModelId(projectId: ProjectId, model: Model): string {
  return `${projectId}-${slugify(model.name)}`;
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
