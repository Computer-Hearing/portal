import type { Stat } from '@/entities/dataset/types';
import type { Project } from './types';

export { getProject, getProjects, isProjectId } from '@/shared/data/portal';

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
