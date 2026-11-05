import type { ProjectId } from '@/entities/project/types';

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
