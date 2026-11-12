// Камера сцены: всегда смотрит на автомобиль и движется вокруг него по сфере.
// Три источника движения:
//  - перелёт к ракурсу раздела (flyTo);
//  - перетаскивание мышью или пальцем, с инерцией после отпускания;
//  - медленное авто-вращение, пока сцену никто не трогает.
// update() сообщает, изменился ли вид: если нет, сцену можно не перерисовывать.
//
// Колесо мыши и вертикальный жест не перехватываются: они прокручивают
// страницу (на холсте стоит touch-action: pan-y, см. stage.module.css).
import * as THREE from 'three';
import type { StageView } from './views';

const LOOK_AT = new THREE.Vector3(0, 0.55, 0);
const MIN_POLAR = Math.PI * 0.18; // выше нельзя — вид строго сверху не нужен
const MAX_POLAR = Math.PI * 0.47; // ниже нельзя — камера ушла бы под землю

const FLY_RATE = 2.6; // чем больше, тем быстрее камера долетает до ракурса
const AUTO_ROTATE = 0.04; // рад/с
const INERTIA_DECAY = 4; // чем больше, тем быстрее гаснет инерция
const MIN_SPIN = 0.002; // рад/с: медленнее — инерция считается погасшей
const SHIFT_STEP = 0.0005; // доля экрана: ближе — сдвиг считается законченным

const radians = THREE.MathUtils.degToRad;
const { clamp, lerp, euclideanModulo } = THREE.MathUtils;

export interface CameraRig {
  /** Перелететь к ракурсу; `immediate` — встать в него сразу */
  flyTo(view: StageView, immediate?: boolean): void;
  /**
   * Шаг анимации. `motion: false` — без инерции и плавности; `cruising` —
   * медленное авто-вращение. Возвращает true, если вид изменился.
   */
  update(delta: number, motion: boolean, cruising: boolean): boolean;
  /** Вызывать после изменения размеров холста */
  resize(): void;
  dispose(): void;
}

export function createCameraRig(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
): CameraRig {
  // Положение камеры на сфере вокруг автомобиля и сдвиг картинки на экране
  const pose = { azimuth: 0, polar: Math.PI / 2, distance: 10 };
  const shift = new THREE.Vector2();
  const offset = new THREE.Vector3();

  let goal: StageView | null = null;
  let flying = false;
  let settling = false; // сдвиг на экране ещё доводится до цели
  let moved = true; // вид менялся вне update(): перетаскивание, новый ракурс, размер
  let dragging = false;
  let spin = 0; // угловая скорость после отпускания, рад/с
  let lastX = 0;
  let lastY = 0;
  let lastMove = 0;

  /** На узких экранах автомобиль по центру и выше, камера дальше */
  const fit = (view: StageView): StageView => {
    const wide = clamp((camera.aspect - 0.9) / 0.7, 0, 1);
    return {
      ...view,
      distance: view.distance * Math.max(1, 0.95 / camera.aspect),
      shiftX: view.shiftX * wide,
      shiftY: lerp(-0.2, view.shiftY, wide),
    };
  };

  const apply = () => {
    offset.setFromSphericalCoords(pose.distance, pose.polar, pose.azimuth);
    camera.position.copy(LOOK_AT).add(offset);
    camera.lookAt(LOOK_AT);

    // Сдвиг автомобиля на экране без изменения ракурса
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.setViewOffset(width, height, -shift.x * width, -shift.y * height, width, height);
  };

  /** Шаг к ракурсу раздела: `amount` от 0 (на месте) до 1 (сразу в ракурс) */
  const approachGoal = (amount: number) => {
    if (!goal) return;
    const view = fit(goal);

    // Сдвиг на экране доводится всегда, даже если камеру перехватил пользователь
    settling =
      Math.abs(view.shiftX - shift.x) > SHIFT_STEP || Math.abs(view.shiftY - shift.y) > SHIFT_STEP;
    shift.x = lerp(shift.x, view.shiftX, settling ? amount : 1);
    shift.y = lerp(shift.y, view.shiftY, settling ? amount : 1);
    if (!flying) return;

    // К нужному углу — по кратчайшей дуге
    const turn = euclideanModulo(radians(view.azimuth) - pose.azimuth + Math.PI, Math.PI * 2) - Math.PI;
    pose.azimuth += turn * amount;
    pose.polar = lerp(pose.polar, radians(view.polar), amount);
    pose.distance = lerp(pose.distance, view.distance, amount);

    const arrived =
      Math.abs(turn) < 0.002 &&
      Math.abs(pose.polar - radians(view.polar)) < 0.002 &&
      Math.abs(pose.distance - view.distance) < 0.01;
    if (amount >= 1 || arrived) flying = false;
  };

  // --- Перетаскивание ------------------------------------------------------

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    flying = false; // пользователь взялся за сцену — перелёт отменяется
    spin = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    lastMove = performance.now();
    canvas.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    // Полный оборот — за протяжку на высоту холста
    const scale = (Math.PI * 2) / canvas.clientHeight;
    const turn = -(event.clientX - lastX) * scale;
    pose.azimuth += turn;
    pose.polar = clamp(pose.polar - (event.clientY - lastY) * scale, MIN_POLAR, MAX_POLAR);
    moved = true;

    const now = performance.now();
    const elapsed = Math.max(now - lastMove, 1) / 1000;
    spin = lerp(spin, turn / elapsed, 0.5);
    lastX = event.clientX;
    lastY = event.clientY;
    lastMove = now;
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    // Отпустили после паузы — инерции нет
    if (performance.now() - lastMove > 80) spin = 0;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  return {
    flyTo(view, immediate = false) {
      goal = view;
      flying = true;
      moved = true;
      if (immediate) approachGoal(1);
    },
    update(delta, motion, cruising) {
      let changed = moved || flying;
      moved = false;
      approachGoal(motion ? 1 - Math.exp(-FLY_RATE * delta) : 1);

      // Инерция после перетаскивания и авто-вращение
      const turning = motion && !dragging && !flying && (cruising || Math.abs(spin) > MIN_SPIN);
      if (turning) {
        pose.azimuth += (spin + (cruising ? AUTO_ROTATE : 0)) * delta;
        spin *= Math.exp(-INERTIA_DECAY * delta);
      }

      changed ||= settling || turning;
      if (changed) apply();
      return changed;
    },
    resize() {
      moved = true;
    },
    dispose() {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    },
  };
}
