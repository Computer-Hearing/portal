import type { Model, ProjectId } from '@/data/portal';
import { getModelId } from '@/data/portal';
import { formatParams } from './format';

export const SCATTER_DOMAIN = {
  xMax: 1_600_000,
  yMin: 0.68,
  yMax: 0.92,
} as const;

export const SCATTER_X_TICKS = [0, 400_000, 800_000, 1_200_000, 1_600_000];
export const SCATTER_Y_TICKS = [0.7, 0.75, 0.8, 0.85, 0.9];

export interface ScatterPoint {
  model: Model;
  id: string;
  left: number;
  top: number;
  best: boolean;
}

export interface ScatterTick {
  position: number;
  label: string;
}

export interface ScatterData {
  points: ScatterPoint[];
  pareto: Array<{ left: number; top: number }>;
  xTicks: ScatterTick[];
  yTicks: ScatterTick[];
}

export function xPercent(params: number): number {
  return (params / SCATTER_DOMAIN.xMax) * 100;
}

export function yPercent(accuracy: number): number {
  const { yMin, yMax } = SCATTER_DOMAIN;
  return (1 - (accuracy - yMin) / (yMax - yMin)) * 100;
}

export function buildScatterData(models: Model[], projectId: ProjectId): ScatterData {
  const sortedByParams = [...models].sort((a, b) => a.params - b.params);
  const bestNames = new Set<string>();
  const pareto: Array<{ left: number; top: number }> = [];

  let bestAccuracy = -1;
  for (const model of sortedByParams) {
    if (model.accuracy > bestAccuracy) {
      bestAccuracy = model.accuracy;
      bestNames.add(model.name);
      pareto.push({ left: xPercent(model.params), top: yPercent(model.accuracy) });
    }
  }

  return {
    points: sortedByParams.map((model) => ({
      model,
      id: getModelId(projectId, model),
      left: xPercent(model.params),
      top: yPercent(model.accuracy),
      best: bestNames.has(model.name),
    })),
    pareto,
    xTicks: SCATTER_X_TICKS.map((value) => ({
      position: xPercent(value),
      label: value === 0 ? '0' : formatParams(value).replace('.00', ''),
    })),
    yTicks: SCATTER_Y_TICKS.map((value) => ({
      position: yPercent(value),
      label: value.toFixed(2),
    })),
  };
}
