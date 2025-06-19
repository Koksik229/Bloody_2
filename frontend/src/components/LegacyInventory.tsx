import React, { useEffect, useState } from 'react';

/**
 * Renders the original legacy HTML/CSS inventory exactly as it was in the old project.
 * The raw HTML is stored as a static file served from `/legacy/inventory.html` together
 * with its original stylesheets and images in `/legacy/**`.
 *
 * 1. Copy `inventory.txt` (or экспортированный HTML из HAR) to
 *    `frontend/public/legacy/inventory.html`.
 *    – Удалите лишний `<script>` и `<body>`/`<html>` теги при желании, или оставьте как есть.
 * 2. Поместите все CSS-файлы (`bootstrap.css`, `my2.css`, `mframe-style.css`,
 *    `common-fighte-style.css` …) в `frontend/public/legacy/css/`.
 * 3. Положите изображения/гифы из HAR в `frontend/public/legacy/img/`.
 * 4. Внутри `inventory.html` замените старые абсолютные URL вида
 *      //dm-game.com//layout//people/img/...
 *    на  
 *      /legacy/img/...
 *    и пути к CSS на `/legacy/css/...`.
 * 5. Подключите компонент вместо текущего React-инвентаря.
 *
 * Компонент делает простой fetch HTML → вставляет в DOM через dangerouslySetInnerHTML,
 * обеспечивая 100-процентный пиксель-перфект без переписывания верстки.
 */

const LegacyInventory: React.FC = () => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('/legacy/inventory.html')
      .then((res) => res.text())
      .then((txt) => setHtml(txt))
      .catch((err) => console.error('Cannot load legacy inventory:', err));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default LegacyInventory;
