/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroArticleParser from './parsers/hero-article.js';
import videoInlineParser from './parsers/video-inline.js';
import quoteAuthorParser from './parsers/quote-author.js';
import cardsArticleParser from './parsers/cards-article.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/abbvie-cleanup.js';
import dmImagesTransformer from './transformers/abbvie-dm-images.js';
import sectionsTransformer from './transformers/abbvie-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-article': heroArticleParser,
  'video-inline': videoInlineParser,
  'quote-author': quoteAuthorParser,
  'cards-article': cardsArticleParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'story-article',
  description: 'Story article page from the Who We Are / Our Stories section, featuring long-form narrative content about company initiatives',
  urls: [
    'https://www.abbvie.com/who-we-are/our-stories/three-ways-ai-is-changing-drug-discovery-at-abbvie.html',
  ],
  blocks: [
    {
      name: 'hero-article',
      instances: ['.container.abbvie-container.large-radius.cmp-container-full-width'],
    },
    {
      name: 'video-inline',
      instances: ['.video.cmp-video-xx-large'],
    },
    {
      name: 'quote-author',
      instances: ['.quote.cmp-quote-xx-large'],
    },
    {
      name: 'cards-article',
      instances: ['.cardpagestory.card-standard'],
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: '.container.abbvie-container.large-radius.cmp-container-full-width',
      style: null,
      blocks: ['hero-article'],
      defaultContent: [],
    },
    {
      id: 'section-article-body',
      name: 'Article Body',
      selector: '.grid-row__col-with-8.grid-cell',
      style: null,
      blocks: ['video-inline', 'quote-author'],
      defaultContent: ['.text.cmp-text-xx-large', '.title.cmp-title-xx-large', '.separator'],
    },
    {
      id: 'section-related-sidebar',
      name: 'Related Content Sidebar',
      selector: '.grid-row__col-with-2.grid-cell .container.abbvie-container.height-short',
      style: null,
      blocks: ['cards-article'],
      defaultContent: ['.header.standard-header-with-divider'],
    },
    {
      id: 'section-related-bottom',
      name: 'Related Content Bottom',
      selector: '#container-9dbfe90168',
      style: 'dark',
      blocks: ['cards-article'],
      defaultContent: ['.title.medium-weight'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
