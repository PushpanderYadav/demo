/* =========================================================
   Cookie Consent – AEM SAFE VERSION
   - Universal Editor Compatible (doesn't hide original content)
   - Follows standard AEM component pattern
   ========================================================= */

// ✔ All API calls go through the App Builder action — auth token is NEVER in the browser.
// After deploying (`aio app deploy`) replace the URL below with your action's webhook URL.
const CONSENT_ACTION_URL = 'https://3842504-gmr-stage.adobeioruntime.net/api/v1/web/eds-smtp-mailer/consent-log';

let userIP = 'unknown';

/* ===============================
   1. UTILITIES
   =============================== */

async function fetchIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) userIP = (await res.json()).ip;
  } catch (e) { console.warn('IP Fetch failed', e); }
}

async function fetchGeo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const d = await res.json();
      return {
        city: d.city || 'unknown',
        region: d.region || 'unknown',
        country: d.country_name || 'unknown'
      };
    }
  } catch (e) { }
  return { city: 'unknown', region: 'unknown', country: 'unknown' };
}

fetchIP();

/* ===============================
   2. TAG MANAGER LOGIC
   =============================== */

function applyConsents(prefs) {
  // --- Google Analytics ---
  if (prefs.analytics) {
    if (!document.getElementById('gtag-script')) {
      const script = document.createElement('script');
      script.id = 'gtag-script';
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-BSTN6PSHZG';
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-BSTN6PSHZG');
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
        console.log('[Cookies] GA Tags Loaded');
      };
    } else if (window.gtag) {
      window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }
  } else {
    if (window.gtag) window.gtag('consent', 'update', { 'analytics_storage': 'denied' });
  }

  // --- Adobe Target ---
  if (window.adobe && window.adobe.optIn) {
    if (prefs.preference) {
      adobe.optIn.approve(adobe.OptInCategories.TARGET);
    } else {
      adobe.optIn.deny(adobe.OptInCategories.TARGET);
    }
  }
}

/* ===============================
   3. DATA EXTRACTION - AEM SAFE
   =============================== */

function getBlockConfig(block) {
  if (!block) return {};

  // Extract text from block children (AEM structure)
  // Find the container we created during decorate()
  const container = block.querySelector('.cookie-consent-data');
  const rows = container ? [...container.children] : [...block.children];

  const conf = {};

  // Helper function to get text content safely
  const getText = (row) => {
    if (!row || !row.children || !row.children[0]) return '';
    return row.children[0].textContent?.trim() || '';
  };

  // Helper function to get HTML content safely
  const getHTML = (row) => {
    if (!row || !row.children || !row.children[0]) return '';
    return row.children[0].innerHTML?.trim() || '';
  };

  // Map the block structure based on your JSON model
  try {
    // Title
    conf.title = getText(rows[0]) || 'Your Privacy Matters';

    // Description
    conf.note = getHTML(rows[1]) || 'We use cookies to ensure the website works properly, understand how it\'s used, and remember your preferences. We do not use cookies for advertising, cross-site tracking, or profiling.';

    // Essential Cookies Title
    conf.essentialTitle = getText(rows[2]) || 'Essential Cookies';

    // Analytics Cookies (ON/OFF text) - row 4
    conf.analyticsCookies = getText(rows[4]) || 'Analytics Cookies';
    const analyticsText = getText(rows[4])?.toUpperCase() || 'OFF';
    conf.isAnalyticsOn = analyticsText.includes('ON');

    // Analytics Description - row 5
    conf.analyticsDescription = getHTML(rows[5]) || '<p>Analytics cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.</p>';

    // Preference Cookies (ON/OFF text) - row 6
    conf.preferenceCookies = getText(rows[6]) || 'Preference Cookies';
    const preferenceText = getText(rows[6])?.toUpperCase() || 'OFF';
    conf.isPreferenceOn = preferenceText.includes('ON');

    // Preference Description - row 7
    conf.preferenceDescription = getHTML(rows[7]) || '<p>Preference cookies allow the website to remember choices you make, such as language or region, to provide a more personalized experience.</p>';

    // Buttons
    conf.acceptAllLabel = getText(rows[8]) || 'Accept All';
    conf.saveLabel = getText(rows[9]) || 'Save Preferences & Close';

    // Essential is always ON
    conf.essentialStatus = 'ON';

    // Additional fields
    conf.deleteLabel = 'Delete My Data';

  } catch (error) {
    console.warn('[Cookies] Error extracting config, using defaults:', error);
    // Fallback to defaults
    conf.title = 'Your Privacy Matters';
    conf.note = 'We use cookies to ensure the website works properly, understand how it\'s used, and remember your preferences. We do not use cookies for advertising, cross-site tracking, or profiling.';
    conf.essentialTitle = 'Essential Cookies';
    conf.essentialStatus = 'ON';
    conf.analyticsCookies = 'Analytics Cookies';
    conf.isAnalyticsOn = false;
    conf.preferenceCookies = 'Preference Cookies';
    conf.isPreferenceOn = false;
    conf.acceptAllLabel = 'Accept All';
    conf.saveLabel = 'Save Preferences & Close';
    conf.deleteLabel = 'Delete My Data';
  }

  return conf;
}

