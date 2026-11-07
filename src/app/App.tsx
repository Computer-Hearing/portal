import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomePage } from '@/pages/HomePage';
import { ToolsPage } from '@/pages/ToolsPage';
import { InfoPage } from '@/pages/InfoPage';
import { InferencePage } from '@/pages/InferencePage';
import { ModelsPage } from '@/pages/ModelsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
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
