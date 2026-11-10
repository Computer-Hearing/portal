import { useMemo, useState } from 'react';
import type { Model, ProjectId } from '@/data/portal';
import { getModels } from '@/data/portal';
import { buildScatterData } from '@/lib/scatter';
import { formatAccuracy, formatParams } from '@/lib/format';
import { cn } from './ui';
import styles from './scatter.module.css';

interface ModelScatterProps {
  projectId: ProjectId;
  size?: 'lg' | 'sm';
  framed?: boolean;
  showAxisTitles?: boolean;
  onSelectModel?: (model: Model) => void;
  className?: string;
}

export function ModelScatter({
  projectId,
  size = 'lg',
  framed = false,
  showAxisTitles = size === 'lg',
  onSelectModel,
  className,
}: ModelScatterProps) {
  const data = useMemo(() => buildScatterData(getModels(projectId), projectId), [projectId]);
  const [hovered, setHovered] = useState<string | null>(null);

  const activePoint = data.points.find((point) => point.id === hovered) ?? null;
  const isCompact = size === 'sm';

  const tooltipTransform = activePoint
    ? `translate(${activePoint.left > 70 ? 'calc(-100% - 14px)' : '14px'}, ${
        activePoint.top < 25 ? '8px' : 'calc(-100% - 8px)'
      })`
    : undefined;

  return (
    <div
      className={cn(
        styles.chart,
        isCompact ? styles.chartSm : styles.chartLg,
        framed && styles.framed,
        className,
      )}
      role="group"
      aria-label="Карта моделей: число параметров и accuracy"
    >
      <div className={styles.plot}>
        {data.yTicks.map((tick) => (
          <div key={`y-${tick.label}`} className={styles.axisY} style={{ top: `${tick.position}%` }}>
            <span className={styles.axisYLabel}>{tick.label}</span>
          </div>
        ))}

        {data.xTicks.map((tick) => (
          <div key={`x-${tick.label}`} className={styles.axisX} style={{ left: `${tick.position}%` }}>
            <span className={styles.axisXLabel}>{tick.label}</span>
          </div>
        ))}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={styles.pareto}
          aria-hidden="true"
        >
          <polyline
            points={data.pareto.map((point) => `${point.left},${point.top}`).join(' ')}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {data.points.map((point) => (
          <button
            key={point.id}
            type="button"
            className={cn(styles.point, point.best && styles.pointBest)}
            style={{ left: `${point.left}%`, top: `${point.top}%` }}
            aria-label={`${point.model.name}: accuracy ${formatAccuracy(
              point.model.accuracy,
            )}, ${formatParams(point.model.params)} параметров`}
            onMouseEnter={() => setHovered(point.id)}
            onFocus={() => setHovered(point.id)}
            onMouseLeave={() => setHovered(null)}
            onBlur={() => setHovered(null)}
            onClick={() => onSelectModel?.(point.model)}
          />
        ))}

        {activePoint ? (
          <div
            className={styles.tooltip}
            style={{
              left: `${activePoint.left}%`,
              top: `${activePoint.top}%`,
              transform: tooltipTransform,
            }}
          >
            <span className={styles.tooltipName}>{activePoint.model.name}</span>
            <span className={styles.tooltipLine}>
              acc {formatAccuracy(activePoint.model.accuracy)} ·{' '}
              {formatParams(activePoint.model.params)} параметров
            </span>
            {!isCompact ? (
              <span className={cn(styles.tooltipLine, styles.tooltipMuted)}>
                {activePoint.model.arch} · вход {activePoint.model.input.mel} ×{' '}
                {activePoint.model.input.frames}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {showAxisTitles ? (
        <>
          <span className={styles.xTitle}>Число параметров</span>
          <span className={styles.yTitle}>Accuracy</span>
        </>
      ) : null}
    </div>
  );
}
