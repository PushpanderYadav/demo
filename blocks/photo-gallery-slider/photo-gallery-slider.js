import { loadScript } from "../../scripts/aem.js";

const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";

/* ================================
   Bootstrap Video Modal (safe)
================================ */
function ensureVideoModal() {
  if (document.getElementById("galleryVideoModal")) return;

  const modal = document.createElement("div");
  modal.id = "galleryVideoModal";
  modal.className = "modal fade";

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content bg-black">
        <div class="modal-body p-0 position-relative text-end">
          <button type="button"
            class="btn-close btn-close-white ms-auto m-2"
            data-bs-dismiss="modal"></button>

          <div class="ratio ratio-16x9">
            <iframe id="galleryVideoFrame"
              src=""
              allow="autoplay; encrypted-media"
              allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.append(modal);

  modal.addEventListener("hidden.bs.modal", () => {
    const frame = document.getElementById("galleryVideoFrame");
    if (frame) frame.src = "";
  });
}

/* ================================
   YouTube URL → embed
================================ */
function getYoutubeEmbed(url) {
  if (!url) return "";

  if (url.includes("youtu.be"))
    return `https://www.youtube.com/embed/${
      url.split("youtu.be/")[1]?.split("?")[0]
    }?autoplay=1`;

  if (url.includes("youtube.com"))
    return `https://www.youtube.com/embed/${
      url.split("v=")[1]?.split("&")[0]
    }?autoplay=1`;

  return url;
}

function openVideo(url) {
  if (!window.bootstrap) return;

  const frame = document.getElementById("galleryVideoFrame");
  if (!frame) return;

  frame.src = getYoutubeEmbed(url);

  new bootstrap.Modal(
    document.getElementById("galleryVideoModal")
  ).show();
}

