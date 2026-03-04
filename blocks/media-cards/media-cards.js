import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

export default async function decorate(block) {
  console.log("Decorating Media Cards (tabs + grid + mobile swiper)");

  const rows = [...block.children];
  if (!rows.length) return;

  /* ================================
     DETECT SECTION TYPE
  ================================ */
  const section = block.closest(".section");

  let colClass = "col-md-6";

  if (section?.classList.contains("sec-grid-3")) {
    colClass = "col-lg-4 col-md-6";
  }

  if (section?.classList.contains("sec-grid-4")) {
    colClass = "col-xl-3 col-lg-4 col-md-6";
  }

  const isSwiperSlider = section?.classList.contains("sec-swiper-slider");

  /* ================================
     LOAD SWIPER ONLY IF NEEDED
  ================================ */
  if (isSwiperSlider) {
    await loadCSS(SWIPER_CSS);
    await loadScript(SWIPER_JS);
  }

  /* ================================
     HEADER
  ================================ */
  const title = rows[0]?.textContent?.trim() || "";
  const description = rows[1]?.textContent?.trim() || "";

  /* ================================
     CARD ROWS
  ================================ */
  const itemRows = rows.slice(2).filter((row) => row.textContent?.trim());
  if (!itemRows.length) return;

  /* ================================
     HELPERS
  ================================ */
  const getText = (cell) =>
    cell?.innerText?.trim() || cell?.textContent?.trim() || "";

  const formatLabel = (val) =>
    val
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  /* ---------- AEM SAFE IMAGE PARSER ---------- */
  const getImageData = (cell) => {
    if (!cell) return { src: "", alt: "" };

    // supports picture > img OR direct img
    const img = cell.querySelector("picture img, img");
    if (!img) return { src: "", alt: "" };

    return {
      src: img.getAttribute("src") || "",
      alt:
        img.getAttribute("alt") ||
        img.getAttribute("title") ||
        "",
    };
  };

  /* ================================
     BUILD TABS DATA
  ================================ */
  const tabsMap = {};
  const tabsMeta = {};

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const tabValue = getText(cells[0]) || "none";

    if (!tabsMap[tabValue]) {
      tabsMap[tabValue] = [];
      tabsMeta[tabValue] = formatLabel(tabValue);
    }

    const imageData = getImageData(cells[1]);

    tabsMap[tabValue].push({
      image: imageData.src,
      imageAlt: imageData.alt,
      title: getText(cells[2]) || getText(cells[3]),
      description: getText(cells[4]),
      ctaLabel1: getText(cells[5]),
      link1: cells[6]?.querySelector("a")?.href || "",
      ctaLabel2: getText(cells[7]),
      link2: cells[8]?.querySelector("a")?.href || "",
    });
  });

  const tabValues = Object.keys(tabsMap);
  if (!tabValues.length) return;

  const hasOnlyNoneTab = tabValues.length === 1 && tabValues[0] === "none";

  /* ================================
     HIDE AUTHORED HTML
  ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     RUNTIME MARKUP
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "overview-runtime";

  runtime.innerHTML = `
    <div class="container">

      <div class="overview-header">
        <div class="overview-header-content">
          ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
          ${description ? `<p class="sec-desc">${description}</p>` : ""}
        </div>

        ${
          !hasOnlyNoneTab
            ? `
        <div class="overview-tabs">
          ${tabValues
            .map(
              (value, i) => `
            <button class="overview-tab-btn ${
              i === 0 ? "active" : ""
            }" data-filter="${value}">
              ${tabsMeta[value]}
            </button>
          `
            )
            .join("")}
        </div>`
            : ""
        }
      </div>

      ${
        isSwiperSlider
          ? `
        <div class="swiper overview-swiper d-md-none">
          <div class="swiper-wrapper"></div>
          <div class="swiper-pagination"></div>
        </div>
      `
          : ""
      }

      <div class="overview-cards row ${
        isSwiperSlider ? "d-none d-md-flex" : ""
      }"></div>

    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".overview-cards");
  const tabButtons = runtime.querySelectorAll(".overview-tab-btn");
  const swiperWrapper = runtime.querySelector(".swiper-wrapper");
  const pagination = runtime.querySelector(".swiper-pagination");

  let swiperInstance = null;

  /* ================================
     RENDER CARDS
  ================================ */
  function renderCards(type) {
    cardList.innerHTML = "";
    if (swiperWrapper) swiperWrapper.innerHTML = "";

    if (!tabsMap[type]) return;

    tabsMap[type].forEach((card) => {
      const altText = card.imageAlt || card.title || "image";

      const cardHTML = `
        <div class="card card-ui h-100 p-3">

          ${
            card.image
              ? `<div class="card-img">
                  <img src="${card.image}" alt="${altText}" loading="lazy">
                </div>`
              : ""
          }

          <div class="card-body">
            ${card.title ? `<h5 class="card-title">${card.title}</h5>` : ""}
            ${
              card.description
                ? `<p class="card-text">${card.description}</p>`
                : ""
            }

            <div class="card-cta">
              ${
                card.link1
                  ? `<div><a href="${card.link1}" target="_blank" class="btn-link download">${card.ctaLabel1 || "DOWNLOAD"}</a></div>`
                  : ""
              }
              ${
                card.link2
                  ? `<div><a href="${card.link2}" target="_blank" class="btn-link download">${card.ctaLabel2 || "DOWNLOAD"}</a></div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;

      /* ---------- Desktop Grid ---------- */
      const gridCol = document.createElement("div");
      gridCol.className = `overview-card ${colClass} mt-4`;
      gridCol.innerHTML = cardHTML;
      cardList.appendChild(gridCol);

      /* ---------- Mobile Swiper ---------- */
      if (isSwiperSlider && swiperWrapper) {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.innerHTML = cardHTML;
        swiperWrapper.appendChild(slide);
      }
    });

    initSwiper();
  }

  /* ================================
     INIT SWIPER (MOBILE ONLY)
  ================================ */
  function initSwiper() {
    if (!isSwiperSlider) return;

    if (window.innerWidth < 768) {
      if (swiperInstance) swiperInstance.destroy(true, true);

      swiperInstance = new Swiper(".overview-swiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        speed: 600,
        loop: true,
        pagination: {
          el: pagination,
          clickable: true,
        },
      });
    } else if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
  }

  /* ================================
     TAB CLICK
  ================================ */
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCards(btn.dataset.filter);
    });
  });

  window.addEventListener("resize", initSwiper);

  /* ================================
     INITIAL LOAD
  ================================ */
  renderCards(tabValues[0]);
}
