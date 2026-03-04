import { getApiHost } from "./api.js";

let newsPromise = null;

/* ================================
   Read slug from URL
================================ */
function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("post");
}
function getLangFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[0] || window.APP_CONFIG?.LANGUAGE || "en";
}

/* ================================
   Fetch news detail (cached)
================================ */
export function getNewsDetail() {
  if (newsPromise) {
    return newsPromise;
  }

  const slug = getSlugFromURL();

  if (!slug) {
    newsPromise = Promise.resolve(null);
    return newsPromise;
  }
  const lang = getLangFromURL();

  const apiUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-details` +
    `?lang=${lang}` +
    `&slugUrl=${encodeURIComponent(slug)}`;

  console.log("+++++++++++++++++++++++++++++++++++", apiUrl);
  
  newsPromise = fetch(apiUrl)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`News API failed: ${res.status}`);
      }
      return res.json();
    })
    .then((json) => {
      return json?.data?.data?.newsList?.items?.[0] || null;
    })
    .catch((err) => {
      console.error("news-api error:", err);
      newsPromise = null; // allow retry if needed
      return null;
    });

  return newsPromise;
}
