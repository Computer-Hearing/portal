import { useEffect, useRef, type RefObject } from 'react';
import type { ProjectId } from '@/entities/project/types';
import type { OverlayFrame, ScreenPoint } from './useCarScene';
import styles from './car-viewer.module.css';
import { cn } from '@/shared/lib/cn';

interface CarOverlayProps {
  frameRef: RefObject<OverlayFrame>;
  heroRef: RefObject<HTMLDivElement | null>;
  hostRef: RefObject<HTMLDivElement | null>;
  blockRefs: RefObject<Array<HTMLElement | null>>;
  hovered: ProjectId | null;
  onHover: (projectId: ProjectId | null) => void;
  onOpen: (projectId: ProjectId) => void;
}

interface Point {
  x: number;
  y: number;
}

function setAttributes<T extends Element>(
  element: T | null,
  attributes: Record<string, string | number>,
) {
  if (!element) return;
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
}

function curve(start: Point, end: Point): string {
  const dx = Math.max(50, (end.x - start.x) * 0.45);
  return `M${start.x.toFixed(1)} ${start.y.toFixed(1)} C${(start.x + dx).toFixed(1)} ${start.y.toFixed(
    1,
  )} ${(end.x - dx).toFixed(1)} ${end.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

export function CarOverlay({
  frameRef,
  heroRef,
  hostRef,
  blockRefs,
  hovered,
  onHover,
  onOpen,
}: CarOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const diagBoxRef = useRef<SVGRectElement>(null);
  const trafficRef = useRef<SVGPathElement>(null);
  const road0Ref = useRef<SVGPathElement>(null);
  const road1Ref = useRef<SVGPathElement>(null);
  const sirenRef = useRef<SVGPathElement>(null);
  const diagLineRef = useRef<SVGPathElement>(null);
  const hitTrafficRef = useRef<SVGPathElement>(null);
  const hitRoad0Ref = useRef<SVGPathElement>(null);
  const hitRoad1Ref = useRef<SVGPathElement>(null);
  const hitSirenRef = useRef<SVGPathElement>(null);
  const hitDiagRef = useRef<SVGPathElement>(null);
  const dotTrafficRef = useRef<SVGCircleElement>(null);
  const dotRoad0Ref = useRef<SVGCircleElement>(null);
  const dotRoad1Ref = useRef<SVGCircleElement>(null);
  const dotSirenRef = useRef<SVGCircleElement>(null);
  const textTrafficRef = useRef<SVGTextElement>(null);
  const textRoadRef = useRef<SVGTextElement>(null);
  const textSirenRef = useRef<SVGTextElement>(null);
  const textDiagRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const host = hostRef.current;
    const svg = svgRef.current;
    if (!hero || !host || !svg) return;

    let animationFrame = 0;
    let heroRect = hero.getBoundingClientRect();
    let hostRect = host.getBoundingClientRect();
    let blockRects: Array<DOMRect | null> = [];
    let sideLayout = false;

    const measure = () => {
      heroRect = hero.getBoundingClientRect();
      hostRect = host.getBoundingClientRect();
      blockRects = (blockRefs.current ?? []).map((element) =>
        element ? element.getBoundingClientRect() : null,
      );
      sideLayout =
        hostRect.left - heroRect.left > 200 && Math.abs(hostRect.top - heroRect.top) < 140;
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(hero);
    resizeObserver.observe(host);

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      void document.fonts.ready.then(measure);
    }

    const toLocal = (point: ScreenPoint): Point => ({
      x: point.x - heroRect.left,
      y: point.y - heroRect.top,
    });

    const blockStart = (index: number): Point | null => {
      const rect = blockRects[index];
      if (!rect) return null;
      return {
        x: rect.right - heroRect.left,
        y: rect.top + rect.height / 2 - heroRect.top,
      };
    };

    const opacityFor = (point: ScreenPoint) =>
      point.d > frameRef.current.centerDistance + 0.3 ? '0.35' : '1';

    const draw = () => {
      animationFrame = requestAnimationFrame(draw);

      const frame = frameRef.current;
      if (!frame.ready || !frame.bbox || !sideLayout) {
        svg.style.display = 'none';
        return;
      }

      svg.style.display = '';

      const front = toLocal(frame.front);
      const roof = toLocal(frame.roof);
      const wheels = frame.wheels.map(toLocal);
      const box = {
        x: frame.bbox.x - heroRect.left,
        y: frame.bbox.y - heroRect.top,
        width: frame.bbox.width,
        height: frame.bbox.height,
      };

      const trafficStart = blockStart(0);
      if (trafficStart) {
        const d = curve(trafficStart, front);
        setAttributes(trafficRef.current, { d });
        setAttributes(hitTrafficRef.current, { d });
      }
      setAttributes(dotTrafficRef.current, {
        cx: front.x,
        cy: front.y,
        opacity: opacityFor(frame.front),
      });
      setAttributes(textTrafficRef.current, { x: front.x + 12, y: front.y - 12 });

      const roadStart = blockStart(1);
      const roadPaths = [road0Ref.current, road1Ref.current];
      const roadHits = [hitRoad0Ref.current, hitRoad1Ref.current];
      const roadDots = [dotRoad0Ref.current, dotRoad1Ref.current];

      if (roadStart && wheels.length === 2) {
        wheels.forEach((wheel, index) => {
          const d = curve(roadStart, wheel);
          setAttributes(roadPaths[index], { d });
          setAttributes(roadHits[index], { d });
          setAttributes(roadDots[index], { cx: wheel.x, cy: wheel.y, opacity: '1' });
        });
        setAttributes(textRoadRef.current, {
          x: (wheels[0].x + wheels[1].x) / 2 - 50,
          y: Math.max(wheels[0].y, wheels[1].y) + 40,
        });
      }

      const sirenStart = blockStart(2);
      if (sirenStart) {
        const d = curve(sirenStart, roof);
        setAttributes(sirenRef.current, { d });
        setAttributes(hitSirenRef.current, { d });
      }
      setAttributes(dotSirenRef.current, {
        cx: roof.x,
        cy: roof.y,
        opacity: opacityFor(frame.roof),
      });
      setAttributes(textSirenRef.current, { x: roof.x + 12, y: roof.y - 14 });

      setAttributes(diagBoxRef.current, {
        x: box.x - 8,
        y: box.y - 8,
        width: box.width + 16,
        height: box.height + 16,
      });

      const diagStart = blockStart(3);
      if (diagStart) {
        const diagEnd = {
          x: box.x - 8,
          y: box.y + box.height - 8 - box.height * 0.18,
        };
        const d = curve(diagStart, diagEnd);
        setAttributes(diagLineRef.current, { d });
        setAttributes(hitDiagRef.current, { d });
        setAttributes(textDiagRef.current, { x: box.x - 8, y: box.y - 18 });
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [blockRefs, frameRef, heroRef, hostRef]);

  const lineClass = (projectId: ProjectId) =>
    cn(styles.line, hovered === projectId && styles.lineOn);

  const hitHandlers = (projectId: ProjectId) => ({
    onClick: () => onOpen(projectId),
    onMouseEnter: () => onHover(projectId),
    onMouseLeave: () => onHover(null),
  });

  return (
    <svg ref={svgRef} className={styles.overlay} aria-hidden="true">
      <rect
        ref={diagBoxRef}
        x="0"
        y="0"
        width="0"
        height="0"
        rx="10"
        className={lineClass('diag')}
      />
      <path ref={trafficRef} d="M0 0" className={lineClass('traffic')} />
      <path ref={road0Ref} d="M0 0" className={lineClass('road')} />
      <path ref={road1Ref} d="M0 0" className={lineClass('road')} />
      <path ref={sirenRef} d="M0 0" className={lineClass('siren')} />
      <path ref={diagLineRef} d="M0 0" className={lineClass('diag')} />

      <path ref={hitTrafficRef} d="M0 0" className={styles.hit} {...hitHandlers('traffic')} />
      <path ref={hitRoad0Ref} d="M0 0" className={styles.hit} {...hitHandlers('road')} />
      <path ref={hitRoad1Ref} d="M0 0" className={styles.hit} {...hitHandlers('road')} />
      <path ref={hitSirenRef} d="M0 0" className={styles.hit} {...hitHandlers('siren')} />
      <path ref={hitDiagRef} d="M0 0" className={styles.hit} {...hitHandlers('diag')} />

      <circle ref={dotTrafficRef} cx="-50" cy="-50" r="5" className={styles.dot} />
      <circle ref={dotRoad0Ref} cx="-50" cy="-50" r="5" className={styles.dot} />
      <circle ref={dotRoad1Ref} cx="-50" cy="-50" r="5" className={styles.dot} />
      <circle ref={dotSirenRef} cx="-50" cy="-50" r="5" className={styles.dot} />

      <text ref={textTrafficRef} x="-500" y="-500" className={styles.labelText}>
        передний сектор · трафик
      </text>
      <text ref={textRoadRef} x="-500" y="-500" className={styles.labelText}>
        колёса · шум шин
      </text>
      <text ref={textSirenRef} x="-500" y="-500" className={styles.labelText}>
        мик. массив на крыше · сирены
      </text>
      <text ref={textDiagRef} x="-500" y="-500" className={styles.labelText}>
        класс: VW Golf VII · состояние: [норма]
      </text>
    </svg>
  );
}
