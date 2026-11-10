// 3D-сцена портала на three.js, без React: автомобиль «едет» по бесконечной
// дороге (вращаются колёса, навстречу бежит дорога). Камерой управляет
// camera.ts: её можно крутить мышью, а при смене раздела она перелетает
// к новому ракурсу.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createCameraRig } from './camera';
import { createRoad } from './road';
import type { StageView } from './views';

const MODEL_URL = `${import.meta.env.BASE_URL}models/golf7.glb`;

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

export interface StageScene {
  /** Перелететь к ракурсу; `immediate` — встать в него сразу, без перелёта */
  setView(view: StageView, immediate?: boolean): void;
  /** Включить или выключить движение (prefers-reduced-motion) */
  setMotion(enabled: boolean): void;
  dispose(): void;
}

interface StageCallbacks {
  onReady: () => void;
  onError: () => void;
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
  { onReady, onError }: StageCallbacks,
): StageScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
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
  let disposed = false;

  // --- Размер -------------------------------------------------------------

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    rig.resize();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  // --- Модель ---------------------------------------------------------------

  new GLTFLoader().load(
    MODEL_URL,
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
      onReady();
    },
    undefined,
    () => {
      if (!disposed) onError();
    },
  );

  // --- Кадр -----------------------------------------------------------------

  const timer = new THREE.Timer();
  timer.connect(document);
  let animationFrame = 0;

  const render = () => {
    animationFrame = requestAnimationFrame(render);
    if (document.hidden) return;

    timer.update();
    // После возврата на вкладку не «проматываем» накопившееся время
    const delta = Math.min(timer.getDelta(), 0.1);

    if (motion) {
      const distance = SPEED * delta;
      road.advance(distance);
      for (const wheel of wheels) wheel.rotation.x += distance / WHEEL_RADIUS;
    }

    rig.update(delta, motion);
    renderer.render(scene, camera);
  };
  render();

  return {
    setView(view, immediate = false) {
      rig.flyTo(view, immediate);
    },
    setMotion(enabled) {
      motion = enabled;
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
