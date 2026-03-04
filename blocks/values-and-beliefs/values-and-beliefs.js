export default function decorate(block) {
  /* ================================
     AUTHOR MODE DETECTION
  ================================= */
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  /* ================================
     INIT GUARD
  ================================= */
  if (block.classList.contains('values-initialized')) return;
  block.classList.add('values-initialized');

  /* ================================
     READ AUTHORED CONTENT (DO NOT FILTER YET)
  ================================= */
  const children = [...block.children];
  if (children.length < 2) return;

  /* TITLE = FIRST ROW */
  const sectionTitle =
    children[0]?.textContent?.trim() || 'Values & Beliefs';

  /* CARD ROWS = REST */
  const cardRows = children.slice(1);

  /* ================================
     BUILD RUNTIME
  ================================= */
  const runtime = document.createElement('div');
  runtime.className = 'values-runtime spacer';

  const section = document.createElement('div');
  section.className = 'values-section container';

  const titleEl = document.createElement('h2');
  titleEl.className = 'sec-title text-center mb-5';
  titleEl.textContent = sectionTitle;

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'values-cards';

  section.append(titleEl, cardsWrapper);
  runtime.appendChild(section);
  block.appendChild(runtime);

  /* ================================
     BUILD CARDS
  ================================= */
  cardRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const picture =
      cells[0].querySelector('picture') ||
      cells[0].querySelector('img');

    const titleText = cells[1].textContent.trim();
    const descriptionHTML = cells[2].innerHTML.trim();
    const authorText = cells[3].textContent.trim();

    const card = document.createElement('div');
    card.className = 'value-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'value-card-image';

    if (picture) {
      imgWrap.appendChild(picture.cloneNode(true));
    }

    const overlay = document.createElement('div');
    overlay.className = 'value-card-overlay';
    overlay.innerHTML = `<span>${titleText}</span>`;

    const content = document.createElement('div');
    content.className = 'value-card-content';
    content.innerHTML = `
      <div class="quote">${descriptionHTML}</div>
      <p class="author"> ${authorText}</p>
    `;

    imgWrap.append(overlay, content);
    card.appendChild(imgWrap);
    cardsWrapper.appendChild(card);

    /* ================================
       INTERACTIONS (PUBLISH ONLY)
    ================================= */
    if (isAuthorMode) return;

    overlay.addEventListener('click', (e) => {
      e.stopPropagation();

      cardsWrapper
        .querySelectorAll('.value-card.active')
        .forEach((c) => c !== card && c.classList.remove('active'));

      card.classList.add('active');
    });

    card.addEventListener('click', (e) => {
      if (!card.classList.contains('active')) return;

      const rect = card.getBoundingClientRect();
      if (
        e.clientX - rect.left > rect.width - 44 &&
        e.clientY - rect.top < 44
      ) {
        card.classList.remove('active');
      }
    });
  });
}
