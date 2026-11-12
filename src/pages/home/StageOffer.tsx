import type { StageMode } from '@/stage/support';
import styles from './home.module.css';

interface StageOfferProps {
  onChoose: (mode: StageMode) => void;
}

// Предложение заменить живой фон изображением. Ответ сохраняется в cookie
// (src/stage/support.ts), после чего предложение больше не показывается.
export function StageOffer({ onChoose }: StageOfferProps) {
  return (
    <aside className={styles.offer} aria-label="Выбор фона">
      <p>
        Фон портала — живая 3D-сцена, она нагружает устройство. Можно заменить её
        изображением. Выбор сохранится в cookie, изменить его можно на главной.
      </p>
      <div className={styles.offerActions}>
        <button type="button" className={styles.offerPrimary} onClick={() => onChoose('static')}>
          Статичный фон
        </button>
        <button type="button" onClick={() => onChoose('live')}>Оставить 3D-сцену</button>
      </div>
    </aside>
  );
}
