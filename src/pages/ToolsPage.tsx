import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ChartIcon, ContainersIcon, FlaskIcon } from '@/shared/ui/icons';
import { ToolCard } from '@/widgets/tools-grid/ToolCard';
import ui from '@/shared/ui/ui.module.css';
import styles from '@/widgets/tools-grid/tools.module.css';

const TOOLS = [
  {
    name: 'MLflow',
    href: 'http://localhost:5000',
    host: 'localhost:5000',
    description:
      'Эксперименты, метрики обучения, реестр моделей и версии весов по всем четырём подпроектам.',
    icon: <FlaskIcon />,
  },
  {
    name: 'Grafana',
    href: 'http://localhost:3000',
    host: 'localhost:3000',
    description:
      'Дашборды инференса: задержка, загрузка GPU/CPU, частота срабатываний классов в реальном времени.',
    icon: <ChartIcon />,
  },
  {
    name: 'Portainer',
    href: 'http://localhost:9000',
    host: 'localhost:9000',
    description:
      'Управление Docker-контейнерами сервисов инференса и API: запуск, логи, обновление образов.',
    icon: <ContainersIcon />,
  },
];

export function ToolsPage() {
  useDocumentTitle('Инструменты — Компьютерный слух');

  return (
    <section className={ui.page}>
      <SectionHeader
        as="h1"
        title="Инструменты"
        lead="Трекинг экспериментов, мониторинг и управление контейнерами инференса. Адреса ниже — заглушки, замените на адреса вашего стенда."
      />
      <div className={styles.grid}>
        {TOOLS.map((tool) => (
          <ToolCard key={tool.name} {...tool} />
        ))}
      </div>
    </section>
  );
}
