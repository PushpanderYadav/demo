export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const sectionTitleRow = rows[0];
  const sectionDescRow = rows[1];
  const cardRows = rows.slice(2);

  const sectionTitle = sectionTitleRow.textContent.trim();
  const sectionDesc = sectionDescRow.innerHTML;

  /* ================================
     2️⃣ Hide authored rows (DO NOT REMOVE)
     ================================ */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ================================
     3️⃣ Runtime wrapper
     ================================ */
  const runtime = document.createElement("div");
  runtime.className = "innovation-runtime";

  runtime.innerHTML = `
    <section class="sec-innovation spacer">
      <div class="container">
        <div class="my-5 ps-5 ms-5">
          <div class="row">
            <div class="col-md-6">
              <h2 class="sec-title text-primary">${sectionTitle}</h2>
              <div class="sec-desc">${sectionDesc}</div>
            </div>
          </div>
        </div>
        <div class="innovation-row"></div>
      </div>
    </section>
  `;

  block.after(runtime);

  const cardsRow = runtime.querySelector(".innovation-row");

  /* ================================
     4️⃣ Build cards + ACTIVE logic
     ================================ */
  cardRows.forEach((row, index) => {
    const cells = [...row.children];

    const picture = cells[0]?.querySelector("img");
    const title = cells[1]?.textContent?.trim() || "";
    const desc = cells[2]?.textContent?.trim() || "";
    const cta = cells[3]?.textContent?.trim() || "READ MORE";

    const col = document.createElement("div");
    col.className = "innovation-col";

    const card = document.createElement("div");
    card.className = "card card-overlay";

    // ✅ Set first card active
    if (index === 0) {
      col.classList.add("active");
    }

    /* Image */
    if (picture?.src) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "card-img";

      const img = document.createElement("img");
      img.src = picture.src;
      img.alt = picture.alt || "";

      imgWrap.append(img);
      card.append(imgWrap);
    }

    /* Content */
    const content = document.createElement("div");
    content.className = "card-body";

    content.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <p class="card-desc">${desc}</p>
      <div class="card-cta">
        <a href="#" class="btn-link">${cta}</a>
      </div>
    `;

    card.append(content);
    col.append(card);
    cardsRow.append(col);

    /* ================================
       5️⃣ Click handling
       ================================ */
    col.addEventListener("click", () => {
      // Remove active from all cards
      cardsRow
        .querySelectorAll(".innovation-col.active")
        .forEach((c) => c.classList.remove("active"));

      // Add active to clicked card
      col.classList.add("active");
    });
  });
}
