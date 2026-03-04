import { formatDate } from "../../scripts/common.js";
import { getSlugFromURL } from "../../scripts/common.js";
import { getApiHost } from "../../scripts/api.js";
import { getLangFromURL } from "../../scripts/common.js";

const PUBLISH_DOMAIN =
  "https://publish-p168597-e1803019.adobeaemcloud.com";

/* ================================
   Swiper Loader
================================ */
const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

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

/* ================================
   Open External Links in New Tab
================================ */
/* ================================
   Open External Links in New Tab
================================ */
function fixExternalLinks(container) {
  if (!container) return;

  const links = container.querySelectorAll("a[href]");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const isExternal =
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//");

    if (isExternal) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/* ================================
   Dynamic Section Renderer (NEW)
================================ */
function renderSection(title, content) {
  if (!title && !content) return "";

  return `
    <div class="section spacer column">
      <div class="container">
        <div class="row">
          <div class="col-md-5">
            ${title ? `<h2 class="sticky">${title}</h2>` : ""}
          </div>
          <div class="col-md-7">
            ${fixImageSrc(content || "")}
          </div>
        </div>
      </div>
    </div>
  `;
}

export default async function decorate(block) {
  const slug = getSlugFromURL();
  block.innerHTML = "";

  if (!slug) {
    block.innerHTML = "<p>Invalid news item.</p>";
    return;
  }

  const container = document.createElement("section");
  container.className = "news-detail";

  container.innerHTML = `
      <div class="news-detail-wrapper">
        <p class="loading">Loading article...</p>
      </div>
  `;

  block.appendChild(container);

  const contentWrapper = container.querySelector(".news-detail-wrapper");

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/story-details` +
      `?lang=${getLangFromURL()}` +
      `&slugUrl=${encodeURIComponent(slug)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const items = json?.data?.data?.successStoryList?.items || [];
    const item = items[0] || null;

    if (!item) {
      contentWrapper.innerHTML = "<p>Story not found.</p>";
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

    const publishDateRaw =
      item.publishDate?.iso ||
      item.publishDate?.value ||
      item.publishDate ||
      "";

    const publishDateFormatted = formatDate(publishDateRaw);

    const hasTitle = !!item.title;
    const hasImage = !!item.cardImage?._publishUrl;

    /* ================================
       Collect Gallery Images
    ================================ */
    const galleryImages = [
      item.image1?._publishUrl,
      item.image2?._publishUrl,
      item.image3?._publishUrl,
      item.image4?._publishUrl,
      item.image5?._publishUrl,
      item.image6?._publishUrl,
      item.image7?._publishUrl,
      item.image8?._publishUrl,
      item.image9?._publishUrl,
      item.image10?._publishUrl,
    ].filter(Boolean);

    /* ================================
       Banner Images
    ================================ */
    const bannerDesktop =
      item.bannerDesktop?._publishUrl || "../../img/media_desk.webp";
    const bannerMobile =
      item.bannerMobile?._publishUrl || "../../img/media_mob.webp";

    /* ================================
       Render page
    ================================ */
    contentWrapper.innerHTML = `
      <div class="press-hero-wrapper">
      <div class="press-hero block">
        <section class="press-banner">

          <div class="press-hero-media">
            <picture class="d-none d-md-block">
              <img src="${bannerDesktop}" width="1920" height="550">
            </picture>
            <picture class="d-block d-md-none">
              <img src="${bannerMobile}" width="640" height="965">
            </picture>
          </div>

          <div class="press-hero-content">
            <div class="container">
              <!--<button class="btn-primary btn-sm btn" onclick="history.back()">
          <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.0833 8.75L0.749919 8.75M0.749919 8.75L8.74992 16.75M0.749919 8.75L8.74992 0.749998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M22.0833 8.75L0.749919 8.75M0.749919 8.75L8.74992 16.75M0.749919 8.75L8.74992 0.749998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg> Back
        </button>-->

              <div class="press-hero-title">
                <h1>${item.title}</h1>
    <p>${fixImageSrc(
      item.description?.html ||
      item.description?.plaintext ||
      item.description ||
      ""
    )}</p>
              </div>

              <div class="press-hero-meta">
                ${item.subCategory ? `<span class="press-hero-tag badge ${item.subCategory || ""}">${item.subCategory}</span>` : ""}
                <span class="sep">|</span>
                ${publishDateFormatted ? `<span><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.6665 9.99998C1.6665 6.85728 1.6665 5.28593 2.64281 4.30962C3.61913 3.33331 5.19047 3.33331 8.33317 3.33331H11.6665C14.8092 3.33331 16.3805 3.33331 17.3569 4.30962C18.3332 5.28593 18.3332 6.85728 18.3332 9.99998V11.6666C18.3332 14.8093 18.3332 16.3807 17.3569 17.357C16.3805 18.3333 14.8092 18.3333 11.6665 18.3333H8.33317C5.19047 18.3333 3.61913 18.3333 2.64281 17.357C1.6665 16.3807 1.6665 14.8093 1.6665 11.6666V9.99998Z" stroke="white" stroke-width="1.5"></path>
<path d="M5.8335 3.33331V2.08331" stroke="white" stroke-width="1.5" stroke-linecap="round"></path>
<path d="M14.1665 3.33331V2.08331" stroke="white" stroke-width="1.5" stroke-linecap="round"></path>
<path d="M2.0835 7.5H17.9168" stroke="white" stroke-width="1.5" stroke-linecap="round"></path>
</svg> ${publishDateFormatted}</span>` : ""}
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>

      <article class="news-article">

        <!--${hasTitle ? `
  <div class="news-title">
    <h1>${item.title}</h1>
    ${fixImageSrc(
      item.description?.html ||
      item.description?.plaintext ||
      item.description ||
      ""
    )}
  </div>
` : ""}

        ${hasImage ? `
          <div class="news-card">
            <img src="${item.cardImage._publishUrl}" alt="${item.title || ""}"/>
          </div>
        ` : ""}-->

        <!-- Dynamic Sections -->
        ${[
          renderSection(item.executiveSummaryTitle, item.executiveSummary?.html),
          renderSection(item.openingNarrativeTitle, item.openingNarrative?.html),
          renderSection(item.coreProblemStatementTitle, item.coreProblemStatement?.html),
          renderSection(item.contextHistoricalBackdropTitle, item.contextHistoricalBackdrop?.html),
          renderSection(item.leadershipPerspectivesTitle, item.leadershipPerspectives?.html),
          renderSection(item.globalBenchmarkingInsightsTitle, item.globalBenchmarkingInsights?.html),
          renderSection(item.approachStrategyTitle, item.approachStrategy?.html),
          renderSection(item.implementationTitle, item.implementation?.html),
          renderSection(item.stakeholderMapTitle, item.stakeholderMap?.html),
          renderSection(item.sustainabilityImpactTitle, item.outcomesImpactwhereeverSustainabilityImpact?.html),
          renderSection(item.lessonsScalableFrameworkTitle, item.lessonsScalableFramework?.html),
        ].join("")}

        ${galleryImages.length ? `
          <div class="news-gallery swiper">
            <div class="swiper-wrapper">
              ${galleryImages.map(img => `
                <div class="swiper-slide">
                  <img src="${img}" alt="Gallery image"/>
                </div>
              `).join("")}
            </div>
            <div class="swiperPagination">
              <div class="swiper-button-prev"></div>
              <div class="swiper-button-next"></div>
            </div>
          </div>
        ` : ""}

      </article>
    `;

    /* ================================
       FIX EXTERNAL LINKS - ADD THIS
       Apply to all content in the wrapper
    ================================ */
    fixExternalLinks(contentWrapper);

    /* ================================
       Back Button
    ================================ */
    container.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", () => history.back());
    });

    /* ================================
       Init Swiper
    ================================ */
    if (galleryImages.length) {
      loadCSS(SWIPER_CSS);
      await loadScript(SWIPER_JS);

      new Swiper(".news-gallery", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
    }
  } catch (err) {
    console.error("News detail error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}