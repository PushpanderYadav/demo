import { loadCSS, loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  /* ----------------------------------
     Load Swiper (UI Safe)
  ---------------------------------- */
  //   await loadCSS('/libs/swiper/swiper-bundle.min.css');
  await loadScript("../../scripts/swiper-bundle.min.js");

  /* ----------------------------------
     Read authored content
  ---------------------------------- */
  const rows = [...block.children];

  const sectionTitle = rows[0]?.querySelector("p")?.textContent || "";
  const sectionDesc = rows[1]?.querySelector("p")?.textContent || "";

  const itemRows = rows.slice(2);

  /* ----------------------------------
     Build Swiper Markup
  ---------------------------------- */
  const section = document.createElement("div");
  section.className = "sec-brand spacer";

  const container = document.createElement("div");
  container.className = "container";

  container.innerHTML = `
    <div class="row">
        <div class="col-md-7 text-center mx-auto mb-5">
         <h2 class="sec-title">${sectionTitle}</h2>
          <p class="sec-desc">${sectionDesc}</p>        
        </div>
    </div>
    <div class="swiper gmr-brand-swiper">
      <div class="swiper-wrapper"></div>
      <div class="gmr-swiper-nav d-flex gap-3 justify-content-center mt-4">
        <button class="swiper-button-prev"></button>
        <button class="swiper-button-next"></button>
      </div>
    </div>
  `;

  const swiperWrapper = container.querySelector(".swiper-wrapper");

  /* ----------------------------------
     Build Slides from UE content
  ---------------------------------- */
  itemRows.forEach((row) => {
    const img = row.querySelector("picture");
    const title = row.children[1]?.textContent || "";
    const desc = row.children[2]?.innerHTML || "";
    const ctaText = row.children[3]?.textContent || "Read More";
    const ctaLink = row.children[3]?.querySelector("a")?.href || "#";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="card card-ui-two h-100 p-4">
        <div class="card-img">${img?.outerHTML || ""}</div>

        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <div class="card-text mb-3">${desc}</div>
          <div class="card-cta mt-auto">
            <a href="${ctaLink}" class="btn-link">
                ${ctaText}
            </a>
          </div>
        </div>
      </div>
    `;

    swiperWrapper.appendChild(slide);
  });

  /* ----------------------------------
     Replace block HTML
  ---------------------------------- */
  block.innerHTML = "";
  section.appendChild(container);
  block.appendChild(section);

  /* ----------------------------------
     Init Swiper
  ---------------------------------- */
  // eslint-disable-next-line no-undef
  new Swiper(".gmr-brand-swiper", {
    slidesPerView: 1.1,
    spaceBetween: 24,
    loop: false,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      768: {
        slidesPerView: 2.2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
}
