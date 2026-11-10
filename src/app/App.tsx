import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from '@/pages/home/HomePage';
import { ToolsPage } from '@/pages/tools/ToolsPage';
import { InfoPage } from '@/pages/info/InfoPage';
import { InferencePage } from '@/pages/inference/InferencePage';
import { ModelsPage } from '@/pages/models/ModelsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Header } from './Header';
import styles from './app.module.css';

// three.js и модель (~10 МБ) грузятся отдельным чанком и не задерживают
// появление самой страницы
const Stage = lazy(() => import('@/stage/Stage').then((module) => ({ default: module.Stage })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Общая разметка всех страниц: сцена с автомобилем на заднем плане, меню
// «Разделы» и содержимое страницы. Сцена и меню при переходах остаются на
// месте, меняется только содержимое: key по адресу запускает его появление.
function Layout() {
  const { pathname } = useLocation();

  return (
    <div className={styles.app}>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Stage />
      </Suspense>
      <Header />
      <main key={pathname} className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="inference" element={<InferencePage />} />
          <Route path="info" element={<InfoPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