/* ===============================
   4. API ACTIONS
   =============================== */

async function sendConsent(type, prefs, block) {
  applyConsents(prefs); // Apply tags

  const geo = await fetchGeo();

  const payload = {
    userIp: userIP,
    location: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...geo,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    consentType: type,
    customPreferences: prefs,
    uuid: localStorage.getItem('uuid') || null
  };

  try {
    console.log('[Cookies] Sending Consent via App Builder:', payload);
    // No Authorization header — the token lives in the App Builder action env
    const response = await fetch(CONSENT_ACTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[Cookies] API Response:', result);

      // The action returns { status: 'success', data: { _id, ... } }
      // Fall back to direct fields for API compatibility
      const savedId = result.data?._id || result.data?.id || result._id || result.id;

      if (savedId) {
        localStorage.setItem('gmr-privacy-id', savedId);
        localStorage.setItem('uuid', savedId);
        console.log('[Cookies] Saved Privacy ID & UUID:', savedId);
      } else {
        console.warn('[Cookies] Warning: No ID returned from API');
      }
    }
  } catch (e) {
    console.warn('[Cookies] Consent API failed', e);
  }

  localStorage.setItem('gmr-cookie-consent', type);
  localStorage.setItem('gmr-custom-preferences', JSON.stringify(prefs));

  showPostConsentView(block);
}

