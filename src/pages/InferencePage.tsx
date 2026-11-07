import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { InferenceEmbed } from '@/widgets/inference-embed/InferenceEmbed';
import ui from '@/shared/ui/ui.module.css';

export function InferencePage() {
  useDocumentTitle('Инференс — Компьютерный слух');

  return (
    <section className={ui.page}>
      <SectionHeader
        as="h1"
        title="Инференс"
        lead="Загрузите аудиофайл и выберите модель: запись разбивается на чанки, для каждого показывается ответ модели, распределение вероятностей и фрагмент можно прослушать или скачать."
      />
      <InferenceEmbed />
    </section>
  );
}
