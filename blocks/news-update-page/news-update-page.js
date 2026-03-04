import { getNewsDetail } from "../../scripts/news-api.js";
import { formatDate } from "../../scripts/common.js";
import { getSlugFromURL } from "../../scripts/common.js";

const PUBLISH_DOMAIN =
  "https://publish-p168597-e1803019.adobeaemcloud.com";

/* ================================
   Fix DAM image paths
================================ */
function fixImageSrc(html) {
  if (!html) return html;

  return html.replace(
    /<img([^>]+)src="(\/content\/dam[^"]+)"/g,
    `<img$1src="${PUBLISH_DOMAIN}$2"`
  );
}

export default async function decorate(block) {
  const slug = getSlugFromURL();
  const currentUrl = window.location.href;

  block.innerHTML = "";

  if (!slug) {
    block.innerHTML = "<p>Invalid news item.</p>";
    return;
  }

  const container = document.createElement("section");
  container.className = "news-detail spacer";

  container.innerHTML = `
    <div class="container">
      <div class="news-detail-wrapper">
        <p class="loading">Loading article...</p>
      </div>
    </div>

    <!-- SHARE MODAL -->
    <div class="share-modal hidden">
      <div class="share-modal-backdrop"></div>
      <div class="share-modal-content">
        <button class="share-close">✕</button>
        <h4>Share this post</h4>
        <div class="share-links">
          <a class="share-whatsapp" target="_blank"><svg width="800px" height="800px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z" fill="#BFC8D0"/>
<path d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" fill="url(#paint0_linear_87_7264)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z" fill="white"/>
<path d="M12.5 9.49989C12.1672 8.83131 11.6565 8.8905 11.1407 8.8905C10.2188 8.8905 8.78125 9.99478 8.78125 12.05C8.78125 13.7343 9.52345 15.578 12.0244 18.3361C14.438 20.9979 17.6094 22.3748 20.2422 22.3279C22.875 22.2811 23.4167 20.0154 23.4167 19.2503C23.4167 18.9112 23.2062 18.742 23.0613 18.696C22.1641 18.2654 20.5093 17.4631 20.1328 17.3124C19.7563 17.1617 19.5597 17.3656 19.4375 17.4765C19.0961 17.8018 18.4193 18.7608 18.1875 18.9765C17.9558 19.1922 17.6103 19.083 17.4665 19.0015C16.9374 18.7892 15.5029 18.1511 14.3595 17.0426C12.9453 15.6718 12.8623 15.2001 12.5959 14.7803C12.3828 14.4444 12.5392 14.2384 12.6172 14.1483C12.9219 13.7968 13.3426 13.254 13.5313 12.9843C13.7199 12.7145 13.5702 12.305 13.4803 12.05C13.0938 10.953 12.7663 10.0347 12.5 9.49989Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear_87_7264" x1="26.5" y1="7" x2="4" y2="28" gradientUnits="userSpaceOnUse">
<stop stop-color="#5BD066"/>
<stop offset="1" stop-color="#27B43E"/>
</linearGradient>
</defs>
</svg></a>
          <a class="share-facebook" target="_blank"><svg width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#1877F2" d="M15 8a7 7 0 00-7-7 7 7 0 00-1.094 13.915v-4.892H5.13V8h1.777V6.458c0-1.754 1.045-2.724 2.644-2.724.766 0 1.567.137 1.567.137v1.723h-.883c-.87 0-1.14.54-1.14 1.093V8h1.941l-.31 2.023H9.094v4.892A7.001 7.001 0 0015 8z"/><path fill="#ffffff" d="M10.725 10.023L11.035 8H9.094V6.687c0-.553.27-1.093 1.14-1.093h.883V3.87s-.801-.137-1.567-.137c-1.6 0-2.644.97-2.644 2.724V8H5.13v2.023h1.777v4.892a7.037 7.037 0 002.188 0v-4.892h1.63z"/></svg></a>
          <a class="share-x" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" fill="#000000" class="bi bi-twitter-x" viewBox="0 0 16 16" id="Twitter-X--Streamline-Bootstrap" height="16" width="16">
  <desc>
    Twitter X Streamline Icon: https://streamlinehq.com
  </desc>
  <path d="M12.6 0.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867 -5.07 -4.425 5.07H0.316l5.733 -6.57L0 0.75h5.063l3.495 4.633L12.601 0.75Zm-0.86 13.028h1.36L4.323 2.145H2.865z" stroke-width="1"></path>
</svg></a>
          <a class="share-linkedin" target="_blank"><svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="24" cy="24" r="20" fill="#0077B5"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.7747 14.2839C18.7747 15.529 17.8267 16.5366 16.3442 16.5366C14.9194 16.5366 13.9713 15.529 14.0007 14.2839C13.9713 12.9783 14.9193 12 16.3726 12C17.8267 12 18.7463 12.9783 18.7747 14.2839ZM14.1199 32.8191V18.3162H18.6271V32.8181H14.1199V32.8191Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M22.2393 22.9446C22.2393 21.1357 22.1797 19.5935 22.1201 18.3182H26.0351L26.2432 20.305H26.3322C26.9254 19.3854 28.4079 17.9927 30.8101 17.9927C33.7752 17.9927 35.9995 19.9502 35.9995 24.219V32.821H31.4922V24.7838C31.4922 22.9144 30.8404 21.6399 29.2093 21.6399C27.9633 21.6399 27.2224 22.4999 26.9263 23.3297C26.8071 23.6268 26.7484 24.0412 26.7484 24.4574V32.821H22.2411V22.9446H22.2393Z" fill="white"/>
</svg></a>
        </div>
      </div>
    </div>
  `;

  block.appendChild(container);

  const contentWrapper = container.querySelector(".news-detail-wrapper");

  /* ================================
     Fetch news detail
  ================================ */
  try {
    const item = await getNewsDetail();

    if (!item) {
      contentWrapper.innerHTML = "<p>News not found.</p>";
      return;
    }

    /* ================================
       Meta updates
    ================================ */
    document.title = item.metaTitle || item.title || "";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = item.metaDescription?.plaintext || "";

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", item.metaKeywords || "");

    const publishDateRaw = item.publishMonth + " " + item.publishYear;

    const publishDateFormatted = formatDate(publishDateRaw);

    const hasTitle = !!item.title;
const hasImage = !!item.cardImage?._publishUrl;
const hasContent = !!item.description?.html;
const hasContacts = !!item.contacts?.html;

// KEY HIGHLIGHT should appear only if something exists
const hasAnyContent = hasTitle || hasImage || hasContent || hasContacts;

    /* ================================
       Render page
    ================================ */
    contentWrapper.innerHTML = `
      <!-- TOP ACTIONS -->
      <div class="copySection1 mb-4">
        <div class="copy-actions justify-content-end">
          <button class="copy-btn btn" type="button">Copy 
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.41992 9.9366C5.41992 7.38159 5.41992 6.10408 6.21366 5.31034C7.0074 4.5166 8.28491 4.5166 10.8399 4.5166H13.5499C16.1049 4.5166 17.3824 4.5166 18.1762 5.31034C18.9699 6.10408 18.9699 7.38159 18.9699 9.9366V14.4533C18.9699 17.0083 18.9699 18.2858 18.1762 19.0795C17.3824 19.8733 16.1049 19.8733 13.5499 19.8733H10.8399C8.28491 19.8733 7.0074 19.8733 6.21366 19.0795C5.41992 18.2858 5.41992 17.0083 5.41992 14.4533V9.9366Z" stroke="currentColor" stroke-width="1.5"/>
<path d="M5.41996 17.1633C3.92327 17.1633 2.70996 15.95 2.70996 14.4533V9.03331C2.70996 5.62662 2.70996 3.92328 3.76828 2.86496C4.8266 1.80664 6.52994 1.80664 9.93663 1.80664H13.55C15.0467 1.80664 16.26 3.01995 16.26 4.51664" stroke="currentColor" stroke-width="1.5"/>
</svg>
</button>
          <button class="share-btn btn" type="button">Share 
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.8733 12.6448C19.8472 15.7288 19.6759 17.4289 18.5548 18.5501C17.2315 19.8733 15.1018 19.8733 10.8423 19.8733C6.58287 19.8733 4.45313 19.8733 3.12989 18.5501C1.80664 17.2268 1.80664 15.0971 1.80664 10.8376C1.80664 6.57815 1.80664 4.44842 3.12989 3.12517C4.25106 2.00401 5.9512 1.83279 9.03519 1.80664" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M19.8732 6.32331H12.6465C11.0315 6.32331 10.0475 7.10289 9.66642 7.47941C9.54028 7.60405 9.4772 7.66637 9.47507 7.6685C9.47294 7.67063 9.41062 7.7337 9.28599 7.85985C8.90946 8.24094 8.12988 9.22497 8.12988 10.84V13.55M19.8732 6.32331L15.3565 1.80664M19.8732 6.32331L15.3565 10.84" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</button>
        </div>
      </div>

      <article class="news-article">

    ${hasAnyContent ? `<h2 class="news-key-highlight">KEY HIGHLIGHT</h2>` : ""}

    ${
      hasTitle
        ? `<div class="news-title">
             <h1>${item.title}</h1>
           </div>`
        : ""
    }

    ${
      item.uploadPdf?._publishUrl
        ? `<div class="news-pdf-download">
             <a
               class="btn btn-primary btn-pdf-download"
               href="${item.uploadPdf._publishUrl}"
               download
               target="_blank"
               rel="noopener noreferrer"
             >
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12 3V15M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                 <path d="M3 21H21M3 17V21M21 17V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
               Download PDF
             </a>
           </div>`
        : ""
    }

    ${
      hasImage
        ? `<div class="news-card">
             <img
               src="${item.cardImage._publishUrl}"
               alt="${item.title || "News image"}"
             />
           </div>`
        : ""
    }

    ${
      hasContent
        ? `<div class="news-content">
             ${fixImageSrc(item.description.html)}
           </div>`
        : ""
    }

    ${
      hasContacts
        ? `<div class="news-contact-cards">
             ${item.contacts.html}
           </div>`
        : ""
    }

  </article>

      <!-- BOTTOM ACTIONS -->
      <div class="copySection">
        <!--<button class="btn-primary btn-sm btn" onclick="history.back()">
          <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.0833 8.75L0.749919 8.75M0.749919 8.75L8.74992 16.75M0.749919 8.75L8.74992 0.749998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M22.0833 8.75L0.749919 8.75M0.749919 8.75L8.74992 16.75M0.749919 8.75L8.74992 0.749998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg> Back
        </button>-->
        <div class="copy-actions">
          <button class="copy-btn btn" type="button">Copy 
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.41992 9.9366C5.41992 7.38159 5.41992 6.10408 6.21366 5.31034C7.0074 4.5166 8.28491 4.5166 10.8399 4.5166H13.5499C16.1049 4.5166 17.3824 4.5166 18.1762 5.31034C18.9699 6.10408 18.9699 7.38159 18.9699 9.9366V14.4533C18.9699 17.0083 18.9699 18.2858 18.1762 19.0795C17.3824 19.8733 16.1049 19.8733 13.5499 19.8733H10.8399C8.28491 19.8733 7.0074 19.8733 6.21366 19.0795C5.41992 18.2858 5.41992 17.0083 5.41992 14.4533V9.9366Z" stroke="currentColor" stroke-width="1.5"/>
<path d="M5.41996 17.1633C3.92327 17.1633 2.70996 15.95 2.70996 14.4533V9.03331C2.70996 5.62662 2.70996 3.92328 3.76828 2.86496C4.8266 1.80664 6.52994 1.80664 9.93663 1.80664H13.55C15.0467 1.80664 16.26 3.01995 16.26 4.51664" stroke="currentColor" stroke-width="1.5"/>
</svg>
</button>
          <button class="share-btn btn" type="button">Share 
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.8733 12.6448C19.8472 15.7288 19.6759 17.4289 18.5548 18.5501C17.2315 19.8733 15.1018 19.8733 10.8423 19.8733C6.58287 19.8733 4.45313 19.8733 3.12989 18.5501C1.80664 17.2268 1.80664 15.0971 1.80664 10.8376C1.80664 6.57815 1.80664 4.44842 3.12989 3.12517C4.25106 2.00401 5.9512 1.83279 9.03519 1.80664" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M19.8732 6.32331H12.6465C11.0315 6.32331 10.0475 7.10289 9.66642 7.47941C9.54028 7.60405 9.4772 7.66637 9.47507 7.6685C9.47294 7.67063 9.41062 7.7337 9.28599 7.85985C8.90946 8.24094 8.12988 9.22497 8.12988 10.84V13.55M19.8732 6.32331L15.3565 1.80664M19.8732 6.32331L15.3565 10.84" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</button>
        </div>
      </div>
    `;

    /* ================================
       Events
    ================================ */
    const modal = container.querySelector(".share-modal");

    container.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", () => history.back());
    });

    container.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(currentUrl);
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = "Copy"), 1500);
        } catch {
          alert("Copy failed");
        }
      });
    });

    container.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.classList.remove("hidden");
      });
    });

    modal.querySelector(".share-close")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    modal
      .querySelector(".share-modal-backdrop")
      ?.addEventListener("click", () => {
        modal.classList.add("hidden");
      });

    /* ================================
       Share URLs
    ================================ */
    modal.querySelector(".share-whatsapp").href =
      `https://wa.me/?text=${encodeURIComponent(currentUrl)}`;

    modal.querySelector(".share-facebook").href =
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`;

    modal.querySelector(".share-x").href =
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`;

    modal.querySelector(".share-linkedin").href =
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`;
  } catch (err) {
    console.error("News detail error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}