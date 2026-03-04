export default function decorate(block) {
  const authoredRows = [...block.children];

  // Detect AEM editor mode
  const isEditor = document.documentElement.classList.contains(
    "aem-AuthorLayer-Edit",
  );

  // Extract authoring data BEFORE removing nodes
  const firstRow = authoredRows[0];
  const cells = firstRow ? [...firstRow.children] : [];

  const imageSrc = cells[0]?.querySelector("img")?.src || "";
  const linkedin = cells[1]?.innerText.trim() || "";
  const facebook = cells[2]?.innerText.trim() || "";
  const youtube = cells[3]?.innerText.trim() || "";
  const buttonLabel = cells[4]?.innerText.trim() || "";
  const textHtml = cells[5]?.innerHTML || "";

  /* -----------------------------
     BUILD ENHANCED UI
  --------------------------------*/
  const wrapper = document.createElement("div");
  wrapper.className = "footer-enhanced-wrapper";

  wrapper.innerHTML = `
    <div class="footer-top bg-primary">
      <div class="container d-flex flex-wrap align-items-md-start align-items-center gap-2">

        <div class="footertopbar-image">
          ${imageSrc ? `<img src="${imageSrc}" alt="">` : ""}
        </div>

        <div class="ms-md-auto social-links d-flex gap-2">
          ${linkedin ? `<a href="${linkedin}"><img src="/icons/linkedin-icon.svg"></a>` : ""}
          ${facebook ? `<a href="${facebook}"><img src="/icons/facebook-icon.svg"></a>` : ""}
          ${youtube ? `<a href="${youtube}"><img src="/icons/youtube-icon.svg"></a>` : ""}
        </div>

        <div class="group-btn ms-md-0 ms-auto">
          ${
            buttonLabel
              ? `<button class="btn btn-primary" type="button"
                   data-bs-toggle="collapse"
                   data-bs-target="#groupCollapse">${buttonLabel} <span></span></button>`
              : ""
          }
        </div>

        <div class="footertopbar-text">${textHtml}</div>
      </div>
    </div>

    <div id="groupCollapse" class="footer-collapse collapse bg-royal-blue text-white">
      <div class="container py-5">
        <div class="row"></div>
      </div>
    </div>
  `;

  // Insert wrapper
  block.appendChild(wrapper);

  const loopRow = wrapper.querySelector(".row");

  // Build extra columns based on authored rows
  authoredRows.slice(1).forEach((row) => {
    const col = document.createElement("div");
    col.classList.add("col-md-3", "loop-item");

    [...row.children].forEach((child) => {
      col.appendChild(child.cloneNode(true));
    });

    loopRow.appendChild(col);
  });

  /* -----------------------------
     REMOVE authored table on LIVE
     KEEP visible inside AEM editor
  --------------------------------*/
  if (!isEditor) {
    authoredRows.forEach((r) => r.remove());
  }
}
