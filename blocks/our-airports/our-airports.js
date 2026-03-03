export default function decorate(block) {
  console.log("Decorating Our Airports block");

  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const configRow = rows[0];
  const configCells = [...configRow.children];

  const title = configCells[0]?.textContent?.trim();
  const domesticBtnLabel =
    configCells[1]?.textContent?.trim() || "Domestic Network";
  const internationalBtnLabel =
    configCells[2]?.textContent?.trim() || "International Network";

  const itemRows = rows.slice(1);

  /* ================================
     2️⃣ Hide authored rows (AEM SAFE)
     ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     3️⃣ Runtime wrapper
     ================================ */
  const runtime = document.createElement("section");
  runtime.className = "airport-overview-runtime";

  runtime.innerHTML = `
    <div class="container">
      <div class="airport-overview-header text-center mb-5">
        ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
        <div class="airport-tabs">
          <button class="tab-btn active" data-filter="domestic">
            ${domesticBtnLabel}
          </button>
          <button class="tab-btn" data-filter="international">
            ${internationalBtnLabel}
          </button>
        </div>
      </div>

      <div class="airport-cards row"></div>

      <div class="load-more-wrap text-center">
        <button class="load-more-btn btn-link">Load More</button>
      </div>
    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".airport-cards");
  const tabButtons = runtime.querySelectorAll(".tab-btn");
  const loadMoreBtn = runtime.querySelector(".load-more-btn");

  /* ================================
     4️⃣ Build cards (SAMPLE STRUCTURE)
     ================================ */
  itemRows.forEach((row) => {
    if (!row.textContent?.trim()) return;

    const cells = [...row.children];
    const type = cells[0]?.textContent?.trim().toLowerCase();
    if (!["domestic", "international"].includes(type)) return;

    /* Image */
    let imageUrl = "";
    const img = cells[1]?.querySelector("img");
    if (img) imageUrl = img.src;

    const badge = cells[2]?.textContent?.trim();
    const name = cells[3]?.textContent?.trim();
    if (!name) return;

    const desc = cells[4]?.textContent?.trim();
    const ctaLabel = cells[5]?.textContent?.trim() || "READ MORE";

    let linkUrl = "";
    const link = cells[6]?.querySelector("a");
    if (link) linkUrl = link.href;

    /* LI wrapper for filtering */
    const li = document.createElement("div");
    li.className = "airport-card col-md-6 mt-4";
    li.dataset.type = type;

    li.innerHTML = `
      <div class="card card-ui-one">
        ${
          imageUrl
            ? `
          <div class="card-img">
            ${badge ? `<span class="badge">${badge}</span>` : ""}
            <img src="${imageUrl}" alt="${name}" loading="lazy" />
          </div>
        `
            : ""
        }

        <div class="card-body">
          <h3 class="card-title">${name}</h3>
          ${desc ? `<p class="card-desc">${desc}</p>` : ""}
          ${
            linkUrl
              ? `
            <div class="card-cta">
              <a href="${linkUrl}" class="btn-link">${ctaLabel}</a>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    cardList.appendChild(li);
  });

  /* ================================
     5️⃣ Load More (Mobile Only)
     ================================ */
  const MOBILE_LIMIT = 3;
  let visibleCount = MOBILE_LIMIT;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function applyLoadMore(filterType, reset = false) {
    const cards = [...cardList.querySelectorAll(".airport-card")].filter(
      (card) => card.dataset.type === filterType
    );

    if (!isMobile()) {
      cards.forEach((c) => (c.style.display = "block"));
      loadMoreBtn.style.display = "none";
      return;
    }

    if (reset) visibleCount = MOBILE_LIMIT;

    cards.forEach((card, index) => {
      card.style.display = index < visibleCount ? "block" : "none";
    });

    loadMoreBtn.style.display =
      visibleCount < cards.length ? "inline-block" : "none";
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += MOBILE_LIMIT;
    const active =
      runtime.querySelector(".tab-btn.active").dataset.filter;
    applyLoadMore(active);
  });

  /* ================================
     6️⃣ Tab filtering
     ================================ */
  function filterCards(type) {
    const cards = cardList.querySelectorAll(".airport-card");
    cards.forEach((card) => {
      card.style.display =
        card.dataset.type === type ? "block" : "none";
    });
    applyLoadMore(type, true);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterCards(btn.dataset.filter);
    });
  });

  /* ================================
     7️⃣ Init
     ================================ */
  filterCards("domestic");

  window.addEventListener("resize", () => {
    const active =
      runtime.querySelector(".tab-btn.active").dataset.filter;
    applyLoadMore(active, true);
  });

  console.log("Our Airports block initialized");
}
