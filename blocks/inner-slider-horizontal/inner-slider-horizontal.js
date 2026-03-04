import { loadCSS, loadScript } from '../../../scripts/aem.js';

const SWIPER_JS =
  'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js';
const SWIPER_CSS =
  'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css';

export default async function decorate(block) {

  /* ===============================
     1️⃣ Prevent Double Execution
  =============================== */
  if (block.classList.contains('inner-slider-initialized')) return;
  block.classList.add('inner-slider-initialized');

  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add('inner-slider-horizontal');

  /* ===============================
     2️⃣ Get Section Title
  =============================== */
  let sectionTitle = '';
  let titleRow = null;

  const firstRow = rows[0];

  if (firstRow?.children?.length === 1 && !firstRow.querySelector('img')) {
    sectionTitle = firstRow.textContent.trim();
    titleRow = firstRow;
  }

  /* ===============================
     3️⃣ Collect Slide Rows
  =============================== */
  const itemRows = rows.filter((row, index) => {
    if (row === titleRow) return false; // 🔥 exclude title row
    return row.children.length >= 4;
  });

  if (!itemRows.length) return;

  /* ===============================
     4️⃣ Extract Slide Data
  =============================== */
  const slidesData = itemRows.map((row) => {
    const cols = [...row.children];

    return {
      year: cols[0]?.textContent?.trim() || '',
      title: cols[1]?.textContent?.trim() || '',
      description: cols[2]?.innerHTML || '',
      image: cols[3]?.querySelector('img')?.outerHTML || '',
    };
  });

  /* ===============================
     5️⃣ Hide Authored Rows (INCLUDING TITLE)
  =============================== */
  rows.forEach((row) => {
    row.style.display = 'none';
  });

  /* ===============================
     6️⃣ Create Wrapper
  =============================== */
  const wrapper = document.createElement('div');
  wrapper.className = 'ish-wrapper';

  /* ===============================
     7️⃣ Header
  =============================== */
  if (sectionTitle) {
    const header = document.createElement('div');
    header.className = 'ish-header';
    header.innerHTML = `<h2 class="ish-title">${sectionTitle}</h2>`;
    wrapper.appendChild(header);
  }

  /* ===============================
     8️⃣ Swiper Container
  =============================== */
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'ish-slider-container';

  sliderContainer.innerHTML = `
  <div class="swiper ish-swiper">
    <div class="swiper-wrapper"></div>

    <div class="ish-navigation">
      <div class="ish-timeline-wrapper">
        <div class="ish-timeline">
          <div class="ish-year-top"></div>
          <div class="ish-dot"></div>
          <div class="ish-year-bottom"></div>
        </div>
      </div>

      <div class="ish-arrows-wrapper">
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    </div>
  </div>
`;

  wrapper.appendChild(sliderContainer);
  block.appendChild(wrapper);

  const swiperWrapper =
    sliderContainer.querySelector('.swiper-wrapper');

  /* ===============================
     9️⃣ Build Slides
  =============================== */
  slidesData.forEach((slide) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'swiper-slide';

    slideEl.innerHTML = `
      <div class="ish-slide-card">
        <div class="ish-slide-content">
          ${slide.year ? `<div class="ish-slide-year">${slide.year}</div>` : ''}
          ${slide.title ? `<h3 class="ish-slide-title">${slide.title}</h3>` : ''}
          ${slide.description ? `<div class="ish-slide-description">${slide.description}</div>` : ''}
        </div>

        ${slide.image ? `
          <div class="ish-slide-image">
            ${slide.image}
          </div>
        ` : ''}
      </div>
    `;

    swiperWrapper.appendChild(slideEl);
  });

  /* 🚫 Skip Swiper Init in Author Mode */
  if (isAuthorMode) return;

  /* ===============================
     🔟 Load Swiper
  =============================== */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  await new Promise((resolve) => setTimeout(resolve, 50));

  /* ===============================
     1️⃣1️⃣ Initialize Swiper
  =============================== */
  const swiperEl = sliderContainer.querySelector('.ish-swiper');
  const nextBtn = sliderContainer.querySelector('.swiper-button-next');
  const prevBtn = sliderContainer.querySelector('.swiper-button-prev');

  const swiper = new window.Swiper(swiperEl, {
    direction: 'vertical',
    slidesPerView: 1,
    spaceBetween: 40,
    loop: true,
    speed: 800,

    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
  });

  /* ===============================
     1️⃣2️⃣ Timeline Year Logic
  =============================== */
  const yearTop = sliderContainer.querySelector('.ish-year-top');
  const yearBottom = sliderContainer.querySelector('.ish-year-bottom');

  function updateTimelineYears() {
    const total = slidesData.length;
    const activeIndex = swiper.realIndex;

    const prevIndex = (activeIndex - 1 + total) % total;
    const nextIndex = (activeIndex + 1) % total;

    yearTop.textContent = slidesData[prevIndex].year;
    yearBottom.textContent = slidesData[nextIndex].year;
  }

  updateTimelineYears();

  swiper.on('slideChange', () => {
    updateTimelineYears();
  });
}
