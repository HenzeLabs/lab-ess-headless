// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'https://store.labessentials.com/', // Homepage
        'https://store.labessentials.com/products/precision-microscope', // Example Product page
        'https://store.labessentials.com/collections/microscopes', // Example Collection page
      ],
      numberOfRuns: 3,
      settings: {
        // Will be overridden per run for desktop/mobile
      },
    },
    assert: {
      assertions: {
        'categories.performance': ['warn', { minScore: 0.85 }],
        'categories.seo': ['warn', { minScore: 0.9 }],
        'categories.accessibility': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
