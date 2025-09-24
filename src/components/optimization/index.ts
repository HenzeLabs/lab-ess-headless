// Enhanced Product Discovery and Conversion Optimization Components
export { default as SmartProductDiscovery } from './SmartProductDiscovery';
export { ProductRecommendations } from './ProductRecommendations';
export {
  ABTest,
  useABTest,
  abTestManager,
  useABTestConversion,
  DEFAULT_AB_TESTS,
} from './ABTestingFramework';

// Type exports
export type {
  ABTestVariant,
  ABTestConfig,
  ABTestResults,
} from './ABTestingFramework';
