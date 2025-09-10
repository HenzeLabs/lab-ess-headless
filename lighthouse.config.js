module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/collections',
        'http://localhost:3000/products',
      ],
    },
    assert: {
      assertions: {
        performance: ['error', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.9 }],
        'metrics:lcp': ['error', { maxNumericValue: 2500 }],
        'metrics:total-blocking-time': ['error', { maxNumericValue: 300 }],
        'metrics:cls': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
