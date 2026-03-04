import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

/* ================================
   Character Limit Helper
================================ */
const CHAR_LIMIT = 150;

function truncateText(text, limit = CHAR_LIMIT) {
  if (!text) return "";
  return text.length > limit ? text.substring(0, limit) + "..." : text;
}

/* ================================
   Format text → multiple paragraphs
================================ */
function formatParagraphs(text) {
  if (!text) return "";

  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
}

/* ================================
   Reusable Modal Open Function
================================ */
function openModal(modal, title, desc, img) {
  modal.querySelector(".gmr-modal-title").textContent = title;
  modal.querySelector(".gmr-modal-desc").innerHTML = formatParagraphs(desc);

  const imgEl = modal.querySelector(".gmr-modal-img img");

  if (img) {
    imgEl.src = img;
    imgEl.style.display = "block";
  } else {
    imgEl.style.display = "none";
  }

  new bootstrap.Modal(modal).show();
}

export default async function decorate(block) {
  /* ================================
     1️⃣ Read authored content
  ================================ */
  const rows = [...block.children];
  if (rows.length < 3) return;

  const sectionTitle = rows[0]?.textContent?.trim() || "";
  const sectionDesc = rows[1]?.textContent?.trim() || "";
  const itemRows = rows.slice(2);

  /* ================================
     2️⃣ UNIVERSAL EDITOR SAFE
  ================================ */
  const isUE = document.querySelector(
    "aem-extension, [data-aue-resource], [data-aue-prop]"
  );

  if (isUE) {
    block.dataset.aueType = "container";
    block.dataset.aueLabel = "GMR Business Brand";

    rows[0].dataset.aueProp = "sectionTitle";
    rows[1].dataset.aueProp = "sectionDescription";

    itemRows.forEach((row, i) => {
      row.dataset.aueType = "item";
      row.dataset.aueLabel = `GMR Business Item ${i + 1}`;
    });
  }

  /* Hide authored rows */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     3️⃣ Create Swiper UI
  ================================ */
  const section = document.createElement("section");
  section.className = "sec-brand spacer";

  section.innerHTML = `
    <div class="container">

      <div class="row">
        <div class="col-md-7 text-center mx-auto mb-5">
          <h2 class="sec-title">${sectionTitle}</h2>
          <div class="sec-desc">${sectionDesc}</div>
        </div>
      </div>

      <div class="swiper gmr-brand-swiper">
        <div class="swiper-wrapper"></div>
        <div class="gmr-swiper-nav d-flex gap-3 justify-content-center mt-4">
          <button class="swiper-button-prev"></button>
          <button class="swiper-button-next"></button>
        </div>
      </div>

    </div>
  `;

  block.after(section);
  const wrapper = section.querySelector(".swiper-wrapper");

  /* ================================
     4️⃣ Create Bootstrap Modal (once)
  ================================ */
  const modal = document.createElement("div");
  modal.className = "modal fade gmr-modal";

  modal.innerHTML = `
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">

        <button type="button" class="btn-close modal-close" data-bs-dismiss="modal"></button>

        <div class="modal-body">
          <div class="gmr-modal-inner d-flex gap-4">

            <div class="gmr-modal-img">
              <img src="" alt="">
            </div>

            <div class="gmr-modal-content">
              <h3 class="gmr-modal-title"></h3>
              <div class="gmr-modal-desc"></div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;

  document.body.append(modal);

  /* ================================
     5️⃣ Build Slides
  ================================ */
  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 6) return;

    const img = cells[0]?.querySelector("img");
    const alt = cells[1]?.textContent?.trim() || "";
    const title = cells[2]?.textContent?.trim() || "";
    const desc = cells[3]?.textContent?.trim() || "";

    const ctaText = cells[4]?.textContent?.trim() || "Read More";
    const linkEl = cells[5]?.querySelector("a");
    const ctaLink = linkEl?.href || "";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="card card-ui-two h-100 p-4">
        ${
          img
            ? `
        <div class="card-img">
          <img 
            src="${img.src}" 
            alt="${alt || title}"
            class="card-img-click"
            data-title="${title}"
            data-desc="${encodeURIComponent(desc)}"
            data-img="${img?.src || ""}"
            style="cursor:pointer"
          >
        </div>`
            : ""
        }

        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${title}</h5>

          <div class="card-text">
            ${truncateText(desc)}
            ${
              desc.length > CHAR_LIMIT
                ? `
              <div class="card-cta mt-3">
                <button 
                  type="button"
                  class="btn-link read-more-btn"
                  data-title="${title}"
                  data-desc="${encodeURIComponent(desc)}"
                  data-img="${img?.src || ""}"
                >
                  Read More
                </button>
              </div>`
                : ""
            }
          </div>

          ${
            ctaLink
              ? `
          <div class="card-cta mt-auto">
            <a href="${ctaLink}" class="btn-link">${ctaText}</a>
          </div>`
              : ""
          }
        </div>
      </div>
    `;

    wrapper.append(slide);
  });

  /* ================================
     6️⃣ Load Swiper
  ================================ */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new window.Swiper(section.querySelector(".gmr-brand-swiper"), {
    slidesPerView: 1,
    spaceBetween: 24,
    //centeredSlides: true,
    navigation: {
      nextEl: section.querySelector(".swiper-button-next"),
      prevEl: section.querySelector(".swiper-button-prev"),
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });

  /* ================================
     7️⃣ Open Modal → Image + Button
  ================================ */
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".read-more-btn, .card-img-click");
    if (!trigger) return;

    const title = trigger.dataset.title;
    const desc = decodeURIComponent(trigger.dataset.desc);
    const img = trigger.dataset.img;

    openModal(modal, title, desc, img);
  });
}