function showCookieBanner(block) {
  // Remove any existing banner
  document.querySelectorAll('.policyCookiesInner').forEach(e => e.remove());

  const banner = document.createElement('div');
  banner.className = 'policyCookiesInner';

  banner.innerHTML = `
    <div class="container">
    <div class="policyCookiesInner1">
    <div class="leftBlock">
      <p><strong>Your Privacy Matters</strong></p>
      <p>
        You can choose which optional cookies you allow and change your preferences at any time.
        <a href="/en/privacy-policy">Privacy Policy</a>
        or
        <a href="/en/cookie-policy">Cookie Policy</a>
      </p>
    </div>
    <div class="rightBlock">
      <a href="javascript:void(0)" class="editPreferences btn btn-outline-primary">Edit Preferences</a>
      <button class="btn btn-primary" id="acceptAllBanner">Accept All</button>
    </div>
    </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Edit Preferences → open modal
  banner.querySelectorAll('.editPreferences').forEach(btn => {
    btn.addEventListener('click', () => {
      openConsentModal(block);
    });
  });

  // Accept All → save + close banner
  banner.querySelector('#acceptAllBanner').onclick = () => {
    sendConsent(
      'accepted',
      { essential: true, analytics: true, preference: true },
      block
    );
    banner.remove();
  };
}


async function deleteRecord(block) {
  // 1. Deny Tags
  applyConsents({ analytics: false, preference: false });

  // 2. Get ID
  const id = localStorage.getItem('uuid') || localStorage.getItem('gmr-privacy-id');
  console.log('[Cookies] Attempting delete for ID:', id);

  if (id) {
    try {
      // Pass the id as a query param — the action appends it to the upstream DELETE URL
      const url = `${CONSENT_ACTION_URL}?id=${encodeURIComponent(id)}`;
      console.log('[Cookies] Hitting App Builder DELETE action:', url);

      // No Authorization header — the token lives in the App Builder action env
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log('[Cookies] Delete Successful');
        alert('Your data has been permanently deleted.');
      } else {
        console.warn('[Cookies] Delete API returned status:', response.status);
      }
    } catch (e) {
      console.warn('[Cookies] Delete API failed', e);
    }
  } else {
    console.warn('[Cookies] Cannot hit API: No Privacy ID found in LocalStorage.');
    alert("No saved consent record found. Local preferences cleared.");
  }

  // 3. Clear Storage
  localStorage.removeItem('gmr-cookie-consent');
  localStorage.removeItem('gmr-custom-preferences');
  localStorage.removeItem('gmr-privacy-id');
  localStorage.removeItem('uuid');

  // 4. Reset UI
  document.querySelectorAll('.cookie-consent-modal').forEach(m => m.remove());
  // Show cookie banner again
  showCookieBanner(block);
}

/* ===============================
   5. UI VIEWS
   =============================== */

function showPostConsentView(block) {
  // Only remove the modal, not the data container
  document.querySelectorAll('.policyCookiesInner').forEach(e => e.remove());
  document.querySelectorAll('.cookie-consent-modal').forEach(e => e.remove());

  const wrapper = document.createElement('div');
  wrapper.className = 'cookie-consent-modal';

  wrapper.innerHTML = `
    <button id="managePrefs" class="cookie-manage-btn">Cookie Preferences</button>
  `;

  document.body.appendChild(wrapper);
  const btn = document.getElementById('managePrefs');
  if (btn) btn.onclick = () => openConsentModal(block);
}

function initAccordions(wrapper) {
  wrapper.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.toggle')) return;

      const row = header.closest('.cookie-row');
      if (!row) return;

      row.classList.toggle('open');

      const arrow = row.querySelector('.accordion-arrow');
      if (!arrow) return;

      arrow.innerHTML = row.classList.contains('open')
        ? `
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
               width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="2"
                  d="m5 15 7-7 7 7"/>
          </svg>
        `
        : `
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
               width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="2"
                  d="m19 9-7 7-7-7"/>
          </svg>
        `;
    });
  });
}


function openConsentModal(block) {
  // Hide cookie banner when modal opens
  document.querySelectorAll('.policyCookiesInner').forEach(b => {
    b.style.display = 'none';
  });
  // Only remove the modal, not the data container
  document.querySelectorAll('.cookie-consent-modal').forEach(e => e.remove());

  const conf = getBlockConfig(block);
  const saved = JSON.parse(localStorage.getItem('gmr-custom-preferences') || '{}');
  const hasSaved = localStorage.getItem('gmr-cookie-consent');

  // Defaults based on saved preferences or initial config
  const state = {
    analytics: saved.analytics !== undefined ? saved.analytics : conf.isAnalyticsOn,
    preference: saved.preference !== undefined ? saved.preference : conf.isPreferenceOn
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'cookie-consent-modal';

  wrapper.innerHTML = `
    <div class="cookie-consent-col">
      <div class="cookie-layout">
        <div class="cookie-left">
          <h2>${conf.title}</h2>
          <div class="cookie-description">${conf.note}</div>
          <div class="cookie-description cookie-note">
            You can choose which optional cookies you allow and change your preferences at any time.<br/><br/>
            Learn more in our <br/><a href="#"><u>Privacy Policy</u></a> and <a href="/en/cookie-policy"><u>Cookie Policy</u></a>.
          </div>
        </div>
        <div class="cookie-right">
          <div class="cookie-row open">
            <div class="cookie-row-header accordion-header">
              <div class="header-title"><span>${conf.essentialTitle}</span><span class="accordion-arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 15 7-7 7 7"/>
</svg>
</span></div>
              <span class="always-enabled">Always Enabled</span>
            </div>
            <div class="accordion-content">
              <p>These cookies are necessary for the website to function correctly. They support security, session management, and storing your cookie consent choice.</p>
            </div>
          </div>
          <div class="cookie-row">
            <div class="cookie-row-header accordion-header">
              <div class="header-title"><span>${conf.analyticsCookies}</span><span class="accordion-arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg>
</span></div>
              <div class="toggle" data-type="analytics">
                <button data-val="false" class="${!state.analytics ? 'active' : ''}">OFF</button>
                <button data-val="true" class="${state.analytics ? 'active' : ''}">ON</button>
              </div>
            </div>
            <div class="accordion-content">${conf.analyticsDescription}</div>
          </div>
          <div class="cookie-row">
            <div class="cookie-row-header accordion-header">
              <div class="header-title"><span>${conf.preferenceCookies}</span><span class="accordion-arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span></div>
              <div class="toggle" data-type="preference">
                <button data-val="false" class="${!state.preference ? 'active' : ''}">OFF</button>
                <button data-val="true" class="${state.preference ? 'active' : ''}">ON</button>
              </div>
            </div>
            <div class="accordion-content">${conf.preferenceDescription}</div>
          </div>
        </div>
      </div>
      <div class="cookie-footer">
        <div class="footer-actions-right">
          <button class="btn btn-outline-primary" id="acceptAll">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" stroke-width="1.5"/>
<path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
 ${conf.acceptAllLabel}</button>
          <button class="btn btn-primary" id="savePrefs">${conf.saveLabel}</button>
        </div>
        <div class="footer-actions-left">
           ${hasSaved ? `<button class="btn-text" id="deletePrefs">${conf.deleteLabel}</button>` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // Toggle Logic
  wrapper.querySelectorAll('.toggle').forEach(toggle => {
    const type = toggle.dataset.type;
    toggle.querySelectorAll('button').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        state[type] = btn.dataset.val === 'true';
        toggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });
  });

  document.getElementById('acceptAll').onclick = () =>
    sendConsent('accepted', { essential: true, analytics: true, preference: true }, block);

  document.getElementById('savePrefs').onclick = () =>
    sendConsent('custom', { essential: true, analytics: state.analytics, preference: state.preference }, block);

  const delBtn = document.getElementById('deletePrefs');
  if (delBtn) {
    delBtn.onclick = () => {
      if (confirm('Are you sure you want to delete your data? This action cannot be undone.')) deleteRecord(block);
    };
  }

  initAccordions(wrapper);
}

