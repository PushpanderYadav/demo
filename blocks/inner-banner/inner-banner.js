export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 6) return;

  /* ==============================
     1️⃣ Read UE fields
     ============================== */
  const [
    textRow,
    buttonLabelRow,
    buttonLinkRow,
    videoRow,
    desktopImageRow,
    mobileImageRow,
  ] = rows;

  const heroHTML = textRow?.innerHTML || "";
  const buttonLabel = buttonLabelRow?.textContent?.trim();
  const buttonLink = buttonLinkRow?.textContent?.trim() || "#";
  const videoURL = videoRow?.querySelector("a")?.href || "";

  const desktopPicture = desktopImageRow?.querySelector("picture");
  const mobilePicture = mobileImageRow?.querySelector("picture");

  /* ==============================
     2️⃣ Clear author DOM
     ============================== */
  block.innerHTML = "";

  /* ==============================
     3️⃣ Root wrapper
     ============================== */
  const hero = document.createElement("div");
  hero.className = "inner-hero";

  /* ==============================
     4️⃣ Image Wrapper
     ============================== */
  if (desktopPicture || mobilePicture) {
    const imgWrap = document.createElement("div");
    imgWrap.className = "inner-hero-img";

    if (desktopPicture) {
      const desktopClone = desktopPicture.cloneNode(true);
      desktopClone.classList.add("d-none", "d-md-block");
      imgWrap.append(desktopClone);
    }

    if (mobilePicture) {
      const mobileClone = mobilePicture.cloneNode(true);
      mobileClone.classList.add("d-block", "d-md-none");
      imgWrap.append(mobileClone);
    }

    hero.append(imgWrap);
  }

  /* ==============================
     5️⃣ Overlay
     ============================== */
  const overlay = document.createElement("div");
  overlay.className = "inner-hero-overlay";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row align-items-center";

  /* ---------- Left Column ---------- */
  const leftCol = document.createElement("div");
  leftCol.className = "col-md-6 inner-hero-content";

  const textWrap = document.createElement("div");
  textWrap.className = "inner-hero-text";
  textWrap.innerHTML = heroHTML;
  leftCol.append(textWrap);

  if (buttonLabel) {
    const btn = document.createElement("a");
    btn.className = "btn btn-primary mt-4";
    btn.href = buttonLink;
    btn.textContent = buttonLabel;
    leftCol.append(btn);
  }

  /* ---------- Right Column (Video) ---------- */
  const rightCol = document.createElement("div");
  rightCol.className =
    "col-md-6 inner-hero-video d-flex align-items-center justify-content-center text-center";

  if (videoURL) {
    const playBtn = document.createElement("button");
    playBtn.className = "inner-hero-play";
    playBtn.setAttribute("aria-label", "Play video");
    playBtn.innerHTML = "Play Video";

    playBtn.addEventListener("click", () => openVideoModal(videoURL));

    rightCol.append(playBtn);
  }

  /* ==============================
     6️⃣ Assemble DOM
     ============================== */
  row.append(leftCol, rightCol);
  container.append(row);
  overlay.append(container);
  hero.append(overlay);
  block.append(hero);

  block.classList.add("inner-hero-initialized");

  /* ==============================
     7️⃣ Bootstrap Video Modal
     ============================== */
  function openVideoModal(url) {
    let modal = document.getElementById("videoModal");

    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal fade";
      modal.id = "videoModal";
      modal.tabIndex = -1;

      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content bg-black">
            <button type="button" class="btn-close btn-close-white ms-auto m-2"
              data-bs-dismiss="modal" aria-label="Close"></button>
            <div class="ratio ratio-16x9">
              <iframe id="videoIframe"
                src=""
                title="YouTube video"
                allow="autoplay; encrypted-media"
                allowfullscreen>
              </iframe>
            </div>
          </div>
        </div>
      `;

      document.body.append(modal);

      // Stop video on close
      modal.addEventListener("hidden.bs.modal", () => {
        modal.querySelector("#videoIframe").src = "";
      });
    }

    const iframe = modal.querySelector("#videoIframe");
    iframe.src = `${convertToEmbed(url)}?autoplay=1&rel=0`;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }

  /* ==============================
     8️⃣ YouTube URL Helper
     ============================== */
  function convertToEmbed(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
}
