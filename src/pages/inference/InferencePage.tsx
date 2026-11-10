import { useEffect, useRef, useState } from 'react';
import { useDocumentTitle } from '@/lib/hooks';
import { SectionHeader, Spinner } from '@/ui/ui';
import ui from '@/ui/ui.module.css';
import styles from './inference.module.css';

// Сервис инференса собирается отдельно (репозиторий audio-inference-service,
// папка frontend) в один файл inference.js и раздаётся своим Caddy.
// Портал загружает его во время работы, без пересборки портала:
// обновили инференс на сервере — портал сразу получил новую версию.
const INFERENCE_URL =
  import.meta.env.VITE_INFERENCE_URL ?? 'https://inference.kuronami.fun/inference.js';

// То, что экспортирует inference.js (см. frontend/src/index.tsx)
interface InferenceModule {
  mount(
    target: HTMLElement,
    options?: { apiBaseUrl?: string; header?: boolean },
  ): () => void;
}

type Status = 'loading' | 'ready' | 'error';

function InferenceEmbed() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let unmount: (() => void) | undefined;

    // @vite-ignore: адрес внешний и известен только во время работы,
    // Vite не должен пытаться найти и собрать этот модуль сам
    import(/* @vite-ignore */ INFERENCE_URL)
      .then((mod: InferenceModule) => {
        if (cancelled) return;
        unmount = mod.mount(host, { header: false });
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Failed to load inference module', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, []);

  return (
    <div className={styles.embed}>
      {status === 'loading' ? (
        <div className={styles.status} role="status">
          <Spinner />
          <span>Загружаем модуль инференса…</span>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className={styles.status} role="alert">
          Не удалось загрузить модуль инференса. Проверьте, что сервис доступен:{' '}
          <code>{INFERENCE_URL}</code>
        </div>
      ) : null}
      <div ref={hostRef} className={styles.host} />
    </div>
  );
}

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
