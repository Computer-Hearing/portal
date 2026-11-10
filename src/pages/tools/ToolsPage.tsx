import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/lib/hooks';
import { SectionHeader } from '@/ui/ui';
import { ChartIcon, ContainersIcon, FlaskIcon } from '@/ui/icons';
import ui from '@/ui/ui.module.css';
import styles from './tools.module.css';

interface ToolCardProps {
  href: string;
  name: string;
  description: string;
  host: string;
  icon: ReactNode;
}

function ToolCard({ href, name, description, host, icon }: ToolCardProps) {
  return (
    <a className={styles.card} href={href} target="_blank" rel="noopener noreferrer">
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{name}</span>
      <span className={styles.description}>{description}</span>
      <span className={styles.footer}>
        <span>{host}</span>
        <span className={styles.open}>Открыть →</span>
      </span>
    </a>
  );
}

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
