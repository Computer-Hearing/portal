import { describe, expect, it } from 'vitest';
import { getModelId, getModelStats, getModels } from '@/entities/model/selectors';
import { formatAccuracy, formatParams, slugify } from './format';

describe('formatters', () => {
  it('formats parameter counts', () => {
    expect(formatParams(146500)).toBe('147 K');
    expect(formatParams(1_462_000)).toBe('1.46 M');
  });

  it('formats accuracy with three decimals', () => {
    expect(formatAccuracy(0.889)).toBe('0.889');
  });

  it('slugifies model names', () => {
    expect(slugify('AST-Distill-XS')).toBe('ast-distill-xs');
    expect(slugify('CNN + GRU')).toBe('cnn-gru');
  });
});

describe('model selectors', () => {
  it('builds stable API ids', () => {
    const model = getModels('traffic').find((item) => item.name === 'AST-Distill-XS');
    expect(model).toBeDefined();
    if (model) expect(getModelId('traffic', model)).toBe('traffic-ast-distill-xs');
  });

  it('summarises a project', () => {
    expect(getModelStats('traffic')).toEqual({
      count: 10,
      best: '0.889',
      min: '147 K',
    });
  });
});
