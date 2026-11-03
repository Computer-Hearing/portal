import type { ProjectId } from '@/entities/project/types';

export interface ModelInput {
  mel: number;
  frames: number;
}

export interface Model {
  name: string;
  arch: string;
  params: number;
  accuracy: number;
  input: ModelInput;
}

export type ModelsByProject = Record<ProjectId, Model[]>;

export interface ModelStats {
  count: number;
  best: string;
  min: string;
}
