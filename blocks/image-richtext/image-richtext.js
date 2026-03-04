import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
    const rows = [...block.children];

    const [contentRow, imageRow, imageAltRow] = rows;

    const contentHTML = contentRow?.innerHTML || "";
    const picture = imageRow?.querySelector("picture");
    const imageAlt = imageAltRow?.textContent?.trim() || "Image content";

    block.innerHTML = "";

    const container = document.createElement("div");
    container.className = "image-richtext-container container";

    const row = document.createElement("div");
    row.className = "row align-items-center";

    // Content Column
    const contentCol = document.createElement("div");
    contentCol.className = "col-lg-6 image-richtext-content-col";

    if (contentRow) {
        const content = document.createElement("div");
        content.className = "image-richtext-text";
        content.innerHTML = contentHTML;
        moveInstrumentation(contentRow, content);
        contentCol.append(content);
    }

    // Image Column
    const imageCol = document.createElement("div");
    imageCol.className = "col-lg-6 image-richtext-img-col";

    if (picture) {
        const pic = picture.cloneNode(true);
        const img = pic.querySelector("img");
        if (img) img.alt = imageAlt;
        moveInstrumentation(imageRow, pic);
        imageCol.append(pic);
    }

    row.append(contentCol, imageCol);
    container.append(row);
    block.append(container);
}
