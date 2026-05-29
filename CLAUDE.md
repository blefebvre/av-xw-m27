# AbbVie EDS Migration — Project Notes

## Project Overview

XWalk project migrating pages from abbvie.com to AEM Edge Delivery Services.
- **Source site:** https://www.abbvie.com
- **Project type:** xwalk (Universal Editor / AEM Sites authoring)
- **Fstab mount:** author-p170502-e1825534.adobeaemcloud.com
- **Block library:** sta-xwalk-boilerplate (aemysites)

## Build Commands

- `npm run build:json` — regenerates `component-models.json`, `component-definition.json`, `component-filters.json` from `models/` and `blocks/*/_*.json` files. Run after any model change.
- `aem up` — local dev server at localhost:3000

## Key Architecture Decisions

### Content Paths
- Imported content goes in `content/` (e.g. `content/who-we-are/our-stories/page.plain.html`)
- Nav fragment: `content/nav.plain.html` (also copy to `nav.plain.html` at root for local preview with `aem up`)
- Footer fragment: `content/footer.plain.html` (also copy to `footer.plain.html` at root)
- The local dev server (`aem up`) wraps `.plain.html` files with `<html><head>` from `head.html`, which injects `<meta>`, `<link>`, `<script>` into the fragment response. The `header.js` must use `:scope > .section` (not `nav.children[i]`) to find content sections, skipping injected head elements.

### Fonts
- AbbVie uses proprietary "F37 Lineca" (Book weight 650, Medium weight 800) loaded from their CDN woff2 files
- Body text uses "Roboto" (300/400/700) also from AbbVie's CDN
- `@font-face` declarations in `styles/styles.css` reference `https://www.abbvie.com/etc.clientlibs/abbvie-com2/clientlibs/clientlib-site/resources/custom-fonts/...`
- Brand variables in `styles/brand.css`

### DM/Scene7 Images
- AbbVie uses Scene7 for images (e.g. `https://abbvie.scene7.com/is/image/abbviecorp/...`)
- The DM auto-block in `scripts/scripts.js` converts anchor carriers back to responsive `<picture>` elements at runtime
- The DM dispatcher in `scripts/aem.js` intercepts `createOptimizedPicture` calls to preserve Scene7 query params
- Block models with image fields use `component: "richtext"` (not `reference`) so md2jcr stores DM carrier-anchors as inline HTML rather than ingesting into DAM

## Parser Patterns (Lessons Learned)

### Cards/grid blocks — collect ALL items into ONE block table
- Source pages nest cards in deep grid structures (different parent containers, varying depths)
- Use `document.querySelectorAll(selector)` to find ALL matching cards across the entire DOM, not `parent.querySelectorAll`
- The import script must call the parser only ONCE per block type (pass only `elements[0]` from `findBlocksOnPage`)
- The parser itself queries the full document for all matching cards and builds one multi-row block table
- Each card becomes one row: `[imageCell, textCell]`

### Block table structure (xwalk)
- Each block table row maps to a "card item" in the UE model
- Field hints (`<!-- field:image -->`, `<!-- field:text -->`) go at the start of each cell
- The block model's `fields[]` defines columns; each row is one item
- Container blocks (cards, carousel) use a parent definition + child item definition pattern

### Import script — findBlocksOnPage
- For blocks where multiple source elements should merge into ONE block table, only return the first matched element
- The parser handles collecting siblings/all instances
- Do NOT return all matched elements and call the parser per-element — that creates separate block tables

### Sections transformer
- The sections transformer uses `payload.template.sections` to insert `<hr>` separators
- For simple pages without complex section boundaries, use `sections: []` in the import script's PAGE_TEMPLATE to skip section processing
- Complex section selectors that target deeply nested grid containers can disrupt content if the grid gets stripped by cleanup

## Metadata / Page Properties

### Page model (`models/_page.json`)
- Defines fields available in Universal Editor page properties panel
- Fields: `jcr:title`, `jcr:description`, `keywords`, `og-title`, `template`, `publishdate`, `category`
- Use hyphens not colons in field names (e.g. `og-title` not `og:title`) — colons cause `NamespaceError` in md2jcr XML serialization

### Metadata block
- Do NOT create a `blocks/metadata/_metadata.json` model — the metadata block is handled specially by md2jcr as page properties
- The metadata table in imported content maps key-value rows directly to `jcr:content` page properties via the page model
- If a metadata block model exists, md2jcr tries to parse it as a regular block and fails

### Template-based autoblocking
- The `template` metadata property (e.g. `template: article`) drives conditional autoblocking in `scripts/scripts.js`
- The `buildArticleMeta` function runs in `buildAutoBlocks` (before `decorateSections`) — so query `main.querySelector(':scope > div')` not `.section`
- Use `<aside>` element for autoblocked content to prevent EDS from treating it as a block (EDS only block-decorates `<div>` elements with classes)

## Cleanup Transformer

The `abbvie-cleanup.js` transformer handles:
- **beforeTransform:** Extracts date/category from `.storyinfo`, removes `.button.back-cta` (breadcrumb), `.storyinfo` (read time), cookie consent
- **afterTransform:** Removes header/footer experience fragments, skip-link, CSS links, iframes, noscript, departure popup (`.modal-popup.popup-departure`), back-to-top button, tracking pixels, sidebar related content

## Import Script — Custom Metadata Extraction

The `import-story-article.js` script extracts `publishdate` and `category` BEFORE calling transformers (since transformers remove `.storyinfo`). It then appends custom rows to the metadata TABLE element (not div — `createMetadata` produces a `<table>`) after `WebImporter.rules.createMetadata` runs. Use `metadataTable.querySelector('tbody') || metadataTable` to find the insert target.

## Header/Nav

- Standard xwalk fragment-based header (`loadFragment('/nav')`)
- `header.js` uses `:scope > .section` to find content sections (skips injected head elements from `aem up`)
- Logo in nav uses absolute URL to AbbVie's CDN SVG (no link wrapper)
- Search icon: `:search:` in nav.plain.html → EDS decorates as `<span class="icon icon-search">`
- Nav dropdowns hidden by default (`display: none` on `ul > li > ul`), shown on click via `aria-expanded`

## Footer

- Three-section structure: main (logo + nav links + social icons), links (Popular Pages + External Links + legal text), legal bar
- Social icons use EDS icon syntax (`:facebook:`, `:x:`, `:instagram:`, etc.)
- `footer.js` uses dual-fetch pattern and assigns section classes (`footer-main`, `footer-links`, `footer-legal`)

## Styling Notes

- Max-width for nav and hero: 1440px (matches source)
- Section content max-width: 1200px
- Nav height: 88px, padding: 0 55px
- Header: sticky, white background, no shadow
- Dark sections: `background-color: var(--dark-color)` (#071d49), white text
- Button reset in article content: `main a.button:any-link` resets to inline link appearance
- Stylelint: use `/* stylelint-disable-next-line no-descending-specificity */` or reorder selectors when targeting same elements in different component sections

## Common Pitfalls

1. **Never hardcode text** in autoblocking JS — derive from metadata or URL path segments
2. **Don't use `<div>` with class names** for autoblocked content — EDS treats any classed div as a block and tries to load `blocks/{name}/{name}.js`
3. **`loadSection(section)` needs null guard** — in Universal Editor, sections may not exist yet
4. **aem.js `loadSection` also needs null guard** — same reason
5. **Colons in metadata keys** cause XML namespace errors in md2jcr — use hyphens
6. **The metadata block does NOT get a model** — it maps to page properties via `_page.json`
7. **`npm run build:json`** must be run after any model file change to regenerate component-models.json
