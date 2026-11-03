import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@/shared/config/nav';
import { LogoMark } from '@/shared/ui/icons';
import { Tab } from '@/shared/ui/Tab';
import styles from './app-header.module.css';

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => navigate('/')}
          aria-label="На главную"
        >
          <LogoMark />
          <span className={styles.logoText}>
            <span className={styles.logoTitle}>Компьютерный слух</span>
            <span className={styles.logoSub}>для беспилотных автомобилей</span>
          </span>
        </button>

        <nav aria-label="Разделы" className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Tab
              key={item.to}
              active={location.pathname === item.to}
              disabled={item.disabled}
              title={item.title}
              onClick={() => navigate(item.to)}
            >
              {item.label}
            </Tab>
          ))}
        </nav>
      </div>
    </header>
  );
}
