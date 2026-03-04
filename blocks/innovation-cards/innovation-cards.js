import { loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* -------------------------------
     1️⃣ Read authored content
     ------------------------------- */
  const sectionTitleRow = rows[0];
  const sectionDescRow = rows[1];
  const cardRows = rows.slice(2);

  const sectionTitle = sectionTitleRow.textContent.trim();
  const sectionDesc = sectionDescRow.innerHTML;

  /* Hide authored */
  rows.forEach((r) => (r.style.display = "none"));

  /* -------------------------------
     2️⃣ Runtime layout
     ------------------------------- */
  const runtime = document.createElement("div");
  runtime.className = "innovation-runtime";

  runtime.innerHTML = `
    <section class="sec-innovation spacer">
      <div class="container">
        <div class="mb-5 ps-5 ms-5">
          <div class="row">
            <div class="col-xl-6 col-lg-8 text-md-start text-center">
              <h2 class="sec-title text-primary">${sectionTitle}</h2>
              <div class="sec-desc">${sectionDesc}</div>
            </div>
          </div>
        </div>

        <!-- DESKTOP row -->
        <div class="innovation-row desktop-view"></div>

        <!-- MOBILE Swiper -->
        <div class="innovation-mobile-swiper-wrapper mobile-view">
          <div class="swiper innovation-swiper">
            <div class="swiper-wrapper"></div>
          </div>

          <div class="innovation-pagination-box d-flex gap-3 align-items-center justify-content-center mt-5">
            <button class="swiper-button-prev"></button>

            <div class="swiper-pagination-fraction w-auto">
              <span class="current-slide">01</span>
              <span>/</span>
              <span class="total-slide">03</span>
            </div>

            <button class="swiper-button-next"></button>
          </div>
        </div>
      </div>
    </section>
  `;

  block.after(runtime);

  const desktopRow = runtime.querySelector(".innovation-row");
  const mobileWrapper = runtime.querySelector(".swiper-wrapper");

  /* -------------------------------
     3️⃣ Build cards (shared markup)
     ------------------------------- */
  function createCard(obj) {
    const { picture, title, desc, cta, ctaLink } = obj;

    return `
      <div class="card card-overlay">
        <div class="card-img">
          <img src="${picture}" alt="${title}">
        </div>

        <div class="card-body">
          <h3 class="card-title">${title}</h3>
          <p class="card-desc">${desc}</p>
          <div class="card-cta">
            <a href="${ctaLink || "#"}" class="btn-link">${cta}</a>
          </div>
        </div>
      </div>
    `;
  }

  const cardsData = cardRows.map((row) => {
    const cells = [...row.children];

    const img = cells[0]?.querySelector("img");
    return {
      picture: img?.src || "",
      title: cells[1]?.textContent?.trim() || "",
      desc: cells[2]?.textContent?.trim() || "",
      cta: cells[3]?.textContent?.trim() || "READ MORE",
      ctaLink: cells[4]?.textContent?.trim() || "#",
    };
  });

  /* -------------------------------
     4️⃣ Desktop layout
     ------------------------------- */
  cardsData.forEach((item, index) => {
    const col = document.createElement("div");
    col.className = "innovation-col";
    if (index === 0) col.classList.add("active");

    col.innerHTML = createCard(item);

    col.addEventListener("click", () => {
      desktopRow
        .querySelectorAll(".innovation-col.active")
        .forEach((c) => c.classList.remove("active"));
      col.classList.add("active");
    });

    desktopRow.append(col);
  });

  /* -------------------------------
     5️⃣ Mobile Swiper
     ------------------------------- */
  await loadScript(SWIPER_JS);

  cardsData.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = createCard(item);
    mobileWrapper.append(slide);
  });

  const currentEl = runtime.querySelector(".current-slide");
  const totalEl = runtime.querySelector(".total-slide");

  const pad = (n) => (n < 10 ? "0" + n : n);

  const swiper = new Swiper(".innovation-swiper", {
    slidesPerView: 1.1,
    spaceBetween: 24,
    centeredSlides: false,
    speed: 500,
    navigation: {
      nextEl: runtime.querySelector(".swiper-button-next"),
      prevEl: runtime.querySelector(".swiper-button-prev"),
    },
  });

  /* Set fraction numbers */
  totalEl.textContent = pad(cardsData.length);
  swiper.on("slideChange", () => {
    currentEl.textContent = pad(swiper.realIndex + 1);
  });
  currentEl.textContent = pad(1);

  /* -------------------------------
     6️⃣ Responsive Toggle
     ------------------------------- */
  function toggleView() {
    if (window.innerWidth <= 768) {
      runtime.querySelector(".desktop-view").style.display = "none";
      runtime.querySelector(".mobile-view").style.display = "block";
    } else {
      runtime.querySelector(".desktop-view").style.display = "flex";
      runtime.querySelector(".mobile-view").style.display = "none";
    }
  }

  toggleView();
  window.addEventListener("resize", toggleView);
}
