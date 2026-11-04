# Компьютерный слух — портал

SPA-портал для проекта акустического восприятия беспилотных автомобилей.
Тёмная тема, акцент `#FFB547`,
шрифты Golos Text / JetBrains Mono, 3D-модель Volkswagen Golf VII.

## Стек

- Vite + React 19 + TypeScript
- React Router (реальные URL для вкладок и параметров состояния)
- CSS Modules + дизайн-токены (`src/shared/styles/tokens.css`)
- three.js r187 для 3D-сцены, без React Three Fiber

## Запуск

```bash
npm install
npm run dev      # http://localhost:4173
npm run build    # tsc + vite build
npm run preview  # предпросмотр production-сборки
npm test         # vitest
```

## Маршруты

| URL | Экран |
| --- | --- |
| `/` | Главная: hero, подпроекты, 3D-модель |
| `/tools` | Инструменты (MLflow, Grafana, Portainer) |
| `/info?project=road` | Карта моделей и датасеты |
| `/models?project=siren` | Каталог моделей |
| `/models?project=siren&model=siren-emergencynet` | Раскрытая карточка модели |
| `/?open=traffic` | Модалка подпроекта |

Параметры `project`, `model` и `open` являются источником состояния:
ссылки можно шарить, кнопка «назад» работает. Вкладка «Инференс» оставлена
заглушкой в навигации, без бейджа.

## Структура

```
src/
  app/                 # роутер, shell, общие стили приложения
  pages/               # Home, Tools, Info, Models, NotFound
  widgets/             # header/footer, hero, 3D-viewer, scatter, grids, modal
  entities/            # типы, данные и селекторы project/model/dataset
  shared/              # UI-примитивы, хуки, утилиты, токены
  test/                # настройка vitest
public/
  models/golf7.glb     # 3D-модель Volkswagen Golf VII
  favicon.svg
```

Данные вынесены в `entities/*/data.ts`, расчёты — в чистые функции
(`shared/lib/scatter.ts`, `entities/model/selectors.ts`), поэтому их можно
тестировать без DOM. В `src/shared/lib/*.test.ts` покрыты форматирование,
ID моделей и парето-фронт.

## 3D-сцена

- Модель загружается лениво вместе с чанком `CarViewer`, чтобы three.js не
  попадал в начальный бандл.
- Сцена и оверлей с пунктирными линиями портированы из макета: камера,
  polar grid, тени, пульсирующие кольца, проекция якорей (колёса, крыша,
  передний сектор, bounding box).
- При `prefers-reduced-motion` авто-вращение отключается; рендер
  приостанавливается, когда вьюер вне вьюпорта или вкладка скрыта.
- Оверлей скрывается при stacked-раскладке на мобильных.

## Заглушки

Ссылки Kaggle / Google Drive, кнопки скачивания `.pt` / `.onnx` и адреса
инструментов — заглушки. Для API можно задать хост:

```bash
VITE_API_HOST=https://api.example.com npm run dev
```

Если переменная не задана, в примерах API показывается `[API_HOST]`.

## 3D-модель

`public/models/golf7.glb` весит ~10 МБ. При необходимости её можно
дополнительно сжать через `gltf-transform`.
