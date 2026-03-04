import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from "../../scripts/common.js";
import { formatDate } from "../../scripts/common.js";

export default async function decorate(block) {
  const [titleEl, descEl, ctaTextEl, ctaLinkEl, categoryEl, limitEl] = [
    ...block.children,
  ];

  const sectionTitle = titleEl?.textContent?.trim() || "";
  const sectionDescription = descEl?.innerHTML || "";
  const ctaText = ctaTextEl?.textContent?.trim() || "";
  const ctaLink = ctaLinkEl?.textContent?.trim() || "#";
  const category = categoryEl?.textContent?.trim() || "";
  const limit = limitEl?.textContent?.trim() || "3";

  block.innerHTML = "";

  const section = document.createElement("section");
  section.className = "sec-news bg-sky-blue spacer";

  const wrapper = document.createElement("div");
  wrapper.className = "container";

  wrapper.innerHTML = `
    <div class="news-header d-md-flex justify-content-between align-items-end gap-4 mb-md-5 mb-4">
      <div class="news-header-left">
        <h2 class="text-primary sec-title">${sectionTitle}</h2>
        <div class="sec-desc">${sectionDescription}</div>
      </div>
      ${
        ctaText
          ? `<a class="btn btn-primary mb-md-3 mt-4 mt-md-0" href="${ctaLink}">${ctaText}</a>`
          : ""
      }
    </div>

    <div class="row"></div>
  `;

  section.appendChild(wrapper);
  block.appendChild(section);

  const cardsWrapper = wrapper.querySelector(".row");

  /* ================================
    Fetch news from serverless
  ================================ */
  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/news-update` +
      `?category=${encodeURIComponent(category)}` +
      `&limit=${encodeURIComponent(limit)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.newsList?.items || [];

    if (!items.length) {
      cardsWrapper.innerHTML = "<p>No news found.</p>";
      return;
    }
    console.log("_____________________", items);
    

    /* ================================
      Render news cards
    ================================ */
    items.forEach((item) => {
      const publishDateRaw = item.publishMonth + " " + item.publishYear;  

      const publishDateFormatted = formatDate(publishDateRaw);

      const card = document.createElement("div");
      card.className = "col-md-6 col-lg-4 mt-4";

      card.innerHTML = `
        <div class="card card-news">
          <div class="card-img">
            <img src="${item.cardImage?._publishUrl || ""}" alt="${
              item.title || ""
            }">
          </div>

          <div class="card-body">
            <div class="card-meta d-flex gap-4 align-items-center mb-3">
              <span class="badge ${item.category || ""}">
                ${slugToTitle(item.category) || ""}
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
              <a class="btn-link" href="/en/news-update?post=${encodeURIComponent(item.slugUrl)}">
                ${item.ctaLabel || "READ MORE"}
              </a>
            </div>
          </div>
        </div>
      `;

      cardsWrapper.appendChild(card);
    });
  } catch (err) {
    console.error("News Updates error:", err);
    cardsWrapper.innerHTML = "<p>Error loading news.</p>";
  }
}
