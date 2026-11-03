import styles from './app-footer.module.css';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>Компьютерный слух для беспилотных автомобилей · [название команды]</span>
        <span>3D-модель: Volkswagen Golf VII</span>
      </div>
    </footer>
  );
}
