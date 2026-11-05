import { useEffect, useRef, type RefObject } from 'react';
import { getProjects } from '@/entities/project/selectors';
import type { ProjectId } from '@/entities/project/types';
import type { OverlayFrame } from './useCarScene';
import { cn } from '@/shared/lib/cn';
import styles from './car-viewer.module.css';

interface CarOverlayProps {
  frameRef: RefObject<OverlayFrame>;
  hostRef: RefObject<HTMLDivElement | null>;
  hovered: ProjectId | null;
  onHover: (projectId: ProjectId | null) => void;
  onOpen: (projectId: ProjectId) => void;
}

export function CarOverlay({ frameRef, hostRef, hovered, onHover, onOpen }: CarOverlayProps) {
  const projects = getProjects();
  const overlayRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lineRefs = useRef<Array<SVGPathElement | null>>([]);

  useEffect(() => {
    let animationFrame = 0;
    const draw = () => {
      animationFrame = requestAnimationFrame(draw);
      const host = hostRef.current;
      const overlay = overlayRef.current;
      if (!host || !overlay) return;
      const frame = frameRef.current;
      overlay.hidden = !frame.ready;
      if (!frame.ready || !frame.bbox) return;
      const rect = host.getBoundingClientRect();
      const points = [
        frame.front,
        frame.wheels[0],
        frame.roof,
        { x: frame.bbox.x + frame.bbox.width * 0.72, y: frame.bbox.y + frame.bbox.height * 0.65 },
      ];
      points.forEach((point, index) => {
        const marker = markerRefs.current[index];
        if (!marker || !point) return;
        const line = lineRefs.current[index];
        if (!line) return;
        const x = Math.max(8, Math.min(rect.width - 8, point.x - rect.left));
        const y = Math.max(85, Math.min(rect.height - 45, point.y - rect.top));
        const labelX = marker.offsetLeft;
        const shelfY = marker.offsetTop + marker.offsetHeight;
        const rightSide = index >= 2;
        const elbowX = rightSide ? labelX - 14 : labelX + marker.offsetWidth + 14;
        const shelfEnd = rightSide ? labelX + marker.offsetWidth : labelX;
        // A diagonal leader, horizontal shelf, and short tick replace the glowing pin.
        line.setAttribute('d',
          `M${x - 3} ${y + 4}l6 -8 M${x} ${y}L${elbowX} ${shelfY}H${shelfEnd}`,
        );
      });
    };
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [frameRef, hostRef]);

  return (
    <div ref={overlayRef} className={styles.overlay} hidden>
      <svg className={styles.leaders} aria-hidden="true">
        {projects.map((project, index) => (
          <path key={project.id} ref={(element) => { lineRefs.current[index] = element; }}
            data-project={project.id}
            className={cn(styles.leader, hovered === project.id && styles.leaderOn)} />
        ))}
      </svg>
      {projects.map((project, index) => (
        <button key={project.id} ref={(element) => { markerRefs.current[index] = element; }}
          type="button" data-project={project.id}
          className={cn(styles.marker, hovered === project.id && styles.markerOn)}
          aria-label={`Открыть подпроект: ${project.name}`} aria-haspopup="dialog"
          onClick={() => onOpen(project.id)} onMouseEnter={() => onHover(project.id)}
          onMouseLeave={() => onHover(null)} onFocus={() => onHover(project.id)} onBlur={() => onHover(null)}>
          <span className={styles.markerCode}>0{index + 1}</span>
          <span className={styles.markerLabel}>{project.short}</span>
        </button>
      ))}
    </div>
  );
}
