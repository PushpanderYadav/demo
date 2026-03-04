// import { loadCSS, loadScript } from "../../scripts/aem.js";

// const SWIPER_JS = "../../scripts/swiper-bundle.min.js";
// const SWIPER_CSS = "../../styles/swiper-bundle.min.css";

// export default async function decorate(block) {
//   await loadCSS(SWIPER_CSS);
//   await loadScript(SWIPER_JS);

//   const original = [...block.children];
//   if (!original.length) return;

//   const sectionTitle = original[0];
//   const sectionDesc = original[1];
//   const items = original.slice(2);

//   const sectionTitleText = sectionTitle?.textContent?.trim() || "";

//   block.classList.add("awards-recognitions");

//   const wrapper = document.createElement("div");
//   wrapper.className = "awards-wrapper";

//   /* ---------- Header ---------- */
//   if (sectionTitle || sectionDesc) {
//     const header = document.createElement("header");
//     header.className = "entry-container text-center mb-5";

//     if (sectionTitleText) {
//       const h2 = document.createElement("h2");
//       h2.className = "title";
//       h2.textContent = sectionTitleText;
//       header.appendChild(h2);
//     }

//     if (sectionDesc) {
//       const descText = sectionDesc.textContent.trim();
//       if (descText) {
//         const p = document.createElement("p");
//         p.className = "sec-desc";
//         p.textContent = descText;
//         header.appendChild(p);
//       }
//     }

//     wrapper.append(header);
//   }

//   /* ---------- Swiper ---------- */
//   const swiper = document.createElement("div");
//   swiper.className = "swiper awards-swiper";

//   const swiperWrapper = document.createElement("div");
//   swiperWrapper.className = "swiper-wrapper";

//   items.forEach((item) => {
//     if (!item || !item.children.length) return;

//     const fields = [...item.children]; // image, title, desc, alt-text

//     const slide = document.createElement("div");
//     slide.className = "swiper-slide";

//     const card = document.createElement("div");
//     card.className = "award-card";

//     /* ---------- Image + ALT TEXT ---------- */
//     if (fields[0]) {
//       const media = document.createElement("div");
//       media.className = "award-media";

//       const altText =
//         fields[3]?.textContent?.trim() || sectionTitleText;

//       const img = fields[0].querySelector("img");
//       if (img) {
//         img.alt = altText;
//       }

//       media.append(fields[0]); // UE node preserved
//       card.append(media);
//     }

//     /* ---------- Title + Description ---------- */
//     if (fields[1] || fields[2]) {
//       const content = document.createElement("div");
//       content.className = "award-card-body";

//       if (fields[1]) {
//         const text = fields[1].textContent.trim();
//         if (text) {
//           const title = document.createElement("h3");
//           title.textContent = text;
//           content.append(title);
//         }
//       }

//       if (fields[2]) {
//         const desc = document.createElement("div");
//         desc.className = "award-desc";
//         desc.innerHTML = fields[2].innerHTML;
//         content.append(desc);
//       }

//       card.append(content);
//     }

//     item.innerHTML = "";
//     item.append(card);

//     slide.append(item);
//     swiperWrapper.append(slide);
//   });

//   swiper.append(swiperWrapper);

//   const pagination = document.createElement("div");
//   pagination.className = "swiper-pagination";
//   swiper.append(pagination);

//   wrapper.append(swiper);

//   block.innerHTML = "";
//   block.append(wrapper);

