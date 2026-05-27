/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video-inline
 * Base block: video
 * Source: https://www.abbvie.com/who-we-are/our-stories/three-ways-ai-is-changing-drug-discovery-at-abbvie.html
 * Generated: 2026-05-27
 *
 * UE Model fields:
 *   - uri (aem-content): Video source URL
 *   - placeholder_image (reference): Poster/thumbnail image
 *   - placeholder_imageAlt (text): COLLAPSED into placeholder_image (not hinted)
 *   - classes (multiselect): SKIPPED per hinting rules
 *
 * Target table structure (from block library):
 *   Row 1: Poster image (field: placeholder_image)
 *   Row 2: Video source URL (field: uri)
 */
export default function parse(element, { document }) {
  // Extract poster image from the video panel image area
  const posterImg = element.querySelector('.cmp-video__image img, .cmp-video__panel img.cmp-image__image');

  // Fallback: try the video.js poster image
  const vjsPosterImg = element.querySelector('.vjs-poster img');

  // Determine the best poster image element
  const imageEl = posterImg || vjsPosterImg;

  // Extract video source URL
  // Try: 1) iframe src (YouTube embeds), 2) video element src, 3) source element
  const iframe = element.querySelector('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="brightcove"]');
  const videoEl = element.querySelector('video[src], video source[src]');

  let videoUrl = '';
  if (iframe) {
    videoUrl = iframe.getAttribute('src') || '';
  } else if (videoEl) {
    const src = videoEl.getAttribute('src') || '';
    // Skip blob: URLs as they are runtime-generated and not importable
    if (!src.startsWith('blob:')) {
      videoUrl = src;
    }
  }

  // If no direct video URL found, look for data attributes on player container
  if (!videoUrl) {
    const bcPlayer = element.querySelector('[data-video-id], [data-account]');
    if (bcPlayer) {
      const videoId = bcPlayer.getAttribute('data-video-id') || '';
      const account = bcPlayer.getAttribute('data-account') || '';
      if (videoId && account) {
        videoUrl = `https://players.brightcove.net/${account}/default_default/index.html?videoId=${videoId}`;
      } else if (videoId) {
        videoUrl = videoId;
      }
    }
  }

  // Build cells matching the block library table structure
  const cells = [];

  // Row 1: Poster image with field hint (placeholder_image)
  if (imageEl) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:placeholder_image '));
    imgFrag.appendChild(imageEl);
    cells.push([imgFrag]);
  } else {
    // Empty row required by xwalk model - all rows must exist
    cells.push(['']);
  }

  // Row 2: Video URL with field hint (uri)
  const uriFrag = document.createDocumentFragment();
  uriFrag.appendChild(document.createComment(' field:uri '));
  if (videoUrl) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    uriFrag.appendChild(link);
  }
  cells.push([uriFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-inline', cells });
  element.replaceWith(block);
}
