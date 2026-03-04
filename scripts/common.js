export function slugToTitle(str) {
  if (!str || typeof str !== 'string') return "";
  if(str.toLowerCase() === "transport-urban-infrastructure") return "Transport & Urban Infrastructure";
  if(str.toLowerCase() === "airport-aero-services") return "Airport & Aero Services";
  if(str.toLowerCase() === "other") return "Other Services";
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function fixImageSrc(html) {
  if (!html) return html;

  return html.replace(
    /<img([^>]+)src="(\/content\/dam[^"]+)"/g,
    `<img$1src="${PUBLISH_DOMAIN}$2"`
  );
}

export function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("post");
}

export function getLangFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[0] || window.APP_CONFIG?.LANGUAGE || "en";
}