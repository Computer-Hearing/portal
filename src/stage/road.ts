// Дорога под автомобилем: сетка на земле и две линии разметки. Автомобиль
// стоит на месте, а дорога бежит ему навстречу — так создаётся ощущение
// бесконечной езды. Вдали всё растворяется в тумане сцены.
import * as THREE from 'three';

const SIZE = 120; // сторона площадки, м
const CELL = 2; // шаг сетки, м
const DASH_PERIOD = 6; // штрих разметки + промежуток, м
const LANE_X = 1.9; // расстояние от оси автомобиля до линии разметки, м
const LINE_COLOR = 'rgba(237, 235, 230, 0.13)';
const DASH_COLOR = 'rgba(237, 235, 230, 0.5)';

export interface Road {
  object: THREE.Group;
  /** Сдвинуть дорогу на `distance` метров назад (автомобиль едет вперёд, к +Z) */
  advance(distance: number): void;
  dispose(): void;
}

function canvasTexture(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D) => void,
  anisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) draw(context);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function plane(width: number, texture: THREE.Texture): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, SIZE),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  // Плоскость лежит на земле; координата v текстуры растёт к −Z (назад)
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function createRoad(anisotropy: number): Road {
  const grid = canvasTexture(128, 128, (context) => {
    context.fillStyle = LINE_COLOR;
    context.fillRect(0, 0, 128, 2);
    context.fillRect(0, 0, 2, 128);
  }, anisotropy);
  grid.repeat.set(SIZE / CELL, SIZE / CELL);

  const dashes = canvasTexture(8, 128, (context) => {
    context.fillStyle = DASH_COLOR;
    context.fillRect(0, 0, 8, 56);
  }, anisotropy);
  dashes.repeat.set(1, SIZE / DASH_PERIOD);

  const object = new THREE.Group();
  const ground = plane(SIZE, grid);
  ground.position.y = 0.001;
  object.add(ground);

  for (const x of [-LANE_X, LANE_X]) {
    const lane = plane(0.12, dashes);
    lane.position.set(x, 0.002, 0);
    object.add(lane);
  }

  const wrap = (value: number) => value - Math.floor(value);

  return {
    object,
    advance(distance) {
      // Уменьшение смещения текстуры двигает рисунок к −Z, то есть назад
      grid.offset.y = wrap(grid.offset.y - distance / CELL);
      dashes.offset.y = wrap(dashes.offset.y - distance / DASH_PERIOD);
    },
    dispose() {
      grid.dispose();
      dashes.dispose();
    },
  };
}
