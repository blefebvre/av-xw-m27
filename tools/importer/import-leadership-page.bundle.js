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

  // tools/importer/import-leadership-page.js
  var import_leadership_page_exports = {};
  __export(import_leadership_page_exports, {
    default: () => import_leadership_page_default
  });

  // tools/importer/parsers/cards-leader.js
  function parse(element, { document }) {
    const allCards = [...document.querySelectorAll(".cardpagestory.card-standard.card-small.standard-title")];
    const cells = [];
    allCards.forEach((card) => {
      card.dataset.cardsParsed = "true";
      const cardLink = card.querySelector(":scope > a");
      const href = cardLink ? cardLink.getAttribute("href") : "";
      const img = card.querySelector(".card-image-container img, img.card-image");
      const title = card.querySelector("h4.card-title, h3.card-title, .card-title");
      const description = card.querySelector("p.card-description, .card-description");
      const ctaSpan = card.querySelector(".card-cta");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (img) {
        imageCell.appendChild(img);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
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
      if (href && ctaSpan) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = ctaSpan.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(link);
        textCell.appendChild(p);
      } else if (href && title) {
        const firstName = title.textContent.trim().split(/[,\s]/)[0];
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = `Meet ${firstName}`;
        const p = document.createElement("p");
        p.appendChild(link);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-leader", cells });
    allCards.forEach((card) => {
      if (card !== element) card.remove();
    });
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
      WebImporter.DOMUtils.remove(element, [".button.back-cta", ".breadcrumb.abbvie-breadcrumb"]);
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
        "noscript",
        // Departure warning popup modal
        ".modal-popup.popup-departure",
        "#abbvie-warn-on-departure-popup",
        // Back to top button
        ".button.back-to-top",
        // Tracking pixels (Twitter, analytics)
        'img[src*="t.co/i/adsct"]',
        'img[src*="analytics.twitter.com"]',
        // Sidebar related content (duplicates bottom related content section)
        ".grid-row__col-with-2.grid-cell .header.standard-header-with-divider",
        ".grid-row__col-with-2.grid-cell .cardpagestory"
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

  // tools/importer/import-leadership-page.js
  var parsers = {
    "cards-leader": parse
  };
  var transformers = [
    transform,
    transform2,
    transform3
  ];
  var PAGE_TEMPLATE = {
    name: "leadership-page",
    description: "Leadership team page with grid of executive profiles including photos, names, and titles",
    urls: [
      "https://www.abbvie.com/science/our-people/our-rd-leaders.html"
    ],
    blocks: [
      {
        name: "cards-leader",
        instances: [".cardpagestory.card-standard.card-small.standard-title"]
      }
    ],
    sections: []
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
        if (elements.length > 0) {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element: elements[0],
            section: blockDef.section || null
          });
        }
      });
    });
    return pageBlocks;
  }
  var import_leadership_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
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
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
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
  return __toCommonJS(import_leadership_page_exports);
})();
