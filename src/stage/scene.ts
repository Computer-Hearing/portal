// 3D-сцена портала на three.js, без React: автомобиль «едет» по бесконечной
// дороге (вращаются колёса, навстречу бежит дорога). Камерой управляет
// camera.ts: её можно крутить мышью, а при смене раздела она перелетает
// к новому ракурсу.
//
// Сцена рисуется только когда на ней что-то меняется. Пока она на заднем
// плане (setIdle), автомобиль стоит, и кадры не рисуются вовсе — до тех пор,
// пока камеру не сдвинут.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { createCameraRig } from './camera';
import { createRoad } from './road';
import type { StageView } from './views';
// Модель сжата (scripts/optimize-model.mjs); Vite добавит в имя файла хеш,
// поэтому браузер может кешировать её надолго
import modelUrl from './golf7.glb?url';

// Цвета сцены совпадают с токенами портала (--bg, --accent)
const BACKGROUND = 0x0d0d0c;
const ACCENT = 0x7fc7bd;
const SIDE_LIGHT = 0xb5dfd8;
// Молочная краска: почти белые детали модели (кузов, диски) слегка тонируются
const CAR_TINT = new THREE.Color(0xf3e9d8);

const SPEED = 14; // скорость «езды», м/с (около 50 км/ч)
const WHEEL_RADIUS = 0.385; // м
// Узлы-оси колёс в модели. Внутри каждого — шина с диском (вращаются)
// и тормоз BRAKE_* (остаётся на месте).
const WHEEL_NODES = ['WHEEL_LF', 'WHEEL_RF', 'WHEEL_LR', 'WHEEL_RR'];

const MAX_PIXEL_RATIO = 1.75;
// Не чаще 60 кадров в секунду: на экранах 120 Гц лишние кадры только греют
// устройство. Допуск 10 % — на погрешность таймера браузера.
const MIN_FRAME_MS = (1000 / 60) * 0.9;

// Проверка скорости: первую секунду езды сцена «разогревается», следующие
// три — считаются кадры. Если их мало, устройство со сценой не справляется.
const PROBE_WARMUP = 1; // с
const PROBE_TIME = 3; // с
const MIN_FPS = 24;

export interface StageScene {
  /** Перелететь к ракурсу; `immediate` — встать в него сразу, без перелёта */
  setView(view: StageView, immediate?: boolean): void;
  /** Включить или выключить движение (prefers-reduced-motion) */
  setMotion(enabled: boolean): void;
  /** Сцена на заднем плане: автомобиль стоит, кадры рисуются только при движении камеры */
  setIdle(idle: boolean): void;
  dispose(): void;
}

interface StageCallbacks {
  onReady: () => void;
  /** Устройство не справляется: сцена выдаёт слишком мало кадров */
  onSlow: () => void;
  /** Модель не загрузилась */
  onUnavailable: () => void;
}

/** Тёмное пятно под автомобилем вместо настоящих теней */
function createShadow(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
  }
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 5.6),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.003;
  return shadow;
}

function addLights(scene: THREE.Scene): void {
  // Нейтральный основной свет сохраняет автомобиль светлым,
  // цветные источники только подкрашивают края
  scene.add(new THREE.HemisphereLight(0xfff6ea, 0x0c0b0a, 0.5));

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 8, 5);
  scene.add(key);

  // Контровой свет акцентного цвета позади автомобиля (он смотрит на +Z)
  const rim = new THREE.DirectionalLight(ACCENT, 2);
  rim.position.set(0, 2.5, -6);
  scene.add(rim);

  const side = new THREE.PointLight(SIDE_LIGHT, 8, 0, 2);
  side.position.set(4, 1.6, 0);
  scene.add(side);
}

/** Тонирует светлые ненасыщенные материалы (краска, диски), остальное не трогает */
function tintPaint(model: THREE.Object3D): void {
  const hsl = { h: 0, s: 0, l: 0 };
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!('color' in material) || !(material.color instanceof THREE.Color)) continue;
      material.color.getHSL(hsl);
      if (hsl.l > 0.6 && hsl.s < 0.2) material.color.multiply(CAR_TINT);
    }
  });
}

