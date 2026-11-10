// Ракурсы камеры. Автомобиль стоит на сцене всегда, а при переходе между
// разделами камера плавно перелетает к ракурсу этого раздела.

export interface StageView {
  /** Угол вокруг автомобиля, градусы: 0 — спереди, 90 — сбоку, 180 — сзади */
  azimuth: number;
  /** Угол от вертикали, градусы: 90 — на уровне земли, меньше — выше */
  polar: number;
  /** Расстояние до автомобиля, метры */
  distance: number;
  /** Сдвиг автомобиля на экране, доля ширины/высоты: +x — вправо, +y — вниз */
  shiftX: number;
  shiftY: number;
}

// На главной автомобиль — главный герой: крупно, справа от текста.
const HOME: StageView = { azimuth: 42, polar: 74, distance: 10, shiftX: 0.2, shiftY: -0.05 };

// На остальных страницах он уходит на задний план, вправо и вниз.
const VIEWS: Record<string, StageView> = {
  '/': HOME,
  '/tools': { azimuth: 90, polar: 78, distance: 10.5, shiftX: 0.24, shiftY: 0.14 },
  '/inference': { azimuth: 148, polar: 70, distance: 10.5, shiftX: 0.26, shiftY: 0.14 },
  '/info': { azimuth: 24, polar: 52, distance: 11, shiftX: 0.24, shiftY: 0.12 },
  '/models': { azimuth: -32, polar: 80, distance: 10, shiftX: 0.24, shiftY: 0.14 },
};

export function isHomePath(pathname: string): boolean {
  return pathname === '/';
}

export function viewForPath(pathname: string): StageView {
  return VIEWS[pathname] ?? HOME;
}
