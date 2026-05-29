This block is used to showcase distinct pieces of information in a consistent, card-based layout, each card typically containing an image, a title, and descriptive text.

## Implementation

This block's table has 2 columns and multiple rows, with the first row containing only the block name and optional variants in parenthesis.

Each **subsequent row** **must** contain two cells, not all cells however may have content as the image or text might not be present, but an empty cell must be included then. Each **row** represents a single card and can include:

- **Image or Icon** - in the first cell of the row
- **Text content** - in the second cell of the row. The cell can contain:
  - **Title (optional)** – styled as a Heading.
  - **Description (optional)** - below the heading.
  - **Call-to-Action (optional)** - linked text at the bottom of the cell.

When rendered, CSS and JavaScript transform each row into a card, arranging them in a grid or list layout based on available space.

## When to use

- To highlight multiple related features, products, or articles.
- When you want a uniform visual style for items with distinct content.
- To make a set of clickable, structured elements that are easy to scan.

## When to consider another block

- If you need just a single feature or highlight, rather than multiple cards.
- When your layout requires more complex components or varied styling per item.
- If a simpler list or table layout better fits the content.
- If no images are present in the cards, consider the 'no images' variant.

## Example

| Cards |
| --- | --- |
| ![card image](image.png) | **Unmatched speed** Helix is the fastest way to publish, create, and serve websites |
| ![card image](image.png) | **Content at scale** Helix allows you to publish more content in shorter time with smaller teams |
| ![card image](image.png) | **Uncertainty eliminated** Preview content at 100% fidelity, get predictable content velocity, and shorten project durations |
