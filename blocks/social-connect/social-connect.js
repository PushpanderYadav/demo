export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add("social-connect", "mb-5", "mt-5");

  /* ================================
     1️⃣ Extract authored elements
     Order must match model fields
     ================================ */
  const [
    titleRow,
    instagramRow,
    xRow,
    linkedinRow,
    youtubeRow,
    whatsappRow,
    facebookRow,
  ] = rows;

  const socialItems = [
    { name: "instagram", row: instagramRow },
    { name: "x", row: xRow },
    { name: "linkedin", row: linkedinRow },
    { name: "youtube", row: youtubeRow },
    { name: "whatsapp", row: whatsappRow }, // ✅ added here
    { name: "facebook", row: facebookRow },
  ].filter(({ row }) => row?.textContent?.trim());

  /* ================================
     2️⃣ Build runtime layout
     ================================ */
  const container = document.createElement("div");
  container.className = "container";

  const layout = document.createElement("div");
  layout.className =
    "d-flex flex-column flex-md-row align-items-center justify-content-between gap-3";

  /* ---- Title ---- */
  const titleWrap = document.createElement("div");
  titleWrap.className = "social-connect-title";

  if (titleRow) {
    const p = titleRow.querySelector("p");

    if (p) {
      const h4 = document.createElement("h4");
      h4.innerHTML = p.innerHTML;
      h4.className = "social-connect-heading m-0 fw-normal";
      p.replaceWith(h4);
    }

    titleWrap.append(titleRow);
  }

  /* ---- Icons ---- */
  const iconsWrap = document.createElement("div");
  iconsWrap.className = "social-connect-icons d-flex align-items-center gap-3";

  socialItems.forEach(({ name, row }) => {
    const url = row.textContent.trim();

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = `social-icon social-${name}`;
    a.setAttribute("aria-label", name);

    const icon = document.createElement("span");
    icon.className = `icon icon-${name}`;

    a.append(icon);
    iconsWrap.append(a);

    // remove original authored row
    row.remove();
  });

  layout.append(titleWrap, iconsWrap);
  container.append(layout);
  block.append(container);
}
