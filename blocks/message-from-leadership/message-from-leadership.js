export default function decorate(block) {
  const runtime = block.querySelector('.mfl-runtime');
  if (!runtime) return;

  const slidesWrapper = runtime.querySelector('.mfl-slides');
  const prevBtn = runtime.querySelector('.mfl-prev');
  const nextBtn = runtime.querySelector('.mfl-next');

  /* ==============================
     1️⃣ Collect item components
     ============================== */
  const items = [...block.children].filter((child) =>
    child.dataset?.aueModel === 'message-from-leadership-item'
  );

  if (!items.length) return;

  /* ==============================
     2️⃣ Build slides
     ============================== */
  items.forEach((item) => {
    const cells = [...item.children];
    if (cells.length < 4) return;

    const image = cells[0].querySelector('img');
    const subtitle = cells[1].textContent.trim();
    const message = cells[2].innerHTML;
    const designation = cells[3].textContent.trim();

    const slide = document.createElement('div');
    slide.className = 'mfl-slide';

    slide.innerHTML = `
      <div class="mfl-image">
        ${image ? image.outerHTML : ''}
      </div>
      <div class="mfl-content">
        <h4 class="mfl-subtitle">${subtitle}</h4>
        <div class="mfl-message">${message}</div>
        <div class="mfl-author">${designation}</div>
      </div>
    `;

    slidesWrapper.append(slide);
  });

  /* ==============================
     3️⃣ Slider logic
     ============================== */
  let index = 0;
  const slides = [...slidesWrapper.children];

  function update() {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'grid' : 'none';
    });
  }

  prevBtn?.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  nextBtn?.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });

  update();
}
