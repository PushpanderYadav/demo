/**
 * Press Release Detail Block
 * Reads category and slug from URL and displays the press release content
 * URL format: /press-releases/{category}/{slug}
 * Data source: /press-releases/press-release-data.json (spreadsheet)
 */

export default async function decorate(block) {
  console.log("Decorating Press Release Detail block");

  // Read authored fields for fallback/config
  const children = [...block.children];
  const backLinkText = children[0]?.textContent?.trim() || "Back to Press Releases";
  const backLinkUrl = children[1]?.textContent?.trim() || "/press-releases";
  const dataSourceUrl = children[2]?.textContent?.trim() || "/press-releases/press-release-data.json";

  /* ================================
     Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('press-detail-author-mode');
    block.innerHTML = `
      <div class="press-detail-author-note">
        <p><strong>📰 Press Release Detail Component</strong></p>
        <p><small>• This block displays press release details based on URL</small></p>
        <p><small>• URL format: /press-releases/{category}/{slug}</small></p>
        <p><small>• Data source: ${dataSourceUrl}</small></p>
      </div>
    `;
    return;
  }

  // Clear block and show loading
  block.innerHTML = `
    <section class="press-release-detail-runtime">
      <div class="container">
        <div class="detail-loading">
          <div class="loading-spinner"></div>
          <p>Loading press release...</p>
        </div>
      </div>
    </section>
  `;

  /* ================================
     Parse URL to get category and slug
  ================================ */
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // Expected: ['press-releases', 'category', 'slug']
  
  let category = '';
  let slug = '';

  if (pathParts.length >= 3 && pathParts[0] === 'press-releases') {
    category = pathParts[1];
    slug = pathParts[2];
  } else if (pathParts.length >= 2) {
    // Fallback: /press-releases/slug
    category = '';
    slug = pathParts[pathParts.length - 1];
  }

  if (!slug) {
    block.innerHTML = `
      <section class="press-release-detail-runtime">
        <div class="container">
          <div class="detail-error">
            <h2>Press Release Not Found</h2>
            <p>The requested press release could not be found.</p>
            <a href="${backLinkUrl}" class="btn-back">${backLinkText}</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  /* ================================
     Fetch press release data
  ================================ */
  try {
    const response = await fetch(dataSourceUrl);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
    
    const data = await response.json();
    const pressReleases = data.data || data;

    // Find the press release by slug (and optionally category)
    const pressRelease = pressReleases.find(item => {
      const itemSlug = createSlug(item.title);
      const itemCategory = createSlug(item.category);
      
      if (category) {
        return itemSlug === slug && itemCategory === category;
      }
      return itemSlug === slug;
    });

    if (!pressRelease) {
      block.innerHTML = `
        <section class="press-release-detail-runtime">
          <div class="container">
            <div class="detail-error">
              <h2>Press Release Not Found</h2>
              <p>The requested press release could not be found.</p>
              <a href="${backLinkUrl}" class="btn-back">${backLinkText}</a>
            </div>
          </div>
        </section>
      `;
      return;
    }

    // Find previous and next press releases in the same category
    const { previousRelease, nextRelease } = findPreviousNextReleases(
      pressReleases,
      pressRelease,
      category
    );

    // Render the press release
    renderPressRelease(block, pressRelease, backLinkUrl, backLinkText, previousRelease, nextRelease);

  } catch (error) {
    console.error('Error loading press release:', error);
    block.innerHTML = `
      <section class="press-release-detail-runtime">
        <div class="container">
          <div class="detail-error">
            <h2>Error Loading Press Release</h2>
            <p>There was an error loading the press release. Please try again later.</p>
            <a href="${backLinkUrl}" class="btn-back">${backLinkText}</a>
          </div>
        </div>
      </section>
    `;
  }
}

/**
 * Create URL-friendly slug from text
 */
function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format date to readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  // If already formatted like "01 Jan 2026", return as is
  if (/^\d{1,2}\s+\w{3}\s+\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  // Try to parse and format
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Parse date for sorting
 */
function parseDateForSort(dateStr) {
  if (!dateStr) return new Date(0);
  // If already formatted like "01 Jan 2026"
  if (/^\d{1,2}\s+\w{3}\s+\d{4}$/.test(dateStr)) {
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
  }
  // Try to parse as ISO date
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date(0) : date;
}

/**
 * Find previous and next press releases in the same category
 */
function findPreviousNextReleases(allReleases, currentRelease, currentCategory) {
  if (!allReleases || !Array.isArray(allReleases) || allReleases.length === 0) {
    return { previousRelease: null, nextRelease: null };
  }

  // Filter releases by same category
  const currentCategorySlug = createSlug(currentRelease.category || currentCategory);
  const sameCategoryReleases = allReleases.filter(item => {
    const itemCategorySlug = createSlug(item.category);
    return itemCategorySlug === currentCategorySlug;
  });

  if (sameCategoryReleases.length <= 1) {
    return { previousRelease: null, nextRelease: null };
  }

  // Sort by publish date (newest first)
  sameCategoryReleases.sort((a, b) => {
    const dateA = parseDateForSort(a.publishDate || a.lastUpdated || '');
    const dateB = parseDateForSort(b.publishDate || b.lastUpdated || '');
    return dateB.getTime() - dateA.getTime();
  });

  // Find current release index
  const currentSlug = createSlug(currentRelease.title);
  const currentIndex = sameCategoryReleases.findIndex(item => {
    const itemSlug = createSlug(item.title);
    return itemSlug === currentSlug;
  });

  if (currentIndex === -1) {
    return { previousRelease: null, nextRelease: null };
  }

  // Get previous and next
  const previousRelease = currentIndex > 0 ? sameCategoryReleases[currentIndex - 1] : null;
  const nextRelease = currentIndex < sameCategoryReleases.length - 1 ? sameCategoryReleases[currentIndex + 1] : null;

  return { previousRelease, nextRelease };
}

/**
 * Generate URL for a press release
 */
function generatePressReleaseUrl(pr) {
  if (!pr) return '';
  const categorySlug = createSlug(pr.category) || 'general';
  const titleSlug = createSlug(pr.title);
  return `/press-releases/${categorySlug}/${titleSlug}`;
}

/**
 * Build breadcrumb navigation
 */
function buildBreadcrumb(category, title) {
  const homeUrl = window.location.origin + '/';
  const pressReleasesUrl = '/press-releases';
  const categoryUrl = category ? `/press-releases/${createSlug(category)}` : pressReleasesUrl;
  
  const crumbs = [
    { title: 'Home', url: homeUrl },
    { title: 'News & Insights', url: null },
    { title: 'Press Releases', url: pressReleasesUrl }
  ];
  
  if (category) {
    crumbs.push({ title: category, url: categoryUrl });
  }
  
  crumbs.push({ title: title, url: null });
  
  return `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol class="breadcrumb">
        ${crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          if (isLast || !crumb.url) {
            return `<li class="breadcrumb-item" ${isLast ? 'aria-current="page"' : ''}>${crumb.title}</li>`;
          }
          return `<li class="breadcrumb-item"><a href="${crumb.url}">${crumb.title}</a></li>`;
        }).join('')}
      </ol>
    </nav>
  `;
}

/**
 * Render contact details section
 */
function renderContactDetails(contacts) {
  if (!contacts || (Array.isArray(contacts) && contacts.length === 0)) {
    return '';
  }
  
  // Handle both array and object formats
  let contactList = [];
  if (Array.isArray(contacts)) {
    contactList = contacts;
  } else if (typeof contacts === 'object') {
    // If it's a single contact object, wrap it in an array
    contactList = [contacts];
  }
  
  if (contactList.length === 0) return '';
  
  const contactCards = contactList.map(contact => {
    const name = contact.name || contact.Name || '';
    const role = contact.role || contact.Role || contact.title || contact.Title || '';
    const email = contact.email || contact.Email || '';
    
    if (!name && !email) return '';
    
    return `
      <div class="contact-card">
        ${name ? `<div class="contact-name">${name}</div>` : ''}
        ${role ? `<div class="contact-role">${role}</div>` : ''}
        ${email ? `<div class="contact-email"><a href="mailto:${email}">${email}</a></div>` : ''}
      </div>
    `;
  }).filter(Boolean).join('');
  
  if (!contactCards) return '';
  
  return `
    <div class="detail-contact-section">
      <h3 class="contact-section-title">For further details, please contact:</h3>
      <div class="contact-cards">
        ${contactCards}
      </div>
      <div class="contact-footer">
        <p>For further information about GMR Group, visit <a href="https://www.gmrgroup.in" target="_blank" rel="noopener">https://www.gmrgroup.in</a></p>
      </div>
    </div>
  `;
}

/**
 * Render previous/next navigation
 */
function renderPreviousNextNavigation(previousRelease, nextRelease) {
  let navigationHTML = '<div class="detail-navigation">';
  
  // Previous Release
  if (previousRelease) {
    const prevUrl = generatePressReleaseUrl(previousRelease);
    const prevTitle = previousRelease.title || '';
    const prevPreview = prevTitle.length > 80 ? prevTitle.substring(0, 80) + '...' : prevTitle;
    
    navigationHTML += `
      <div class="nav-item nav-previous">
        <a href="${prevUrl}" class="nav-link nav-link-previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
          </svg>
          <span>Previous</span>
        </a>
      </div>
    `;
  } else {
    navigationHTML += `
      <div class="nav-item nav-previous nav-disabled">
        <span class="nav-link nav-link-previous disabled">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
          </svg>
          <span>Previous</span>
        </span>
      </div>
    `;
  }
  
  // Next Release Preview
  if (nextRelease) {
    const nextUrl = generatePressReleaseUrl(nextRelease);
    const nextTitle = nextRelease.title || '';
    const nextPreview = nextTitle.length > 100 ? nextTitle.substring(0, 100) + '...' : nextTitle;
    
    navigationHTML += `
      <div class="nav-item nav-next-preview">
        <div class="next-preview-card">
          <div class="next-preview-label">Next Press Release</div>
          <div class="next-preview-title">${nextPreview}</div>
        </div>
      </div>
      <div class="nav-item nav-next">
        <a href="${nextUrl}" class="nav-link nav-link-next">
          <span>Next</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    `;
  } else {
    navigationHTML += `
      <div class="nav-item nav-next-preview">
        <div class="next-preview-card empty">
          <div class="next-preview-label">Next Press Release</div>
          <div class="next-preview-title">No more press releases in this category</div>
        </div>
      </div>
      <div class="nav-item nav-next">
        <span class="nav-link nav-link-next disabled">
          <span>Next</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    `;
  }
  
  navigationHTML += '</div>';
  return navigationHTML;
}

/**
 * Render the press release detail page
 */
function renderPressRelease(block, pr, backLinkUrl, backLinkText, previousRelease = null, nextRelease = null) {
  const categoryClass = createSlug(pr.category) || 'general';
  const categorySlug = createSlug(pr.category);
  
  // Build breadcrumb
  const breadcrumb = buildBreadcrumb(pr.category, pr.title);
  
  // Get contact details (support multiple formats)
  const contacts = pr.contacts || pr.contactDetails || pr.contact || [];
  
  // Get location
  const location = pr.location || pr.Location || '';
  
  // Prepare content for copying
  const contentToCopy = `
