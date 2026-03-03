
export default function decorate(block) {
  // Your actual rows are inside the first child div
  const row = block.querySelector(":scope > div");
  if (!row) return;

  const items = [...row.children]; // 4 inner divs

  // Create container
  const container = document.createElement("div");
  container.className = "container";

  // Create extra wrapper inside container
  const wrapper = document.createElement("div");
  wrapper.className = "row align-items-center";

  // Column 1
  const col1 = document.createElement("div");
  col1.className = "col-md-4 copyright opacity-50";
  col1.append(items[0]);
  wrapper.append(col1);

  // Column 2
  const col2 = document.createElement("div");
  col2.className =
    "col-md-3 d-flex justify-content-center align-items-center logo fw-medium gap-3";
  const span = document.createElement("span");
  span.textContent = "SECURED BY:";
  col2.append(span);
  col2.append(items[1]);

  wrapper.append(col2);

  // Column 3
  const col3 = document.createElement("div");
  col3.className = "col-md-5 links";
  col3.append(items[2]);
  wrapper.append(col3);

  // Append wrapper inside container
  container.append(wrapper);

  // Remove original row
  //row.remove();

  // Append container to block
  block.append(container);

  // Remove hidden metadata row
  if (items[3]) items[3].remove();
}

