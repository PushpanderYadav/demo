import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
    const rows = [...block.children];

    // Metadata rows:
    // Title, Description, Desktop Image, Mobile Image, Image Alt
    const [titleRow, descriptionRow, imageRow, mobileImageRow, imageAltRow, ...items] = rows;

    const title = titleRow?.textContent?.trim() || "";
    const descriptionHTML =
        descriptionRow?.children[0]?.innerHTML ||
        descriptionRow?.innerHTML ||
        "";

    const desktopPicture = imageRow?.querySelector("picture");
    const mobilePicture = mobileImageRow?.querySelector("picture");
    const imageAlt = imageAltRow?.textContent?.trim() || title || "Section Image";

    block.innerHTML = "";

    const container = document.createElement("div");
    container.className = "cards-image-container container";

    /* =========================
       INTRO SECTION (Title + Description)
    ========================== */

    const introSection = document.createElement("div");
    introSection.className = "cards-image-intro text-center mb-5";

    if (titleRow) {
        const h2 = document.createElement("h2");
        h2.className = "cards-image-title";
        h2.textContent = title;
        moveInstrumentation(titleRow, h2);
        introSection.append(h2);
    }

    if (descriptionRow) {
        const desc = document.createElement("div");
        desc.className = "cards-image-description";
        desc.innerHTML = descriptionHTML;
        moveInstrumentation(descriptionRow, desc);
        introSection.append(desc);
    }

    container.append(introSection);

    /* =========================
       CARDS + IMAGE SECTION
    ========================== */

    if (items.length > 0) {
        const wrapper = document.createElement("div");
        wrapper.className = "cards-image-grid";

        const topRow = document.createElement("div");
        topRow.className = "row g-4 justify-content-center";

        const bottomRow = document.createElement("div");
        bottomRow.className = "row g-4 justify-content-center mt-4";

        // Create image element once
        let imageBlock = null;

        if (desktopPicture || mobilePicture) {
            imageBlock = document.createElement("div");
            imageBlock.className = "row my-5 justify-content-center";

            const imageCol = document.createElement("div");
            imageCol.className = "col-12 text-center cards-image-intro-img";

            const pictureWrap = document.createElement("div");
            pictureWrap.className = "cards-image-picture-wrap";

            if (desktopPicture) {
                const pic = desktopPicture.cloneNode(true);
                const img = pic.querySelector("img");
                if (img) img.alt = imageAlt;
                pic.classList.add("d-none", "d-md-block");
                moveInstrumentation(imageRow, pic);
                pictureWrap.append(pic);
            }

            if (mobilePicture) {
                const pic = mobilePicture.cloneNode(true);
                const img = pic.querySelector("img");
                if (img) img.alt = imageAlt;
                pic.classList.add("d-block", "d-md-none");
                moveInstrumentation(mobileImageRow, pic);
                pictureWrap.append(pic);
            }

            imageCol.append(pictureWrap);
            imageBlock.append(imageCol);
        }

        items.forEach((itemRow, index) => {
            const contentField = itemRow.children[0];
            const contentHTML = contentField?.innerHTML || "";

            const cardCol = document.createElement("div");
            cardCol.className = "col-md-5 col-lg-5 cards-image-card-col";

            const card = document.createElement("div");
            card.className =
                "cards-image-card h-100 p-4 shadow-sm border rounded";
            card.innerHTML = contentHTML;

            moveInstrumentation(itemRow, card);
            cardCol.append(card);

            if (index < 2) {
                topRow.append(cardCol);
            } else {
                bottomRow.append(cardCol);
            }
        });

        // Append structure in correct order
        wrapper.append(topRow);

        if (imageBlock) {
            wrapper.append(imageBlock);
        }

        wrapper.append(bottomRow);

        container.append(wrapper);
    }

    block.append(container);
}
