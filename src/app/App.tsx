import { lazy, Suspense, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from '@/pages/home/HomePage';
import { ToolsPage } from '@/pages/tools/ToolsPage';
import { InfoPage } from '@/pages/info/InfoPage';
import { InferencePage } from '@/pages/inference/InferencePage';
import { ModelsPage } from '@/pages/models/ModelsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useMediaQuery, useScrolledPast } from '@/lib/hooks';
import {
  isWeakDevice, readChoice, saveChoice, STATIC_ONLY_QUERY,
  type StageControl, type StageMode,
} from '@/stage/support';
import { isHomePath } from '@/stage/views';
import { cn } from '@/ui/ui';
import { Header } from './Header';
import styles from './app.module.css';

// three.js и модель грузятся отдельным чанком: они не задерживают появление
// страницы и вовсе не скачиваются там, где сцена не показывается
const Stage = lazy(() => import('@/stage/Stage').then((module) => ({ default: module.Stage })));

function ScrollToTop() {
  const { pathname } = useLocation();

  // До отрисовки, чтобы новая страница не мелькала в старой позиции прокрутки
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Общая разметка всех страниц: фон с автомобилем, меню «Разделы» и
// содержимое страницы. Фон и меню при переходах остаются на месте, меняется
// только содержимое: key по адресу запускает его появление.
//
// Фон бывает живым (3D-сцена) и статичным (изображение). Статичный — на
// телефонах, на слабых компьютерах и по выбору пользователя; выбор хранится
// в cookie. Страницы получают режим и переключатель через <Outlet context>.
function Layout() {
  const { pathname } = useLocation();
  const smallScreen = useMediaQuery(STATIC_ONLY_QUERY);
  const [broken, setBroken] = useState(false); // сцена не запустилась
  const canLive = !smallScreen && !broken;
  const [choice, setChoice] = useState(readChoice);
  // Без выбора пользователя слабый компьютер получает статичный фон
  const preferred = choice ?? (isWeakDevice() ? 'static' : 'live');
  const mode: StageMode = canLive ? preferred : 'static';

  // На первом экране главной автомобиль виден полностью; на остальных
  // страницах и при прокрутке главной вниз фон приглушается
  const scrolledDown = useScrolledPast(0.45);
  const dimmed = !isHomePath(pathname) || scrolledDown;

  const choose = useCallback((next: StageMode) => {
    saveChoice(next);
    setChoice(next);
  }, []);
  // Сцена тормозит: переходим на изображение, если человек сам не выбрал сцену
  const handleSlow = useCallback(() => {
    if (readChoice() === null) choose('static');
  }, [choose]);
  const handleUnavailable = useCallback(() => setBroken(true), []);
  const control = useMemo<StageControl>(
    () => ({ mode, choice, canLive, choose }),
    [mode, choice, canLive, choose],
  );

  return (
    <div className={styles.app} data-stage={mode}>
      <ScrollToTop />
      <div className={cn(styles.stage, dimmed && styles.stageDimmed)}>
        {mode === 'live' ? (
          <Suspense fallback={null}>
            <Stage idle={dimmed} onSlow={handleSlow} onUnavailable={handleUnavailable} />
          </Suspense>
        ) : (
          <div className={styles.stageImage} />
        )}
      </div>
      <Header />
      <main key={pathname} className={styles.main}>
        <Outlet context={control} />
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
