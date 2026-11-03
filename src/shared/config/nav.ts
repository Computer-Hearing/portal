export interface NavItem {
  to: string;
  label: string;
  disabled?: boolean;
  title?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/tools', label: 'Инструменты' },
  {
    to: '/inference',
    label: 'Инференс',
    disabled: true,
    title: 'Раздел в разработке',
  },
  { to: '/info', label: 'Информация' },
  { to: '/models', label: 'Модели' },
];
