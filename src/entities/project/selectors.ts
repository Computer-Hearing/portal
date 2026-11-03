import type { Stat } from '@/entities/dataset/types';
import type { Project, ProjectId } from './types';
import { PROJECTS } from './data';

export const PROJECT_IDS: ProjectId[] = PROJECTS.map((project) => project.id);

export function isProjectId(value: string | null | undefined): value is ProjectId {
  return PROJECT_IDS.includes(value as ProjectId);
}

export function getProject(id: string | null | undefined): Project {
  return PROJECTS.find((project) => project.id === id) ?? PROJECTS[0];
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
