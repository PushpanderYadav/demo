export default function decorate(block) {
  requestAnimationFrame(() => {
    const children = [...block.children];
    if (children.length < 3) return;

    /* ================================
       1️⃣ Read authored fields (ROW SAFE)
    ================================= */
    const sectionTitleRow = children[0];
    const ctaTextRow = children[1];
    const ctaLinkRow = children[2];

    const title = sectionTitleRow?.textContent?.trim() || '';
    const ctaText = ctaTextRow?.textContent?.trim() || '';
    const ctaLink = ctaLinkRow?.textContent?.trim() || '#';

    [sectionTitleRow, ctaTextRow, ctaLinkRow].forEach((row) => {
      if (row) row.style.display = 'none';
    });
    /* ================================
       2️⃣ Award Items (AFTER meta rows)
       → everything after index 2
    ================================= */
    const items = children.slice(3);
    if (!items.length) return;

    /* ================================
       3️⃣ Runtime wrapper (DO NOT clear)
    ================================= */
    const runtime = document.createElement('div');
    runtime.className = 'gal-awards-runtime';

    block.append(runtime);

    /* ================================
       4️⃣ Build static structure
    ================================= */
    runtime.innerHTML = `
      <h2 class="gal-awards-title">${title}</h2>

      <div class="gal-awards-viewport">
        <div class="gal-awards-track"></div>
      </div>

      <div class="gal-awards-dots"></div>

      ${
        ctaText
          ? `<a class="gal-awards-cta" href="${ctaLink}" data-aue-link="true">
               ${ctaText}
             </a>`
          : ''
      }
    `;

    const track = runtime.querySelector('.gal-awards-track');
    const dotsWrap = runtime.querySelector('.gal-awards-dots');

    /* ================================
       5️⃣ Build cards (MOVE content)
    ================================= */
    items.forEach((row) => {
      const card = document.createElement('div');
      card.className = 'gal-award-card';

      card.appendChild(row);

      track.appendChild(card);
    });

    /* ================================
       6️⃣ Pagination logic (3 at a time)
    ================================= */
    const totalSlides = Math.ceil(items.length / 3);
    let currentIndex = 0;

    function moveTo(index) {
      currentIndex = index;
      track.style.transform = `translateX(-${index * 100}%)`;

      dotsWrap.querySelectorAll('span').forEach((dot, i) =>
        dot.classList.toggle('active', i === index)
      );
    }

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => moveTo(i));
      dotsWrap.appendChild(dot);
    }

    /* ================================
       7️⃣ Hide authoring rows (LAST)
    ================================= */
    // children.forEach((row) => {
    //   row.style.display = 'none';
    // });
    requestAnimationFrame(() => {
      [...block.children].forEach((child) => {
        if (!child.classList.contains('gal-awards-runtime')) {
          child.style.display = 'none';
        }
      });
    });
  });
}
