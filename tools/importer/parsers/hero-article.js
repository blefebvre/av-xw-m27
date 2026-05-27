/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-article
 * Base block: hero
 * Source: https://www.abbvie.com/who-we-are/our-stories/three-ways-ai-is-changing-drug-discovery-at-abbvie.html
 * Generated: 2026-05-27
 *
 * UE Model fields:
 *   - image (reference) + imageAlt (collapsed)
 *   - text (richtext)
 *
 * Source structure:
 *   .container.abbvie-container.large-radius.cmp-container-full-width
 *     > .cmp-container
 *       > img.cmp-container__bg-image (background image)
 */
export default function parse(element, { document }) {
  // Extract background image
  const bgImage = element.querySelector('img.cmp-container__bg-image, img[class*="bg-image"], img[class*="bg_image"]');

  // Extract text content (heading, description, CTA) if present
  // The UE model defines a richtext "text" field for heading/description/CTA
  const heading = element.querySelector('h1, h2, h3, .cmp-title__text, [class*="title"]');
  const description = element.querySelector('p:not(:empty), .cmp-text p, [class*="description"]');
  const ctaLinks = Array.from(element.querySelectorAll('a.cmp-button, a[class*="cta"], a[class*="button"]'));

  const cells = [];

  // Row 1: image (field: image, with imageAlt collapsed into alt attribute)
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (bgImage) {
    imageCell.appendChild(bgImage);
  }
  cells.push([imageCell]);

  // Row 2: text (richtext field containing heading, description, CTAs)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (description) textCell.appendChild(description);
  ctaLinks.forEach((link) => textCell.appendChild(link));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
