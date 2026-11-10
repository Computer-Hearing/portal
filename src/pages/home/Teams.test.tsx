import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Teams } from './Teams';

function renderTeams() {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(<MemoryRouter><Teams /></MemoryRouter>);
  return container;
}

describe('Teams', () => {
  it('presents four teams separately from recognition subprojects', () => {
    const container = renderTeams();
    expect([...container.querySelectorAll('h3')].map((heading) => heading.textContent)).toEqual([
      'ML', 'Алгоритмы локализации', 'Датасет', 'Установка',
    ]);
    expect(container.textContent).toContain('поднаправления');
  });

  it('keeps ML without a photo and links to the model catalog', () => {
    const ml = renderTeams().querySelector('article');
    expect(ml?.querySelector('img')).toBeNull();
    expect(ml?.querySelector('[aria-label="Цикл работы ML-команды"]')).toBeNull();
    expect(ml?.textContent).not.toContain('Аудиоданные');
    expect(ml?.querySelector('a')?.getAttribute('href')).toBe('/models');
    expect(ml?.textContent).toContain('программное обеспечение для тестирования');
  });

  it('uses the three PNG images with lazy loading and descriptive alt text', () => {
    const photos = [...renderTeams().querySelectorAll('img')];
    expect(photos).toHaveLength(3);
    photos.forEach((photo) => {
      expect(photo.getAttribute('src')).toMatch(/\.png$/);
      expect(photo.getAttribute('loading')).toBe('lazy');
      expect(photo.getAttribute('alt')?.length).toBeGreaterThan(20);
      expect(Number(photo.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(photo.getAttribute('height'))).toBeGreaterThan(0);
    });
  });
});
