/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie site-wide cleanup.
 * Removes non-authorable content (header, footer, navigation, cookie consent,
 * tracking elements) so import contains only page-level authorable content.
 *
 * Selectors sourced from captured DOM (migration-work/cleaned.html):
 * - .cmp-experiencefragment--header (line 9): site header experience fragment
 * - .cmp-experiencefragment--footer (line 4432): site footer experience fragment
 * - #onetrust-consent-sdk (line 4928): OneTrust cookie consent banner/dialog
 * - .skip-link (line 17): skip to main content accessibility link
 * - link elements (lines 10-11): clientlib CSS references
 * - iframe (line 5183): OneTrust tracking iframes
 * - noscript: Google Tag Manager noscript fallbacks (line 2)
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

// Shared state for extracted metadata (populated in beforeTransform, consumed by import script)
export const extractedMeta = {};

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Extract date and category from .storyinfo before removing it
    const storyinfo = element.querySelector('.storyinfo');
    if (storyinfo) {
      const firstP = storyinfo.querySelector('p');
      if (firstP) {
        const categoryLink = firstP.querySelector('a');
        const category = categoryLink ? categoryLink.textContent.trim() : '';
        const textContent = firstP.textContent.trim();
        const date = textContent.replace(category, '').trim();
        if (date) extractedMeta.publishdate = date;
        if (category) extractedMeta.category = category;
      }
    }

    // Remove breadcrumbs (will be autoblocked from template)
    WebImporter.DOMUtils.remove(element, ['.button.back-cta', '.breadcrumb.abbvie-breadcrumb']);

    // Remove storyinfo (date/category extracted above; read-time will be autoblocked)
    WebImporter.DOMUtils.remove(element, ['.storyinfo']);

    // Remove elements that could interfere with block parsing:
    // - Cookie consent overlay/banner (covers content, may affect selectors)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome and global elements
    WebImporter.DOMUtils.remove(element, [
      // Header experience fragment (contains nav, logo, skip-link)
      '.cmp-experiencefragment--header',
      // Footer experience fragment
      '.cmp-experiencefragment--footer',
      // Skip to content link
      '.skip-link',
      // CSS link elements from clientlibs
      'link',
      // Tracking iframes
      'iframe',
      // GTM noscript fallbacks
      'noscript',
      // Departure warning popup modal
      '.modal-popup.popup-departure',
      '#abbvie-warn-on-departure-popup',
      // Back to top button
      '.button.back-to-top',
      // Tracking pixels (Twitter, analytics)
      'img[src*="t.co/i/adsct"]',
      'img[src*="analytics.twitter.com"]',
      // Sidebar related content (duplicates bottom related content section)
      '.grid-row__col-with-2.grid-cell .header.standard-header-with-divider',
      '.grid-row__col-with-2.grid-cell .cardpagestory',
    ]);
  }
}
