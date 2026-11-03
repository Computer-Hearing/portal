import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface ScreenPoint {
  x: number;
  y: number;
  d: number;
}

export interface OverlayFrame {
  ready: boolean;
  front: ScreenPoint;
  wheels: ScreenPoint[];
  roof: ScreenPoint;
  bbox: { x: number; y: number; width: number; height: number } | null;
  centerDistance: number;
}

interface UseCarSceneOptions {
  hostRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  autoRotate?: boolean;
  rotateSpeed?: number;
  reducedMotion?: boolean;
}

interface CarSceneResult {
  frameRef: RefObject<OverlayFrame>;
  loading: boolean;
  error: string | null;
}

const EMPTY_POINT: ScreenPoint = { x: 0, y: 0, d: 0 };

export function useCarScene({
  hostRef,
  canvasRef,
  autoRotate = true,
  rotateSpeed = 0.9,
  reducedMotion = false,
}: UseCarSceneOptions): CarSceneResult {
  const frameRef = useRef<OverlayFrame>({
    ready: false,
    front: EMPTY_POINT,
    wheels: [],
    roof: EMPTY_POINT,
    bbox: null,
    centerDistance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoRotateRef = useRef(autoRotate);
  const rotateSpeedRef = useRef(rotateSpeed);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    rotateSpeedRef.current = rotateSpeed;
  }, [rotateSpeed]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let cancelled = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let isVisible = true;
    let renderer: THREE.WebGLRenderer;

    const frame = frameRef.current;

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setError('Не удалось загрузить 3D-движок');
      setLoading(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x15181c, 0.5));
    const directional = new THREE.DirectionalLight(0xffffff, 1.1);
    directional.position.set(4, 8, 5);
    scene.add(directional);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(6.4, 2.7, 6.0);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.55, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.update();

    const grid = new THREE.PolarGridHelper(5.5, 16, 6, 96, 0x232a32, 0x1a2027);
    grid.position.y = 0.001;
    scene.add(grid);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowContext = shadowCanvas.getContext('2d');
    if (shadowContext) {
      const gradient = shadowContext.createRadialGradient(128, 128, 10, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 5.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.003;
    scene.add(shadow);

    const rings: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.985, 1, 128),
        new THREE.MeshBasicMaterial({
          color: 0xffb547,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.005;
      scene.add(ring);
      rings.push(ring);
    }

    let group: THREE.Group | null = null;
    let modelBox: THREE.Box3 | null = null;
    let anchors: {
      wheels: THREE.Vector3[];
      front: THREE.Vector3;
      roof: THREE.Vector3;
    } | null = null;

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    if (typeof IntersectionObserver !== 'undefined') {
      visibilityObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      });
      visibilityObserver.observe(host);
    }

    const loader = new GLTFLoader();
    const modelUrl = `${import.meta.env.BASE_URL}models/golf7.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        if (cancelled) return;

        modelBox = new THREE.Box3().setFromObject(gltf.scene);
        const center = modelBox.getCenter(new THREE.Vector3());
        group = new THREE.Group();
        group.add(gltf.scene);
        group.position.set(-center.x, -modelBox.min.y, -center.z);
        scene.add(group);

        const vector = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
        anchors = {
          wheels: [
            vector(0.77, 0.4, 1.505),
            vector(-0.77, 0.4, 1.505),
            vector(0.75, 0.42, -1.13),
            vector(-0.75, 0.42, -1.13),
          ],
          front: vector(0, 0.62, modelBox.max.z - 0.05),
          roof: vector(0, modelBox.max.y - 0.02, center.z - 0.25),
        };

        setLoading(false);
        setError(null);
      },
      undefined,
      () => {
        if (cancelled) return;
        setLoading(false);
        setError('Не удалось загрузить 3D-модель');
      },
    );

    const projectToScreen = (
      point: THREE.Vector3,
      rect: DOMRect,
    ): ScreenPoint => {
      if (!group) return { x: 0, y: 0, d: 0 };
      const world = point.clone().applyMatrix4(group.matrixWorld);
      const distance = world.distanceTo(camera.position);
      const projected = world.project(camera);
      return {
        x: rect.left + ((projected.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - projected.y) / 2) * rect.height,
        d: distance,
      };
    };

    const updateOverlayFrame = () => {
      if (!group || !anchors || !modelBox) {
        frame.ready = false;
        return;
      }

      const rect = host.getBoundingClientRect();
      group.updateMatrixWorld();

      frame.front = projectToScreen(anchors.front, rect);
      frame.wheels = anchors.wheels
        .map((point) => projectToScreen(point, rect))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .sort((a, b) => a.x - b.x);
      frame.roof = projectToScreen(anchors.roof, rect);

      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;

      const xs = [modelBox.min.x, modelBox.max.x];
      const ys = [modelBox.min.y, modelBox.max.y];
      const zs = [modelBox.min.z, modelBox.max.z];

      for (const x of xs) {
        for (const y of ys) {
          for (const z of zs) {
            const point = projectToScreen(new THREE.Vector3(x, y, z), rect);
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
          }
        }
      }

      frame.bbox = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
      frame.centerDistance = new THREE.Vector3(0, 0.55, 0).distanceTo(camera.position);
      frame.ready = true;
    };

    const timer = new THREE.Timer();
    timer.connect(document);

    const render = () => {
      animationFrame = requestAnimationFrame(render);

      if (document.hidden || !isVisible) return;

      controls.autoRotate = autoRotateRef.current && !reducedMotionRef.current;
      controls.autoRotateSpeed = rotateSpeedRef.current;
      controls.update();

      timer.update();

      if (!reducedMotionRef.current) {
        const time = timer.getElapsed();
        for (let i = 0; i < rings.length; i += 1) {
          const phase = (time * 0.22 + i / rings.length) % 1;
          const scale = 2.6 + phase * 2.8;
          rings[i].scale.set(scale, scale, scale);
          rings[i].material.opacity = (1 - phase) * 0.45;
        }
      }

      renderer.render(scene, camera);
      updateOverlayFrame();
    };

    render();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      timer.dispose();
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material.dispose();
        }
      });
      shadowTexture.dispose();
      renderer.dispose();
      frame.ready = false;
    };
  }, [canvasRef, hostRef]);

  return { frameRef, loading, error };
}
