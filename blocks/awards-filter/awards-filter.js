export default function decorate(block) {
  /* ================================
   GLOBAL STATE
================================ */

let CURRENT_YEAR = new Date().getFullYear().toString();

const state = {
  year: "",
  category: "all",
  tempYear: "",
  tempCategory: "all"
};
  console.log("Decorating Awards List block");

  const children = [...block.children];
  if (children.length < 5) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const allAwardsLabel = children[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle = children[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear = children[3]?.textContent?.trim() || "";
  const items = children.slice(4);

  /* ================================
     2️⃣ Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('awards-author-mode');
    const authorNote = document.createElement('div');
    authorNote.className = 'awards-author-note';
    authorNote.innerHTML = `
      <p><strong>🏆 Awards List Component</strong></p>
      <p><small>• Edit award items in the table below</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    return;
  }

  /* ================================
     3️⃣ Preserve authored content for Universal Editor (AEM SAFE)
     while hiding it visually for end users
  ================================ */

  // Create a wrapper to hide authored content visually but keep in DOM
  const authoredContentWrapper = document.createElement('div');
  authoredContentWrapper.className = 'awards-authored-content';
  authoredContentWrapper.setAttribute('aria-hidden', 'true');
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

  // Move all children to the hidden wrapper while preserving them in DOM
  while (block.firstChild) {
    authoredContentWrapper.appendChild(block.firstChild);
  }

  // Add the hidden wrapper back to the block
  block.appendChild(authoredContentWrapper);

  /* ================================
     4️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "awards-filter-runtime bg-gray";

  runtime.innerHTML = `
    <div class="container">
      <!-- Desktop Layout -->
      <div class="awards-layout desktop-layout">
        <aside class="awards-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <select class="year-filter">
            
          </select>
          <ul class="category-filter">
            <li data-category="all" class="active">${allAwardsLabel}</li>
          </ul>
        </aside>
        <div class="awards-list"></div>
      </div>

      <!-- Mobile Layout -->
      <div class="awards-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn year-btn" data-type="year">
            Year <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
          </button>
          <button class="mobile-filter-btn category-btn" data-type="category">
            Filter by <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
          </button>
        </div>
        <div class="awards-list"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Select Year</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="filter-group year-group" style="display: none;">
              <label><input type="radio" name="year" value="" checked> All Years</label>
            </div>
            <div class="filter-group category-group" style="display: none;">
              <label><input type="radio" name="category" value="all" checked> ${allAwardsLabel}</label>
            </div>
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
  const desktopList = runtime.querySelector('.desktop-layout .awards-list');
  const mobileList = runtime.querySelector('.mobile-layout .awards-list');
  const yearSelectDesktop = runtime.querySelector('.year-filter');
  const categoryListDesktop = runtime.querySelector('.category-filter');
  const yearFilterBtn = runtime.querySelector('.year-btn');
  const categoryFilterBtn = runtime.querySelector('.category-btn');
  const mobileModal = runtime.querySelector('.mobile-filter-modal');
  const modalOverlay = runtime.querySelector('.mobile-filter-overlay');
  const modalHeader = runtime.querySelector('.modal-header');
  const yearGroup = runtime.querySelector('.year-group');
  const categoryGroup = runtime.querySelector('.category-group');
  const applyButton = runtime.querySelector('.apply-btn');
  const closeModalBtn = runtime.querySelector('.close-modal');

  /* ================================
     6️⃣ Create No Awards Message Elements
  ================================ */
  const createNoAwardsMessage = () => {
    const noAwardsCard = document.createElement('div');
    noAwardsCard.className = 'award-card no-awards-message';
    noAwardsCard.style.display = 'none';
    noAwardsCard.innerHTML = `
      <div class="award-content text-center">
        <div class="no-results-icon">
          <img src="../icons/search-no-result.svg" alt="No results" loading="eager">
        </div>
        <h3 class="mb-0">No Awards Found</h3>
      </div>
    `;
    return noAwardsCard;
  };

  const desktopNoAwardsMsg = createNoAwardsMessage();
  const mobileNoAwardsMsg = createNoAwardsMessage();
  
  desktopList.appendChild(desktopNoAwardsMsg);
  mobileList.appendChild(mobileNoAwardsMsg);

  /* ================================
     7️⃣ Data Collection & Card Building
  ================================ */
  const years = new Set();
  const categories = new Set();
  const cardsDesktop = [];
  const cardsMobile = [];

  // Use the items from the authored content wrapper
  const authoredItems = [...authoredContentWrapper.children]
  .slice(4)
  .sort((a, b) => {
    const yearA = a.children[1]?.textContent?.trim() || "0";
    const yearB = b.children[1]?.textContent?.trim() || "0";
    return parseInt(yearB, 10) - parseInt(yearA, 10); // latest year first
  });

  authoredItems.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";
    let imageEl = null;
    if (cols[2]) imageEl = cols[2].querySelector("img") || cols[2].querySelector("picture");
    const title = cols[3]?.textContent?.trim() || "";
    const description = cols[4]?.innerHTML?.trim() || "";

    if (!category && !year && !title && !description && !imageEl) return;

    if (year) years.add(year);
    if (category) categories.add(category);

    const createCard = () => {
      const card = document.createElement("article");
      card.className = "award-card";
      card.dataset.year = year;
      card.dataset.category = category;

      if (imageEl) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "award-img";

        // Function to extract image URL from various elements
        const extractImageUrl = (imgElement) => {
          if (imgElement.tagName === 'IMG') {
            return imgElement.src;
          } else if (imgElement.tagName === 'PICTURE') {
            // Try to get image from picture element
            const img = imgElement.querySelector('img');
            return img ? img.src : '';
          } else if (imgElement.tagName === 'DIV' && imgElement.style.backgroundImage) {
            // Handle background images if needed
            const bg = imgElement.style.backgroundImage;
            const urlMatch = bg.match(/url\(['"]?(.*?)['"]?\)/);
            return urlMatch ? urlMatch[1] : '';
          }
          return '';
        };

        const imageUrl = extractImageUrl(imageEl);

        if (imageUrl) {
          // Create a clean img tag with just the URL
          const newImg = document.createElement('img');
          newImg.src = imageUrl;

          // Copy important attributes if they exist
          if (imageEl.alt) newImg.alt = imageEl.alt;
          if (imageEl.title) newImg.title = imageEl.title;
          if (imageEl.width) newImg.width = imageEl.width;
          if (imageEl.height) newImg.height = imageEl.height;

          // Add lazy loading
          newImg.loading = "lazy";

          imgWrap.appendChild(newImg);
        } else {
          // Fallback: clone the original if no URL found
          const clonedImg = imageEl.cloneNode(true);
          imgWrap.appendChild(clonedImg);
        }

        card.appendChild(imgWrap);
      }

      const content = document.createElement("div");
      content.className = "award-content";

      if (title) {
        const titleEl = document.createElement("h3");
        titleEl.textContent = title;
        content.appendChild(titleEl);
      }

      if (description) {
        const temp = document.createElement("div");
        temp.innerHTML = description;

        let p = temp.querySelector("p");
        if (!p) {
          p = document.createElement("p");
          p.textContent = description;
        }

        p.classList.add("award-description");
        content.appendChild(p);
      }

      card.appendChild(content);
      return card;
    };

    const cardDesktop = createCard();
    const cardMobile = createCard();

    desktopList.appendChild(cardDesktop);
    mobileList.appendChild(cardMobile);

    cardsDesktop.push(cardDesktop);
    cardsMobile.push(cardMobile);
  });

  /* ================================
     8️⃣ Populate Filters
  ================================ */
  // Use current year if available, otherwise latest available year
const sortedYears = Array.from(years)
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

// Use current year if exists, otherwise use latest available
if (!sortedYears.includes(CURRENT_YEAR)) {
  CURRENT_YEAR = sortedYears[0] || "";
}

// set initial state
state.year = CURRENT_YEAR;
state.tempYear = CURRENT_YEAR;

const sortedCategories = Array.from(categories).sort();

  // Desktop Year Filter
  sortedYears.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === CURRENT_YEAR || y === defaultYear) opt.selected = true;
    yearSelectDesktop.appendChild(opt);
  });

  // Desktop Category Filter
  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryListDesktop.appendChild(li);
  });

  // Mobile Year Filter
  sortedYears.forEach(y => {
    const label = document.createElement("label");
    label.innerHTML = `
  <input type="radio" name="year" value="${y}" id="year-${y}" 
  ${y === CURRENT_YEAR ? "checked" : ""}> ${y}
`;
    yearGroup.appendChild(label);
  });

  // Mobile Category Filter
  sortedCategories.forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="category" value="${cat}" id="category-${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    categoryGroup.appendChild(label);
  });

 

  /* ================================
     🔟 Filter Functions
  ================================ */
  function checkAndShowNoAwardsMessage(messageElement, cards) {
    const visibleCards = cards.filter(card => card.style.display !== "none");
    
    if (visibleCards.length === 0) {
      messageElement.style.display = "block";
    } else {
      messageElement.style.display = "none";
    }
  }

  function applyFilter(yearVal, catVal, cards, messageElement) {
    state.year = yearVal;
    state.category = catVal;

    cards.forEach(card => {
      const yearMatch = !yearVal || card.dataset.year === yearVal;
      const catMatch = catVal === "all" || card.dataset.category === catVal;
      card.style.display = yearMatch && catMatch ? "" : "none";
    });

    // Check if any awards are visible
    checkAndShowNoAwardsMessage(messageElement, cards);
    updateButtonText();
  }

  function updateButtonText() {
    // Update Year button text
    const yearText = state.year || "Year";
    yearFilterBtn.innerHTML = `${yearText} <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;

    // Update Category button text
    const catText = state.category === "all" ?
      allAwardsLabel :
      state.category.charAt(0).toUpperCase() + state.category.slice(1);
    categoryFilterBtn.innerHTML = `Filter by - ${catText} <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;
  }

  function openModal(filterType) {
    mobileModal.classList.add("open");
    document.body.style.overflow = 'hidden';

    // Set temp filters to current state
    state.tempYear = state.year;
    state.tempCategory = state.category;

    // Update modal UI
    const modalTitle = modalHeader.querySelector('h3');
    if (filterType === 'year') {
      modalTitle.textContent = 'Filter by Year';
      yearGroup.style.display = 'block';
      categoryGroup.style.display = 'none';
    } else {
      modalTitle.textContent = 'Filter by Category';
      yearGroup.style.display = 'none';
      categoryGroup.style.display = 'block';
    }

    // Set active radio buttons
    if (filterType === 'year') {
      const yearRadio = yearGroup.querySelector(`input[name="year"][value="${state.tempYear}"]`);
      if (yearRadio) yearRadio.checked = true;
      else yearGroup.querySelector('input[name="year"][value=""]').checked = true;
    } else {
      const catRadio = categoryGroup.querySelector(`input[name="category"][value="${state.tempCategory}"]`);
      if (catRadio) catRadio.checked = true;
      else categoryGroup.querySelector('input[name="category"][value="all"]').checked = true;
    }

    // Update button states
    yearFilterBtn.classList.toggle('active', filterType === 'year');
    categoryFilterBtn.classList.toggle('active', filterType === 'category');
  }

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = '';
    yearFilterBtn.classList.remove('active');
    categoryFilterBtn.classList.remove('active');
  }

  /* ================================
     1️⃣1️⃣ Event Listeners
  ================================ */
  // Desktop Filters
  yearSelectDesktop.addEventListener("change", () => {
    const activeCat = categoryListDesktop.querySelector(".active")?.dataset.category || "all";
    applyFilter(yearSelectDesktop.value, activeCat, cardsDesktop, desktopNoAwardsMsg);
  });

  categoryListDesktop.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;

    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");

    applyFilter(yearSelectDesktop.value, e.target.dataset.category, cardsDesktop, desktopNoAwardsMsg);
  });

  // Mobile Filters
  yearFilterBtn.addEventListener("click", () => openModal('year'));
  categoryFilterBtn.addEventListener("click", () => openModal('category'));

  modalOverlay.addEventListener("click", closeModal);
  closeModalBtn.addEventListener('click', closeModal);

  // Mobile Radio Button Changes
  yearGroup.querySelectorAll('input[name="year"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempYear = radio.value;
    });
  });

  categoryGroup.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempCategory = radio.value;
    });
  });

  // Apply Button
  applyButton.addEventListener('click', () => {
    applyFilter(state.tempYear, state.tempCategory, cardsMobile, mobileNoAwardsMsg);
    closeModal();
  });

  // Escape Key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeModal();
    }
  });

  /* ================================
     1️⃣2️⃣ Initialize
  ================================ */
  // Check if there are any awards
  if (authoredItems.length === 0) {
    desktopNoAwardsMsg.style.display = "block";
    mobileNoAwardsMsg.style.display = "block";
  } else {
    // Set initial state (show all)
    applyFilter(state.year, "all", cardsDesktop, desktopNoAwardsMsg);
applyFilter(state.year, "all", cardsMobile, mobileNoAwardsMsg);
  }

  // Initialize desktop UI
  yearSelectDesktop.value = state.year;
  categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");

  console.log("Awards List block initialized");
}