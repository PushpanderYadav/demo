import { loadCSS, loadScript } from '../../../scripts/aem.js';

const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js';
const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css';

export default async function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const rows = [...block.children];
  if (!rows.length) return;

  /* ================================
     1️⃣ GET SECTION TITLE (BLOCK FIELD)
  ================================ */
  let sectionTitle = '';

  const firstRow = rows[0];
  if (firstRow?.children?.length === 1 && !firstRow.querySelector('img')) {
    sectionTitle = firstRow.textContent.trim();
  }

  /* ================================
     2️⃣ COLLECT AUTHORED ITEMS
  ================================ */
  const items = rows.filter((row, index) => {
    if (index === 0 && sectionTitle) return false; // skip title row

    return (
      row.tagName === 'DIV' &&
      row.children.length >= 4 &&
      row.querySelector('img, picture')
    );
  });

  if (!items.length) return;

  /* ================================
     3️⃣ READ ITEM DATA
  ================================ */
  const slidesData = items.map((item) => {
    const cells = [...item.children];

    return {
      image: cells[0].innerHTML.trim(),
      subtitle: cells[1].textContent.trim(),
      message: cells[2].innerHTML.trim(),
      designation: cells[3].textContent.trim(),
    };
  });

  /* ================================
     4️⃣ BUILD RUNTIME UI
  ================================ */
  block.classList.add('mfl-initialized');

  const container = document.createElement('div');
  container.className = 'mfl-runtime';

  container.innerHTML = `
    ${
      sectionTitle
        ? `<div class="mfl-section-header mb-5">
            <h2 class="sec-title">${sectionTitle}</h2>
           </div>`
        : ''
    }

    <div class="swiper mfl-swiper">
      <div class="swiper-wrapper"></div>

      <div class="mfl-navigation">
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    </div>
  `;

  block.append(container);

  const swiperWrapper = container.querySelector('.swiper-wrapper');

  slidesData.forEach((data) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
      <div class="mfl-card">
        <div class="mfl-image">${data.image}</div>

        <div class="mfl-content">
          <h3 class="mfl-title">${data.subtitle}</h3>
          <div class="mfl-message">${data.message}</div>
          <div class="mfl-author">${data.designation}</div>
        </div>
      </div>
    `;

    swiperWrapper.appendChild(slide);
  });

  /* ================================
     5️⃣ AUTHOR MODE SAFE
  ================================ */
  if (isAuthorMode) return;

  /* ================================
     6️⃣ LOAD SWIPER
  ================================ */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new Swiper(container.querySelector('.mfl-swiper'), {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
      nextEl: container.querySelector('.swiper-button-next'),
      prevEl: container.querySelector('.swiper-button-prev'),
    },
  });
}
