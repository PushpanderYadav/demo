import { getApiHost } from "../../scripts/api.js";
import { getNewsDetail } from "../../scripts/news-api.js";

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("press-nav fetch error:", err);
    return null;
  }
}
function slugToTitle(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function decorate(block) {
  const item = await getNewsDetail();
  if (!item) {
  console.warn("press-nav: news item missing");
  return;
}

  block.classList.add("press-nav");
  const nextcat =slugToTitle(item.category);
  block.innerHTML = `
  <div class="container mb-5">
    <div class="press-nav-actions">
      <div class="press-nav-side prev">
        <a class="nav-btn disabled" ><svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.0833 8.75L0.749919 8.75M0.749919 8.75L8.74992 16.75M0.749919 8.75L8.74992 0.749998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22.0833 8.75L0.749919 8.75M0.749919 8.75L8.74992 16.75M0.749919 8.75L8.74992 0.749998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg> Previous</a>
        <div class="nav-hover-card">
          <div class="label">Previous ${nextcat}</div>
          <div class="title">No previous article</div>
        </div>
      </div>

      <div class="press-nav-side next">
        <div class="nav-hover-card">
          <div class="label">Next ${nextcat}</div>
          <div class="title">No next article</div>
        </div>
        <a class="nav-btn primary disabled">Next <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 8.75H22.0833M22.0833 8.75L14.0833 0.75M22.0833 8.75L14.0833 16.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.75 8.75H22.0833M22.0833 8.75L14.0833 0.75M22.0833 8.75L14.0833 16.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></a>
      </div>
    </div>
    </div>
  `;

  
  
  if (!item || !item.publishDate) {
    console.warn("press-nav: publishDate missing");
    return;
  }

  const publishDate =
    item.publishDate?.iso ||
    item.publishDate?.value ||
    item.publishDate;

    const tags = Array.isArray(item.tags) ? item.tags : [];

const formattedTags = tags
  .map((tag) =>
    tag
      .replace(/^news:/, "")
      .replace(/--/g, " & ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
  .filter(Boolean);

if (formattedTags.length) {
  block.innerHTML += `
    <div class="news-tags">
      <div class="container d-flex gap-3">
        <span class="news-tags-label">Tags:</span>
        <span class="news-tags-list">
          ${formattedTags
            .map((t) => `<span>${t}</span>`)
            .join("<span class='sep'>|</span>")}
        </span>
      </div>
    </div>
  `;
}

  const category = item.category;
  const prevUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-pre` +
    `?category=${category}` +
    `&publishDate=${publishDate}`;
 
  const nextUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-next` +
    `?category=${category}` +
    `&publishDate=${publishDate}`;
 
  const [prevRes, nextRes] = await Promise.all([
    fetchJSON(prevUrl),
    fetchJSON(nextUrl),
  ]);
  
  const prevItem = prevRes?.data?.data?.newsList?.items?.[0];
  const nextItem = nextRes?.data?.data?.newsList?.items?.[0];
  
  const parts = window.location.pathname.split("/").filter(Boolean);
  const lang = parts[0] || "en";
 
  if (prevItem) {
    const prevBtn = block.querySelector(".prev .nav-btn");
    const prevCard = block.querySelector(".prev .nav-hover-card");

    prevBtn.href = `/${lang}/news-update?post=${prevItem.slugUrl}`;
    prevBtn.classList.remove("disabled");
    prevCard.querySelector(".title").textContent = prevItem.title;
  }

  if (nextItem) {
    const nextBtn = block.querySelector(".next .nav-btn");
    const nextCard = block.querySelector(".next .nav-hover-card");

    nextBtn.href = `/${lang}/news-update?post=${nextItem.slugUrl}`;
    nextBtn.classList.remove("disabled");
    nextCard.querySelector(".title").textContent = nextItem.title;
  }
}