import type { Model } from '@/entities/model/types';
import type { Project } from '@/entities/project/types';

export interface PortalProject extends Project {
  models: Model[];
}

export interface PortalData {
  schemaVersion: number;
  updatedAt: string;
  projects: PortalProject[];
}
