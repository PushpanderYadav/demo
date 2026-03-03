export default function decorate(block) {
  if (block.classList.contains('sdg-themes-initialized')) return;
  block.classList.add('sdg-themes-initialized');

  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ===============================
     1️⃣ Read parent title
  =============================== */
  const title = rows[0]?.textContent?.trim() || '';

  /* ===============================
     2️⃣ Item rows
  =============================== */
  const itemRows = rows.slice(1);

  /* ===============================
     3️⃣ Runtime container
  =============================== */
  const runtime = document.createElement('div');
  runtime.className = 'sdg-themes-runtime';

  runtime.innerHTML = `
    <div class="sdg-container">
      <h2 class="sdg-title">${title}</h2>
      <div class="sdg-grid"></div>
    </div>
  `;

  const grid = runtime.querySelector('.sdg-grid');

  /* ===============================
     4️⃣ Build cards (CLONE DATA ONLY)
  =============================== */
  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const imgEl = cells[0].querySelector('img');
    const imgSrc = imgEl?.getAttribute('src') || '';
    const imgAlt = imgEl?.getAttribute('alt') || '';

    const number = cells[1]?.textContent?.trim() || '';
    const title = cells[2]?.textContent?.trim() || '';
    const desc = cells[3]?.innerHTML || '';

    const card = document.createElement('article');
    card.className = 'sdg-card';

    card.innerHTML = `
      <div class="sdg-image">
        ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}">` : ''}
        ${number ? `<span class="sdg-number">${number}</span>` : ''}
      </div>
      <div class="sdg-content">
        <h3>${title}</h3>
        <div class="sdg-desc">${desc}</div>
      </div>
    `;

    grid.append(card);
  });

  block.append(runtime);
}
