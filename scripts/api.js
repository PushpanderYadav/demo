export function getApiHost() {
  const host = window.location.hostname;

  // API-aware environments (author / preview)
  if (host.includes('adobeio-static.net')) {
    return window.location.origin;
  }

  // Publish environments (hlx.page, hlx.live, prod domains)
  return 'https://3842504-gmrapi-stage.adobeio-static.net';
}
