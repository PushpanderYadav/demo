export default function decorate(block) {
  // keep original nodes (AEM editable fields)
  const original = [...block.children];

  // helpers
  const hasPicture = (node) =>
    !!node.querySelector && !!node.querySelector("picture");

  // FIELD HOLDERS
  let sectionTitleNode = null;
  const pictureNodes = [];
  let blueCardNode = null;

  // NEW: CTA fields captured separately
  let ctaLabelNode = null; // The p tag: CTA Button Label
  let ctaLinkNode = null; // The <a class="button">

  // CLASSIFY ALL CHILD NODES
  original.forEach((child) => {
    const p = child.querySelector && child.querySelector("p");
    const a = child.querySelector && child.querySelector("a.button");

    // Section title (first text node but not CTA)
    if (!sectionTitleNode && p && !p.textContent.includes("Explore Life")) {
      sectionTitleNode = child;
      return;
    }

    // Pictures
    if (hasPicture(child)) {
      pictureNodes.push(child);
      return;
    }

    // CTA label text (p field)
    if (p && p.textContent.includes("Explore Life")) {
      ctaLabelNode = child;
      return;
    }

    // CTA button link (a field)
    if (a) {
      ctaLinkNode = child;
      return;
    }

    // Blue card content
    if (
      !blueCardNode &&
      (child.querySelector("h2") ||
        child.querySelector("h3") ||
        child.querySelector("p"))
    ) {
      blueCardNode = child;
      return;
    }
  });

  // MAIN WRAPPERS
  const section = document.createElement("div");
  section.className = "sec-career spacer";
  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const col1 = document.createElement("div");
  col1.className = "col-md-4";

  const col2 = document.createElement("div");
  col2.className = "col-md-4";

  const col3 = document.createElement("div");
  col3.className = "col-md-4 d-flex flex-column";

  /* -------------------------
     COLUMN 1 – TWO IMAGES
  ------------------------- */

  // Image 1 (top left)
  if (pictureNodes[0]) {
    const wrap1 = document.createElement("div");
    wrap1.className = "careerImg picone";
    wrap1.appendChild(pictureNodes[0]);

    const img = wrap1.querySelector("img");
    if (img) {
      img.setAttribute("data-aue-prop", "imageOffice");
      img.setAttribute("data-aue-label", "Image 1 (Top Left)");
      img.setAttribute("data-aue-type", "media");
    }

    col1.appendChild(wrap1);
  }

  // Image 2 (bottom left)
  if (pictureNodes[1]) {
    const wrap2 = document.createElement("div");
    wrap2.className = "careerImg pictwo";
    wrap2.appendChild(pictureNodes[1]);

    const img = wrap2.querySelector("img");
    if (img) {
      img.setAttribute("data-aue-prop", "imageTeamSmall");
      img.setAttribute("data-aue-label", "Image 2 (Bottom Left)");
      img.setAttribute("data-aue-type", "media");
    }

    col1.appendChild(wrap2);
  }

  /* -------------------------
     COLUMN 2 – BLUE CARD
  ------------------------- */

  if (blueCardNode) {
    const cardContent = document.createElement("div");
    cardContent.className = "cardContent";
    cardContent.appendChild(blueCardNode);
    col2.appendChild(cardContent);
  }

  /* -------------------------
     COLUMN 3 – LARGE IMAGE + CTA
  ------------------------- */

  // Image 3 (right side)
  if (pictureNodes[2]) {
    const wrap3 = document.createElement("div");
    wrap3.className = "careerImg picthree";
    wrap3.appendChild(pictureNodes[2]);

    const img = wrap3.querySelector("img");
    if (img) {
      img.setAttribute("data-aue-prop", "imageTeamLarge");
      img.setAttribute("data-aue-label", "Image 3 (Right Side)");
      img.setAttribute("data-aue-type", "media");
    }

    col3.appendChild(wrap3);
  }

  // --- CTA MERGE FIX ---
  const ctaWrap = document.createElement("div");
  ctaWrap.className = "cta careerBtn";

  const finalBtn = document.createElement("a");
  finalBtn.className = "btn btn-primary btn-lg w-100";

  // CTA LABEL (from text field)
  if (ctaLabelNode) {
    const p = ctaLabelNode.querySelector("p");
    if (p) {
      finalBtn.textContent = p.textContent.trim();
    }
  }

  // CTA URL/TITLE (from button field)
  if (ctaLinkNode) {
    const a = ctaLinkNode.querySelector("a");
    if (a) {
      finalBtn.href = a.href;
      if (a.title) finalBtn.title = a.title;
    }
  }

  ctaWrap.appendChild(finalBtn);
  col3.appendChild(ctaWrap);

  /* -------------------------
     ASSEMBLE FINAL STRUCTURE
  ------------------------- */

  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);

  // Clear AEM block first
  block.innerHTML = "";

  // Add header wrapper
  if (sectionTitleNode) {
    const header = document.createElement("header");
    header.className = "mb-5 text-center";

    const p = sectionTitleNode.querySelector("p");

    if (p) {
      const h2 = document.createElement("h2");
      h2.className = "sec-title";
      h2.innerHTML = p.innerHTML; // preserve authored content
      p.replaceWith(h2);
    }

    header.appendChild(sectionTitleNode);
    container.appendChild(header);
  }
  container.appendChild(row);
  section.appendChild(container);
  block.appendChild(section);
}
