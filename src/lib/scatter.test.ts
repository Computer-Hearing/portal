import { describe, expect, it } from 'vitest';
import { getModels } from '@/data/portal';
import { buildScatterData, xPercent, yPercent } from './scatter';

describe('scatter scale', () => {
  it('maps the axis boundaries to 0..100 percent', () => {
    expect(xPercent(0)).toBe(0);
    expect(xPercent(1_600_000)).toBe(100);
    expect(yPercent(0.68)).toBe(100);
    expect(yPercent(0.92)).toBe(0);
  });
});

describe('buildScatterData', () => {
  const models = getModels('traffic');
  const data = buildScatterData(models, 'traffic');

  it('returns one point per model', () => {
    expect(data.points).toHaveLength(models.length);
  });

  it('keeps all points inside the chart', () => {
    for (const point of data.points) {
      expect(point.left).toBeGreaterThanOrEqual(0);
      expect(point.left).toBeLessThanOrEqual(100);
      expect(point.top).toBeGreaterThanOrEqual(0);
      expect(point.top).toBeLessThanOrEqual(100);
    }
  });

  it('marks the pareto front and keeps it monotonic', () => {
    const best = data.points.filter((point) => point.best);
    expect(best.length).toBeGreaterThan(0);

    for (let index = 1; index < best.length; index += 1) {
      expect(best[index].model.params).toBeGreaterThan(best[index - 1].model.params);
      expect(best[index].model.accuracy).toBeGreaterThan(best[index - 1].model.accuracy);
    }
  });

  it('generates axis ticks', () => {
    expect(data.xTicks).toHaveLength(5);
    expect(data.yTicks).toHaveLength(5);
    expect(data.xTicks.at(-1)?.label).toBe('1.60 M');
  });
});
