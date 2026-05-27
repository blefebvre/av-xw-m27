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

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
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
    ]);
  }
}
