export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ================================
     1️⃣ Identify rows (EDS safe)
  ================================ */
  const headerRow = rows[0];

  const tabRows = rows.filter(
    (row, index) => index > 0 && row.children.length === 3
  );

  const dropdownRows = rows.filter(
    (row, index) => index > 0 && row.children.length === 2
  );

  /* ================================
     2️⃣ Helpers
  ================================ */
  const cleanPath = (url) => {
  if (!url) return "";

  // remove domain
  let path = url.replace(/^(https?:\/\/)?[^/]+/, "");

  // remove trailing slash
  path = path.replace(/\/$/, "");

  // remove language prefix (/en or /fr)
  path = path.replace(/^\/(en|fr)(?=\/)/, "");

  return path;
};

const currentPath = cleanPath(window.location.href);

  /* ================================
     3️⃣ Resolve dropdown button text
  ================================ */
  let dropdownButtonText = "";

  dropdownRows.forEach((row) => {
    const cells = [...row.children];
    const text = cells[0]?.textContent?.trim();
    const url = cells[1]?.textContent?.trim();

    if (text && url && cleanPath(url) === currentPath) {
      dropdownButtonText = text;
    }
  });

  if (!dropdownButtonText && dropdownRows.length) {
    dropdownButtonText =
      dropdownRows[0].children[0]?.textContent?.trim();
  }

  /* ================================
     4️⃣ Hide authored rows
  ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     5️⃣ Runtime HTML (WITH ARROWS)
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "aviation-tabs-runtime";

  runtime.innerHTML = `
    <section class="aviation-tabs-section">
      <div class="container aviation-tabs-wrap">

        <div class="aviation-tabs-scroll-wrap">
          <button class="aviation-tab-arrow left"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
</svg></button>

          <div class="aviation-tabs-scroll">
            <ul class="aviation-tabs-list"></ul>
          </div>

          <button class="aviation-tab-arrow right"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
</svg></button>
        </div>

        ${
          dropdownRows.length
            ? `
          <div class="aviation-dropdown">
            <button class="aviation-dropdown-btn">
              ${dropdownButtonText}
              <span class="chevron"></span>
            </button>
            <ul class="aviation-dropdown-menu"></ul>
          </div>
        `
            : ""
        }

      </div>
    </section>
  `;

  block.after(runtime);

  const tabsUL = runtime.querySelector(".aviation-tabs-list");
  const scrollContainer = runtime.querySelector(".aviation-tabs-scroll");
  const leftArrow = runtime.querySelector(".aviation-tab-arrow.left");
  const rightArrow = runtime.querySelector(".aviation-tab-arrow.right");
  const dropdownBtn = runtime.querySelector(".aviation-dropdown-btn");
  const dropdownMenu = runtime.querySelector(".aviation-dropdown-menu");

  /* ================================
     6️⃣ Build tabs
  ================================ */
  tabRows.forEach((row) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent?.trim();
    const link = cells[1]?.textContent?.trim();
    const isActive = cells[2]?.textContent?.trim() === "true";

    if (!label || !link) return;

    const li = document.createElement("li");

    if (isActive || cleanPath(link) === currentPath) {
      li.classList.add("active");
    }

    li.innerHTML = `<a href="${link}">${label}</a>`;
    tabsUL.appendChild(li);
  });

  /* ================================
   7️⃣ Scroll arrows + visibility control
================================ */
if (scrollContainer && leftArrow && rightArrow) {
  const scrollAmount = 200;

  const updateArrowVisibility = () => {
    const scrollLeft = scrollContainer.scrollLeft;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    /* hide both if no overflow */
    if (maxScroll <= 0) {
      leftArrow.style.display = "none";
      rightArrow.style.display = "none";
      return;
    }

    /* show/hide based on position */
    leftArrow.style.display = scrollLeft > 0 ? "flex" : "none";
    rightArrow.style.display = scrollLeft < maxScroll - 0 ? "flex" : "none";
  };

  leftArrow.addEventListener("click", () => {
    scrollContainer.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  });

  rightArrow.addEventListener("click", () => {
    scrollContainer.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  });

  scrollContainer.addEventListener("scroll", updateArrowVisibility);
  window.addEventListener("resize", updateArrowVisibility);

  setTimeout(updateArrowVisibility, 100);
}

  /* ================================
     8️⃣ Build dropdown
  ================================ */
  if (dropdownMenu && dropdownBtn) {
    dropdownRows.forEach((row) => {
      const cells = [...row.children];
      const text = cells[0]?.textContent?.trim();
      const url = cells[1]?.textContent?.trim();

      if (!text || !url) return;

      const li = document.createElement("li");
      li.innerHTML = `<a href="${url}">${text}</a>`;
      dropdownMenu.appendChild(li);
    });

    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dropdownMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!runtime.contains(e.target)) {
        dropdownMenu.classList.remove("open");
      }
    });
  }
}