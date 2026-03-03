export default function decorate(block) {
  const authoredRows = [...block.children];

  // Extract first row fields
  const firstRow = authoredRows[0];
  const cells = firstRow ? [...firstRow.children] : [];

  // Prevent duplicated logo image: extract only src
  let image = "";
  if (cells[0]) {
    const img = cells[0].querySelector("img");
    image = img ? img.src : "";
  }

  const linkedin = cells[1] ? cells[1].innerText.trim() : "";
  const facebook = cells[2] ? cells[2].innerText.trim() : "";
  const youtube = cells[3] ? cells[3].innerText.trim() : "";
  const buttonLabel = cells[4] ? cells[4].innerText.trim() : "";
  const textHtml = cells[5] ? cells[5].innerHTML : "";

  const blueStrip = document.createElement("div");
  blueStrip.classList.add("footer-top", "bg-primary");

  const blueContainer = document.createElement("div");
  blueContainer.classList.add("container");

  const item = document.createElement("div");
  item.classList.add("d-flex", "gap-2");

  item.innerHTML = `
      <div class="footertopbar-image">
        ${image ? `<img src="${image}" alt="">` : ""}
      </div>

      <div class="ms-auto social-links d-flex gap-2">
        ${
          linkedin
            ? `<a href="${linkedin}"><img src="/icons/linkedin-icon.svg" alt="Linkedin" /></a>`
            : ""
        }
        ${
          facebook
            ? `<a href="${facebook}"><img src="/icons/facebook-icon.svg" alt="Facebook" /></a>`
            : ""
        }
        ${
          youtube
            ? `<a href="${youtube}"><img src="/icons/youtube-icon.svg" alt="YouTube" /></a>`
            : ""
        }
      </div>

      <div class="group-btn">
        ${
          buttonLabel
            ? `<button class="btn btn-primary" type="button" data-bs-toggle="collapse"
                 data-bs-target="#groupWebsiteCollapse" aria-expanded="false"
                 aria-controls="groupWebsiteCollapse">${buttonLabel} <span></span></button>`
            : ""
        }
      </div>

      <div class="footertopbar-text">
        ${textHtml}
      </div>
    `;

  blueContainer.appendChild(item);
  blueStrip.appendChild(blueContainer);

  const collapseSection = document.createElement("div");
  collapseSection.classList.add(
    "footer-collapse",
    "bg-royal-blue",
    "text-white",
    "collapse"
  );
  collapseSection.id = "groupWebsiteCollapse";

  const collapseContainer = document.createElement("div");
  collapseContainer.classList.add("container", "py-5");

  const loopRow = document.createElement("div");
  loopRow.classList.add("row", "g-5");

  authoredRows.slice(1).forEach((row) => {
    const loopItem = document.createElement("div");
    loopItem.classList.add("loop-item", "col-md-3");

    while (row.firstChild) {
      loopItem.appendChild(row.firstChild);
    }

    loopRow.appendChild(loopItem);
  });

  collapseContainer.appendChild(loopRow);
  collapseSection.appendChild(collapseContainer);

  // Replace content
  block.innerHTML = "";
  block.appendChild(blueStrip);
  block.appendChild(collapseSection);
}


