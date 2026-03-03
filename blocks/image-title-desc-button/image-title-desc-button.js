export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 5) return;

  block.classList.add("image-title-desc-button");

  /* =========================
     Read UE-authored fields
  ========================== */
  const imageRow = rows[0];
  const titleRow = rows[1];
  const descRow = rows[2];
  const buttonTextRow = rows[3];
  const buttonLinkRow = rows[4];

  const picture = imageRow.querySelector("picture");

  const titleCell = titleRow.children[0];
  const descCell = descRow.children[0];
  const btnText = buttonTextRow.textContent.trim();
  const btnLink =
    buttonLinkRow.querySelector("a")?.getAttribute("href") ||
    buttonLinkRow.textContent.trim();

  const hasDesc = descCell && descCell.textContent.trim().length > 0;
  const hasButton = btnText.length > 0 && btnLink.length > 0;

  /* =========================
     Build flat Structure
  ========================== */
  const flat = document.createElement("section");
  flat.className = "flat-banner position-relative";

  /* ---- Background Image ---- */
  if (picture) {
    picture.classList.add("flat-bg");
    flat.append(picture);
  }

  /* ---- Overlay Content ---- */
  const overlay = document.createElement("div");
  overlay.className =
    "flat-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-8 mx-auto text-center text-white";

  /* ---- Title ---- */
  if (titleCell) {
    const h2 = titleCell.querySelector("h2") || titleCell;
    h2.classList.add("flat-title", "mb-4");
    col.append(titleCell);
  }

  /* ---- Description (optional) ---- */
  if (hasDesc) {
    descCell.classList.add("flat-desc", "mb-4");
    col.append(descCell);
  }

  /* ---- Button ---- */
  if (hasButton) {
    const btn = document.createElement("a");
    btn.href = btnLink;
    btn.className = "btn btn-primary btn-lg";
    btn.textContent = btnText;
    col.append(btn);
  }

  row.append(col);
  container.append(row);
  overlay.append(container);
  flat.append(overlay);

  /* =========================
     Assemble (UE-safe)
  ========================== */
  block.innerHTML = "";
  block.append(flat);
}
