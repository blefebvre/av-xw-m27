/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie Dynamic Media / Scene7 image conversion.
 * Converts DM/Scene7 <img> tags into anchors that round-trip through
 * markdown intact. The companion auto-block in scripts/scripts.js rebuilds
 * them as responsive <picture> elements at render time.
 *
 * Runs only in afterTransform — block parsers need <img> during their pass
 * between beforeTransform and afterTransform.
 *
 * Scene7 URLs detected in metadata.json .images.mapping:
 * - https://abbvie.scene7.com/is/image/abbviecorp/phil-hajduk-headshot-1?$Responsive$
 * - https://abbvie.scene7.com/is/image/abbviecorp/Ai-in-drug-discovery-hero?fmt=webp
 * - https://abbvie.scene7.com/is/image/abbviecorp/AI-drug-discovery-poster-image?fmt=webp
 * - https://abbvie.scene7.com/is/image/abbviecorp/ambily-card-image?fmt=webp
 * - https://abbvie.scene7.com/is/image/abbviecorp/stine-blaine-headshot?$Responsive$
 * - https://abbvie.scene7.com/is/image/abbviecorp/dr-heath-guay-headshot-1?$Responsive$
 * - https://abbvie.scene7.com/is/image/abbviecorp/AI-in-drug-discovery-in-story-protein-infographic?ts=1745741129596&dpr=off
 * - https://abbvie.scene7.com/is/image/abbviecorp/man-looking-screen-hero-1?fmt=webp
 * - https://abbvie.scene7.com/is/image/abbviecorp/two-women-scientist-talking-hero?fmt=webp
 */

// ---- Begin canonical helpers (copy from dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  // Scene7 detected by path alone — hostname is irrelevant because
  // customer sites routinely CNAME a vanity domain to Scene7 (e.g.
  // media-assets.brand.example). Keep byte-identical with dm-scene7-helpers.js.
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

// Walk up from a DM <img> through allow-listed inline wrappers (currently
// just <picture>) to find the carrier anchor for the linked-image
// round-trip. Returns the outer <a> when the img is the sole meaningful
// descendant; null otherwise. Without the walk, parsers that pre-wrap
// the img in <picture> — e.g. cards-portfolio on 2026-05-13 producing
// <a href="/page"><picture><img src=DM></picture></a> — slip past the
// linked branch and end up nested-anchored, splitting into two siblings
// in markdown. Keep byte-identical with dm-scene7-helpers.js.
const LINKED_DM_INLINE_WRAPPER_TAGS = new Set(['PICTURE']);
const LINKED_DM_WRAPPER_SIBLING_TAGS = new Set(['SOURCE']); // standard <picture> siblings
function findLinkedDmCarrier(img) {
  if (!img || !img.parentElement) return null;
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
    let foundNode = false;
    for (const child of parent.children) {
      if (child === node) {
        foundNode = true;
      } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
        return null;
      }
    }
    if (!foundNode) return null;
    node = parent;
    parent = parent.parentElement;
  }
  if (!parent || parent.tagName !== 'A') return null;
  if (parent.children.length !== 1 || parent.children[0] !== node) return null;
  if (parent.textContent.trim() !== '') return null;
  return parent;
}

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function altToLinkText(alt) {
  return alt || EMPTY_ALT_SENTINEL;
}
// ---- End canonical helpers ----

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;

    // Preserve alt verbatim, including empty string for decorative images.
    // The auto-block uses the URL pattern (not the text) to find these
    // anchors, so the link text is purely a Document-view UX cue. When alt
    // is empty we substitute EMPTY_ALT_SENTINEL ('Image without alt text')
    // so authors editing the doc see a visible cell at the image's
    // position; the auto-block translates the sentinel back to alt="" via
    // linkTextToAlt() so screen readers correctly skip decorative images.
    const alt = img.getAttribute('alt') || '';

    // Linked image (incl. parser-wrapped `<a><picture><img></picture></a>`).
    // Stash DM URL in title, keep outer href; setting textContent replaces
    // any wrapper descendants with the link text.
    const linkedAnchor = findLinkedDmCarrier(img);
    if (linkedAnchor) {
      linkedAnchor.setAttribute('title', src);
      linkedAnchor.textContent = altToLinkText(alt);
      return;
    }

    // Inside an anchor but not a sole-meaningful-child shape — mixed
    // content. No clean single-anchor markdown representation; skip.
    const parent = img.parentElement;
    if (parent && parent.tagName === 'A') {
      // eslint-disable-next-line no-console
      console.warn('DM image inside mixed-content anchor, skipped:', src);
      return;
    }

    // Unlinked image: create an anchor whose href is the DM URL.
    const a = doc.createElement('a');
    a.href = src;
    a.textContent = altToLinkText(alt);
    img.replaceWith(a);
  });
}
