import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

export default async function decorate(block) {
  /* ================================
     1️⃣ Read authored content
  ================================ */
  const rows = [...block.children];
  if (rows.length < 2) return;

  const sectionTitle = rows[0]?.textContent?.trim() || "Guest Book";
  const itemRows = rows.slice(1);

  /* ================================
     2️⃣ Universal Editor Safe
  ================================ */
  const isUE = document.querySelector(
    "aem-extension, [data-aue-resource], [data-aue-prop]"
  );

  if (isUE) {
    block.dataset.aueType = "container";
    block.dataset.aueLabel = "Guest Book";

    rows[0].dataset.aueProp = "sectionTitle";

    itemRows.forEach((row, i) => {
      row.dataset.aueType = "item";
      row.dataset.aueLabel = `Guest Book Item ${i + 1}`;
    });
  }

  /* Hide authored rows */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     3️⃣ Create Swiper Layout
  ================================ */
  const section = document.createElement("section");
  section.className = "guestbook-sec spacer";

  section.innerHTML = `
    <div class="container">

      <h2 class="guestbook-title">${sectionTitle}</h2>

      <div class="swiper guestbook-swiper">
        <div class="swiper-wrapper"></div>

        <div class="guestbook-nav">
          <button class="swiper-button-prev"></button>
          <button class="swiper-button-next"></button>
        </div>
      </div>

    </div>
  `;

  block.after(section);

  const wrapper = section.querySelector(".swiper-wrapper");

  /* ================================
     4️⃣ Build Slides (from JSON fields)
     date | description | title | subtitle
  ================================ */
  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const date = cells[0]?.textContent?.trim() || "";
    const description = cells[1]?.textContent?.trim() || "";
    const title = cells[2]?.textContent?.trim() || "";
    const subtitle = cells[3]?.textContent?.trim() || "";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="gBook-card">

        <div class="gBook-date">
          <span class="icon">
<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.66675 9.99967C1.66675 6.85698 1.66675 5.28563 2.64306 4.30932C3.61937 3.33301 5.19072 3.33301 8.33341 3.33301H11.6667C14.8094 3.33301 16.3808 3.33301 17.3571 4.30932C18.3334 5.28563 18.3334 6.85698 18.3334 9.99967V11.6663C18.3334 14.809 18.3334 16.3804 17.3571 17.3567C16.3808 18.333 14.8094 18.333 11.6667 18.333H8.33341C5.19072 18.333 3.61937 18.333 2.64306 17.3567C1.66675 16.3804 1.66675 14.809 1.66675 11.6663V9.99967Z" stroke="#333333" stroke-width="1.5"/>
<path d="M5.83325 3.33301V2.08301" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M14.1667 3.33301V2.08301" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2.08325 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</span>
          <span>${date}</span>
        </div>

        <div class="gBook-desc">
          ${description}
        </div>

        <h3 class="gBook-name">
          ${title}
          ${
            subtitle
              ? `<span class="gBook-role">${subtitle}</span>`
              : ""
          }
        </h3>

      </div>
    `;

    wrapper.append(slide);
  });

  /* ================================
     5️⃣ Load Swiper
  ================================ */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new window.Swiper(section.querySelector(".guestbook-swiper"), {
    slidesPerView: 1,
    spaceBetween: 24,
    navigation: {
      nextEl: section.querySelector(".swiper-button-next"),
      prevEl: section.querySelector(".swiper-button-prev"),
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}