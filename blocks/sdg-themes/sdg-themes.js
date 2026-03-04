export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  /* ===============================
     COLLECT AUTHORED ROWS
  =============================== */
  const rows = [...block.children];
  if (rows.length < 2) return;

  const sectionTitle = rows[0]?.textContent?.trim() || '';
  const itemRows = rows.slice(1);

  const items = itemRows
    .map((row) => {
      const cells = [...row.children];
      if (cells.length < 4) return null;

      const imgEl = cells[0].querySelector('img');

      return {
        image: imgEl ? imgEl.outerHTML : '',
        number: cells[1]?.textContent?.trim() || '',
        title: cells[2]?.textContent?.trim() || '',
        desc: cells[3]?.innerHTML || '',
      };
    })
    .filter(Boolean);

  if (!items.length) return;

  /* ===============================
     HIDE AUTHORED CONTENT (NOT DELETE)
  =============================== */
  block.classList.add('sdg-themes-initialized');

  /* ===============================
     BUILD RUNTIME MARKUP
  =============================== */
  const runtime = document.createElement('div');
  runtime.className = 'sdg-themes-runtime';

  const container = document.createElement('div');
  container.className = 'sdg-container';

  const titleEl = document.createElement('h2');
  titleEl.className = 'sdg-title';
  titleEl.textContent = sectionTitle;

  const grid = document.createElement('div');
  grid.className = 'sdg-grid';

  container.append(titleEl, grid);
  runtime.append(container);
  block.append(runtime);

  /* ===============================
     BUILD CARDS
  =============================== */
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'sdg-card';

    card.innerHTML = `
      <div class="sdg-image">
        ${item.image}
        ${item.number ? `<span class="sdg-number">${item.number}</span>` : ''}
      </div>

      <div class="sdg-content">
        <h3>${item.title}</h3>
      </div>

      <div class="sdg-overlay">
        <p>${item.desc}</p>
      </div>
    `;

    grid.appendChild(card);

    /* ===============================
       INTERACTIONS (DISABLED IN EDIT)
    =============================== */
    if (isAuthorMode) return;

    const bottomBar = card.querySelector('.sdg-content');

    bottomBar.addEventListener('click', (e) => {
      e.stopPropagation();

      grid.querySelectorAll('.sdg-card.active').forEach((c) => {
        if (c !== card) c.classList.remove('active');
      });

      card.classList.add('active');
    });

    card.addEventListener('click', (e) => {
      if (!card.classList.contains('active')) return;

      const rect = card.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (clickX > rect.width - 44 && clickY < 44) {
        card.classList.remove('active');
      }
    });
  });
}