/* ================================
   Main Decorate
================================ */
export default async function decorate(block) {
  await loadScript(SWIPER_JS);
  ensureVideoModal();

  const rows = [...block.children];
  if (rows.length < 3) return;

  const headingRow = rows[0];
  const descRow = rows[1];
  const items = rows.slice(2);

  block.classList.add("sec-photo-slider", "spacer");

  /* ================================
     Build Tabs Map (auto detect)
     Supports BOTH structures:

     CURRENT HTML:
     0 image
     1 title
     2 description

     FUTURE HTML:
     0 gallerykType
     1 image
     2 title
     3 description
     4 videoUrl
  ================================ */

  const tabsMap = {};
  let hasTabs = false;

  items.forEach((item) => {
  const cells = [...item.children];

  let tabValue = "all";
  let tabName = "All";

  let imageRow, titleRow, descRowCell, videoRow;

  /* detect structure */
  if (cells.length >= 4 && !cells[0].querySelector("img")) {
    const rawType = cells[0]?.textContent?.trim() || "";

    /* -------------------------------
       Parse multiple formats safely
    -------------------------------- */
    function formatTabLabel(str = "") {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

    if (rawType.includes("{")) {
      // JSON format
      try {
        const parsed = JSON.parse(rawType);
        tabName = parsed.name || formatTabLabel(parsed.value);
        tabValue = parsed.value || parsed.name || "all";
      } catch {
        tabName = rawType;
        tabValue = rawType;
      }
    }

    else if (rawType.includes("name") && rawType.includes("value")) {
      // name:value text format
      const nameMatch = rawType.match(/name["']?\s*:\s*["']?([^,"\n]+)/i);
      const valueMatch = rawType.match(/value["']?\s*:\s*["']?([^,"\n]+)/i);

      tabName =
  nameMatch?.[1]?.trim() ||
  formatTabLabel(valueMatch?.[1] || "");
      tabValue = valueMatch?.[1]?.trim() || tabName.toLowerCase();
    }

    else {
      // plain text
      tabValue = rawType.toLowerCase().replace(/\s+/g, "");
tabName = formatTabLabel(rawType);
    }

    imageRow = cells[1];
    titleRow = cells[2];
    descRowCell = cells[3];
    videoRow = cells[4];

    hasTabs = true;
  }
  else {
    // old structure
    imageRow = cells[0];
    titleRow = cells[1];
    descRowCell = cells[2];
  }

  /* create tab group */
  if (!tabsMap[tabValue]) {
    tabsMap[tabValue] = {
      name: tabName,
      items: [],
    };
  }

  const img = imageRow?.querySelector("img");

  tabsMap[tabValue].items.push({
    image: img?.src || "",
    altText: titleRow?.textContent.trim() || "",
    title: titleRow?.textContent.trim() || "",
    description: descRowCell?.innerHTML || "",
    videoUrl: videoRow?.textContent.trim() || "",
  });
  });

  const tabValues = Object.keys(tabsMap);
  if (!tabValues.length) return;

  /* ---------- Container ---------- */
  const container = document.createElement("div");
  container.className = "container";

  /* ---------- Header ---------- */
  const header = document.createElement("div");
  header.className = "text-center mb-5";

  if (headingRow.textContent.trim()) {
    header.innerHTML += `<h2 class="sec-title">${headingRow.textContent.trim()}</h2>`;
  }

  if (descRow.innerHTML.trim()) {
    header.innerHTML += `<div class="sec-desc">${descRow.innerHTML}</div>`;
  }

  /* ---------- Tabs (only if exist) ---------- */
  if (hasTabs && tabValues.length > 1) {
    const tabsWrap = document.createElement("div");
    tabsWrap.className = "gallery-tabs mt-4";

    tabValues.forEach((val, i) => {
      const btn = document.createElement("button");
      btn.className = `tab-btn ${i === 0 ? "active" : ""}`;
      btn.dataset.tab = val;
      btn.textContent = tabsMap[val].name;
      tabsWrap.append(btn);
    });

    header.append(tabsWrap);
  }

  container.append(header);

  /* ---------- Slider Container ---------- */
  const sliderContainer = document.createElement("div");
  container.append(sliderContainer);

  block.innerHTML = "";
  block.append(container);

  /* ================================
     Render Slider
  ================================ */
  let swiperInstance;

  function renderSlider(type) {
  sliderContainer.innerHTML = "";

  const swiper = document.createElement("div");
  swiper.className = "swiper image-slider-swiper";

  const wrapper = document.createElement("div");
  wrapper.className = "swiper-wrapper";

  tabsMap[type].items.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="card card-ui-one">
        ${
          item.image
            ? `
          <div class="card-img">
            <img src="${item.image}"
              alt="${item.altText}"
              loading="lazy"
              style="${item.videoUrl ? "cursor:pointer" : ""}">
          </div>
        `
            : ""
        }
        <div class="card-body">
          ${item.title ? `<h3 class="card-title">${item.title}</h3>` : ""}
          ${
            item.description
              ? `<div class="card-desc">${item.description}</div>`
              : ""
          }
        </div>
      </div>
    `;

    if (item.videoUrl) {
      slide.querySelector("img")?.addEventListener("click", () =>
        openVideo(item.videoUrl)
      );
    }

    wrapper.append(slide);
  });

  swiper.append(wrapper);

  /* ================================
     ✅ NAVIGATION WRAPPER (UPDATED)
  ================================= */
  const navWrapper = document.createElement("div");
  navWrapper.className =
    "d-flex gap-3 justify-content-center mt-5";

  const prev = document.createElement("div");
  prev.className = "swiper-button-prev";

  const next = document.createElement("div");
  next.className = "swiper-button-next";

  navWrapper.append(prev, next);

  /* append swiper + nav */
  sliderContainer.append(swiper, navWrapper);

  /* destroy old swiper */
  if (swiperInstance) swiperInstance.destroy(true, true);

  /* ================================
     Init Swiper
  ================================= */
  swiperInstance = new window.Swiper(swiper, {
    slidesPerView: 2.5,
    spaceBetween: 20,
    loop: false,

    navigation: {
      nextEl: next,
      prevEl: prev,
    },

    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 2 },
      992: { slidesPerView: 2 },
    },
  });
}

  /* ---------- Tab Click ---------- */
  container.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");
      renderSlider(btn.dataset.tab);
    });
  });

  /* initial load */
  renderSlider(tabValues[0]);
}