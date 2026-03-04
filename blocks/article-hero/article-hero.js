import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from "../../scripts/common.js";
import { formatDate } from "../../scripts/common.js";

/* ================================
   Get Category From URL
================================ */
function getCategoryFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (!parts.length) return "";

  let slug = parts[parts.length - 1].toLowerCase();

  const slugMap = {
    "brand-films-visuals": "press-release",
  };

  return slugMap[slug] || slug;
}

/* ================================
   Get Final Category (SAFE)
   → handles different API structures
================================ */
function getFinalCategory(item) {
  return String(
    item?.subCategory ||
      item?.sub_category ||
      item?.subcategory ||
      item?.category?.subCategory ||
      item?.category?.name ||
      item?.category ||
      "Press"
  ).trim();
}

/* ================================
   Create Bootstrap Video Modal
================================ */
function createVideoModal() {
  if (document.getElementById("videoModal")) return;

  const modalHTML = `
    <div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-black">
          <button type="button"
            class="btn-close btn-close-white ms-auto m-2"
            data-bs-dismiss="modal">
          </button>

          <div class="ratio ratio-16x9">
            <iframe
              id="videoIframe"
              src=""
              title="YouTube video"
              allow="autoplay; encrypted-media"
              allowfullscreen>
            </iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modalEl = document.getElementById("videoModal");
  modalEl.addEventListener("hidden.bs.modal", () => {
    document.getElementById("videoIframe").src = "";
  });
}

/* ================================
   Extract YouTube ID
================================ */
function getYouTubeId(url) {
  if (!url) return "";

  if (url.includes("watch?v=")) {
    return url.split("watch?v=")[1].split("&")[0];
  }

  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split("?")[0];
  }

  return "";
}

/* ================================
   Open Video Modal
================================ */
function openVideoModal(url) {
  const videoId = getYouTubeId(url);
  if (!videoId) return;

  const iframe = document.getElementById("videoIframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  const modalEl = document.getElementById("videoModal");

  if (window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    modalEl.style.display = "block";
    modalEl.classList.add("show");
  }
}

/* ================================
   Main Decorate Function
================================ */
export default async function decorate(block) {
  let category = getCategoryFromURL();
  if (!category) category = "press-release";

  let autoLabel = "LATEST UPDATE";
  if (category === "press-release") autoLabel = "Featured Video";
  else if (category === "blog") autoLabel = "LATEST INSIGHTS";

  const authorLabel = block.dataset.label;
  const labelText = authorLabel || autoLabel;

  block.innerHTML = "";

  const container = document.createElement("section");
  container.className = "article-hero spacer";

  container.innerHTML = `
    <div class="ah-wrapper">
      <p class="loading">Loading content...</p>
    </div>
  `;

  block.appendChild(container);
  const wrapper = container.querySelector(".ah-wrapper");

  try {
    const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/films-latest`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.filmsVisualsList?.items || [];

    if (!items.length) {
      wrapper.innerHTML = "<p>No news available.</p>";
      return;
    }

    const item = items[0];

    /* ===== Publish Date ===== */
    const publishDateRaw =
      item?.publishDate ||
      (item?.publishMonth && item?.publishYear
        ? `${item.publishMonth} ${item.publishYear}`
        : "");

    const publishDateFormatted = publishDateRaw
      ? formatDate(publishDateRaw)
      : "";

    /* ===== Category Badge ===== */
    const finalCategory = getFinalCategory(item);

    const categorySlug = finalCategory
      .toLowerCase()
      .replace(/\s+/g, "-");

    /* ===== Render ===== */
    wrapper.innerHTML = `
      <div class="ah-header">
        <span class="ah-label">${labelText}</span>

        <h1 class="ah-title">${item.title || ""}</h1>

        <div class="ah-meta">
          <span class="ah-category badge ${categorySlug}">
            ${slugToTitle(finalCategory)}
          </span>

          <span class="ah-separator">|</span>

          <span class="ah-date">
            <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="#333" stroke-width="1.5"></path>
              <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
              <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
              <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
            ${publishDateFormatted}
          </span>
        </div>
      </div>

      <div class="ah-media">
        <img
          src="${item.thumbnail?._publishUrl || ""}"
          alt="${item.title || ""}"
          loading="lazy"
        />

        ${
          item.video
            ? `<button class="ah-video-btn inner-hero-play" data-video="${item.video}">
                Play Video
              </button>`
            : ""
        }
      </div>
    `;

    /* ===== Setup Video Modal ===== */
    if (item.video) {
      createVideoModal();

      wrapper
        .querySelector(".ah-video-btn")
        ?.addEventListener("click", (e) => {
          openVideoModal(e.currentTarget.dataset.video);
        });
    }
  } catch (err) {
    console.error("Article hero error:", err);
    wrapper.innerHTML = "<p>Error loading content.</p>";
  }
}