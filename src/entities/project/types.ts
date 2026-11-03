import type { Dataset } from '@/entities/dataset/types';

export type ProjectId = 'traffic' | 'road' | 'siren' | 'diag';

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
