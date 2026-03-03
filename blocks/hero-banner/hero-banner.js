import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "../../scripts/swiper-bundle.min.js";

function isValidRow(row) {
  return (
    row.textContent.trim().length > 0 ||
    row.querySelector("picture") ||
    row.querySelector("a")
  );
}

/* ---------- Custom Nav: Arrows + Numbers ---------- */
function buildHeroNav(swiper, total) {
  const nav = document.createElement("div");
  nav.className = "hero-nav";

  /* Container */
  const container = document.createElement("div");
  container.className = "container";

  /* Prev */
  const prev = document.createElement("button");
  prev.className = "swiper-button-prev";
  prev.setAttribute("aria-label", "Previous slide");

  /* Next */
  const next = document.createElement("button");
  next.className = "swiper-button-next";
  next.setAttribute("aria-label", "Next slide");

  /* Numbers */
  const numbers = document.createElement("div");
  numbers.className = "hero-numbers";

  const nums = [];

  for (let i = 0; i < total; i += 1) {
    const num = document.createElement("span");
    num.className = "hero-num";
    num.textContent = String(i + 1).padStart(2, "0");

    num.addEventListener("click", () => swiper.slideToLoop(i));

    nums.push(num);
    numbers.append(num);
  }

  /* Build structure */
  container.append(prev, numbers, next);
  nav.append(container);
  swiper.el.append(nav);

  /* Events */
  prev.onclick = () => swiper.slidePrev();
  next.onclick = () => swiper.slideNext();

  function updateActive() {
    nums.forEach((n) => n.classList.remove("active"));
    nums[swiper.realIndex]?.classList.add("active");
  }

  swiper.on("slideChange", updateActive);
  updateActive();
}

export default async function decorate(block) {
  await loadScript(SWIPER_JS);

  const rows = [...block.children].filter(isValidRow);
  if (!rows.length) return;

  const swiper = document.createElement("div");
  swiper.className = "swiper hero-swiper";

  const wrapper = document.createElement("div");
  wrapper.className = "swiper-wrapper";

  rows.forEach((row) => {
    const cells = [...row.children];

    const [
      title,
      description,
      bgImage,
      bgVideo,
      knowLabel,
      knowLink,
      watchLabel,
      watchLink,
    ] = cells;

    /* ---------- Slide ---------- */
    const slide = document.createElement("div");
    slide.className = "swiper-slide hero-slide";

    /* ---------- Media ---------- */
    const media = document.createElement("div");
    media.className = "hero-media";

    const picture = bgImage?.querySelector("picture");
    if (picture) media.append(picture);

    const videoAnchor = bgVideo?.querySelector("a");
    if (videoAnchor) {
      const video = document.createElement("video");
      video.src = videoAnchor.href;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      media.append(video);
    }

    /* ---------- Content ---------- */
    const content = document.createElement("div");
    content.className = "hero-content";

    const container = document.createElement("div");
    container.className = "container";

    const contentInner = document.createElement("div");
    contentInner.className = "hero-content-inner";

    if (title?.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.innerHTML = title.innerHTML;
      contentInner.append(h3);
    }

    if (description?.innerHTML.trim()) {
      const div = document.createElement("div");
      div.className = "hero-desc";
      div.innerHTML = description.innerHTML;
      contentInner.append(div);
    }

    const actions = document.createElement("div");
    actions.className = "hero-actions";

    if (knowLabel?.textContent && knowLink?.querySelector("a")) {
      const a = knowLink.querySelector("a");
      a.textContent = knowLabel.textContent;
      a.className = "btn btn-primary";
      actions.append(a);
    }

    if (watchLabel?.textContent && watchLink?.querySelector("a")) {
      const a = watchLink.querySelector("a");
      a.textContent = watchLabel.textContent;
      a.className = "btn btn-outline-primary";
      actions.append(a);
    }

    contentInner.append(actions);
    container.append(contentInner);
    content.append(container);

    slide.append(media, content);
    wrapper.append(slide);
  });

  swiper.append(wrapper);
  block.append(swiper);
  block.classList.add("hero-banner-initialized");

  const swiperInstance = new Swiper(swiper, {
    loop: true,
    speed: 800,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });

  buildHeroNav(swiperInstance, rows.length);
}
