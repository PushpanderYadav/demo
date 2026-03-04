import { getApiHost } from "../../scripts/api.js";
import { getNewsDetail } from "../../scripts/news-api.js";
import { formatDate } from "../../scripts/common.js";

function slugToTitle(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function decorate(block) {
  const item = await getNewsDetail();
  const limit = 3;
  const offset = 0;
  const category = item.category;
  const slugUrl = item.slugUrl;

  // Clear block content
  block.innerHTML = "";

  // Create section with proper classes
  const section = document.createElement("section");
  section.className = "sec-news bg-sky-blue spacer";

  const wrapper = document.createElement("div");
  wrapper.className = "container";

  // Create header section
  const headerHtml = `
    <div class="news-header mb-5">
      <div class="news-header-left text-center">
        <h2 class="text-primary sec-title">Related ${slugToTitle(category)}</h2>
      </div>
    </div>
    <div class="row"></div>
  `;

  wrapper.innerHTML = headerHtml;
  section.appendChild(wrapper);
  block.appendChild(section);

  const cardsWrapper = wrapper.querySelector(".row");

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/recent-posts` +
      `?limit=${encodeURIComponent(limit)}` +
      `&soffset=${encodeURIComponent(offset)}` +
      `&category=${encodeURIComponent(category)}` +
      `&slugUrl=${encodeURIComponent(slugUrl)}`;
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.newsList?.items || [];

    if (!items.length) {
      cardsWrapper.innerHTML = "<p>No related news found.</p>";
      return;
    }
    
    // Render news cards
    items.forEach((item) => {
      const publishDateRaw = item.publishMonth + " " + item.publishYear;
      
      const publishDateFormatted = formatDate(publishDateRaw);
      
      const card = document.createElement("div");
      card.className = "col-md-6 col-lg-4 mt-4";

      card.innerHTML = `
        <div class="card card-news">
          <div class="card-img">
            <img
              src="${item.cardImage?._publishUrl || ""}"
              alt="${item.title || ""}"
              loading="lazy"
            />
          </div>

          <div class="card-body">
            <div class="card-meta d-flex gap-4 align-items-center mb-3">
              <span class="badge ${item.subCategory || ""}">
                ${slugToTitle(item.subCategory || "")}
              </span>
              <span class="meta-date">
                ${publishDateFormatted}
              </span>
            </div>

            <h3 class="card-title">${item.title || ""}</h3>

            <p class="card-text d-none">
              ${item.description?.plaintext || ""}
            </p>

            <div class="card-cta">
              <a
                class="btn-link"
                href="/en/news-update?post=${encodeURIComponent(item.slugUrl || "")}"
              >
                READ MORE
              </a>
            </div>
          </div>
        </div>
      `;

      cardsWrapper.appendChild(card);
    });
  } catch (err) {
    console.error("Related News Updates error:", err);
    cardsWrapper.innerHTML = "<p>Error loading related news.</p>";
  }
}