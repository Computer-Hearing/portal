import { useRef } from 'react';
import type { ProjectId } from '@/entities/project/types';
import { Spinner } from '@/shared/ui/Spinner';
import { RotateIcon } from '@/shared/ui/icons';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { CarOverlay } from './CarOverlay';
import { useCarScene } from './useCarScene';
import styles from './car-viewer.module.css';

interface CarViewerProps {
  hovered: ProjectId | null;
  onHover: (projectId: ProjectId | null) => void;
  onOpen: (projectId: ProjectId) => void;
}

export function CarViewer({
  hovered,
  onHover,
  onOpen,
}: CarViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { frameRef, loading, error } = useCarScene({
    hostRef,
    canvasRef,
    autoRotate: true,
    rotateSpeed: 0.9,
    reducedMotion,
  });

  return (
      <div ref={hostRef} className={styles.viewerHost}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="3D-модель Volkswagen Golf VII, вращается мышью"
        />

        <div className={styles.viewerBadge}>
          <span className={styles.viewerKicker}>ТЕСТОВАЯ ПЛАТФОРМА</span>
          <span className={styles.viewerTitle}>Volkswagen Golf VII</span>
        </div>

        <div className={styles.rotateHint}>
          <RotateIcon />
          Потяните, чтобы вращать
        </div>

        {loading && !error ? (
          <div className={styles.loader}>
            <Spinner />
            <span>Загрузка 3D-модели…</span>
          </div>
        ) : null}

        {error ? (
          <div className={styles.loader}>
            <span>{error}</span>
          </div>
        ) : null}
        <CarOverlay
          frameRef={frameRef}
          hostRef={hostRef}
          hovered={hovered}
          onHover={onHover}
          onOpen={onOpen}
        />
      </div>
  );
}
