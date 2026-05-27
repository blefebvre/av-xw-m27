/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-author.
 * Base block: quote.
 * Source: https://www.abbvie.com/who-we-are/our-stories/three-ways-ai-is-changing-drug-discovery-at-abbvie.html
 * Generated: 2026-05-27
 *
 * UE Model fields:
 *   - quotation (richtext): The quote text
 *   - attribution (richtext): Author photo, name, and title
 */
export default function parse(element, { document }) {
  // Extract quote text from p.cmp-quote__text
  const quoteTextEl = element.querySelector('p.cmp-quote__text, .cmp-quote__text');

  // Build quotation cell content - strip the icon span, keep only text
  const quotationFrag = document.createDocumentFragment();
  quotationFrag.appendChild(document.createComment(' field:quotation '));
  if (quoteTextEl) {
    // Clone the paragraph and remove the decorative icon span
    const quoteClone = quoteTextEl.cloneNode(true);
    const iconSpan = quoteClone.querySelector('span.abbvie-icon-quote');
    if (iconSpan) iconSpan.remove();
    // Create a clean paragraph with the quote text
    const p = document.createElement('p');
    p.innerHTML = quoteClone.innerHTML.trim();
    quotationFrag.appendChild(p);
  }

  // Extract author block
  const authorBlock = element.querySelector('.cmp-quote__author-block');
  const authorImg = element.querySelector('img.author-img, .cmp-quote__author-block img');
  const authorName = element.querySelector('span.author-name, .author-name');
  const authorTitle = element.querySelector('span.author-title, .author-title');

  // Build attribution cell content: image + name + title
  const attributionFrag = document.createDocumentFragment();
  attributionFrag.appendChild(document.createComment(' field:attribution '));
  if (authorImg) {
    attributionFrag.appendChild(authorImg);
  }
  // Combine author name and title as text
  const parts = [];
  if (authorName) {
    parts.push(authorName.textContent.replace(/<br\s*\/?>/gi, '').trim());
  }
  if (authorTitle) {
    parts.push(authorTitle.textContent.replace(/<br\s*\/?>/gi, '').trim());
  }
  if (parts.length > 0) {
    const span = document.createElement('span');
    span.textContent = parts.join(', ');
    attributionFrag.appendChild(span);
  }

  // Build cells matching library example structure:
  // Row 1: quotation (quote text)
  // Row 2: attribution (author photo + name, title)
  const cells = [
    [quotationFrag],
    [attributionFrag],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-author', cells });
  element.replaceWith(block);
}
