/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-article
 * Base block: cards
 * Source: https://www.abbvie.com/who-we-are/our-stories/three-ways-ai-is-changing-drug-discovery-at-abbvie.html
 * Selector: .cardpagestory.card-standard
 * Generated: 2026-05-27
 *
 * UE Model: container block "cards" with child "card" items.
 * Each card item has fields: image (reference), text (richtext).
 * Structure: one row per card, two columns: [image, text].
 * The text column combines category, title, description, and CTA link.
 */
export default function parse(element, { document }) {
  const cells = [];

  // The source element is a single card instance (.cardpagestory.card-standard)
  // Extract the link wrapping the card
  const cardLink = element.querySelector(':scope > a');
  const href = cardLink ? cardLink.getAttribute('href') : '';

  // Extract image
  const img = element.querySelector('.card-image-container img, img.card-image');

  // Extract text content elements
  const eyebrow = element.querySelector('.card-eyebrow');
  const title = element.querySelector('h4.card-title, h3.card-title, h2.card-title, .card-title');
  const description = element.querySelector('p.card-description, .card-description');
  const ctaText = element.querySelector('.card-cta');

  // Build image cell with field hint
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (img) {
    imageCell.appendChild(img);
  }

  // Build text cell with field hint - combines category, title, description, and CTA
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    textCell.appendChild(p);
  }

  if (title) {
    // Preserve as strong/bold heading per library example
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = title.textContent.trim();
    p.appendChild(strong);
    textCell.appendChild(p);
  }

  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    textCell.appendChild(p);
  }

  // Build CTA as a link using the card's href
  if (href && ctaText) {
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = ctaText.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(link);
    textCell.appendChild(p);
  } else if (href) {
    // Fallback: use href with generic text
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = 'Learn More';
    const p = document.createElement('p');
    p.appendChild(link);
    textCell.appendChild(p);
  }

  // Container block: each card is one row with [image, text] columns
  cells.push([imageCell, textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
