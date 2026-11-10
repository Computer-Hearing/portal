import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/lib/hooks';
import { SectionHeader } from '@/ui/ui';
import ui from '@/ui/ui.module.css';

export function NotFoundPage() {
  useDocumentTitle('Страница не найдена — Компьютерный слух');

  return (
    <section className={ui.page}>
      <SectionHeader as="h1" title="Страница не найдена" lead="Такого раздела пока нет." />
      <p>
        <Link className={ui.link} to="/">
          Вернуться на главную
        </Link>
      </p>
    </section>
  );
}
