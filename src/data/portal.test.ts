import { describe, expect, it } from 'vitest';
import type { Dataset } from '@/data/portal';
import { getModelId, getModels, getProject, getProjects, isProjectId } from '@/data/portal';
import { slugify } from '@/lib/format';

const PROJECT_MODEL_COUNTS = {
  traffic: 10,
  road: 9,
  siren: 8,
  diag: 11,
} as const;

describe('portal golden data', () => {
  const projects = getProjects();

  it('contains four projects and 38 models', () => {
    expect(projects).toHaveLength(4);
    expect(projects.reduce((total, project) => total + project.models.length, 0)).toBe(38);

    for (const project of projects) {
      expect(project.models).toHaveLength(PROJECT_MODEL_COUNTS[project.id]);
    }
  });

  it('has unique project and model ids', () => {
    const projectIds = projects.map((project) => project.id);
    const modelIds = projects.flatMap((project) => project.models.map((model) => model.id));

    expect(new Set(projectIds).size).toBe(projectIds.length);
    expect(new Set(modelIds).size).toBe(modelIds.length);
  });

  it('keeps model ids stable for public links', () => {
    for (const project of projects) {
      for (const model of project.models) {
        const expectedId = `${project.id}-${slugify(model.name)}`;
        expect(model.id).toBe(expectedId);
        expect(getModelId(project.id, model)).toBe(expectedId);
      }
    }
  });

  it('provides weight links for every model', () => {
    for (const project of projects) {
      for (const model of project.models) {
        expect(Object.keys(model.weights).sort()).toEqual(['onnx', 'pt']);
        expect(model.weights.pt === null || typeof model.weights.pt === 'string').toBe(true);
        expect(model.weights.onnx === null || typeof model.weights.onnx === 'string').toBe(true);
      }
    }
  });

  it('keeps datasets complete', () => {
    const fields: Array<keyof Dataset> = [
      'name',
      'slug',
      'hours',
      'clips',
      'sampleRate',
      'channels',
      'split',
      'note',
    ];

    for (const project of projects) {
      for (const field of fields) {
        expect(project.dataset[field]).toBeTruthy();
      }
    }
  });

  it('keeps project lookups working', () => {
    expect(getProject('traffic').id).toBe('traffic');
    expect(getProject('unknown').id).toBe('traffic');
    expect(getModels('traffic')).toHaveLength(10);
    expect(isProjectId('siren')).toBe(true);
    expect(isProjectId('unknown')).toBe(false);
    expect(isProjectId(null)).toBe(false);
  });
});
