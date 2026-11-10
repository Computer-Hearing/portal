import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion, useScrolledPast } from '@/lib/hooks';
import { cn } from '@/ui/ui';
import { createStageScene, type StageScene } from './scene';
import { isHomePath, viewForPath } from './views';
import styles from './stage.module.css';

type Status = 'loading' | 'ready' | 'error';

// Сцена с автомобилем — общий фон всего портала. Она создаётся один раз
// и живёт при переходах между разделами: меняется только ракурс камеры.
// На первом экране главной автомобиль виден полностью; на остальных
// страницах и при прокрутке главной вниз сцена приглушается, чтобы
// не мешать чтению.
export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<StageScene | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const { pathname } = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const scrolledDown = useScrolledPast(0.45);
  const dimmed = !isHomePath(pathname) || scrolledDown;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: StageScene;
    try {
      scene = createStageScene(canvas, {
        onReady: () => setStatus('ready'),
        onError: () => setStatus('error'),
      });
    } catch {
      // WebGL недоступен — портал работает и без сцены
      setStatus('error');
      return;
    }
    sceneRef.current = scene;
    scene.setView(viewForPath(window.location.pathname), true);

    return () => {
      sceneRef.current = null;
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setView(viewForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    sceneRef.current?.setMotion(!reducedMotion);
  }, [reducedMotion]);

  return (
    <div className={cn(styles.stage, dimmed && styles.dimmed)}>
      <canvas
        ref={canvasRef}
        className={cn(styles.canvas, status === 'ready' && styles.canvasReady)}
        aria-label="3D-модель Volkswagen Golf VII, вращается мышью"
      />
      {status === 'loading' ? <span className={styles.status}>Загрузка 3D-модели…</span> : null}
    </div>
  );
}
