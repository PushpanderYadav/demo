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
     2️⃣ Hide authored rows
  ================================ */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ================================
     3️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "expertise-runtime";

  runtime.innerHTML = `
    <section class="sec-expertise spacer">
      <div class="container">  
        <div class="row justify-content-center g-4">
          <div class="col-12">
            <div class="row">
              <div class="col-md-7 text-center mx-auto">
                <h2 class="sec-title">${sectionTitle}</h2>
                <div class="sec-desc">${sectionDesc}</div>
              </div>
            </div>   
          </div>
        </div>     
      </div>
    </section>
  `;

  block.after(runtime);

  const cardsRow = runtime.querySelector(".row.justify-content-center");

  /* ================================
     4️⃣ Build cards
  ================================ */
  cardRows.forEach((row) => {
    const cells = [...row.children];

    // Need 6 cells → image, alt, title, desc, label, link
    if (cells.length < 6) return;

    const imgCell = cells[0];
    const altCell = cells[1];
    const titleCell = cells[2];
    const descCell = cells[3];
    const ctaLabelCell = cells[4]; // Read More text
    const ctaLinkCell = cells[5]; // actual link

    const authoredAlt = altCell?.textContent?.trim() || "";
    const title = titleCell?.textContent?.trim() || "";
    const desc = descCell?.innerHTML?.trim() || "";
    const finalAlt = authoredAlt || title || "";

    /* ================================
       CTA extraction (FIXED)
    ================================ */
    let ctaText = ctaLabelCell?.textContent?.trim() || "";
    let ctaHref = "";
    let ctaTarget = "_self";

    const link = ctaLinkCell?.querySelector("a");

    if (link && link.href) {
      ctaHref = link.href;
      ctaTarget = link.target || "_self";
    }

    /* ================================
       Card wrapper
    ================================ */
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const card = document.createElement("div");
    card.className = "card card-ui-one";

    /* Image handling */
    const picture = imgCell?.querySelector("picture");

    if (picture) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "card-img";

      let pictureHtml = picture.outerHTML;

      if (finalAlt) {
        const temp = document.createElement("div");
        temp.innerHTML = pictureHtml;
        const img = temp.querySelector("img");
        if (img) img.setAttribute("alt", finalAlt);
        pictureHtml = temp.innerHTML;
      }

      imgWrap.innerHTML = pictureHtml;
      card.append(imgWrap);
    }

    /* Content */
    const content = document.createElement("div");
    content.className = "card-body";

    content.innerHTML = `
      ${title ? `<h3 class="card-title">${title}</h3>` : ""}
      <div class="card-desc">${desc}</div>
      ${
        ctaText && ctaHref
          ? `<div class="card-cta">
               <a href="${ctaHref}" target="${ctaTarget}" class="btn-link">
                 ${ctaText}
               </a>
             </div>`
          : ""
      }
    `;

    card.append(content);
    col.append(card);
    cardsRow.append(col);
  });
}
