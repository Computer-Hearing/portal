import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from '@/widgets/app-header/AppHeader';
import { AppFooter } from '@/widgets/app-footer/AppFooter';
import styles from './app-shell.module.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppShell() {
  return (
    <div className={styles.app}>
      <ScrollToTop />
      <AppHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
