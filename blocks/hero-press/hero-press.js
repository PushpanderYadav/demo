import { getNewsDetail } from "../../scripts/news-api.js";
import { getApiHost } from "../../scripts/api.js";
import { formatDate } from "../../scripts/common.js";

function slugToTitle(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("post");
}


function buildHeroNav(swiper, total) {
  const nav = document.createElement("div");
  nav.className = "hero-nav";

  const container = document.createElement("div");
  container.className = "container";

  const prev = document.createElement("button");
  prev.className = "swiper-button-prev";
  prev.setAttribute("aria-label", "Previous slide");

  const next = document.createElement("button");
  next.className = "swiper-button-next";
  next.setAttribute("aria-label", "Next slide");

  const numbers = document.createElement("div");
  numbers.className = "hero-numbers";

  const nums = [];

  for (let i = 0; i < total; i += 1) {
    const num = document.createElement("span");
    num.className = "hero-num";
    num.textContent = String(i + 1).padStart(2, "0");
    num.addEventListener("click", () => swiper.slideToLoop(i));
    nums.push(num);
    numbers.append(num);
  }

  container.append(prev, numbers, next);
  nav.append(container);
  swiper.el.append(nav);

  prev.onclick = () => swiper.slidePrev();
  next.onclick = () => swiper.slideNext();

  function updateActive() {
    nums.forEach((n) => n.classList.remove("active"));
    nums[swiper.realIndex]?.classList.add("active");
  }

  swiper.on("slideChange", updateActive);
  updateActive();
}


/* ================================
   Build Hero
================================ */
function buildPressHero(item) {
  const publishDate =
    item.publishDate?.iso ||
    item.publishDate?.value ||
    item.publishDate ||
    "";
  const publishDateFormatted = formatDate(publishDate);
  const lastUpdated =
    item.lastUpdatedDate?.iso ||
    item.lastUpdatedDate?.value ||
    "";

  const bgUrl =
    item.cardImage?._publishUrl ||
    item.cardImage?.publishUrl ||
    "";

  const hero = document.createElement("section");
  hero.className = "press-banner";

  hero.innerHTML = `
    
      <div class="press-hero-media">
        <picture class="d-none d-md-block">
          <img loading="eager" alt="" src="../../img/press-desk.jpg" width="1920" height="550">
        </picture>
        <picture class="d-block d-md-none">
            <img loading="lazy" alt="" src="../../img/press-mob.jpg" width="640" height="965">
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
          ${item.title || ""}
        </div>

        <div class="press-hero-meta">
          ${item.subCategory || item.category ? `
            <span class="press-hero-tag badge ${item.subCategory || ""}">
                ${slugToTitle(item.subCategory || item.category)}
            </span> <span class='sep'>|</span>
            ` : ""}
          ${publishDate ? `
            <span>
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.6665 9.99998C1.6665 6.85728 1.6665 5.28593 2.64281 4.30962C3.61913 3.33331 5.19047 3.33331 8.33317 3.33331H11.6665C14.8092 3.33331 16.3805 3.33331 17.3569 4.30962C18.3332 5.28593 18.3332 6.85728 18.3332 9.99998V11.6666C18.3332 14.8093 18.3332 16.3807 17.3569 17.357C16.3805 18.3333 14.8092 18.3333 11.6665 18.3333H8.33317C5.19047 18.3333 3.61913 18.3333 2.64281 17.357C1.6665 16.3807 1.6665 14.8093 1.6665 11.6666V9.99998Z" stroke="white" stroke-width="1.5"/>
<path d="M5.8335 3.33331V2.08331" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
<path d="M14.1665 3.33331V2.08331" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2.0835 7.5H17.9168" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
 ${publishDateFormatted}</span> <span class='sep'>|</span>
          ` : ""}
          ${lastUpdated ? `
            <span>
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.6665 9.99998C1.6665 6.85728 1.6665 5.28593 2.64281 4.30962C3.61913 3.33331 5.19047 3.33331 8.33317 3.33331H11.6665C14.8092 3.33331 16.3805 3.33331 17.3569 4.30962C18.3332 5.28593 18.3332 6.85728 18.3332 9.99998V11.6666C18.3332 14.8093 18.3332 16.3807 17.3569 17.357C16.3805 18.3333 14.8092 18.3333 11.6665 18.3333H8.33317C5.19047 18.3333 3.61913 18.3333 2.64281 17.357C1.6665 16.3807 1.6665 14.8093 1.6665 11.6666V9.99998Z" stroke="white" stroke-width="1.5"/>
<path d="M5.8335 3.33331V2.08331" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
<path d="M14.1665 3.33331V2.08331" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2.0835 7.5H17.9168" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
 Last Updated: ${lastUpdated}</span> <span class='sep'>|</span><span class='sep'>|</span>
          ` : ""}
          ${item.city ? `
            <span>
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.1665 7.09555C4.1665 4.09727 6.77818 1.66669 9.99984 1.66669C13.2215 1.66669 15.8332 4.09727 15.8332 7.09555C15.8332 10.0703 13.9714 13.5416 11.0666 14.783C10.3894 15.0724 9.61027 15.0724 8.93312 14.783C6.0283 13.5416 4.1665 10.0703 4.1665 7.09555Z" stroke="white" stroke-width="1.5"/>
<path d="M11.6668 7.49998C11.6668 8.42045 10.9206 9.16665 10.0002 9.16665C9.07969 9.16665 8.3335 8.42045 8.3335 7.49998C8.3335 6.57951 9.07969 5.83331 10.0002 5.83331C10.9206 5.83331 11.6668 6.57951 11.6668 7.49998Z" stroke="white" stroke-width="1.5"/>
<path d="M17.4669 12.9167C18.0214 13.4188 18.3332 13.9847 18.3332 14.5834C18.3332 16.6544 14.6022 18.3334 9.99984 18.3334C5.39746 18.3334 1.6665 16.6544 1.6665 14.5834C1.6665 13.9847 1.97827 13.4188 2.53273 12.9167" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
 ${item.city}</span>
          ` : ""}
        </div>

      </div>
    </div>
  `;

  return hero;
}


/* ================================
   Decorate
================================ */
export default async function decorate(block) {
  const slug = getSlugFromURL();
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
  `;

  block.append(container);

  const contentWrapper = container.querySelector(".news-detail-wrapper");

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/story-details` +
      `?slugUrl=${encodeURIComponent(slug)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.successStoryList?.items || [];

    if (!items.length) {
      cardsWrapper.innerHTML = "<p>No news found.</p>";
      return;
    }
    const item = items[0];

    if (!item) {
      contentWrapper.innerHTML = "<p>News not found.</p>";
      return;
    }
    

    /* Inject Hero */
    const hero = buildPressHero(item);
    block.prepend(hero);
    buildHeroNav(swiper, swiper.slides.length);


    /* Render article body */
    contentWrapper.innerHTML = `
      <article class="news-article">
        <div class="news-content">
          ${item.description?.html || ""}
        </div>
      </article>
    `;
  } catch (err) {
    console.error("Press hero error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}
