import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/shared/config/nav';
import { cn } from '@/shared/lib/cn';
import styles from './app-header.module.css';

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      dialog.close();
      return;
    }
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  return (
    <>
      <button type="button" className={styles.menuToggle} aria-expanded={open}
        aria-haspopup="dialog" aria-controls="portal-navigation" onClick={() => setOpen(true)}>
        <span>Разделы</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M4 7h16M9 12h11M4 17h16" />
        </svg>
      </button>
      <dialog ref={dialogRef} id="portal-navigation" className={styles.header}
        aria-labelledby="navigation-title" onClose={() => setOpen(false)}
        onCancel={(event) => { event.preventDefault(); setOpen(false); }}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className={styles.panelContent}>
          <div className={styles.panelTop}>
            <span className={styles.railCaption}>ПОРТАЛ / ADS</span>
            <button type="button" className={styles.closeButton} aria-label="Закрыть меню" onClick={() => setOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <h2 id="navigation-title" className={styles.panelTitle}>Разделы проекта</h2>
          <nav aria-label="Разделы" className={styles.nav}>
            {[{ to: '/', label: 'Главная' }, ...NAV_ITEMS].map((item, index) => (
              item.disabled ? (
                <button key={item.to} type="button" disabled title={item.title} className={styles.navItem}>
                  <span className={styles.index}>0{index + 1}</span><span>{item.label}</span>
                  <span className={styles.comingSoon}>скоро</span>
                </button>
              ) : (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}
                  className={({ isActive }) => cn(styles.navItem, isActive && styles.active)}
                  onClick={() => setOpen(false)}>
                  <span className={styles.index}>0{index + 1}</span><span>{item.label}</span>
                  <span className={styles.navArrow} aria-hidden="true">↗</span>
                </NavLink>
              )
            ))}
          </nav>
          <div className={styles.railFooter}><span className={styles.statusDot} /> АКУСТИЧЕСКОЕ ВОСПРИЯТИЕ<br />Компьютерный слух для беспилотных автомобилей</div>
        </div>
      </dialog>
    </>
  );
}
