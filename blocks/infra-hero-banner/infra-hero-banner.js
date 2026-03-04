export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 9) return;
 
  const [
    bgDesktopRow,
    bgMobileRow,
    titleRow,
    subtitleRow,
    descRow,
    extraRow,
    ctaTextRow,
    ctaLinkRow,
    alignmentRow,
  ] = rows;
 
  const hero = document.createElement('div');
  hero.className = 'infra-hero';
 
  const bg = document.createElement('div');
  bg.className = 'infra-hero-bg';
 
  const content = document.createElement('div');
  content.className = 'infra-hero-content';
 
  /* =============================
     Background Image (STYLE SAFE)
  ============================== */
  const desktopImg = bgDesktopRow.querySelector('img');
  const mobileImg = bgMobileRow.querySelector('img');
 
  if (desktopImg) {
    const desktopBaseSrc = desktopImg.src.split('?')[0];
    desktopImg.src = `${desktopBaseSrc}?width=2400&quality=90&format=jpg`;
    desktopImg.className = 'infra-hero-bg-img';
    desktopImg.removeAttribute('width');
    desktopImg.removeAttribute('height');
 
    // ✅ ONLY use <picture> when mobile image exists
    if (mobileImg) {
      const picture = document.createElement('picture');
 
      const mobileBaseSrc = mobileImg.src.split('?')[0];
      const source = document.createElement('source');
      source.media = '(max-width: 767px)';
      source.srcset = `${mobileBaseSrc}?width=900&quality=90&format=jpg`;
 
      picture.appendChild(source);
      picture.appendChild(desktopImg);
 
      bg.appendChild(picture);
    } else {
      // ✅ EXACT old structure → styles preserved
      bg.appendChild(desktopImg);
    }
  }
 
  bgDesktopRow.remove();
  bgMobileRow.remove();
 
  /* =============================
     Alignment
  ============================== */
  const alignment = alignmentRow.textContent.trim().toLowerCase();
  hero.classList.add(alignment === 'left' ? 'align-left' : 'align-right');
  alignmentRow.remove();
 
  /* =============================
     Content
  ============================== */
  if (titleRow?.textContent.trim()) {
    titleRow.classList.add('infra-hero-title');
    content.appendChild(titleRow);
  } else titleRow?.remove();
 
  if (subtitleRow?.textContent.trim()) {
    subtitleRow.classList.add('infra-hero-subtitle');
    content.appendChild(subtitleRow);
  } else subtitleRow?.remove();
 
  if (descRow?.textContent.trim()) {
    descRow.classList.add('infra-hero-description');
    content.appendChild(descRow);
  } else descRow?.remove();
 
  if (extraRow?.textContent.trim()) {
    content.appendChild(extraRow);
  } else extraRow?.remove();
 
  /* =============================
     CTA
  ============================== */
  const ctaText = ctaTextRow.textContent.trim();
  const ctaLink = ctaLinkRow.textContent.trim();
 
  if (ctaText && ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'btn btn-primary';
    cta.textContent = ctaText;
    cta.href = ctaLink;
    cta.setAttribute('data-aue-link', 'true');
    content.appendChild(cta);
  }
 
  ctaTextRow.remove();
  ctaLinkRow.remove();
 
  hero.append(bg, content);
  block.prepend(hero);
}