/**
 * Готовит колёса к вращению: внутри каждого узла-оси всё, кроме тормоза,
 * переносится в отдельную группу — её и крутим вокруг оси X.
 */
function collectWheels(model: THREE.Object3D): THREE.Group[] {
  const spinners: THREE.Group[] = [];
  for (const name of WHEEL_NODES) {
    const axle = model.getObjectByName(name);
    if (!axle) continue;
    const spinner = new THREE.Group();
    for (const part of [...axle.children]) {
      if (!part.name.startsWith('BRAKE')) spinner.add(part);
    }
    axle.add(spinner);
    spinners.push(spinner);
  }
  return spinners;
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose();
      material.dispose();
    }
  });
}

export function createStageScene(
  canvas: HTMLCanvasElement,
  { onReady, onSlow, onUnavailable }: StageCallbacks,
): StageScene {
  // failIfMajorPerformanceCaveat: без аппаратного ускорения браузер рисовал бы
  // сцену процессором — в этом случае она не создаётся вовсе (будет ошибка)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  // Туман цвета фона страницы: дорога вдали растворяется без видимого края
  scene.fog = new THREE.Fog(BACKGROUND, 9, 40);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  addLights(scene);

  const road = createRoad(renderer.capabilities.getMaxAnisotropy());
  scene.add(road.object);
  scene.add(createShadow());

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const rig = createCameraRig(camera, canvas);

  let wheels: THREE.Group[] = [];
  let motion = true;
  let idle = false;
  let disposed = false;
  let stale = true; // кадр устарел: изменился размер или загрузилась модель
  let probing = true;
  let probeTime = 0; // сколько секунд езды прошло с начала проверки
  let probeFrames = 0;

  // --- Размер -------------------------------------------------------------

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    rig.resize();
    stale = true;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  // --- Модель ---------------------------------------------------------------

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    modelUrl,
    (gltf) => {
      if (disposed) {
        disposeObject(gltf.scene);
        return;
      }
      tintPaint(gltf.scene);
      wheels = collectWheels(gltf.scene);

      // Ставим автомобиль колёсами на землю, центром в начало координат
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const car = new THREE.Group();
      car.add(gltf.scene);
      car.position.set(-center.x, -box.min.y, -center.z);
      scene.add(car);
      stale = true;
      onReady();
    },
    undefined,
    () => {
      if (!disposed) onUnavailable();
    },
  );

  // --- Кадр -----------------------------------------------------------------

  const timer = new THREE.Timer();
  timer.connect(document);
  let animationFrame = 0;
  let lastFrame = 0;

  /** Считает кадры, пока автомобиль едет, и сообщает, если их слишком мало */
  const probeSpeed = (delta: number) => {
    probeTime += delta;
    if (probeTime < PROBE_WARMUP) return;
    probeFrames += 1;
    if (probeTime < PROBE_WARMUP + PROBE_TIME) return;
    probing = false;
    if (probeFrames / PROBE_TIME < MIN_FPS) onSlow();
  };

  const render = (now: number) => {
    animationFrame = requestAnimationFrame(render);
    if (document.hidden || now - lastFrame < MIN_FRAME_MS) return;
    lastFrame = now;

    timer.update();
    const elapsed = timer.getDelta();
    // После возврата на вкладку не «проматываем» накопившееся время
    const delta = Math.min(elapsed, 0.1);

    const driving = motion && !idle && wheels.length > 0;
    if (driving) {
      const distance = SPEED * delta;
      road.advance(distance);
      for (const wheel of wheels) wheel.rotation.x += distance / WHEEL_RADIUS;
      if (probing) probeSpeed(elapsed);
    }

    const cameraMoved = rig.update(delta, motion, driving);
    if (!driving && !cameraMoved && !stale) return;
    stale = false;
    renderer.render(scene, camera);
  };
  animationFrame = requestAnimationFrame(render);

  return {
    setView(view, immediate = false) {
      rig.flyTo(view, immediate);
    },
    setMotion(enabled) {
      motion = enabled;
    },
    setIdle(value) {
      idle = value;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      timer.dispose();
      rig.dispose();
      road.dispose();
      disposeObject(scene);
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
