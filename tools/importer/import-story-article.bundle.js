/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-story-article.js
  var import_story_article_exports = {};
  __export(import_story_article_exports, {
    default: () => import_story_article_default
  });

  // tools/importer/parsers/hero-article.js
  function parse(element, { document }) {
    const bgImage = element.querySelector('img.cmp-container__bg-image, img[class*="bg-image"], img[class*="bg_image"]');
    const heading = element.querySelector('h1, h2, h3, .cmp-title__text, [class*="title"]');
    const description = element.querySelector('p:not(:empty), .cmp-text p, [class*="description"]');
    const ctaLinks = Array.from(element.querySelectorAll('a.cmp-button, a[class*="cta"], a[class*="button"]'));
    const cells = [];
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (bgImage) {
      imageCell.appendChild(bgImage);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (description) textCell.appendChild(description);
    ctaLinks.forEach((link) => textCell.appendChild(link));
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-inline.js
  function parse2(element, { document }) {
    const posterImg = element.querySelector(".cmp-video__image img, .cmp-video__panel img.cmp-image__image");
    const vjsPosterImg = element.querySelector(".vjs-poster img");
    const imageEl = posterImg || vjsPosterImg;
    const iframe = element.querySelector('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="brightcove"]');
    const videoEl = element.querySelector("video[src], video source[src]");
    let videoUrl = "";
    if (iframe) {
      videoUrl = iframe.getAttribute("src") || "";
    } else if (videoEl) {
      const src = videoEl.getAttribute("src") || "";
      if (!src.startsWith("blob:")) {
        videoUrl = src;
      }
    }
    if (!videoUrl) {
      const bcPlayer = element.querySelector("[data-video-id], [data-account]");
      if (bcPlayer) {
        const videoId = bcPlayer.getAttribute("data-video-id") || "";
        const account = bcPlayer.getAttribute("data-account") || "";
        if (videoId && account) {
          videoUrl = `https://players.brightcove.net/${account}/default_default/index.html?videoId=${videoId}`;
        } else if (videoId) {
          videoUrl = videoId;
        }
      }
    }
    const cells = [];
    if (imageEl) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:placeholder_image "));
      imgFrag.appendChild(imageEl);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const uriFrag = document.createDocumentFragment();
    uriFrag.appendChild(document.createComment(" field:uri "));
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      uriFrag.appendChild(link);
    }
    cells.push([uriFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "video-inline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-author.js
  function parse3(element, { document }) {
    const quoteTextEl = element.querySelector("p.cmp-quote__text, .cmp-quote__text");
    const quotationFrag = document.createDocumentFragment();
    quotationFrag.appendChild(document.createComment(" field:quotation "));
    if (quoteTextEl) {
      const quoteClone = quoteTextEl.cloneNode(true);
      const iconSpan = quoteClone.querySelector("span.abbvie-icon-quote");
      if (iconSpan) iconSpan.remove();
      const p = document.createElement("p");
      p.innerHTML = quoteClone.innerHTML.trim();
      quotationFrag.appendChild(p);
    }
    const authorBlock = element.querySelector(".cmp-quote__author-block");
    const authorImg = element.querySelector("img.author-img, .cmp-quote__author-block img");
    const authorName = element.querySelector("span.author-name, .author-name");
    const authorTitle = element.querySelector("span.author-title, .author-title");
    const attributionFrag = document.createDocumentFragment();
    attributionFrag.appendChild(document.createComment(" field:attribution "));
    if (authorImg) {
      attributionFrag.appendChild(authorImg);
    }
    const parts = [];
    if (authorName) {
      parts.push(authorName.textContent.replace(/<br\s*\/?>/gi, "").trim());
    }
    if (authorTitle) {
      parts.push(authorTitle.textContent.replace(/<br\s*\/?>/gi, "").trim());
    }
    if (parts.length > 0) {
      const span = document.createElement("span");
      span.textContent = parts.join(", ");
      attributionFrag.appendChild(span);
    }
    const cells = [
      [quotationFrag],
      [attributionFrag]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-author", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse4(element, { document }) {
    const cells = [];
    const cardLink = element.querySelector(":scope > a");
    const href = cardLink ? cardLink.getAttribute("href") : "";
    const img = element.querySelector(".card-image-container img, img.card-image");
    const eyebrow = element.querySelector(".card-eyebrow");
    const title = element.querySelector("h4.card-title, h3.card-title, h2.card-title, .card-title");
    const description = element.querySelector("p.card-description, .card-description");
    const ctaText = element.querySelector(".card-cta");
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (img) {
      imageCell.appendChild(img);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      textCell.appendChild(p);
    }
    if (title) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = title.textContent.trim();
      p.appendChild(strong);
      textCell.appendChild(p);
    }
    if (description) {
      const p = document.createElement("p");
      p.textContent = description.textContent.trim();
      textCell.appendChild(p);
    }
    if (href && ctaText) {
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = ctaText.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(link);
      textCell.appendChild(p);
    } else if (href) {
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = "Learn More";
      const p = document.createElement("p");
      p.appendChild(link);
      textCell.appendChild(p);
    }
    cells.push([imageCell, textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/abbvie-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  var extractedMeta = {};
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      const storyinfo = element.querySelector(".storyinfo");
      if (storyinfo) {
        const firstP = storyinfo.querySelector("p");
        if (firstP) {
          const categoryLink = firstP.querySelector("a");
          const category = categoryLink ? categoryLink.textContent.trim() : "";
          const textContent = firstP.textContent.trim();
          const date = textContent.replace(category, "").trim();
          if (date) extractedMeta.publishdate = date;
          if (category) extractedMeta.category = category;
        }
      }
      WebImporter.DOMUtils.remove(element, [".button.back-cta"]);
      WebImporter.DOMUtils.remove(element, [".storyinfo"]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        // Header experience fragment (contains nav, logo, skip-link)
        ".cmp-experiencefragment--header",
        // Footer experience fragment
        ".cmp-experiencefragment--footer",
        // Skip to content link
        ".skip-link",
        // CSS link elements from clientlibs
        "link",
        // Tracking iframes
        "iframe",
        // GTM noscript fallbacks
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/abbvie-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
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
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/abbvie-sections.js
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = section.selector;
      const sectionEl = element.querySelector(selector);
      if (!sectionEl) continue;
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(sectionMetadata);
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-story-article.js
  var parsers = {
    "hero-article": parse,
    "video-inline": parse2,
    "quote-author": parse3,
    "cards-article": parse4
  };
  var transformers = [
    transform,
    transform2,
    transform3
  ];
  var PAGE_TEMPLATE = {
    name: "story-article",
    description: "Story article page from the Who We Are / Our Stories section, featuring long-form narrative content about company initiatives",
    urls: [
      "https://www.abbvie.com/who-we-are/our-stories/three-ways-ai-is-changing-drug-discovery-at-abbvie.html"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: [".container.abbvie-container.large-radius.cmp-container-full-width"]
      },
      {
        name: "video-inline",
        instances: [".video.cmp-video-xx-large"]
      },
      {
        name: "quote-author",
        instances: [".quote.cmp-quote-xx-large"]
      },
      {
        name: "cards-article",
        instances: [".cardpagestory.card-standard"]
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero",
        selector: ".container.abbvie-container.large-radius.cmp-container-full-width",
        style: null,
        blocks: ["hero-article"],
        defaultContent: []
      },
      {
        id: "section-article-body",
        name: "Article Body",
        selector: ".grid-row__col-with-8.grid-cell",
        style: null,
        blocks: ["video-inline", "quote-author"],
        defaultContent: [".text.cmp-text-xx-large", ".title.cmp-title-xx-large", ".separator"]
      },
      {
        id: "section-related-sidebar",
        name: "Related Content Sidebar",
        selector: ".grid-row__col-with-2.grid-cell .container.abbvie-container.height-short",
        style: null,
        blocks: ["cards-article"],
        defaultContent: [".header.standard-header-with-divider"]
      },
      {
        id: "section-related-bottom",
        name: "Related Content Bottom",
        selector: "#container-9dbfe90168",
        style: "dark",
        blocks: ["cards-article"],
        defaultContent: [".title.medium-weight"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_story_article_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      let publishdate = "";
      let category = "";
      const storyinfo = document.querySelector(".storyinfo");
      if (storyinfo) {
        const firstP = storyinfo.querySelector("p");
        if (firstP) {
          const categoryLink = firstP.querySelector("a");
          category = categoryLink ? categoryLink.textContent.trim() : "";
          const textContent = firstP.textContent.trim();
          publishdate = textContent.replace(category, "").trim();
        }
      }
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      const metadataTable = main.lastElementChild;
      if (metadataTable && metadataTable.tagName === "TABLE") {
        const tbody = metadataTable.querySelector("tbody") || metadataTable;
        if (publishdate) {
          const row = document.createElement("tr");
          const keyCell = document.createElement("td");
          keyCell.textContent = "publishdate";
          const valCell = document.createElement("td");
          valCell.textContent = publishdate;
          row.appendChild(keyCell);
          row.appendChild(valCell);
          tbody.appendChild(row);
        }
        if (category) {
          const row = document.createElement("tr");
          const keyCell = document.createElement("td");
          keyCell.textContent = "category";
          const valCell = document.createElement("td");
          valCell.textContent = category;
          row.appendChild(keyCell);
          row.appendChild(valCell);
          tbody.appendChild(row);
        }
      }
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_story_article_exports);
})();
