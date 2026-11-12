// Каким показывать фон портала: живой 3D-сценой или готовым изображением.
// Этот файл не тянет за собой three.js: решение принимается до загрузки
// сцены, и там, где она не нужна, ни её код, ни модель не скачиваются.

/** `live` — живая 3D-сцена, `static` — изображение автомобиля */
export type StageMode = 'live' | 'static';

/** Что получает страница от общей разметки (см. app/App.tsx) */
export interface StageControl {
  mode: StageMode;
  /** Выбор пользователя из cookie; null — ещё не выбирал */
  choice: StageMode | null;
  /** Может ли устройство показать живую сцену (не телефон, сцена запускается) */
  canLive: boolean;
  choose: (mode: StageMode) => void;
}

/** Телефоны, планшеты и узкие окна: фон всегда статичный */
export const STATIC_ONLY_QUERY = '(max-width: 900px), (pointer: coarse)';

const COOKIE = 'stage';
const COOKIE_AGE = 60 * 60 * 24 * 365; // год, в секундах

interface DeviceInfo {
  hardwareConcurrency?: number;
  /** Объём памяти в ГБ; сообщают не все браузеры */
  deviceMemory?: number;
}

/** Слабый компьютер: мало ядер или памяти. По умолчанию фон там статичный */
export function isWeakDevice(): boolean {
  const { hardwareConcurrency = 8, deviceMemory = 8 }: DeviceInfo = navigator;
  return hardwareConcurrency < 4 || deviceMemory < 4;
}

export function readChoice(): StageMode | null {
  const value = document.cookie.match(/(?:^|; )stage=(live|static)/)?.[1];
  return value === 'live' || value === 'static' ? value : null;
}

export function saveChoice(mode: StageMode): void {
  document.cookie = `${COOKIE}=${mode}; max-age=${COOKIE_AGE}; path=/; samesite=lax`;
}
