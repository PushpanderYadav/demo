export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 8) return;

  const [
    bgRow,
    titleRow,
    subtitleRow,
    descRow,
    extraRow,
    ctaTextRow,
    ctaLinkRow,
    alignmentRow,
  ] = rows;

  /* =============================
     Create wrapper
  ============================== */
  const hero = document.createElement('div');
  hero.className = 'infra-hero';

  const bg = document.createElement('div');
  bg.className = 'infra-hero-bg';

  const content = document.createElement('div');
  content.className = 'infra-hero-content';

  /* =============================
     Background image (USE + REMOVE)
  ============================== */
  const img = bgRow.querySelector('img');
  if (img) {
    bg.style.backgroundImage = `url(${img.src})`;
  }
  bgRow.remove(); // ✅ MUST

  /* =============================
     Alignment (READ + REMOVE)
  ============================== */
  const alignment = alignmentRow.textContent.trim().toLowerCase();
  hero.classList.add(alignment === 'left' ? 'align-left' : 'align-right');
  alignmentRow.remove(); // ✅ FIXES "Right" repetition

  /* =============================
     Move visible content rows
  ============================== */
  [titleRow, subtitleRow, descRow, extraRow].forEach((row) => {
    if (row && row.textContent.trim()) {
      content.appendChild(row); // MOVE, not clone
    } else if (row) {
      row.remove();
    }
  });

  /* =============================
     CTA (READ + REMOVE)
  ============================== */
  const ctaText = ctaTextRow.textContent.trim();
  const ctaLink = ctaLinkRow.textContent.trim();

  if (ctaText && ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'infra-hero-cta';
    cta.textContent = ctaText;
    cta.href = ctaLink;
    cta.setAttribute('data-aue-link', 'true');
    content.appendChild(cta);
  }

  // ✅ Remove config-only rows
  ctaTextRow.remove();
  ctaLinkRow.remove();

  /* =============================
     Assemble
  ============================== */
  hero.append(bg, content);
  block.prepend(hero);
}
