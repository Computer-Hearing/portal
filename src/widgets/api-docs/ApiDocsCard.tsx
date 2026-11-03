import styles from './api-docs.module.css';

export function ApiDocsCard() {
  const host = import.meta.env.VITE_API_HOST ?? '[API_HOST]';

  return (
    <div className={styles.card}>
      <div className={styles.text}>
        <span className={styles.eyebrow}>REST API</span>
        <h3 className={styles.title}>Модели можно скачивать через API</h3>
        <p className={styles.description}>
          Список моделей подпроекта, веса PyTorch и ONNX доступны по HTTP — удобно для CI и для
          обновления моделей на борту. Хост и токен — заглушки.
        </p>
      </div>

      <div className={styles.codeWrap}>
        <pre className={styles.pre}>
          <span className={styles.comment}>
            # Список моделей подпроекта (traffic | road | siren | diag)
          </span>
          {`\nGET  https://${host}/api/v1/models?project=road\n\n`}
          <span className={styles.comment}># Скачать веса или ONNX по ID модели</span>
          {`\nGET  https://${host}/api/v1/models/{model_id}/weights   `}
          <span className={styles.comment}>→ .pt</span>
          {`\nGET  https://${host}/api/v1/models/{model_id}/onnx      `}
          <span className={styles.comment}>→ .onnx</span>
          {`\n\ncurl -H "Authorization: Bearer $TOKEN" -o model.onnx \\\n  https://${host}/api/v1/models/road-tirespeccnn/onnx`}
        </pre>
      </div>
    </div>
  );
}
