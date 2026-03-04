export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 5) return;

  block.classList.add("banner-overlay-sec");

  /* =========================
     Read UE-authored fields
  ========================== */
  const imageRow = rows[0];      // Desktop image (always required)
  const titleRow = rows[1];      // Title
  const descRow = rows[2];       // Description
  const buttonTextRow = rows[3]; // Button text
  const buttonLinkRow = rows[4]; // Button link
  
  // Get title text for possible alt text fallback
  let titleText = "";
  if (titleRow && titleRow.children.length > 0) {
    titleText = titleRow.children[0].textContent.trim();
  }
  
  console.log("Title text for alt fallback:", titleText);

  // Mobile image is optional - check if 6th row exists and has content
  let mobileImageRow = null;
  let pictureMobile = null;
  
  // Alt text is optional - check different possible positions
  let altText = "";
  
  // OPTION 1: Alt text might be in row 5 (if no mobile image) or row 6 (if mobile image)
  // But from your logs, you have 6 rows with mobile image, so alt text should be in row 6
  // However, row 6 is your mobile image!
  
  // OPTION 2: Check if mobile image row has alt text as second cell
  if (rows.length >= 6) {
    mobileImageRow = rows[5];
    
    // Check if this is actually a mobile image row or an alt text row
    if (mobileImageRow && mobileImageRow.children.length > 0) {
      const firstCell = mobileImageRow.children[0];
      
      // Check if it has a picture (it's a mobile image)
      pictureMobile = firstCell.querySelector("picture");
      
      if (!pictureMobile) {
        // This might be an alt text row instead!
        altText = firstCell.textContent.trim();
        console.log("Found alt text in row 6:", altText);
      } else {
        console.log("Row 6 is a mobile image, not alt text");
        
        // Check if there's a 7th row for alt text
        if (rows.length >= 7) {
          const altTextRow = rows[6];
          if (altTextRow && altTextRow.children.length > 0) {
            altText = altTextRow.children[0].textContent.trim();
            console.log("Found alt text in row 7:", altText);
          }
        }
      }
    }
  }

  const pictureDesktop = imageRow.querySelector("picture");

  const titleCell = titleRow.children[0];
  const descCell = descRow.children[0];
  const btnText = buttonTextRow.textContent.trim();
  const btnLink =
    buttonLinkRow.querySelector("a")?.getAttribute("href") ||
    buttonLinkRow.textContent.trim();

  const hasDesc = descCell && descCell.textContent.trim().length > 0;
  const hasButton = btnText.length > 0 && btnLink.length > 0;
  const hasMobileImage = pictureMobile !== null;
  
  // Determine what alt text to use
  let finalAltText = altText;
  
  // If no alt text specified, check if desktop image already has alt text
  if (!finalAltText && pictureDesktop) {
    const desktopImg = pictureDesktop.querySelector('img');
    if (desktopImg && desktopImg.getAttribute('alt')) {
      finalAltText = desktopImg.getAttribute('alt');
      console.log("Using existing desktop image alt text:", finalAltText);
    }
  }
  
  // If still no alt text, use title as fallback
  if (!finalAltText && titleText) {
    finalAltText = titleText;
    console.log("Using title as alt text fallback:", finalAltText);
  }
  
  const hasFinalAltText = finalAltText.length > 0;
  console.log("Final alt text to use:", finalAltText);

  /* =========================
     Build flat Structure
  ========================== */
  const container = document.createElement("div");
  container.className = "container";

  const bannerOverlay = document.createElement("div");
  bannerOverlay.className = "banner-overlay";

  /* ---- Background Images ---- */
  // Desktop image (always shown)
  if (pictureDesktop) {
    pictureDesktop.classList.add("banner-overlay-img");
    // Only add desktop-only class if we have a mobile image
    if (hasMobileImage) {
      pictureDesktop.classList.add("desktop-only");
    }
    
    // Apply alt text if available
    if (hasFinalAltText) {
      const desktopImg = pictureDesktop.querySelector('img');
      if (desktopImg) {
        desktopImg.setAttribute('alt', finalAltText);
        console.log("Set desktop alt to:", finalAltText);
      }
    }
    
    bannerOverlay.append(pictureDesktop);
  }

  // Mobile image (optional, only if exists)
  if (hasMobileImage) {
    pictureMobile.classList.add("banner-overlay-img", "mobile-only");
    
    // Apply alt text if available - USE SAME ALT TEXT AS DESKTOP
    if (hasFinalAltText) {
      const mobileImg = pictureMobile.querySelector('img');
      if (mobileImg) {
        mobileImg.setAttribute('alt', finalAltText);
        console.log("Set mobile alt to:", finalAltText);
      }
    }
    
    bannerOverlay.append(pictureMobile);
  }

  /* ---- Overlay Content ---- */
  const overlay = document.createElement("div");
  overlay.className = "banner-overlay-text";

  const row = document.createElement("div");
  row.className = "row";

  const col = document.createElement("div");
  col.className = "col-lg-7 col-md-8";

  /* ---- Title ---- */
  if (titleCell) {
    let h2 = titleCell.querySelector("h2");

    // Convert <p> → <h2> if h2 doesn't exist
    if (!h2) {
      const p = titleCell.querySelector("p");

      if (p) {
        h2 = document.createElement("h2");
        h2.innerHTML = p.innerHTML; // keep formatting
        p.replaceWith(h2);
      } else {
        // fallback: wrap plain text
        h2 = document.createElement("h2");
        h2.innerHTML = titleCell.innerHTML;
        titleCell.innerHTML = "";
        titleCell.appendChild(h2);
      }
    }

    h2.classList.add("sec-title", "mb-4");
    col.append(titleCell);
  }

  /* ---- Description (optional) ---- */
  if (hasDesc) {
    descCell.classList.add("sec-desc", "mb-4");
    col.append(descCell);
  }

  /* ---- Button ---- */
  if (hasButton) {
    const btn = document.createElement("a");
    btn.href = btnLink;
    btn.className = "btn btn-primary btn-lg";
    btn.textContent = btnText;
    col.append(btn);
  }

  row.append(col);
  overlay.append(row);
  bannerOverlay.append(overlay);
  container.append(bannerOverlay);

  /* =========================
     Assemble (UE-safe)
  ========================== */
  block.innerHTML = "";
  block.append(container);
  
}