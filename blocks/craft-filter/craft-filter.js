export default function decorate(block) {
  console.log("Decorating Craft List block");

  const children = [...block.children];
  if (children.length < 3) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitle = children[0]?.textContent?.trim() || "Our Crafts";
  const filterPanelTitle =
    children[1]?.textContent?.trim() || "Filter by Category";

  /* ================================
     2️⃣ Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode =
    document.body.classList.contains("universal-editor-edit") ||
    document.body.classList.contains("aem-AuthorLayer-Edit") ||
    window.location.href.includes("/editor.html");

  if (isAuthorMode) {
    block.classList.add("craft-author-mode");
    return;
  }

  /* ================================
     3️⃣ Preserve authored content
  ================================ */
  const authoredContentWrapper = document.createElement("div");
  authoredContentWrapper.className = "craft-authored-content";
  authoredContentWrapper.setAttribute("aria-hidden", "true");
  authoredContentWrapper.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  `;

  while (block.firstChild) {
    authoredContentWrapper.appendChild(block.firstChild);
  }

  block.appendChild(authoredContentWrapper);

  /* ================================
     4️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "craft-filter-runtime bg-gray spacer";

  runtime.innerHTML = `
    <div class="container">

      <!-- Desktop Layout -->
      <div class="craft-layout desktop-layout">
        <aside class="craft-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <ul class="category-filter"></ul>
        </aside>
        <div class="craft-list"></div>
      </div>

      <!-- Mobile Layout -->
      <div class="craft-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn category-btn">
            Filter by Category <span class="arrow">▼</span>
          </button>
        </div>

        <div class="craft-list"></div>

        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Filter by Category</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="filter-group category-group"></div>
            <div class="apply-filter-btn">
              <button class="apply-btn">Apply</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  block.appendChild(runtime);

  /* ================================
     5️⃣ DOM References
  ================================ */
  const desktopList = runtime.querySelector(".desktop-layout .craft-list");
  const mobileList = runtime.querySelector(".mobile-layout .craft-list");
  const categoryListDesktop = runtime.querySelector(".category-filter");
  const categoryFilterBtn = runtime.querySelector(".category-btn");
  const mobileModal = runtime.querySelector(".mobile-filter-modal");
  const modalOverlay = runtime.querySelector(".mobile-filter-overlay");
  const categoryGroup = runtime.querySelector(".category-group");
  const applyButton = runtime.querySelector(".apply-btn");
  const closeModalBtn = runtime.querySelector(".close-modal");

  /* ================================
     6️⃣ Data Collection
  ================================ */
  const categoryMapping = {
    "shopping-bags": "Shopping Bags",
    "lunch-bags": "Lunch Bags",
    "sling-bags": "Sling Bags and Purses",
    "home-decor": "Home Decor",
    "office-supplies": "Office Supplies",
  };

  const categories = new Map();
  const cardsDesktop = [];
  const cardsMobile = [];

  const authoredItems = [...authoredContentWrapper.children].slice(2);

  authoredItems.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const categorySlug = cols[0]?.textContent?.trim().toLowerCase() || "";
    const image = cols[1]?.querySelector("img, picture");

    const getText = (col) =>
      col?.querySelector("p")?.textContent?.trim() || col?.textContent?.trim() || "";

    let titleText = "";
    let descHTML = "";
    let link = "";

    if (cols.length >= 5) {
      titleText = getText(cols[2]);
      descHTML = cols[3]?.innerHTML?.trim() || "";
      link = cols[4]?.textContent?.trim() || "";
    }

    if (!categorySlug) return;

    const categoryName =
      categoryMapping[categorySlug] ||
      categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

    categories.set(categorySlug, categoryName);

    const createCard = () => {
      const card = document.createElement("article");
      card.className = "craft-card";
      card.dataset.category = categorySlug;

      if (image) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "craft-img";
        imgWrap.appendChild(image.cloneNode(true));
        card.appendChild(imgWrap);
      }

      const content = document.createElement("div");
      content.className = "craft-content";

      if (titleText) {
        const h3 = document.createElement("h3");
        h3.textContent = titleText;
        content.appendChild(h3);
      }

      if (descHTML) {
        const p = document.createElement("p");
        p.className = "craft-description";
        const temp = document.createElement("div");
        temp.innerHTML = descHTML;
        p.textContent = temp.textContent.trim();
        content.appendChild(p);
      }

      if (link) {
        content.innerHTML += `
          <div class="craft-link">
            <a href="${link}" target="_blank" rel="noopener">Visit Website</a>
          </div>`;
      }

      card.appendChild(content);
      return card;
    };

    const d = createCard();
    const m = createCard();

    desktopList.appendChild(d);
    mobileList.appendChild(m);

    cardsDesktop.push(d);
    cardsMobile.push(m);
  });

  /* ================================
     7️⃣ Populate Filters
  ================================ */
  const sortedCategories = Array.from(categories.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  sortedCategories.forEach(([slug, name]) => {
    const li = document.createElement("li");
    li.dataset.category = slug;
    li.textContent = name;
    categoryListDesktop.appendChild(li);

    const label = document.createElement("label");
    label.innerHTML = `
      <input type="radio" name="category" value="${slug}"> ${name}
    `;
    categoryGroup.appendChild(label);
  });

  /* ================================
     8️⃣ State
  ================================ */
  const state = {
    category: "",
    tempCategory: "",
  };

  /* ================================
     9️⃣ Filter Logic
  ================================ */
  function filterByCategory(category, cards) {
    state.category = category;

    cards.forEach((card) => {
      card.style.display =
        card.dataset.category === category ? "" : "none";
    });

    updateButtonText();
  }

  function updateButtonText() {
    const text =
      categories.get(state.category) ||
      state.category.charAt(0).toUpperCase() + state.category.slice(1);

    categoryFilterBtn.innerHTML = `
      Filter by - ${text}
      <span class="arrow">▼</span>
    `;
  }

  function openModal() {
    mobileModal.classList.add("open");
    document.body.style.overflow = "hidden";
    state.tempCategory = state.category;

    const radio = categoryGroup.querySelector(
      `input[value="${state.tempCategory}"]`
    );
    if (radio) radio.checked = true;
  }

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ================================
     🔟 Events
  ================================ */
  categoryListDesktop.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    categoryListDesktop
      .querySelectorAll("li")
      .forEach((li) => li.classList.remove("active"));

    e.target.classList.add("active");
    filterByCategory(e.target.dataset.category, cardsDesktop);
  });

  categoryFilterBtn.addEventListener("click", openModal);
  modalOverlay.addEventListener("click", closeModal);
  closeModalBtn.addEventListener("click", closeModal);

  categoryGroup.addEventListener("change", (e) => {
    if (e.target.name === "category") {
      state.tempCategory = e.target.value;
    }
  });

  applyButton.addEventListener("click", () => {
    filterByCategory(state.tempCategory, cardsMobile);
    closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ================================
     1️⃣1️⃣ Initialize → First Category
  ================================ */
  const firstCategory = sortedCategories[0]?.[0];

  if (firstCategory) {
    state.category = firstCategory;
    state.tempCategory = firstCategory;

    filterByCategory(firstCategory, cardsDesktop);
    filterByCategory(firstCategory, cardsMobile);

    const firstLi = categoryListDesktop.querySelector(
      `li[data-category="${firstCategory}"]`
    );
    if (firstLi) firstLi.classList.add("active");
  }

  console.log("Craft List initialized");
}