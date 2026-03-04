export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 7) return;           // now expect 7 rows minimum

  block.classList.add("image-title-desc-button");

  /* ────────────────────────────────────────
     Updated row mapping after adding alt-text
  ────────────────────────────────────────── */
  const imageDesktopRow = rows[0];
  const imageMobileRow  = rows[1];
  const altTextRow      = rows[2];          // ← NEW: imageAlt1
  const titleRow        = rows[3];          // shifted +1
  const descRow         = rows[4];
  const buttonTextRow   = rows[5];
  const buttonLinkRow   = rows[6];

  const titleCell = titleRow.children[0];
  const descCell  = descRow.children[0];
  const btnText   = buttonTextRow.textContent.trim();
  const btnLink   =
    buttonLinkRow.querySelector("a")?.getAttribute("href") ||
    buttonLinkRow.textContent.trim();

  // Alt logic: authored alt > title text > ""
  const authoredAlt = altTextRow?.textContent?.trim() || "";
  const titleText   = titleCell?.textContent?.trim() || "";
  const finalAlt    = authoredAlt || titleText || "";

  const hasDesc   = descCell && descCell.textContent.trim().length > 0;
  const hasButton = btnText.length > 0 && btnLink.length > 0;

  /* ────────────────────────────────────────
     Build structure
  ────────────────────────────────────────── */
  const flat = document.createElement("section");
  flat.className = "flat-banner position-relative";

  /* Background Image + Alt handling */
  const desktopImg = imageDesktopRow.querySelector("img");
  const mobileImg  = imageMobileRow.querySelector("img");

  if (desktopImg) {
    const desktopBaseSrc = desktopImg.src.split("?")[0];
    desktopImg.src = `${desktopBaseSrc}?width=2400&quality=90&format=jpg`;
    desktopImg.classList.add("flat-bg");
    desktopImg.removeAttribute("width");
    desktopImg.removeAttribute("height");

    // Apply final alt
    desktopImg.setAttribute("alt", finalAlt);

    if (mobileImg) {
      const picture = document.createElement("picture");

      const mobileBaseSrc = mobileImg.src.split("?")[0];
      const source = document.createElement("source");
      source.media = "(max-width: 767px)";
      source.srcset = `${mobileBaseSrc}?width=900&quality=90&format=jpg`;

      // Also set alt on mobile image
      mobileImg.setAttribute("alt", finalAlt);

      picture.appendChild(source);
      picture.appendChild(desktopImg);
      flat.append(picture);
    } else {
      flat.append(desktopImg);
    }
  }

  // Clean up authored rows
  imageDesktopRow.remove();
  imageMobileRow.remove();

  /* Overlay Content */
  const overlay = document.createElement("div");
  overlay.className =
    "flat-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-8 mx-auto text-center text-white";

  if (titleCell) {
    const h2 = titleCell.querySelector("h2") || titleCell;
    h2.classList.add("flat-title", "mb-4");
    col.append(titleCell);
  }

  if (hasDesc) {
    descCell.classList.add("flat-desc", "mb-4");
    col.append(descCell);
  }

  if (hasButton) {
    const btn = document.createElement("a");
    btn.href = btnLink;
    btn.className = "btn btn-primary";
    btn.textContent = btnText;
    col.append(btn);
  }

  row.append(col);
  container.append(row);
  overlay.append(container);
  flat.append(overlay);

  block.innerHTML = "";
  block.append(flat);
}