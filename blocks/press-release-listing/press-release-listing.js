export default function decorate(block) {
  console.log("Decorating Press Release Listing block");

  const children = [...block.children];
  if (children.length < 5) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitle = children[0]?.textContent?.trim() || "All Releases";
  const allReleasesLabel = children[1]?.textContent?.trim() || "All";
  const filterPanelTitle = children[2]?.textContent?.trim() || "Filter by";
  const defaultYear = children[3]?.textContent?.trim() || "";
  const itemsPerPage = parseInt(children[4]?.textContent?.trim(), 10) || 10;
  const items = children.slice(5);

  /* ================================
     2️⃣ Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('press-listing-author-mode');
    const authorNote = document.createElement('div');
    authorNote.className = 'press-listing-author-note';
    authorNote.innerHTML = `
      <p><strong>📰 Press Release Listing Component</strong></p>
      <p><small>• Edit press release items in the table below</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    
    // Keep all children visible for authoring
    return;
  }

  /* ================================
     3️⃣ Helper functions
  ================================ */
  // Helper function to extract image URL
  const extractImageUrl = (imgElement) => {
    if (!imgElement) return '';
    if (imgElement.tagName === 'IMG') {
      return imgElement.src;
    } else if (imgElement.tagName === 'PICTURE') {
      const img = imgElement.querySelector('img');
      return img ? img.src : '';
    }
    return '';
  };

  // Helper function to parse date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    
    // Try ISO format first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // Try "01 Jan 2026" format
    const dateMatch = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
    if (dateMatch) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const day = parseInt(dateMatch[1], 10);
      const monthIndex = monthNames.indexOf(dateMatch[2].toLowerCase());
      const year = parseInt(dateMatch[3], 10);
      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }
    
    return new Date(0);
  };

  // Helper function to format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = parseDate(dateStr);
    if (isNaN(date.getTime()) || date.getTime() === 0) return dateStr;
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper function to create slug from title
  const createSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /* ================================
     4️⃣ Process items and separate featured post
  ================================ */
  const allCardsData = [];

  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    // Item structure: category, image, title, publishDate, lastUpdated, location, contactDetails, ctaLink (optional)
    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    let imageEl = null;
    if (cols[1]) imageEl = cols[1].querySelector("img") || cols[1].querySelector("picture");
    const title = cols[2]?.textContent?.trim() || "";
    const publishDate = cols[3]?.textContent?.trim() || "";
    const lastUpdated = cols[4]?.textContent?.trim() || "";
    const location = cols[5]?.textContent?.trim() || "";
    
    // Parse contact details from column 6 (JSON format)
    let contactDetails = [];
    if (cols[6]) {
      const contactDetailsText = cols[6]?.textContent?.trim() || "";
      if (contactDetailsText) {
        try {
          contactDetails = JSON.parse(contactDetailsText);
          if (!Array.isArray(contactDetails)) {
            contactDetails = [contactDetails];
          }
        } catch (e) {
          const lines = contactDetailsText.split(/\n|;/).filter(line => line.trim());
          contactDetails = lines.map(line => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 3) {
              return {
                name: parts[0],
                role: parts[1],
                email: parts[2]
              };
            } else if (parts.length === 2) {
              return {
                name: parts[0],
                role: '',
                email: parts[1]
              };
            }
            return null;
          }).filter(Boolean);
        }
      }
    }
    
    // Auto-generate ctaLink from category and title
    const linkColIndex = cols.length > 7 ? 7 : (cols.length > 6 ? 6 : 5);
    const providedLink = cols[linkColIndex]?.querySelector("a")?.href || cols[linkColIndex]?.textContent?.trim() || "";
    const categorySlug = createSlug(category) || 'general';
    const titleSlug = createSlug(title);
    const ctaLink = providedLink || `/press-releases/${categorySlug}/${titleSlug}`;

    if (!category && !title && !imageEl) return;

    // Extract month and year from publishDate
    let month = "";
    let extractedYear = "";
    const dateObj = parseDate(publishDate);
    if (dateObj && dateObj.getTime() > 0) {
      month = String(dateObj.getMonth() + 1).padStart(2, '0');
      extractedYear = String(dateObj.getFullYear());
    }

    const imageUrl = extractImageUrl(imageEl);

    allCardsData.push({
      category,
      year: extractedYear,
      month,
      imageUrl,
      title,
      publishDate: formatDate(publishDate),
      lastUpdated: formatDate(lastUpdated),
      location,
      contactDetails,
      ctaLink,
      dateObj: dateObj,
      rawPublishDate: publishDate
    });
  });

  // Sort all cards by date to find the latest post for featured section
  const sortedByDate = [...allCardsData].sort((a, b) => b.dateObj - a.dateObj);
  const featuredCardData = sortedByDate.length > 0 ? sortedByDate[0] : null;
  
  // Create array for listing (EXCLUDING the featured post)
  const listingCardsData = featuredCardData 
    ? allCardsData.filter(card => card.title !== featuredCardData.title || card.dateObj.getTime() !== featuredCardData.dateObj.getTime())
    : [...allCardsData];

  // Extract years and categories from LISTING cards only (excluding featured)
  const years = new Set();
  const categories = new Set();
  
  listingCardsData.forEach(card => {
    if (card.year) years.add(card.year);
    if (card.category) categories.add(card.category);
  });

  /* ================================
     5️⃣ Create featured section HTML (if we have a featured post)
  ================================ */
  let featuredSectionHTML = '';
  if (featuredCardData) {
    const badgeClass = featuredCardData.category ? featuredCardData.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') : '';
    
    featuredSectionHTML = `
      <section class="press-release-featured-runtime">
        <div class="featured-wrapper">
          <div class="featured-content">
            <span class="featured-label">LATEST PRESS UPDATE</span>
            <h1 class="featured-title">${featuredCardData.title}</h1>
            <div class="featured-description">
              ${featuredCardData.location || `<p>${featuredCardData.title}</p>`}
            </div>
            
            <div class="featured-meta">
              ${badgeClass ? `<span class="badge ${badgeClass}">${featuredCardData.category.charAt(0).toUpperCase() + featuredCardData.category.slice(1)}</span>` : ''}
              ${badgeClass && featuredCardData.publishDate ? '<span class="meta-separator">|</span>' : ''}
              ${featuredCardData.publishDate ? `
                <span class="meta-date">
                  <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="#333333" stroke-width="1.5"/>
                  <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  ${featuredCardData.publishDate}
                </span>
              ` : ''}
              ${featuredCardData.lastUpdated && featuredCardData.lastUpdated !== featuredCardData.publishDate ? `
                <span class="meta-separator">|</span>
                <span class="meta-updated">
                  <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="#333333" stroke-width="1.5"/>
                  <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  Last Updated : ${featuredCardData.lastUpdated}
                </span>
              ` : ''}
            </div>

            <a href="${featuredCardData.ctaLink}" class="btn-link">
              READ MORE
            </a>
          </div>

          <div class="featured-image">
            ${featuredCardData.imageUrl ? `<img src="${featuredCardData.imageUrl}" alt="${featuredCardData.title}" loading="eager">` : ''}
          </div>
        </div>
      </section>
    `;
  }

  /* ================================
     6️⃣ Preserve authored content for Universal Editor (AEM SAFE)
  ================================ */
  const authoredContentWrapper = document.createElement('div');
  authoredContentWrapper.className = 'press-listing-authored-content';
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

  // Move all original children to the hidden wrapper
  while (block.firstChild) {
    authoredContentWrapper.appendChild(block.firstChild);
  }

  // Add the hidden wrapper back to the block
  block.appendChild(authoredContentWrapper);

  /* ================================
     7️⃣ Create the listing section (USING listingCardsData - WITHOUT featured post)
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "press-listing-runtime bg-gray";

  runtime.innerHTML = `
    <div class="container">
      <!-- Desktop Layout -->
      <div class="press-layout desktop-layout">
        <aside class="press-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle active" data-target="year-options">
              <span>Year - <span class="selected-year">${defaultYear || new Date().getFullYear()}</span></span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options" id="year-options">
              <label class="filter-option">
                <input type="radio" name="desktop-year" value="">
                <span>All Years</span>
              </label>
            </div>
          </div>
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="month-options">
              <span>Month</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="month-options">
              <label class="filter-option">
                <input type="radio" name="desktop-month" value="" checked>
                <span>All Months</span>
              </label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="01"><span>January</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="02"><span>February</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="03"><span>March</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="04"><span>April</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="05"><span>May</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="06"><span>June</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="07"><span>July</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="08"><span>August</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="09"><span>September</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="10"><span>October</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="11"><span>November</span></label>
              <label class="filter-option"><input type="radio" name="desktop-month" value="12"><span>December</span></label>
            </div>
          </div>
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="category-options">
              <span>Business Categories</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="category-options">
              <label class="filter-option active" data-category="all">
                <input type="radio" name="desktop-category" value="all" checked>
                <span>${allReleasesLabel}</span>
                <svg class="icon-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </label>
            </div>
          </div>
        </aside>
        <div class="press-main">
          <div class="press-header">
            <div class="press-header-info">
              <h2 class="press-title">${sectionTitle} - <span class="year-display">${defaultYear || new Date().getFullYear()}</span></h2>
              <p class="press-count">Displaying <span class="count-display">0</span></p>
            </div>
            <div class="press-sort">
              <div class="sort-dropdown">
                <button class="sort-toggle" id="sort-toggle">
                  <span>Sort by</span>
                  <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div class="sort-options" id="sort-options">
                  <label class="sort-option">
                    <span>Newest First</span>
                    <input type="radio" name="sort" value="newest" checked>
                  </label>
                  <label class="sort-option">
                    <span>Oldest First</span>
                    <input type="radio" name="sort" value="oldest">
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="press-list"></div>
          <div class="press-pagination"></div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="press-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn year-btn" data-type="year">
            Year <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
          </button>
          <button class="mobile-filter-btn category-btn" data-type="category">
            Filter by <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
          </button>
        </div>
        <div class="press-list"></div>
        <div class="press-pagination"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Select Filter</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="filter-group year-group" style="display: none;">
              <label><input type="radio" name="year" value="" checked> All Years</label>
            </div>
            <div class="filter-group month-group" style="display: none;">
              <label><input type="radio" name="month" value="" checked> All Months</label>
              <label><input type="radio" name="month" value="01"> January</label>
              <label><input type="radio" name="month" value="02"> February</label>
              <label><input type="radio" name="month" value="03"> March</label>
              <label><input type="radio" name="month" value="04"> April</label>
              <label><input type="radio" name="month" value="05"> May</label>
              <label><input type="radio" name="month" value="06"> June</label>
              <label><input type="radio" name="month" value="07"> July</label>
              <label><input type="radio" name="month" value="08"> August</label>
              <label><input type="radio" name="month" value="09"> September</label>
              <label><input type="radio" name="month" value="10"> October</label>
              <label><input type="radio" name="month" value="11"> November</label>
              <label><input type="radio" name="month" value="12"> December</label>
            </div>
            <div class="filter-group category-group" style="display: none;">
              <label><input type="radio" name="category" value="all" checked> ${allReleasesLabel}</label>
            </div>
            <div class="apply-filter-btn">
              <button class="apply-btn">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ================================
     8️⃣ Append featured section first, then listing section, then authored content wrapper
  ================================ */
  // Clear the block first (but keep the authored wrapper)
  const tempDiv = document.createElement('div');
  while (block.firstChild) {
    if (block.firstChild !== authoredContentWrapper) {
      tempDiv.appendChild(block.firstChild);
    } else {
      block.firstChild.remove();
    }
  }
  
  // Add featured section if exists
  if (featuredSectionHTML) {
    const featuredSection = document.createElement('div');
    featuredSection.innerHTML = featuredSectionHTML;
    block.appendChild(featuredSection);
  }
  
  // Add the listing section
  block.appendChild(runtime);
  
  // Add the authored content wrapper back (for Universal Editor)
  block.appendChild(authoredContentWrapper);

  /* ================================
     9️⃣ DOM References
  ================================ */
  const desktopList = runtime.querySelector('.desktop-layout .press-list');
  const mobileList = runtime.querySelector('.mobile-layout .press-list');
  const desktopPagination = runtime.querySelector('.desktop-layout .press-pagination');
  const mobilePagination = runtime.querySelector('.mobile-layout .press-pagination');
  const yearFilterToggle = runtime.querySelector('[data-target="year-options"]');
  const monthFilterToggle = runtime.querySelector('[data-target="month-options"]');
  const categoryFilterToggle = runtime.querySelector('[data-target="category-options"]');
  const yearOptionsDesktop = runtime.querySelector('#year-options');
  const monthOptionsDesktop = runtime.querySelector('#month-options');
  const categoryOptionsDesktop = runtime.querySelector('#category-options');
  const sortToggle = runtime.querySelector('#sort-toggle');
  const sortOptions = runtime.querySelector('#sort-options');
  const yearFilterBtn = runtime.querySelector('.year-btn');
  const categoryFilterBtn = runtime.querySelector('.category-btn');
  const mobileModal = runtime.querySelector('.mobile-filter-modal');
  const modalOverlay = runtime.querySelector('.mobile-filter-overlay');
  const modalHeader = runtime.querySelector('.modal-header');
  const yearGroup = runtime.querySelector('.year-group');
  const monthGroup = runtime.querySelector('.month-group');
  const categoryGroup = runtime.querySelector('.mobile-filter-content .category-group');
  const applyButton = runtime.querySelector('.apply-btn');
  const closeModalBtn = runtime.querySelector('.close-modal');
  const countDisplay = runtime.querySelector('.count-display');
  const yearDisplay = runtime.querySelector('.year-display');
  const selectedYearDisplay = runtime.querySelector('.selected-year');

  /* ================================
     1️⃣0️⃣ Populate Filters (using listingCardsData only)
  ================================ */
  const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const sortedCategories = Array.from(categories).sort();

  // Desktop Year Filter
  sortedYears.forEach(y => {
    const label = document.createElement("label");
    label.className = "filter-option";
    label.innerHTML = `<input type="radio" name="desktop-year" value="${y}" ${y === defaultYear ? 'checked' : ''}><span>${y}</span>`;
    yearOptionsDesktop.appendChild(label);
  });

  // Desktop Category Filter
  sortedCategories.forEach(cat => {
    const label = document.createElement("label");
    label.className = "filter-option";
    label.dataset.category = cat;
    label.innerHTML = `<input type="radio" name="desktop-category" value="${cat}"><span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`;
    categoryOptionsDesktop.appendChild(label);
  });

  // Mobile Year Filter
  sortedYears.forEach(y => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="year" value="${y}" id="year-${y}"> ${y}`;
    yearGroup.appendChild(label);
  });

  // Mobile Category Filter
  sortedCategories.forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="category" value="${cat}" id="category-${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    categoryGroup.appendChild(label);
  });

  /* ================================
     1️⃣1️⃣ State Management
  ================================ */
  const state = {
    year: "",
    month: "",
    category: "all",
    sort: "newest",
    currentPage: 1,
    tempYear: "",
    tempMonth: "",
    tempCategory: "all"
  };

  /* ================================
     1️⃣2️⃣ Create Card HTML
  ================================ */
  function createCardHTML(cardData) {
    const badgeClass = cardData.category.replace(/\s+/g, '-').replace(/&/g, '');
    return `
      <article class="press-card" data-year="${cardData.year}" data-month="${cardData.month}" data-category="${cardData.category}">
        <div class="press-card-image">
          ${cardData.imageUrl ? `<img src="${cardData.imageUrl}" alt="${cardData.title}" loading="lazy">` : ''}
        </div>
        <div class="press-card-body">
          <h3 class="press-card-title"><a href="${cardData.ctaLink}">${cardData.title}</a></h3>
          <div class="press-card-meta">
            ${cardData.category ? `<span class="badge ${badgeClass}">${cardData.category.charAt(0).toUpperCase() + cardData.category.slice(1)}</span>` : ''}
            ${cardData.category ? '<span class="meta-separator">|</span>' : ''}
            ${cardData.publishDate ? `
              <span class="meta-date">
                <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="#333333" stroke-width="1.5"/>
                <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                ${cardData.publishDate}
              </span>
            ` : ''}
          </div>
          <div class="press-card-footer">
            <a href="${cardData.ctaLink}" class="btn-link">
              READ MORE
            </a>
            ${cardData.lastUpdated ? `<span class="meta-updated">Last Updated : ${cardData.lastUpdated}</span>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  /* ================================
     1️⃣3️⃣ Filter, Sort & Pagination Functions (using listingCardsData only)
  ================================ */
  function getFilteredAndSortedCards() {
    let filtered = listingCardsData.filter(card => {
      const yearMatch = !state.year || card.year === state.year;
      const monthMatch = !state.month || card.month === state.month;
      const catMatch = state.category === "all" || card.category === state.category;
      return yearMatch && monthMatch && catMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      if (state.sort === "newest") {
        return b.dateObj - a.dateObj;
      } else {
        return a.dateObj - b.dateObj;
      }
    });

    return filtered;
  }

  function renderCards(listEl, paginationEl, filtered) {
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (state.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const pageItems = filtered.slice(startIndex, endIndex);

    // Render cards
    listEl.innerHTML = pageItems.map(card => createCardHTML(card)).join('');

    // Update count display
    if (totalItems > 0) {
      countDisplay.textContent = `${startIndex + 1} - ${endIndex} of ${totalItems}`;
    } else {
      countDisplay.textContent = '0';
    }

    // Render pagination
    renderPagination(paginationEl, totalPages);
  }

  function renderPagination(paginationEl, totalPages) {
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    let html = `
      <button class="page-btn prev ${state.currentPage === 1 ? 'disabled' : ''}" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''}>
<svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M26.6667 16H5.33335M5.33335 16L13.3334 8M5.33335 16L13.3334 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M26.6667 16H5.33335M5.33335 16L13.3334 8M5.33335 16L13.3334 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
      </button>
    `;

    if (startPage > 1) {
      html += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span class="page-ellipsis">...</span>`;
      html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `
      <button class="page-btn next ${state.currentPage === totalPages ? 'disabled' : ''}" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? 'disabled' : ''}>
<svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.33334 16H26.6667M26.6667 16L18.6667 8M26.6667 16L18.6667 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.33334 16H26.6667M26.6667 16L18.6667 8M26.6667 16L18.6667 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
      </button>
    `;

    paginationEl.innerHTML = html;
  }

  function applyFiltersAndRender() {
    const filtered = getFilteredAndSortedCards();
    
    // Update year display
    yearDisplay.textContent = state.year || "All Years";
    selectedYearDisplay.textContent = state.year || "All";

    // Render for desktop
    renderCards(desktopList, desktopPagination, filtered);
    
    // Render for mobile
    renderCards(mobileList, mobilePagination, filtered);

    updateButtonText();
  }

  function updateButtonText() {
    // Update Year button text
    const yearText = state.year || "Year";
    yearFilterBtn.innerHTML = `${yearText} <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;

    // Update Category button text
    const catText = state.category === "all" ?
      allReleasesLabel :
      state.category.charAt(0).toUpperCase() + state.category.slice(1);
    categoryFilterBtn.innerHTML = `Filter by - ${catText} <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;
  }

  /* ================================
     1️⃣4️⃣ Modal Functions
  ================================ */
  function openModal(filterType) {
    mobileModal.classList.add("open");
    document.body.style.overflow = 'hidden';

    // Set temp filters to current state
    state.tempYear = state.year;
    state.tempMonth = state.month;
    state.tempCategory = state.category;

    // Update modal UI
    const modalTitle = modalHeader.querySelector('h3');
    if (filterType === 'year') {
      modalTitle.textContent = 'Filter by Year & Month';
      yearGroup.style.display = 'block';
      monthGroup.style.display = 'block';
      categoryGroup.style.display = 'none';
    } else {
      modalTitle.textContent = 'Filter by Category';
      yearGroup.style.display = 'none';
      monthGroup.style.display = 'none';
      categoryGroup.style.display = 'block';
    }

    // Set active radio buttons
    if (filterType === 'year') {
      const yearRadio = yearGroup.querySelector(`input[name="year"][value="${state.tempYear}"]`);
      if (yearRadio) yearRadio.checked = true;
      else yearGroup.querySelector('input[name="year"][value=""]').checked = true;
      
      const monthRadio = monthGroup.querySelector(`input[name="month"][value="${state.tempMonth}"]`);
      if (monthRadio) monthRadio.checked = true;
      else monthGroup.querySelector('input[name="month"][value=""]').checked = true;
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
     1️⃣5️⃣ Event Listeners
  ================================ */
  // Desktop Filter Toggles
  runtime.querySelectorAll('.filter-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const options = runtime.querySelector(`#${targetId}`);
      toggle.classList.toggle('active');
      options.classList.toggle('hidden');
    });
  });

  // Desktop Year Filter
  yearOptionsDesktop.querySelectorAll('input[name="desktop-year"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.year = radio.value;
      state.currentPage = 1;
      
      // Update active state
      yearOptionsDesktop.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
      radio.closest('.filter-option').classList.add('active');
      
      applyFiltersAndRender();
    });
  });

  // Desktop Month Filter
  monthOptionsDesktop.querySelectorAll('input[name="desktop-month"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.month = radio.value;
      state.currentPage = 1;
      
      // Update active state
      monthOptionsDesktop.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
      radio.closest('.filter-option').classList.add('active');
      
      applyFiltersAndRender();
    });
  });

  // Desktop Category Filter
  categoryOptionsDesktop.querySelectorAll('input[name="desktop-category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.category = radio.value;
      state.currentPage = 1;
      
      // Update active state with arrow
      categoryOptionsDesktop.querySelectorAll('.filter-option').forEach(opt => {
        opt.classList.remove('active');
        const arrow = opt.querySelector('.icon-arrow');
        if (arrow) arrow.remove();
      });
      const label = radio.closest('.filter-option');
      label.classList.add('active');
      label.insertAdjacentHTML('beforeend', '<svg class="icon-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      
      applyFiltersAndRender();
    });
  });

  // Sort Toggle
  sortToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sortOptions.classList.toggle('show');
    sortToggle.classList.toggle('active');
  });

  // Close sort dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!sortToggle.contains(e.target) && !sortOptions.contains(e.target)) {
      sortOptions.classList.remove('show');
      sortToggle.classList.remove('active');
    }
  });

  // Sort Options
  sortOptions.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.sort = radio.value;
      state.currentPage = 1;
      sortOptions.classList.remove('show');
      sortToggle.classList.remove('active');
      applyFiltersAndRender();
    });
  });

  // Pagination Click Handler (Desktop)
  desktopPagination.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-btn');
    if (btn && !btn.disabled && !btn.classList.contains('disabled')) {
      state.currentPage = parseInt(btn.dataset.page, 10);
      applyFiltersAndRender();
      runtime.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Pagination Click Handler (Mobile)
  mobilePagination.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-btn');
    if (btn && !btn.disabled && !btn.classList.contains('disabled')) {
      state.currentPage = parseInt(btn.dataset.page, 10);
      applyFiltersAndRender();
      runtime.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  monthGroup.querySelectorAll('input[name="month"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempMonth = radio.value;
    });
  });

  categoryGroup.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempCategory = radio.value;
    });
  });

  // Apply Button (Mobile)
  applyButton.addEventListener('click', () => {
    state.year = state.tempYear;
    state.month = state.tempMonth;
    state.category = state.tempCategory;
    state.currentPage = 1;
    closeModal();
    applyFiltersAndRender();
  });

  // Escape Key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeModal();
    }
  });

  /* ================================
     1️⃣6️⃣ Initialize
  ================================ */
  // Set initial year if default provided
  const allYearRadio = yearOptionsDesktop.querySelector(
  'input[name="desktop-year"][value=""]'
);
if (allYearRadio) {
  allYearRadio.checked = true;
  allYearRadio.closest('.filter-option').classList.add('active');
}

  applyFiltersAndRender();

  console.log("Press Release Listing block initialized with featured post excluded from listing");
}