import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment('/content/footer');
  if (!fragment) {
    fragment = await loadFragment(footerPath);
  }

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-content';

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const classes = ['footer-main', 'footer-links', 'footer-legal'];
  sections.forEach((section, i) => {
    if (classes[i]) section.classList.add(classes[i]);
    footer.append(section);
  });

  block.append(footer);
}