/* ===============================
   6. COOKIE POLICY LINK HANDLER
   =============================== */

function findCookieConsentBlock() {
  // Find the cookie consent block by its marker class
  const blocks = document.querySelectorAll('.cookie-consent-component');
  if (blocks.length > 0) return blocks[0];

  // Alternative: look for the hidden data container
  const dataContainers = document.querySelectorAll('.cookie-consent-data');
  if (dataContainers.length > 0) {
    return dataContainers[0].closest('.block') || dataContainers[0].parentElement;
  }

  return null;
}

function setupCookiePolicyLinks() {
  // Find all links with title containing "Customize Cookies" (exact match)
  const allLinks = document.querySelectorAll('a[title]');

  allLinks.forEach(link => {
    const title = link.getAttribute('title') || '';

    // Check if this is exactly "Customize Cookies" (case-insensitive)
    if (title.toLowerCase() === 'customize cookies') {

      // Check if we've already added a handler
      if (link.dataset.cookieHandlerAdded) return;

      // Mark as processed
      link.dataset.cookieHandlerAdded = 'true';

      // Add click event listener
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('[Cookies] Cookie policy link clicked');

        const block = findCookieConsentBlock();

        if (block) {
          // Remove any existing modal first
          document.querySelectorAll('.cookie-consent-modal').forEach(m => m.remove());

          // Open the consent modal
          openConsentModal(block);

          // Optional: Scroll to modal
          setTimeout(() => {
            const modal = document.querySelector('.cookie-consent-modal');
            if (modal) {
              modal.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }, 100);
        } else {
          console.warn('[Cookies] Cookie consent block not found');
        }

        return false;
      });
    }
  });
}

// Setup MutationObserver to handle dynamically added links
function setupLinkObserver() {
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      let shouldSetupLinks = false;

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Check if any added nodes are links or contain links
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'A' || node.querySelector('a')) {
                shouldSetupLinks = true;
              }
            }
          });
        }
      });

      if (shouldSetupLinks) {
        setupCookiePolicyLinks();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

/* ===============================
   7. ENTRY POINT - AEM SAFE PATTERN
   =============================== */

export default function decorate(block) {
  // Create a hidden container for the data (preserves Universal Editor functionality)
  const dataContainer = document.createElement('div');
  dataContainer.className = 'cookie-consent-data';
  dataContainer.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden;';

  // Copy all children to the hidden container
  [...block.children].forEach(row => {
    const clone = row.cloneNode(true);
    dataContainer.appendChild(clone);
  });

  // Add the data container to the block (not visible but accessible)
  block.appendChild(dataContainer);

  // Clear the visible block content
  block.innerHTML = '';

  // Add a marker for the component (optional, for Universal Editor)
  block.classList.add('cookie-consent-component');

  // Load CSS only once per page
  if (!document.getElementById('cookie-consent-css')) {
    const link = document.createElement('link');
    link.id = 'cookie-consent-css';
    link.rel = 'stylesheet';
    link.href = '/path/to/cookie-consent.css'; // Update with your actual path
    document.head.appendChild(link);
  }

  // Check if we already have consent
  const savedPrefsJson = localStorage.getItem('gmr-custom-preferences');
  const savedConsent = localStorage.getItem('gmr-cookie-consent');

  if (savedConsent && savedPrefsJson) {
    try {
      const prefs = JSON.parse(savedPrefsJson);
      applyConsents(prefs);
      showPostConsentView(block);
    } catch (e) {
      console.warn('[Cookies] Error parsing saved preferences:', e);
      openConsentModal(block);
    }
  } else {
    // First time visitor or no saved consent
    //openConsentModal(block);
    showCookieBanner(block);
  }

  // Setup cookie policy links
  setTimeout(() => {
    setupCookiePolicyLinks();
    setupLinkObserver();
  }, 500);
}

// Make openConsentModal available globally for debugging if needed
window.openCookieConsentModal = function () {
  const block = findCookieConsentBlock();
  if (block) {
    openConsentModal(block);
  }
};
