export default function decorate(block) {
  console.log("Decorating Our Airports block (label/value tabs)");

  const rows = [...block.children];
  if (rows.length < 5) return;

  /* ================================
     1️⃣ Header content
     ================================ */
  const title = rows[0]?.textContent?.trim() || "";
  const description = rows[1]?.innerHTML?.trim() || "";

  /* ================================
     2️⃣ Card rows
     ================================ */
  const itemRows = rows.slice(2).filter((row) =>
    row.textContent?.trim()
  );

  /* ================================
     3️⃣ Helpers
     ================================ */
  const formatLabel = (val) =>
    val
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  /* ================================
     4️⃣ Build tabs map
     ================================ */
  const tabsMap = {};
  const tabsMeta = {};

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 7) return;

    const value = cells[0]?.textContent?.trim();
    if (!value) return;

    if (!tabsMap[value]) {
      tabsMap[value] = [];
      tabsMeta[value] = formatLabel(value);
    }

    const img = cells[1]?.querySelector("img");
    const imageAlt = img?.getAttribute("alt") || "";

    const getText = (cell) =>
      cell?.innerText?.trim() || cell?.textContent?.trim() || "";

    tabsMap[value].push({
      image: img ? img.src : "",
      imageAlt,
      badge: getText(cells[2]),
      name: getText(cells[3]),
      desc: getText(cells[4]),
      ctaLabel: getText(cells[5]) || "READ MORE",
      link: cells[6]?.querySelector("a")?.href || "",
    });
  });

  const tabValues = Object.keys(tabsMap);
  if (!tabValues.length) return;

  const hasOnlyNoneTab = tabValues.length === 1 && tabValues[0] === "none";

  /* ================================
     5️⃣ Hide authored HTML
     ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     6️⃣ Runtime markup
     ================================ */
  const runtime = document.createElement("section");
  runtime.className = "airport-overview-runtime";

  runtime.innerHTML = `
    <div class="container">
      <div class="airport-overview-header text-center mb-4">
        <div class="airport-overview-headerHead">
          ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
          ${description ? `<div class="sec-desc mb-0">${description}</div>` : ""}
        </div>

        ${
          !hasOnlyNoneTab
            ? `
          <div class="airport-tabs">
            ${tabValues
              .map(
                (value, i) => `
                  <button
                    class="tab-btn ${i === 0 ? "active" : ""}"
                    data-filter="${value}">
                    ${tabsMeta[value]}
                  </button>
                `
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>

      <div class="airport-cards row justify-content-center"></div>

      <div class="load-more-wrap text-center">
        <button class="load-more-btn btn btn-primary">Load More</button>
      </div>
    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".airport-cards");
  const tabsContainer = runtime.querySelector(".airport-tabs");
  const tabButtons = runtime.querySelectorAll(".tab-btn");
  const loadMoreBtn = runtime.querySelector(".load-more-btn");

  /* ================================
     7️⃣ Render cards
     ================================ */
  function renderCards(type) {
    cardList.innerHTML = "";

    tabsMap[type]?.forEach((card) => {
      const div = document.createElement("div");
      div.className = "airport-card col-md-6 mt-4";

      div.innerHTML = `
        <div class="card card-ui-one">
          ${
            card.image
              ? `
              <div class="card-img">
                ${card.badge ? `<span class="badge">${card.badge}</span>` : ""}
                <img src="${card.image}" alt="${card.imageAlt}" loading="lazy" />
              </div>
            `
              : ""
          }
          <div class="card-body">
            ${card.name ? `<h3 class="card-title">${card.name}</h3>` : ""}
            ${card.desc ? `<p class="card-desc">${card.desc}</p>` : ""}
            ${
              card.link
                ? `
              <div class="card-cta">
                <a href="${card.link}" class="btn-link">${card.ctaLabel}</a>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;

      cardList.appendChild(div);
    });
  }

  /* ================================
     8️⃣ Load More
     ================================ */
  const MOBILE_LIMIT = 3;
  let visibleCount = MOBILE_LIMIT;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function applyLoadMore(type, reset = false) {
    const cards = [...cardList.querySelectorAll(".airport-card")];

    if (!isMobile()) {
      cards.forEach((c) => (c.style.display = "block"));
      loadMoreBtn.style.display = "none";
      return;
    }

    if (reset) visibleCount = MOBILE_LIMIT;

    cards.forEach((card, i) => {
      card.style.display = i < visibleCount ? "block" : "none";
    });

    loadMoreBtn.style.display =
      visibleCount < cards.length ? "inline-block" : "none";
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += MOBILE_LIMIT;
    const active =
      runtime.querySelector(".tab-btn.active")?.dataset.filter;
    if (active) applyLoadMore(active);
  });

  /* ================================
     9️⃣ Tabs logic
     ================================ */
  function toggleTabsVisibility(type) {
    if (!tabsContainer) return;
    tabsContainer.style.display = type === "none" ? "none" : "";
  }

  function activateTab(type) {
    toggleTabsVisibility(type);
    renderCards(type);
    applyLoadMore(type, true);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activateTab(btn.dataset.filter);
    });
  });

  /* ================================
     🔁 Initial load
     ================================ */
  activateTab(tabValues[0]);

  window.addEventListener("resize", () => {
    const active =
      runtime.querySelector(".tab-btn.active")?.dataset.filter;
    if (active) applyLoadMore(active, true);
  });
}
