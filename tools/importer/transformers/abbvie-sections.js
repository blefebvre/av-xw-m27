/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie section breaks and section metadata.
 * Inserts <hr> section separators and Section Metadata blocks based on
 * template section definitions from page-templates.json.
 *
 * Runs only in afterTransform. Processes sections in reverse order to
 * maintain DOM positions during insertion.
 *
 * Template sections (story-article):
 * 1. Hero: .container.abbvie-container.large-radius.cmp-container-full-width (line 3689)
 * 2. Article Body: .grid-row__col-with-8.grid-cell (line 3735)
 * 3. Related Content Sidebar: .grid-row__col-with-2.grid-cell .container.abbvie-container.height-short (line 4324)
 * 4. Related Content Bottom: #container-9dbfe90168 (line 4363) - style: "dark"
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process sections in reverse order to preserve DOM positions
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const selector = section.selector;

    // Find the first element matching the section selector
    const sectionEl = element.querySelector(selector);
    if (!sectionEl) continue;

    // Add Section Metadata block if section has a style
    if (section.style) {
      const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(sectionMetadata);
    }

    // Insert <hr> before every section except the first
    if (i > 0) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
