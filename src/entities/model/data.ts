import type { ModelsByProject, Model } from './types';

function model(
  name: string,
  params: number,
  accuracy: number,
  mel: number,
  frames: number,
  arch: string,
): Model {
  return { name, params, accuracy, input: { mel, frames }, arch };
}

export const MODELS: ModelsByProject = {
  traffic: [
    model('TrafficCRNN-S', 182400, 0.781, 128, 128, 'CRNN'),
    model('TrafficCRNN-M', 534200, 0.832, 128, 256, 'CRNN'),
    model('AudioMobileNet-T', 312800, 0.806, 256, 128, 'MobileNetV3'),
    model('PANN-Lite', 1124000, 0.871, 256, 173, 'CNN14 (pruned)'),
    model('SEDNet-Tiny', 146500, 0.742, 128, 128, 'SED CNN'),
    model('TCN-Doppler', 688900, 0.848, 256, 173, 'TCN'),
    model('ConvMixer-A', 905300, 0.859, 128, 256, 'ConvMixer'),
    model('ResNet8-Mel', 421700, 0.817, 256, 128, 'ResNet'),
    model('AST-Distill-XS', 1462000, 0.889, 256, 173, 'Audio Spectrogram Transformer'),
    model('GRU-Flow', 247600, 0.768, 128, 128, 'CNN + GRU'),
  ],
  road: [
    model('RoadNet-S', 128900, 0.713, 128, 128, 'CNN'),
    model('RoadNet-M', 402300, 0.776, 128, 256, 'CNN'),
    model('TireSpecCNN', 615400, 0.812, 256, 173, 'CNN'),
    model('EfficientAudio-B0s', 978200, 0.847, 256, 128, 'EfficientNet-B0 (slim)'),
    model('ResNet10-Surface', 753100, 0.829, 128, 256, 'ResNet'),
    model('ConvLSTM-Road', 1218000, 0.861, 256, 173, 'ConvLSTM'),
    model('MobileViT-Audio-XXS', 1389000, 0.882, 256, 128, 'MobileViT'),
    model('DSCNN-Grip', 274500, 0.758, 128, 128, 'DS-CNN'),
    model('WetDetect-Tiny', 168700, 0.734, 128, 128, 'CNN'),
  ],
  siren: [
    model('SirenCNN-T', 104300, 0.796, 128, 128, 'CNN'),
    model('SirenCNN-S', 236900, 0.832, 128, 256, 'CNN'),
    model('EmergencyNet', 512600, 0.864, 256, 128, 'CNN + Attention'),
    model('YAMNet-Prune', 1047000, 0.887, 256, 173, 'MobileNetV1'),
    model('CRNN-Doppler', 689200, 0.853, 256, 173, 'CRNN'),
    model('HarmonicNet', 341800, 0.818, 128, 256, 'Harmonic CNN'),
    model('DCASE-Base', 1295000, 0.893, 256, 128, 'CNN10'),
    model('WailYelp-GRU', 158400, 0.771, 128, 128, 'GRU'),
  ],
  diag: [
    model('EngineSound-S', 207300, 0.724, 128, 128, 'CNN'),
    model('EngineSound-M', 588100, 0.791, 128, 256, 'CNN'),
    model('KnockNet', 344600, 0.756, 256, 128, 'CNN'),
    model('BearingCNN', 731900, 0.814, 256, 173, 'CNN'),
    model('MIMII-AE-Clf', 952400, 0.832, 128, 256, 'Autoencoder + классификатор'),
    model('WaveNet-Diag', 1187000, 0.857, 256, 173, 'WaveNet'),
    model('ResNet12-Diag', 1436000, 0.874, 256, 128, 'ResNet'),
    model('TCN-Vibro', 466200, 0.779, 128, 128, 'TCN'),
    model('ConvNeXt-Audio-P', 1312000, 0.866, 256, 173, 'ConvNeXt (pico)'),
    model('BeltSqueal-T', 126800, 0.702, 128, 128, 'CNN'),
    model('HybridSpec-Former', 1074000, 0.848, 128, 256, 'CNN + Transformer'),
  ],
};
