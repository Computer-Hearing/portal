// Готовит 3D-модель для портала без потери качества: убирает невидимое,
// склеивает детали с одинаковым материалом и сжимает геометрию и текстуры.
// Форма деталей и размер текстур не меняются.
//
//   npm i --no-save @gltf-transform/core @gltf-transform/extensions \
//     @gltf-transform/functions meshoptimizer sharp
//   node scripts/optimize-model.mjs исходник.glb public/models/golf7.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, flatten, join, meshopt, prune, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const [input, output] = process.argv.slice(2);

// Детали, которых не видно ни с одного ракурса (двигатель под капотом)
const HIDDEN = ['engine_a'];
// Узлы, которые сцена двигает сама (src/stage/scene.ts): их нельзя склеивать с кузовом
const MOVING = ['WHEEL_LF', 'WHEEL_RF', 'WHEEL_LR', 'WHEEL_RR'];

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const document = await io.read(input);
const root = document.getRoot();

for (const node of root.listNodes()) {
  if (HIDDEN.includes(node.getName())) node.dispose();
}

// flatten() и join() не трогают узлы с анимацией — временно «анимируем» колёса
const buffer = root.listBuffers()[0];
const times = document.createAccessor().setType('SCALAR').setArray(new Float32Array([0])).setBuffer(buffer);
const guard = document.createAnimation('guard');
for (const node of root.listNodes()) {
  if (!MOVING.includes(node.getName())) continue;
  const values = document.createAccessor().setType('VEC3')
    .setArray(new Float32Array(node.getTranslation())).setBuffer(buffer);
  const sampler = document.createAnimationSampler().setInput(times).setOutput(values);
  guard.addSampler(sampler)
    .addChannel(document.createAnimationChannel().setTargetNode(node).setTargetPath('translation').setSampler(sampler));
}

await document.transform(dedup(), flatten(), join());

guard.listChannels().forEach((channel) => channel.dispose());
guard.listSamplers().forEach((sampler) => sampler.dispose());
guard.dispose();

await document.transform(
  prune(),
  // Текстуры — в WebP высокого качества, в исходном размере
  textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 92 }),
  // Точность координат после сжатия — доли миллиметра
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);

await io.write(output, document);