//   new Swiper(swiper, {
//     loop: items.length > 1,
//     speed: 800,
//     slidesPerView: 1,
//     spaceBetween: 24,
//     pagination: {
//       el: pagination,
//       clickable: true,
//     },
//     breakpoints: {
//       768: { slidesPerView: 2 },
//       1024: { slidesPerView: 3 },
//     },
//   });
// }
import { loadCSS, loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  /* ----------------------------------
     Load Swiper (UI Safe)
  ---------------------------------- */
  // await loadCSS('/libs/swiper/swiper-bundle.min.css');
  await loadScript(
    "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js",
  );

  const original = [...block.children];
  if (!original.length) return;

  const sectionTitle = original[0];
  const sectionDesc = original[1];
  const items = original.slice(2);

  const sectionTitleText = sectionTitle?.textContent?.trim() || "";

  block.classList.add("awards-recognitions");

  const wrapper = document.createElement("div");
  wrapper.className = "awards-wrapper container";

  /* ---------- Header ---------- */
  if (sectionTitle || sectionDesc) {
    const header = document.createElement("header");
    header.className = "entry-container text-center mb-5";

    if (sectionTitleText) {
      const h2 = document.createElement("h2");
      h2.className = "title";
      h2.textContent = sectionTitleText;
      header.appendChild(h2);
    }

    if (sectionDesc) {
      const descText = sectionDesc.textContent.trim();
      if (descText) {
        const p = document.createElement("p");
        p.className = "sec-desc";
        p.textContent = descText;
        header.appendChild(p);
      }
    }

    wrapper.append(header);
  }

  /* ---------- Desktop Grid View ---------- */
  const grid = document.createElement("div");
  grid.className =
    "row g-4 desktop-grid d-none d-md-flex justify-content-center";

  items.forEach((item) => {
    if (!item || !item.children.length) return;

    // Clone the item for grid view
    const itemClone = item.cloneNode(true);
    const fields = [...itemClone.children];

    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6";

    const card = document.createElement("div");
    card.className = "award-card h-100";

    /* ---------- Image + ALT TEXT ---------- */
    if (fields[0]) {
      const media = document.createElement("div");
      media.className = "award-media";

      const altText = fields[3]?.textContent?.trim() || sectionTitleText;

      const img = fields[0].querySelector("img");
      if (img) {
        img.alt = altText;
      }

      media.append(fields[0]);
      card.append(media);
    }

    /* ---------- Title + Description ---------- */
    if (fields[1] || fields[2]) {
      const content = document.createElement("div");
      content.className = "award-card-body";

      if (fields[1]) {
        const text = fields[1].textContent.trim();
        if (text) {
          const title = document.createElement("h3");
          title.textContent = text;
          content.append(title);
        }
      }

      if (fields[2]) {
        const desc = document.createElement("div");
        desc.className = "award-desc";
        desc.innerHTML = fields[2].innerHTML;
        content.append(desc);
      }

      card.append(content);
    }

    itemClone.innerHTML = "";
    itemClone.append(card);
    col.append(itemClone);
    grid.append(col);
  });

  wrapper.append(grid);

  /* ---------- Mobile Swiper View ---------- */
  const swiper = document.createElement("div");
  swiper.className = "swiper awards-swiper d-md-none";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  items.forEach((item) => {
    if (!item || !item.children.length) return;

    // Clone the item for swiper view
    const itemClone = item.cloneNode(true);
    const fields = [...itemClone.children];

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const card = document.createElement("div");
    card.className = "award-card h-100";

    /* ---------- Image + ALT TEXT ---------- */
    if (fields[0]) {
      const media = document.createElement("div");
      media.className = "award-media";

      const altText = fields[3]?.textContent?.trim() || sectionTitleText;

      const img = fields[0].querySelector("img");
      if (img) {
        img.alt = altText;
      }

      media.append(fields[0]);
      card.append(media);
    }

    /* ---------- Title + Description ---------- */
    if (fields[1] || fields[2]) {
      const content = document.createElement("div");
      content.className = "award-card-body";

      if (fields[1]) {
        const text = fields[1].textContent.trim();
        if (text) {
          const title = document.createElement("h3");
          title.textContent = text;
          content.append(title);
        }
      }

      if (fields[2]) {
        const desc = document.createElement("div");
        desc.className = "award-desc";
        desc.innerHTML = fields[2].innerHTML;
        content.append(desc);
      }

      card.append(content);
    }

    itemClone.innerHTML = "";
    itemClone.append(card);
    slide.append(itemClone);
    swiperWrapper.append(slide);
  });

  swiper.append(swiperWrapper);

  const pagination = document.createElement("div");
  pagination.className = "swiper-pagination";
  swiper.append(pagination);

  wrapper.append(swiper);

  // Clear the original block and append wrapper
  block.innerHTML = "";
  block.append(wrapper);

  // Initialize Swiper only for mobile view
  if (window.innerWidth < 768) {
    new Swiper(swiper, {
      loop: items.length > 1,
      speed: 800,
      slidesPerView: 1,
      spaceBetween: 24,
      pagination: {
        el: pagination,
        clickable: true,
      },
    });
  }

  // Handle window resize to initialize/destroy swiper
  let swiperInstance = null;

  window.addEventListener("resize", function () {
    if (window.innerWidth < 768 && !swiperInstance) {
      swiperInstance = new Swiper(swiper, {
        loop: items.length > 1,
        speed: 800,
        slidesPerView: 1,
        spaceBetween: 24,
        pagination: {
          el: pagination,
          clickable: true,
        },
      });
    } else if (window.innerWidth >= 768 && swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
  });
}
