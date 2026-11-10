import { Link } from 'react-router-dom';
import localizationPhoto from '../../../images/localization.png';
import datasetPhoto from '../../../images/microphone1.png';
import installationPhoto from '../../../images/ustanovka.png';
import styles from './home.module.css';

export function Teams() {
  return (
    <section className={styles.teams} aria-labelledby="teams-title">
      <div className={styles.intro}>
        <h2 id="teams-title">Четыре команды.<br /><span>Одна система.</span></h2>
        <p>
          Транспорт, сирены, диагностика и дорожное покрытие — поднаправления
          компьютерного слуха. Над общей системой работают четыре команды:
          от сбора звука и обучения моделей до локализации источников
          и размещения микрофонов на автомобиле.
        </p>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.team} ${styles.ml}`} aria-labelledby="team-ml-title">
          <div className={styles.teamBody}>
            <h3 id="team-ml-title">ML</h3>
            <p className={styles.summary}>Учим автомобиль понимать, что он слышит.</p>
            <p>
              Команда обучает нейронные сети для распознавания транспорта, сирен,
              состояния автомобиля и дорожного покрытия. Разрабатывает программное
              обеспечение для тестирования моделей и проверки их работы на аудиозаписях.
            </p>
          </div>
          <div className={styles.mlAside}>
            <ul className={styles.responsibilities}>
              <li>Обучение и сравнение нейронных сетей</li>
              <li>Оценка качества распознавания</li>
              <li>Разработка ПО для тестирования</li>
            </ul>
            <Link to="/models">Перейти к моделям <span aria-hidden="true">↗</span></Link>
          </div>
        </article>

        <article className={`${styles.team} ${styles.localization}`} aria-labelledby="team-localization-title">
          <div className={styles.teamBody}>
            <h3 id="team-localization-title">Алгоритмы локализации</h3>
            <p className={styles.summary}>Определяем, откуда приходит звук.</p>
            <p>
              Команда разрабатывает алгоритмы определения направления и расстояния
              до объекта по звуку. Сигналы микрофонного массива помогают перейти
              от распознавания события к оценке положения его источника относительно автомобиля.
            </p>
          </div>
          <figure className={`${styles.photo} ${styles.chart}`}>
            <img src={localizationPhoto} width="1280" height="548" loading="lazy" decoding="async"
              alt="Графики SRP-PHAT и MUSIC для оценки направления на источник звука и схема микрофонного массива" />
          </figure>
        </article>

        <article className={`${styles.team} ${styles.dataset}`} aria-labelledby="team-dataset-title">
          <div className={styles.teamBody}>
            <h3 id="team-dataset-title">Датасет</h3>
            <p className={styles.summary}>Собираем звуки реального мира.</p>
            <p>
              Команда работает с аудиоданными: собирает записи, размечает звуковые
              события и подготавливает датасеты для обучения и тестирования.
              Задача — представить разные дорожные ситуации, источники звука
              и условия записи, с которыми встретится система.
            </p>
          </div>
          <figure className={styles.photo}>
            <img src={datasetPhoto} width="1722" height="968" loading="lazy" decoding="async"
              alt="Микрофон с ветрозащитой на штативе для записи звуков городской улицы" />
          </figure>
        </article>

        <article className={`${styles.team} ${styles.installation}`} aria-labelledby="team-installation-title">
          <div className={styles.teamBody}>
            <h3 id="team-installation-title">Установка</h3>
            <p className={styles.summary}>Превращаем алгоритмы в автомобильную систему.</p>
            <p>
              Команда продумывает физическую конфигурацию платформы: где разместить
              микрофоны на автомобиле, как их закрепить и подключить. Проектирует
              установку оборудования, чтобы программная часть могла работать
              со звуком, записанным непосредственно на машине.
            </p>
          </div>
          <figure className={styles.photo}>
            <img src={installationPhoto} width="1280" height="720" loading="lazy" decoding="async"
              alt="Визуализация крепления кольцевого микрофонного массива на крыше автомобиля" />
          </figure>
        </article>
      </div>
    </section>
  );
}
