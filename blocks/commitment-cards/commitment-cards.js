export default function decorate(block) {
  const rows = [...block.children];

  const outerContainer = document.createElement("div");
  outerContainer.className = "sec-commitment spacer";

  const container = document.createElement("div");
  container.className = "container";

  // ---- Header ----
  const headerRow = rows.shift();
  headerRow.classList.add("sec-head", "mb-5", "text-center");

  const p = headerRow.querySelector("p");
  let hasHeaderContent = false;

  if (p) {
    const h2 = document.createElement("h2");
    h2.className = "sec-title fw-normal";
    h2.innerHTML = p.innerHTML; // preserve authored content

    // Check if header has actual content (not just whitespace/empty)
    const headerText = p.textContent.trim();
    if (headerText) {
      p.replaceWith(h2);
      hasHeaderContent = true;
    } else {
      // Remove the empty paragraph but don't add h2
      p.remove();
    }
  }

  // ---- Grid ----
  const grid = document.createElement("div");
  grid.className = "row";

  rows.forEach((row) => {
    row.classList.add("col-md-6", "comm-card", "mb-md-0", "mb-5");

    const cells = [...row.children];

    const imageCell = cells[0];
    const titleCell = cells[1];
    const descCell = cells[2];
    const buttonTextCell = cells[3];
    const buttonLinkCell = cells[4];

    // Image
    imageCell?.classList.add("comm-card-img");

    // ---- Title: <p> → <h3> ----
    if (titleCell) {
      titleCell.classList.add("comm-card-title");
      const p = titleCell.querySelector("p");
      if (p) {
        const h3 = document.createElement("h3");
        h3.innerHTML = p.innerHTML;
        p.replaceWith(h3);
      }
    }

    // ---- Body wrapper ----
    const body = document.createElement("div");
    body.className = "comm-card-body";

    descCell?.classList.add("comm-card-desc");


    // if (buttonLinkCell ) {
    //   ctaWrapper = buttonLinkCell;
    //   ctaWrapper.classList.add("button-container");

    //   ctaLink = ctaWrapper.querySelector("a");
    //   if (!ctaLink) {
    //     ctaLink = document.createElement("a");
    //     ctaWrapper.append(ctaLink);
    //   }

    //   const linkHref =
    //     buttonLinkCell.querySelector("a")?.getAttribute("href") || "";
    //   const buttonText = buttonTextCell?.textContent?.trim() || "";

    //   if (linkHref) ctaLink.href = linkHref;
    //   if (buttonText) ctaLink.textContent = buttonText;

    //   ctaLink.classList.add("btn", "btn-primary");
    // }

    let ctaWrapper;
    let ctaLink;

    const buttonText = buttonTextCell?.textContent?.trim() || "";

    if (buttonLinkCell && buttonText) {
      ctaWrapper = buttonLinkCell;
      ctaWrapper.classList.add("button-container");

      ctaLink = ctaWrapper.querySelector("a");
      if (!ctaLink) {
        ctaLink = document.createElement("a");
        ctaWrapper.append(ctaLink);
      }

      const linkHref =
        buttonLinkCell.querySelector("a")?.getAttribute("href") || "";

      if (linkHref) ctaLink.href = linkHref;
      ctaLink.textContent = buttonText;

      ctaLink.classList.add("btn", "btn-primary");
    }

// remove authored button rows always
buttonTextCell?.remove();
buttonLinkCell?.remove();

    // remove plain button text row
    buttonTextCell?.remove();

    // Move nodes into body (UE-safe)
    if (titleCell) body.append(titleCell);
    if (descCell) body.append(descCell);
    if (ctaWrapper) body.append(ctaWrapper);

    row.append(body);
    grid.append(row);
  });

  // Only append headerRow if it has content
  if (hasHeaderContent) {
    container.append(headerRow);
  } else {
    // Remove headerRow entirely if empty
    headerRow.remove();
  }

  container.append(grid);
  outerContainer.append(container);
  block.append(outerContainer);
}
