import { loadCSS, loadScript } from "../../../scripts/aem.js";

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const sectionTitle = rows[0].textContent.trim();
  const sectionDesc = rows[1].innerHTML;
  const cardRows = rows.slice(2);

  /* Hide authored rows (UE safe) */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     2️⃣ STATIC (DESKTOP) SECTION
     ================================ */
  const staticSection = document.createElement("div");
  staticSection.className = "expertise-static";

  staticSection.innerHTML = `
    <section class="sec-expertise spacer">
      <div class="container">
        <div class="row">
          <div class="col-12"> 

            <div class="row">
              <div class="col-md-7 text-center mx-auto mb-3">
                <h2 class="sec-title">${sectionTitle}</h2>
                <div class="sec-desc">${sectionDesc}</div>
              </div>
            </div>

            <div class="row cards-row justify-content-center"></div>

          </div>
        </div>
      </div>
    </section>
  `;

  block.after(staticSection);

  const staticCardsRow = staticSection.querySelector(".cards-row");

  /* ================================
     3️⃣ Build STATIC cards
     ================================ */
  cardRows.forEach((row) => {
    const cells = [...row.children];

    const img = cells[0]?.querySelector("img");
    const altText = cells[1]?.textContent?.trim() || "";
    const title = cells[2]?.textContent?.trim() || "";
    const desc = cells[3]?.innerHTML?.trim() || "";

    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mt-4";

    col.innerHTML = `
      <div class="card card-ui-one">
        ${
          img
            ? `<div class="card-img">
                 <img src="${img.src}" alt="${altText || title}">
               </div>`
            : ""
        }
        <div class="card-body">
          <h3 class="card-title">${title}</h3>
          ${
          desc
            ? `
          <div class="card-desc">${desc}</div>
          `
            : ""
        }
        </div>
      </div>
    `;

    staticCardsRow.append(col);
  });

  /* ================================
     4️⃣ MOBILE SWIPER SECTION
     ================================ */
  const swiperSection = document.createElement("div");
  swiperSection.className = "expertise-swiper-only";

  swiperSection.innerHTML = `
    <section class="sec-expertise spacer">
      <div class="container">

        <div class="text-center mb-4">
          <h2 class="sec-title">${sectionTitle}</h2>
          <div class="sec-desc">${sectionDesc}</div>
        </div>

        <div class="swiper expertise-swiper">
          <div class="swiper-wrapper"></div>
          <div class="swiper-pagination"></div>
        </div>

      </div>
    </section>
  `;

  staticSection.after(swiperSection);

  const swiperWrapper = swiperSection.querySelector(".swiper-wrapper");

  /* ================================
     5️⃣ Build SWIPER slides
     ================================ */
  cardRows.forEach((row) => {
    const cells = [...row.children];

    const img = cells[0]?.querySelector("img");
    const altText = cells[1]?.textContent?.trim() || "";
    const title = cells[2]?.textContent?.trim() || "";
    const desc = cells[3]?.textContent?.trim() || "";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="card card-ui-one">
        ${
          img
            ? `<div class="card-img">
                 <img src="${img.src}" alt="${altText || title}">
               </div>`
            : ""
        }
        <div class="card-body">
          <h3 class="card-title">${title}</h3>
          <p class="card-desc">${desc}</p>
        </div>
      </div>
    `;

    swiperWrapper.append(slide);
  });

  /* ================================
     6️⃣ Init Swiper
     ================================ */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new Swiper(swiperSection.querySelector(".expertise-swiper"), {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: {
      el: swiperSection.querySelector(".swiper-pagination"),
      clickable: true,
    },
  });
}
