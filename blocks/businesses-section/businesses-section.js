export default function decorate(block) {
  const children = [...block.children];

  /* ===============================
     HEADER
  =============================== */

  const header = document.createElement("header");
  header.className = "business-accordion-header";

  const h2 = document.createElement("h2");
  const title = children[0]?.textContent || "";
  const subtitle = children[1]?.textContent || "";
  h2.innerHTML = `<span class="title">${title}</span> <span class="subtitle">${subtitle}</span>`;
  header.appendChild(h2);

  const intro = document.createElement("div");
  intro.className = "intro-text";
  intro.innerHTML = children[2]?.innerHTML || "";
  header.appendChild(intro);

  /* ===============================
     WRAPPER
  =============================== */

  const wrapper = document.createElement("div");
  wrapper.className = "business-accordion-wrapper";
  wrapper.appendChild(header);

  /* ===============================
     CONTAINER
  =============================== */

  const container = document.createElement("div");
  container.className = "business-accordion-container";

  const imagePreview = document.createElement("div");
  imagePreview.className = "business-image-preview";
  container.appendChild(imagePreview);

  /* ===============================
     ACCORDION
  =============================== */

  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = "businessAccordion";

  const businessItems = children.slice(3);

  businessItems.forEach((item, index) => {
    item.classList.add("accordion-item");
    if (index === 0) item.classList.add("active");

    const itemChildren = [...item.children];

    /* ---------- Header ---------- */

    const accordionHeader = document.createElement("h2");
    accordionHeader.className = "accordion-header";
    accordionHeader.id = `heading${index}`;

    const button = document.createElement("button");
    button.className = `accordion-button ${index !== 0 ? "collapsed" : ""}`;
    button.type = "button";
    button.setAttribute("data-bs-toggle", "collapse");
    button.setAttribute("data-bs-target", `#collapse${index}`);
    button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
    button.setAttribute("aria-controls", `collapse${index}`);

    const titleEl =
      item.querySelector('[name="title"]') ||
      itemChildren[1] ||
      itemChildren[0];

    const businessTitle =
      titleEl?.textContent?.trim() || `Business ${index + 1}`;

    const titleSpan = document.createElement("span");
    titleSpan.className = "business-title";
    titleSpan.textContent = businessTitle;
    button.appendChild(titleSpan);

    /* ---------- Icons ---------- */

    const iconSpan = document.createElement("span");
    iconSpan.className = "accordion-icon";

    const iconWrapper = document.createElement("span");
    iconWrapper.className = "icon-wrapper";

    const plusIcon = document.createElement("span");
    plusIcon.className = `plus-icon ${index === 0 ? "d-none" : ""}`;
    plusIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14m-7 7V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;

    const minusIcon = document.createElement("span");
    minusIcon.className = `minus-icon ${index === 0 ? "" : "d-none"}`;
    minusIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;

    iconWrapper.appendChild(plusIcon);
    iconWrapper.appendChild(minusIcon);
    iconSpan.appendChild(iconWrapper);
    button.appendChild(iconSpan);

    accordionHeader.appendChild(button);
    item.innerHTML = "";
    item.appendChild(accordionHeader);

    /* ---------- Collapse ---------- */

    const collapseDiv = document.createElement("div");
    collapseDiv.className = `accordion-collapse collapse ${
      index === 0 ? "show" : ""
    }`;
    collapseDiv.id = `collapse${index}`;
    collapseDiv.setAttribute("data-bs-parent", "#businessAccordion");

    const accordionBody = document.createElement("div");
    accordionBody.className = "accordion-body";

    /* ---------- Description ---------- */

    const descDiv = document.createElement("div");
    descDiv.className = "business-description";
    const descEl =
      item.querySelector('[name="description"]') || itemChildren[2];
    if (descEl) descDiv.innerHTML = descEl.innerHTML || "";
    accordionBody.appendChild(descDiv);

    /* ---------- CTA ---------- */

    const ctaDiv = document.createElement("div");
    ctaDiv.className = "business-cta";
    const ctaLabelEl = itemChildren[3];
    const ctaLinkEl = itemChildren[4];
    if (ctaLabelEl) {
      const a = document.createElement("a");
      a.href = (ctaLinkEl?.textContent || "#").trim();
      a.className = "btn-link";
      a.textContent = ctaLabelEl.textContent.trim();
      ctaDiv.appendChild(a);
    }
    accordionBody.appendChild(ctaDiv);

    /* ---------- Image (ONLY ALT ADDED) ---------- */

    const imgEl = item.querySelector('[name="image"]') || itemChildren[0];

let imageClone = null;

if (imgEl) {
  imageClone = imgEl.cloneNode(true);

  const img = imageClone.querySelector("img");
  if (img) {
    const currentAlt = img.getAttribute("alt")?.trim();

    // ✅ If alt is blank → fallback to business title
    if (!currentAlt) {
      img.alt = businessTitle;
    }
  }

  const imgDiv = document.createElement("div");
  imgDiv.className = "business-image";
  imgDiv.appendChild(imageClone.cloneNode(true));
  accordionBody.appendChild(imgDiv);
}


    /* ---------- Default preview image ---------- */

    if (index === 0 && imageClone) {
      imagePreview.innerHTML = "";
      imagePreview.appendChild(imageClone.cloneNode(true));
    }

    collapseDiv.appendChild(accordionBody);
    item.appendChild(collapseDiv);
    accordion.appendChild(item);

    /* ---------- Bootstrap events ---------- */

    if (window.bootstrap) {
      collapseDiv.addEventListener("show.bs.collapse", () => {
        item.classList.add("active");
        plusIcon.classList.add("d-none");
        minusIcon.classList.remove("d-none");

        if (imageClone) {
          imagePreview.innerHTML = "";
          imagePreview.appendChild(imageClone.cloneNode(true));
          imagePreview.classList.remove("fade-in");
          void imagePreview.offsetWidth;
          imagePreview.classList.add("fade-in");
        }
      });

      collapseDiv.addEventListener("hide.bs.collapse", () => {
        item.classList.remove("active");
        plusIcon.classList.remove("d-none");
        minusIcon.classList.add("d-none");
      });
    }
  });

  /* ===============================
     FINAL APPEND
  =============================== */

  container.appendChild(accordion);
  wrapper.appendChild(container);

  block.innerHTML = "";
  block.appendChild(wrapper);
}
