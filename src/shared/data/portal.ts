import raw from './portal.json';
import type { Model } from '@/entities/model/types';
import type { PortalData, PortalProject } from '@/entities/portal/types';
import type { ProjectId } from '@/entities/project/types';
import { slugify } from '@/shared/lib/format';

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

export function getProjects(): PortalProject[] {
  return data.projects;
}

export function getProject(id: string | null | undefined): PortalProject {
  const project = data.projects.find((item) => item.id === id) ?? data.projects[0];
  if (!project) throw new Error('portal.json: projects must not be empty');
  return project;
}

export function getModels(projectId: ProjectId): Model[] {
  return getProject(projectId).models;
}

export function isProjectId(value: string | null | undefined): value is ProjectId {
  return data.projects.some((project) => project.id === value);
}
