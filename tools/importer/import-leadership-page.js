/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsLeaderParser from './parsers/cards-leader.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/abbvie-cleanup.js';
import dmImagesTransformer from './transformers/abbvie-dm-images.js';
import sectionsTransformer from './transformers/abbvie-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-leader': cardsLeaderParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'leadership-page',
  description: 'Leadership team page with grid of executive profiles including photos, names, and titles',
  urls: [
    'https://www.abbvie.com/science/our-people/our-rd-leaders.html',
  ],
  blocks: [
    {
      name: 'cards-leader',
      instances: ['.cardpagestory.card-standard.card-small.standard-title'],
    },
  ],
  sections: [],
};

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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        // Pass only the first element — the parser collects all siblings
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element: elements[0],
          section: blockDef.section || null,
        });
      }
    });
  });

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
