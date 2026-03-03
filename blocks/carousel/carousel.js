export default function decorate(block) {
  const slides = [...block.children];

  // Wrap slides in track
  const track = document.createElement("div");
  track.classList.add("carousel-track");

  slides.forEach(slide => track.appendChild(slide));
  block.appendChild(track);

  let index = 0;

  // Navigation buttons
  const btnContainer = document.createElement("div");
  btnContainer.classList.add("carousel-buttons");
  btnContainer.innerHTML = `
    <button class="carousel-button prev">&#10094;</button>
    <button class="carousel-button next">&#10095;</button>
  `;
  block.appendChild(btnContainer);

  const prevBtn = btnContainer.querySelector(".prev");
  const nextBtn = btnContainer.querySelector(".next");

  // Indicators
  const indicatorContainer = document.createElement("div");
  indicatorContainer.classList.add("carousel-indicators");
  block.appendChild(indicatorContainer);

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("active");
    indicatorContainer.appendChild(dot);
  });

  const indicators = indicatorContainer.querySelectorAll("button");

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
    indicators.forEach(btn => btn.classList.remove("active"));
    indicators[index].classList.add("active");
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateCarousel();
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  indicators.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      index = i;
      updateCarousel();
    });
  });

  // Auto-slide
  setInterval(() => {
    index = (index + 1) % slides.length;
    updateCarousel();
  }, 4000);
}
