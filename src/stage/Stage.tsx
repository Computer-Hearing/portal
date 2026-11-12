import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/ui/ui';
import { createStageScene, type StageScene } from './scene';
import { viewForPath } from './views';
import styles from './stage.module.css';

interface StageProps {
  /** Сцена на заднем плане (приглушена): автомобиль стоит, кадры не рисуются */
  idle: boolean;
  /** Сцена выдаёт слишком мало кадров */
  onSlow: () => void;
  /** Сцену показать не удалось: нет WebGL или не загрузилась модель */
  onUnavailable: () => void;
}

// Живая сцена с автомобилем. Создаётся один раз и живёт при переходах
// между разделами: меняется только ракурс камеры.
export function Stage({ idle, onSlow, onUnavailable }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StageScene | null>(null);
  const [ready, setReady] = useState(false);
  const { pathname } = useLocation();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: StageScene;
    try {
      scene = createStageScene(canvas, { onReady: () => setReady(true), onSlow, onUnavailable });
    } catch {
      // WebGL недоступен или работает без видеокарты
      onUnavailable();
      return;
    }
    sceneRef.current = scene;
    scene.setView(viewForPath(window.location.pathname), true);

    return () => {
      sceneRef.current = null;
      scene.dispose();
    };
  }, [onSlow, onUnavailable]);

  useEffect(() => {
    sceneRef.current?.setView(viewForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    sceneRef.current?.setMotion(!reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    sceneRef.current?.setIdle(idle);
  }, [idle]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(styles.canvas, ready && styles.canvasReady)}
        aria-label="3D-модель Volkswagen Golf VII, вращается мышью"
      />
      {ready ? null : <span className={styles.status}>Загрузка 3D-модели…</span>}
    </>
  );
}
