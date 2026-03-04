import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from "../../scripts/common.js";
import { formatDate } from "../../scripts/common.js";

function getCategoryFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (!parts.length) return "";

  let slug = parts[parts.length - 1].toLowerCase();

  // Custom overrides
  const slugMap = {
    "blogs": "blog",
  };

  return slugMap[slug] || slug;
}

export default async function decorate(block) {
  const limit = 3;
  const offset = 0;
  const category = getCategoryFromURL();
  let labeltitle = '';
  if (category === "press-release") {
    labeltitle = "LATEST PRESS RELEASE";
  } else if (category === "blog") {
    labeltitle = "LATEST INSIGHTS";
  }
  let labelText = block.textContent.trim() || labeltitle;
  block.innerHTML = "";
  

  const container = document.createElement("section");
  container.className = "latest-press-update";

  container.innerHTML = `
    <div class="lpu-wrapper">
      <p class="loading">Loading latest press update...</p>
    </div>
  `;

  block.appendChild(container);

  const wrapper = container.querySelector(".lpu-wrapper");

  /* ================================
     Fetch latest press
  ================================ */
  try {
     const apiUrl =
          `${getApiHost()}/api/v1/web/gmr-api/latest-news` +
          `?category=${encodeURIComponent(category)}`;
          

          
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error(`API error ${res.status}`);
          
          const json = await res.json();
          const items = json?.data?.data?.newsList?.items || [];
          if (!items.length) {
            block.innerHTML = "<p>No news available.</p>";
            return;
          }
          
          const item = items[0];
    if (!item) {
      wrapper.innerHTML = `<p>No ${category} updates found.</p>`;
      return;
    }

    const publishDateRaw = item.publishMonth + " " + item.publishYear;

    const publishDateFormatted = formatDate(publishDateRaw);
    const categorySlug = (item.subCategory || item.category || "press")
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]/g, '');

    wrapper.innerHTML = `
      <div class="lpu-left">
        <span class="lpu-label">${labelText}</span>

        <h1 class="lpu-title">
          ${item.title || ""}
        </h1>

        <div class="lpu-meta">
          <span class="lpu-category badge ${categorySlug}">
            ${slugToTitle(item.subCategory || item.category || "Press")}
          </span>
          <span class="meta-separator">|</span>
          <span class="lpu-date">
            <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="#333333" stroke-width="1.5"></path>
            <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
            ${publishDateFormatted}
          </span>
        </div>
        <p class="lpu-description">
          ${item.description?.plaintext || "No description available."}
        </p>

        <a
          href="/en/news-update?post=${item.slugUrl}"
          class="btn-link"
        >
          Read More
        </a>
      </div>

      <div class="lpu-right">
        <img
          src="${item.cardImage?._publishUrl || ""}"
          alt="${item.title || ""}"
          loading="lazy"
        />
      </div>
    `;
  } catch (err) {
    console.error(`Latest ${category} update error:`, err);
    wrapper.innerHTML = "<p>Error loading press update.</p>";
  }
}
