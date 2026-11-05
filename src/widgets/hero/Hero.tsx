import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import mainPhoto from '../../../images/machine_hearing_main_photo.PNG';
import { getProjects } from '@/entities/project/selectors';
import type { ProjectId } from '@/entities/project/types';
import { ProjectCard } from './ProjectCard';
import styles from './hero.module.css';

const CarViewer = lazy(() =>
  import('@/widgets/car-viewer/CarViewer').then((module) => ({ default: module.CarViewer })),
);

interface HeroProps {
  openProjectId?: ProjectId | null;
  onOpenProject: (projectId: ProjectId) => void;
}

export function Hero({ openProjectId = null, onOpenProject }: HeroProps) {
  const projects = getProjects();
  const [hovered, setHovered] = useState<ProjectId | null>(null);
  const active = hovered ?? openProjectId;

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.photoBanner}>
          <img src={mainPhoto} width="1895" height="830"
            alt="Компьютерный слух — городская улица со светофорами"
            className={styles.mainPhoto} fetchPriority="high" />
          <span className={styles.photoIndex}>RESEARCH / ACOUSTIC PERCEPTION</span>
        </div>

        <div className={styles.workspace}>
          <div className={styles.description}>
            <h1 id="home-title" className={styles.title}>Слышать больше.<br /><span>Понимать раньше.</span></h1>
            <p className={styles.lead}>
              Компьютерный слух для беспилотных автомобилей — система акустического
              восприятия окружающего мира и состояния самой машины.
            </p>
            <p className={styles.descriptionText}>
              Массив микрофонов и нейросети распознают транспорт, дорожное покрытие,
              сирены и неисправности. Информация передаётся в системы восприятия
              и планирования движения — чтобы автомобиль замечал то, что скрыто от камер.
            </p>
            <Link to="/info" className={styles.exploreLink}>Модели и данные <span aria-hidden="true">↗</span></Link>
          </div>

          <div className={styles.platform}>
            <Suspense fallback={<div className={styles.viewerPlaceholder}>Загрузка акустической сцены…</div>}>
              <CarViewer hovered={active} onHover={setHovered} onOpen={onOpenProject} />
            </Suspense>
            <div className={styles.platformCaption}>
              <span className={styles.captionIndex}>01 — 04</span>
              <span>Одна платформа. Четыре направления восприятия.</span>
              <span className={styles.signal} aria-hidden="true">{[8, 16, 27, 13, 36, 22, 12, 30, 19, 9].map((height, i) => <i key={i} style={{ height }} />)}</span>
            </div>
          </div>
        </div>

        <div className={styles.directions}>
          <div className={styles.sectionHeading}>
            <h2>Направления исследования</h2>
            <span>ВЫБЕРИТЕ ПОДПРОЕКТ / 04</span>
          </div>
          <div className={styles.projects}>
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} active={active === project.id}
                onHover={setHovered} onOpen={onOpenProject} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
