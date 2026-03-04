import { getApiHost } from "../../scripts/api.js";
import { loadCSS, loadScript } from "../../scripts/aem.js";
import { getLangFromURL } from "../../scripts/common.js";

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";

export default async function decorate(block) {
  await loadScript(SWIPER_JS);

  /* -----------------------------
     1️⃣ Read authored fields
     ----------------------------- */
  const [titleEl, descEl, ctaTextEl, ctaLinkEl, categoryEl] = [
    ...block.children,
  ];

  const title = titleEl?.textContent?.trim() || "";
  const description = descEl?.innerHTML || "";
  const ctaText = ctaTextEl?.textContent?.trim() || "";
  const ctaLink = ctaLinkEl?.textContent?.trim() || "#";
  const category = categoryEl?.textContent?.trim().toLowerCase() || "";

  /* -----------------------------
     2️⃣ Runtime wrapper
     ----------------------------- */
  const runtime = document.createElement("div");
  runtime.className = "success-stories-runtime container";

  block.append(runtime);
  block.classList.add("success-stories-initialized");

  /* -----------------------------
     3️⃣ Layout
     ----------------------------- */
  runtime.innerHTML = `
  <div class="inner-container">
    <div class="row">
      <div class="col-lg-4">
        <h2 class="text-primary sec-title">${title}</h2>
        <div class="sec-desc">${description}</div>
        <div class="my-5">
          <a href="${ctaLink}" class="btn btn-primary">${ctaText}</a>
        </div>

        <div class="swiper-button">
          <button class="swiper-button-prev"></button>

          <div class="swiper-pagination-fraction d-md-none">
            <span class="current-slide">01</span>
            <span>/</span>
            <span class="total-slide">03</span>
          </div>

          <button class="swiper-button-next"></button>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="swiper stories-swiper">
          <div class="swiper-wrapper"></div>
        </div>
      </div>
    </div>
  </div>
  `;

  const wrapper = runtime.querySelector(".swiper-wrapper");

  /* -----------------------------
     4️⃣ Fetch API
     ----------------------------- */
  try {
        let limit = 10;
        let offset = 0;
        let subCategory = "";
        let publishyear = "";
        let publishmonth = "";
        let tag = "";
        let orderby = "desc";
      const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/success-stories` +
        `?lang=${getLangFromURL()}` +
        `&limit=${encodeURIComponent(limit)}` +
        `&offset=${encodeURIComponent(offset)}` +
        `&subcategory=${encodeURIComponent(subCategory)}` +
        `&publishyear=${encodeURIComponent(publishyear)}` +
        `&publishmonth=${encodeURIComponent(publishmonth.toLowerCase())}` +
        `&tag=${encodeURIComponent(tag.toLowerCase())}` +
        `&orderby=${encodeURIComponent(orderby)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const items = json?.data?.data?.successStoryList?.items || [];

    if (!items.length) {
      wrapper.innerHTML = "<p>No stories found</p>";
      return;
    }

    /* -----------------------------
       5️⃣ Build Slides
       ----------------------------- */
    items.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      const link = item?.slugUrl || "#";

      slide.innerHTML = `
        <div class="card card-ui h-100 p-4">
          <div class="card-img">
            <a href="story-update?post=${link}">
              <img
                src="${item.storyImage?._publishUrl || ""}"
                alt="${item.title || ""}"
              />
            </a>
          </div>
          <div class="card-body">
            <h5 class="card-title">
            <a href="story-update?post=${link}">${item.title || ""}</a>
            </h5>
            <p class="card-text">${item.description?.plaintext || ""}</p>
            <a href="story-update?post=${link}" class="btn-link">
              ${item.ctaText?.plaintext || "READ MORE"}
            </a>
          </div>
        </div>
      `;

      wrapper.append(slide);
    });

    /* -----------------------------
       6️⃣ Init Swiper
       ----------------------------- */
    const swiper = new Swiper(".stories-swiper", {
      slidesPerView: 1.2,
      spaceBetween: 24,
      speed: 600,
      breakpoints: {
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 1.8 },
      },
      navigation: {
        nextEl: runtime.querySelector(".swiper-button-next"),
        prevEl: runtime.querySelector(".swiper-button-prev"),
      },
    });

    /* -----------------------------
       7️⃣ Fraction Pagination
       ----------------------------- */
    const currentEl = runtime.querySelector(".current-slide");
    const totalEl = runtime.querySelector(".total-slide");

    const pad = (n) => (n < 10 ? "0" + n : n);

    // Set total
    totalEl.textContent = pad(swiper.slides.length);

    // Update current slide
    swiper.on("slideChange", () => {
      currentEl.textContent = pad(swiper.realIndex + 1);
    });

    // Initial load
    currentEl.textContent = pad(1);
  } catch (e) {
    console.error("Success Stories error", e);
    wrapper.innerHTML = "<p>Error loading stories</p>";
  }
}
