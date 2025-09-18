// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'], // Collect data from the homepage
      startServerCommand: 'npm run dev',
      startServerReadyRegex: 'ready on',
      numberOfRuns: 3, // Run Lighthouse multiple times for more stable results
    },
    assert: {
      assertions: {
        'categories.performance': ['warn', { minScore: 0.85 }],
        'categories.seo': ['warn', { minScore: 0.90 }],
        'categories.accessibility': ['warn', { minScore: 0.90 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // Upload to temporary public storage for CI
    },
  },
};
