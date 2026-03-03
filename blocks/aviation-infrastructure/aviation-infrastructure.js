export default function decorate(block) {
  const [headingRow, descriptionRow] = [...block.children];

  // Instrumentation for Universal Editor
  block.setAttribute('data-aue-type', 'component');
  block.setAttribute('data-aue-model', 'aviation-infrastructure');

  if (headingRow) {
    const heading = headingRow.querySelector('div');
    heading.setAttribute('data-aue-prop', 'heading');
    heading.setAttribute('data-aue-type', 'text');
  }

  if (descriptionRow) {
    const description = descriptionRow.querySelector('div');
    description.setAttribute('data-aue-prop', 'description');
    description.setAttribute('data-aue-type', 'richtext');
  }
}