${pr.title || ''}

${pr.category ? `Category: ${pr.category}` : ''}
${pr.publishDate ? `Published: ${formatDate(pr.publishDate)}` : ''}
${location ? `Location: ${location}` : ''}

${pr.content || pr.description || ''}

${contacts && contacts.length > 0 ? '\nFor further details, please contact:\n' + (Array.isArray(contacts) ? contacts : [contacts]).map(c => {
  const name = c.name || c.Name || '';
  const role = c.role || c.Role || c.title || c.Title || '';
  const email = c.email || c.Email || '';
  return `${name}${role ? ` - ${role}` : ''}${email ? ` (${email})` : ''}`;
}).join('\n') : ''}
  `.trim();
  
  block.innerHTML = `
    <section class="press-release-detail-runtime">
      <div class="container">
        <!-- Breadcrumb -->
        ${breadcrumb}
        
        <!-- Back Link -->
        <div class="detail-back">
          <a href="${backLinkUrl}" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${backLinkText}
          </a>
        </div>

        <!-- Main Content -->
        <article class="detail-article">
          <!-- Featured Image -->
          ${pr.image ? `
            <div class="detail-image">
              <img src="${pr.image}" alt="${pr.title || 'Press Release'}" loading="eager">
            </div>
          ` : ''}

          <!-- Header -->
          <header class="detail-header">
            <div class="detail-meta">
              ${pr.category ? `<span class="badge ${categoryClass}">${pr.category}</span>` : ''}
              ${pr.category ? '<span class="meta-separator">|</span>' : ''}
              ${pr.publishDate ? `
                <span class="meta-date">
                  <svg class="icon-calendar" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${formatDate(pr.publishDate)}
                </span>
              ` : ''}
              ${pr.lastUpdated ? `
                <span class="meta-separator">|</span>
                <span class="meta-updated">Last Updated: ${formatDate(pr.lastUpdated)}</span>
              ` : ''}
              ${location ? `
                <span class="meta-separator">|</span>
                <span class="meta-location">
                  <svg class="icon-location" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 8.667a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 2.667c-2.667 0-4.667 2-4.667 4.667 0 3.333 4.667 8 4.667 8s4.667-4.667 4.667-8c0-2.667-2-4.667-4.667-4.667z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${location}
                </span>
              ` : ''}
            </div>
            <h1 class="detail-title">${pr.title || ''}</h1>
          </header>

          <!-- Content -->
          <div class="detail-content">
            ${pr.content || pr.description || ''}
          </div>

          <!-- Contact Details -->
          ${renderContactDetails(contacts)}

          <!-- Footer Actions -->
          <footer class="detail-footer">
            <div class="detail-actions">
              <!-- Copy Content Button -->
              <button class="action-btn copy-content" aria-label="Copy content" data-content="${encodeURIComponent(contentToCopy)}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>COPY</span>
              </button>
              
              <!-- Share Section -->
              <div class="detail-share">
                <span class="share-label">SHARE</span>
                <div class="share-buttons">
                  <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" class="share-btn facebook" aria-label="Share on Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(pr.title || '')}" target="_blank" rel="noopener" class="share-btn twitter" aria-label="Share on Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(pr.title || '')}" target="_blank" rel="noopener" class="share-btn linkedin" aria-label="Share on LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            ${pr.tags ? `
              <div class="detail-tags">
                <span class="tags-label">Tags:</span>
                ${pr.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
              </div>
            ` : ''}
          </footer>
        </article>

        <!-- Previous/Next Navigation -->
        ${renderPreviousNextNavigation(previousRelease, nextRelease)}
      </div>
    </section>
  `;
  
  // Add event listener for copy content button
  const copyContentBtn = block.querySelector('.copy-content');
  if (copyContentBtn) {
    copyContentBtn.addEventListener('click', async function() {
      const content = decodeURIComponent(this.getAttribute('data-content'));
      try {
        await navigator.clipboard.writeText(content);
        this.classList.add('copied');
        const originalText = this.querySelector('span').textContent;
        this.querySelector('span').textContent = 'COPIED!';
        setTimeout(() => {
          this.classList.remove('copied');
          this.querySelector('span').textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy content:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.classList.add('copied');
          const originalText = this.querySelector('span').textContent;
          this.querySelector('span').textContent = 'COPIED!';
          setTimeout(() => {
            this.classList.remove('copied');
            this.querySelector('span').textContent = originalText;
          }, 2000);
        } catch (e) {
          console.error('Fallback copy failed:', e);
        }
        document.body.removeChild(textArea);
      }
    });
  }
}

