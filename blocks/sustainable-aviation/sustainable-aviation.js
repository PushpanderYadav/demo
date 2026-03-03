export default async function decorate(block) {
  // 🔒 Prevent double execution
  if (block.classList.contains('sa-initialized')) return;
  block.classList.add('sa-initialized');

  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read section fields
     ================================ */
  const titleEl = rows[0];
  const descEl = rows[1];

  const sectionTitle = titleEl?.textContent?.trim() || '';
  const sectionDescription = descEl?.innerHTML || '';

  const itemRows = rows.slice(2);

  /* ================================
     2️⃣ Runtime wrapper
     ================================ */
  const runtime = document.createElement('div');
  runtime.className = 'sustainable-aviation-runtime';

  block.append(runtime);

  runtime.innerHTML = `
    <div class="sa-container">
      <div class="sa-header">
        <h2>${sectionTitle}</h2>
        <div class="sa-description">${sectionDescription}</div>
      </div>
      <div class="sa-items"></div>
    </div>
  `;

  const itemsWrapper = runtime.querySelector('.sa-items');

  /* ================================
     3️⃣ Render cards (UE SAFE)
     ================================ */
  itemRows.forEach((item) => {
    const cells = [...item.children];
    if (cells.length < 3) return;

    const imgEl = cells[0].querySelector('img');
    const title = cells[1].textContent?.trim() || '';
    const desc = cells[2].textContent?.trim() || '';

    // ✅ CLONE DATA, NOT DOM
    const imgSrc = imgEl?.getAttribute('src') || '';
    const imgAlt = imgEl?.getAttribute('alt') || '';

    const card = document.createElement('article');
    card.className = 'sa-card';

    card.innerHTML = `
      <div class="sa-card-image">
        ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" />` : ''}
      </div>
      <div class="sa-card-content">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `;

    itemsWrapper.append(card);
  });

  /* ================================
     4️⃣ Hide authored rows (LAST)
     ================================ */
  rows.forEach((row) => {
    row.style.display = 'none';
  });
}
