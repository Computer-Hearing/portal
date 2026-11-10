import { Link } from 'react-router-dom';
import mainPhoto from '../../../images/machine_hearing_main_photo.PNG';
import { getProjects } from '@/data/portal';
import type { Project, ProjectId } from '@/data/portal';
import { RotateIcon } from '@/ui/icons';
import { cn } from '@/ui/ui';
import styles from './home.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
  active: boolean;
  onOpen: (projectId: Project['id']) => void;
}

const glyphs: Record<Project['id'], string> = {
  traffic: 'M3 11h20m-6-6 6 6-6 6M29 23H9m6-6-6 6 6 6',
  road: 'M10 3 4 29M22 3l6 26M16 4v5m0 5v5m0 5v5',
  siren: 'M9 23v-9a7 7 0 0 1 14 0v9M6 27h20M16 1v2M3 8l3 2m23-2-3 2M4 18H1m27 0h3',
  diag: 'M2 17h6l4-11 7 22 4-11h7',
};

function ProjectCard({ project, index, active, onOpen }: ProjectCardProps) {
  return (
    <button type="button" data-project={project.id}
      className={cn(styles.project, active && styles.projectOn)}
      onClick={() => onOpen(project.id)} aria-haspopup="dialog">
      <span className={styles.cardTop}>
        <svg className={styles.projectGlyph} width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[project.id]} /></svg>
        <span className={styles.code}>{project.code} / 0{index + 1}</span>
        <span className={styles.arrow} aria-hidden="true">↗</span>
      </span>
      <span className={styles.projectName}>{project.name}</span>
      <span className={styles.projectSub}>{project.sub}</span>
    </button>
  );
}

interface HeroProps {
  openProjectId?: ProjectId | null;
  onOpenProject: (projectId: ProjectId) => void;
}

export function Hero({ openProjectId = null, onOpenProject }: HeroProps) {
  const projects = getProjects();

  return (
    <>
      {/* Первый экран. Автомобиль едет на сцене позади страницы (src/stage),
          поэтому справа место оставлено свободным: его видно и можно крутить. */}
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroPanel}>
          <span className={styles.kicker}>RESEARCH / ACOUSTIC PERCEPTION</span>
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
          <span className={styles.kicker}>ТЕСТОВАЯ ПЛАТФОРМА</span>
          <span className={styles.platformTitle}>Volkswagen Golf VII</span>
          <span className={styles.rotateHint}><RotateIcon size={12} /> Потяните, чтобы вращать</span>
          {/* Модель распространяется по лицензии CC BY 4.0, она требует указывать автора */}
          <p className={styles.modelCredit}>
            3D-модель:{' '}
            <a href="https://sketchfab.com/3d-models/volkswagen-golf-7-mk7-3c86d324d56f4027b08cbd7ba5f10bbb"
              target="_blank" rel="noopener noreferrer">Volkswagen Golf 7 mk7</a>
            {' '}— DR1KING100K,{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
              rel="noopener noreferrer">CC BY 4.0</a>
          </p>
        </div>

        <div className={styles.directions}>
          <div className={styles.sectionHeading}>
            <h2>Направления исследования</h2>
            <span className={styles.caption}>
              <span className={styles.captionIndex}>01 — 04</span>
              Одна платформа. Четыре направления восприятия.
              <span className={styles.signal} aria-hidden="true">{[8, 16, 27, 13, 36, 22, 12, 30, 19, 9].map((height, i) => <i key={i} style={{ height }} />)}</span>
            </span>
            <span>ВЫБЕРИТЕ ПОДПРОЕКТ / 04</span>
          </div>
          <div className={styles.projects}>
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index}
                active={openProjectId === project.id} onOpen={onOpenProject} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.photoSection} aria-label="Фотография проекта">
        <div className={styles.photoBanner}>
          <img src={mainPhoto} width="1895" height="830" loading="lazy"
            alt="Компьютерный слух — городская улица со светофорами"
            className={styles.mainPhoto} />
        </div>
      </section>
    </>
  );
}
