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

  // CTA fields
  let ctaLabelNode = null;
  let ctaLinkNode = null;

  /* ================================
     CLASSIFY ALL CHILD NODES
     (LANGUAGE SAFE + STRUCTURE BASED)
  ================================ */

  original.forEach((child, index) => {
    const p = child.querySelector && child.querySelector("p");
    const a = child.querySelector && child.querySelector("a.button");

    // Pictures
    if (hasPicture(child)) {
      pictureNodes.push(child);
      return;
    }

    // CTA link field
    if (a) {
      ctaLinkNode = child;

      // CTA label = previous paragraph node
      const prev = original[index - 1];
      if (prev?.querySelector?.("p")) {
        ctaLabelNode = prev;
      }
      return;
    }

    // Section title (first paragraph only)
    if (!sectionTitleNode && p) {
      sectionTitleNode = child;
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

  /* ================================
     MAIN WRAPPERS
  ================================ */

  const section = document.createElement("div");
  section.className = "sec-career spacer";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row";

  const col1 = document.createElement("div");
  col1.className = "col-md-6 col-lg-4";

  const col2 = document.createElement("div");
  col2.className = "col-md-6 col-lg-4";

  const col3 = document.createElement("div");
  col3.className =
    "col-md-12 col-lg-4 d-flex flex-md-column flex-column-reverse";

  /* -------------------------
     COLUMN 1 – TWO IMAGES
  ------------------------- */

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

  /* ================================
     CTA MERGE
     LABEL → translated
     LINK → always original
  ================================ */

  const ctaWrap = document.createElement("div");
  ctaWrap.className = "cta careerBtn";

  const finalBtn = document.createElement("a");
  finalBtn.className = "btn btn-primary btn-lg w-100";

  // CTA LABEL (can change per language)
  if (ctaLabelNode) {
    const p = ctaLabelNode.querySelector("p");
    if (p?.textContent?.trim()) {
      finalBtn.textContent = p.textContent.trim();
    }
  }

  // CTA LINK (always keep original resolved URL)
  if (ctaLinkNode) {
    const a = ctaLinkNode.querySelector("a");
    if (a) {
      // browser resolved URL → prevents /ja/# rewrite
      finalBtn.href = new URL(a.href, window.location.origin).href;

      if (a.title) finalBtn.title = a.title;

      // optional flag to prevent other scripts rewriting
      finalBtn.setAttribute("data-fixed-link", "true");
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

  block.innerHTML = "";

  if (sectionTitleNode) {
    const header = document.createElement("header");
    header.className = "mb-md-5 mb-4 text-center";

    const p = sectionTitleNode.querySelector("p");

    if (p) {
      const h2 = document.createElement("h2");
      h2.className = "sec-title";
      h2.innerHTML = p.innerHTML;
      p.replaceWith(h2);
    }

    header.appendChild(sectionTitleNode);
    container.appendChild(header);
  }

  container.appendChild(row);
  section.appendChild(container);
  block.appendChild(section);
}
