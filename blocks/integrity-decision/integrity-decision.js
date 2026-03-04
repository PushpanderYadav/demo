export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitle = rows[0]?.textContent.trim() || "";
  const sectionDesc = rows[1]?.textContent.trim() || "";
  const cardRows = rows.slice(2);

  /* Hide authored rows (UE safe) */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ================================
     2️⃣ Build section layout
  ================================ */
  const section = document.createElement("section");
  section.className = "sec-integrity spacer";

  section.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-md-8 mx-auto text-center mb-5">
          ${sectionTitle ? `<h2 class="sec-title">${sectionTitle}</h2>` : ""}
          ${sectionDesc ? `<div class="sec-desc">${sectionDesc}</div>` : ""}
        </div>
      </div>
      <div class="integrity-cards"></div>
    </div>
  `;

  block.append(section);

  const cardsWrapper = section.querySelector(".integrity-cards");

  /* ================================
     3️⃣ Build cards
     Structure:
     cell[0] → image
     cell[1] → title
     cell[2] → description
     cell[3] → ctaText (optional)
     cell[4] → ctaLink (optional)
  ================================ */
  cardRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const img = cells[0]?.querySelector("img");
    const title = cells[1]?.textContent.trim() || "";
    const desc = cells[2]?.textContent.trim() || "";

    /* ✅ New JSON fields */
    const ctaText = cells[3]?.textContent.trim() || "";
    const ctaLink = cells[4]?.textContent.trim() || "";

    /* CTA only if both exist */
    const showCTA = ctaText && ctaLink;

    const card = document.createElement("div");
    card.className = "integrity-card";

    card.innerHTML = `
      <div class="card-ui">

        ${
          img
            ? `
          <div class="card-icon">
            <img src="${img.src}" alt="${img.alt || title}">
          </div>`
            : ""
        }

        ${title ? `<h3 class="card-title">${title}</h3>` : ""}

        ${desc ? `<div class="card-desc">${desc}</div>` : ""}

        ${
          showCTA
            ? `
          <div class="card-action mt-4">
            <a 
              href="${ctaLink}" 
              class="btn-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${ctaText}
            </a>
          </div>`
            : ""
        }

      </div>
    `;

    cardsWrapper.append(card);
  });
}