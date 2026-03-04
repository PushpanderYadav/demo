export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const [
    titleEl,
    descEl,
    primaryTextEl,
    primaryLinkEl,
    secondaryTextEl,
    secondaryLinkEl
  ] = [...block.children];

  const title = titleEl?.textContent?.trim() || '';
  const description = descEl?.innerHTML || '';
  const primaryText = primaryTextEl?.textContent?.trim() || '';
  const primaryLink = primaryLinkEl?.textContent?.trim() || '#';
  const secondaryText = secondaryTextEl?.textContent?.trim() || '';
  const secondaryLink = secondaryLinkEl?.textContent?.trim() || '#';

  /* ================================
     AUTHOR MODE SAFE
  ================================ */
  if (isAuthorMode) return;

  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'investors-trust-wrapper';

  wrapper.innerHTML = `
    <h2 class="investors-title">${title}</h2>
    <div class="investors-desc">${description}</div>

    <div class="investors-cta">
      ${
        primaryText
          ? `<a class="cta primary" href="${primaryLink}">${primaryText}</a>`
          : ''
      }
      ${
        secondaryText
          ? `<a class="cta secondary" href="${secondaryLink}">${secondaryText}</a>`
          : ''
      }
    </div>
  `;

  block.append(wrapper);
}
