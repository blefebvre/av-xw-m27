/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-leader
 * Base block: cards
 * Source: https://www.abbvie.com/science/our-people/our-rd-leaders.html
 * Selector: .cardpagestory.card-standard.card-small.standard-title
 *
 * Collects ALL sibling card elements from the parent grid and produces
 * a single cards-leader block with one row per leader. Only the first
 * matched element triggers block creation; subsequent siblings are consumed
 * and removed during that first pass.
 */
export default function parse(element, { document }) {
  // Find ALL matching cards in the entire document (they may be in different grid cells)
  const allCards = [...document.querySelectorAll('.cardpagestory.card-standard.card-small.standard-title')];

  const cells = [];

  allCards.forEach((card) => {
    // Mark as consumed so subsequent parse calls skip it
    card.dataset.cardsParsed = 'true';

    const cardLink = card.querySelector(':scope > a');
    const href = cardLink ? cardLink.getAttribute('href') : '';

    // Extract headshot image
    const img = card.querySelector('.card-image-container img, img.card-image');

    // Extract text content
    const title = card.querySelector('h4.card-title, h3.card-title, .card-title');
    const description = card.querySelector('p.card-description, .card-description');
    const ctaSpan = card.querySelector('.card-cta');

    // Build image cell
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      imageCell.appendChild(img);
    }

    // Build text cell
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (title) {
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

    if (href && ctaSpan) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = ctaSpan.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(link);
      textCell.appendChild(p);
    } else if (href && title) {
      const firstName = title.textContent.trim().split(/[,\s]/)[0];
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = `Meet ${firstName}`;
      const p = document.createElement('p');
      p.appendChild(link);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  // Create single block with all cards as rows
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-leader', cells });

  // Remove all other card elements from the DOM
  allCards.forEach((card) => {
    if (card !== element) card.remove();
  });

  // Replace the first card with the consolidated block
  element.replaceWith(block);
}
