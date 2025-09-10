// Accessibility check script using axe-core
// Run this in your browser console or as a test
import axe from 'axe-core';

// Run axe after the page is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    axe.run(document, {}, (err, results) => {
      if (err) throw err;
      console.log('axe accessibility results:', results);
    });
  });
}

export default function AxeA11yScript() {
  return null;
}
