import {
  ExperimentConfig,
  ExperimentAssignment,
  UserContext,
  FeatureFlag,
  ExperimentVariant,
} from './types';

export class ABTestManager {
  private experiments = new Map<string, ExperimentConfig>();
  private assignments = new Map<string, ExperimentAssignment>();
  private featureFlags = new Map<string, FeatureFlag>();

  constructor() {
    // Initialize with stored data if available
    this.loadFromStorage();
  }

  // Experiment Management
  createExperiment(config: ExperimentConfig): void {
    this.validateExperiment(config);
    this.experiments.set(config.id, config);
    this.saveToStorage();
  }

  getExperiment(id: string): ExperimentConfig | undefined {
    return this.experiments.get(id);
  }

  updateExperiment(id: string, updates: Partial<ExperimentConfig>): void {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      throw new Error(`Experiment ${id} not found`);
    }

    const updatedExperiment = {
      ...experiment,
      ...updates,
      updatedAt: new Date(),
    };

    this.validateExperiment(updatedExperiment);
    this.experiments.set(id, updatedExperiment);
    this.saveToStorage();
  }

  deleteExperiment(id: string): void {
    this.experiments.delete(id);
    // Clean up assignments for this experiment
    this.cleanupAssignments(id);
    this.saveToStorage();
  }

  listExperiments(): ExperimentConfig[] {
    return Array.from(this.experiments.values());
  }

  // Feature Flag Management
  createFeatureFlag(flag: FeatureFlag): void {
    this.featureFlags.set(flag.id, flag);
    this.saveToStorage();
  }

  updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): void {
    const flag = this.featureFlags.get(id);
    if (!flag) {
      throw new Error(`Feature flag ${id} not found`);
    }

    const updatedFlag = {
      ...flag,
      ...updates,
      updatedAt: new Date(),
    };

    this.featureFlags.set(id, updatedFlag);
    this.saveToStorage();
  }

  getFeatureFlag(id: string): FeatureFlag | undefined {
    return this.featureFlags.get(id);
  }

  listFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  // Assignment Logic
  getVariant(
    experimentId: string,
    userContext: UserContext,
  ): ExperimentVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user should be included in experiment
    if (!this.shouldIncludeInExperiment(experiment, userContext)) {
      return null;
    }

    // Check for existing assignment
    const assignmentKey = `${experimentId}-${userContext.userId}`;
    let assignment = this.assignments.get(assignmentKey);

    if (!assignment) {
      // Create new assignment
      const variant = this.assignVariant(experiment, userContext);
      if (!variant) return null;

      assignment = {
        userId: userContext.userId,
        experimentId,
        variantId: variant.id,
        assignedAt: new Date(),
        sessionId: userContext.sessionId,
      };

      this.assignments.set(assignmentKey, assignment);
      this.saveToStorage();
    }

    // Return the assigned variant
    return (
      experiment.variants.find((v) => v.id === assignment!.variantId) || null
    );
  }

  // Feature Flag Evaluation
  isFeatureEnabled(flagId: string, userContext: UserContext): boolean {
    const flag = this.featureFlags.get(flagId);
    if (!flag || !flag.enabled) {
      return false;
    }

    // Check targeting rules
    if (!this.shouldIncludeInFeature(flag, userContext)) {
      return false;
    }

    // Check rollout percentage
    const userHash = this.hashUser(userContext.userId, flagId);
    return userHash < flag.rolloutPercentage;
  }

  getFeatureVariant(flagId: string, userContext: UserContext): unknown {
    const flag = this.featureFlags.get(flagId);
    if (!flag || !this.isFeatureEnabled(flagId, userContext)) {
      return null;
    }

    return flag.variants || true;
  }

  // Analytics Integration
  trackExperimentEvent(
    experimentId: string,
    variantId: string,
    event: string,
    value?: number,
    userContext?: UserContext,
  ): void {
    // In a real implementation, this would send to your analytics service
    const eventData = {
      experiment_id: experimentId,
      variant_id: variantId,
      event,
      value,
      timestamp: new Date().toISOString(),
      user_id: userContext?.userId,
      session_id: userContext?.sessionId,
    };

    // For now, just log and store locally
    console.log('Experiment event:', eventData);

    // Store in localStorage for demo purposes
    const events = JSON.parse(
      localStorage.getItem('experiment_events') || '[]',
    );
    events.push(eventData);
    localStorage.setItem('experiment_events', JSON.stringify(events));
  }

  // Private Helper Methods
  private validateExperiment(experiment: ExperimentConfig): void {
    // Check variant allocations sum to 100
    const totalAllocation = experiment.variants.reduce(
      (sum, v) => sum + v.allocation,
      0,
    );
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Variant allocations must sum to 100%');
    }

    // Ensure at least one control variant
    const hasControl = experiment.variants.some((v) => v.isControl);
    if (!hasControl) {
      throw new Error('Experiment must have at least one control variant');
    }

    // Validate traffic allocation
    if (
      experiment.trafficAllocation < 0 ||
      experiment.trafficAllocation > 100
    ) {
      throw new Error('Traffic allocation must be between 0 and 100');
    }
  }

  private shouldIncludeInExperiment(
    experiment: ExperimentConfig,
    userContext: UserContext,
  ): boolean {
    // Check traffic allocation
    const userHash = this.hashUser(userContext.userId, experiment.id);
    if (userHash >= experiment.trafficAllocation) {
      return false;
    }

    // Check targeting rules
    return this.evaluateTargeting(experiment.targeting, userContext);
  }

  private shouldIncludeInFeature(
    flag: FeatureFlag,
    userContext: UserContext,
  ): boolean {
    return this.evaluateTargeting(flag.targeting, userContext);
  }

  private evaluateTargeting(
    targeting: {
      devices?: string[];
      countries?: string[];
      browsers?: string[];
      customRules?: Array<{
        property: string;
        operator: string;
        value: unknown;
      }>;
    },
    userContext: UserContext,
  ): boolean {
    // Check device targeting
    if (targeting.devices && targeting.devices.length > 0) {
      if (!targeting.devices.includes(userContext.device)) {
        return false;
      }
    }

    // Check country targeting
    if (targeting.countries && targeting.countries.length > 0) {
      if (
        !userContext.country ||
        !targeting.countries.includes(userContext.country)
      ) {
        return false;
      }
    }

    // Check browser targeting
    if (targeting.browsers && targeting.browsers.length > 0) {
      if (
        !userContext.browser ||
        !targeting.browsers.includes(userContext.browser)
      ) {
        return false;
      }
    }

    // Evaluate custom rules
    if (targeting.customRules && targeting.customRules.length > 0) {
      return targeting.customRules.every(
        (rule: { property: string; operator: string; value: unknown }) =>
          this.evaluateTargetingRule(rule, userContext),
      );
    }

    return true;
  }

  private evaluateTargetingRule(
    rule: { property: string; operator: string; value: unknown },
    userContext: UserContext,
  ): boolean {
    const { property, operator, value } = rule;

    // Get property value from user context
    let propertyValue: unknown;
    if (property.startsWith('custom.')) {
      const customProp = property.substring(7);
      propertyValue = userContext.customProperties?.[customProp];
    } else {
      // Safely access known properties
      switch (property) {
        case 'userId':
          propertyValue = userContext.userId;
          break;
        case 'sessionId':
          propertyValue = userContext.sessionId;
          break;
        case 'country':
          propertyValue = userContext.country;
          break;
        case 'device':
          propertyValue = userContext.device;
          break;
        case 'browser':
          propertyValue = userContext.browser;
          break;
        case 'userAgent':
          propertyValue = userContext.userAgent;
          break;
        default:
          propertyValue = undefined;
      }
    }

    // Evaluate based on operator
    switch (operator) {
      case 'equals':
        return propertyValue === value;
      case 'not_equals':
        return propertyValue !== value;
      case 'contains':
        return String(propertyValue).includes(String(value));
      case 'not_contains':
        return !String(propertyValue).includes(String(value));
      case 'greater_than':
        return Number(propertyValue) > Number(value);
      case 'less_than':
        return Number(propertyValue) < Number(value);
      case 'in':
        return Array.isArray(value) && value.includes(propertyValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(propertyValue);
      default:
        return false;
    }
  }

  private assignVariant(
    experiment: ExperimentConfig,
    userContext: UserContext,
  ): ExperimentVariant | null {
    const userHash = this.hashUser(
      userContext.userId,
      experiment.id + '_variant',
    );

    let cumulativeAllocation = 0;
    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if (userHash < cumulativeAllocation) {
        return variant;
      }
    }

    // Fallback to control variant
    return (
      experiment.variants.find((v) => v.isControl) || experiment.variants[0]
    );
  }

  private hashUser(userId: string, seed: string): number {
    // Simple hash function for consistent user bucketing
    let hash = 0;
    const str = userId + seed;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to 0-100 range
    return Math.abs(hash % 100);
  }

  private cleanupAssignments(experimentId: string): void {
    for (const [key, assignment] of this.assignments.entries()) {
      if (assignment.experimentId === experimentId) {
        this.assignments.delete(key);
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('ab_test_data');
      if (stored) {
        const data = JSON.parse(stored);

        if (data.experiments) {
          this.experiments = new Map(Object.entries(data.experiments));
        }

        if (data.assignments) {
          this.assignments = new Map(Object.entries(data.assignments));
        }

        if (data.featureFlags) {
          this.featureFlags = new Map(Object.entries(data.featureFlags));
        }
      }
    } catch (error) {
      console.warn('Failed to load A/B test data from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        experiments: Object.fromEntries(this.experiments),
        assignments: Object.fromEntries(this.assignments),
        featureFlags: Object.fromEntries(this.featureFlags),
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem('ab_test_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save A/B test data to storage:', error);
    }
  }

  // Utility methods for clearing data (useful for testing)
  reset(): void {
    this.experiments.clear();
    this.assignments.clear();
    this.featureFlags.clear();
    localStorage.removeItem('ab_test_data');
    localStorage.removeItem('experiment_events');
  }

  getAssignments(): ExperimentAssignment[] {
    return Array.from(this.assignments.values());
  }

  getEvents(): Array<{
    experiment_id: string;
    variant_id: string;
    event: string;
    value?: number;
    timestamp: string;
    user_id?: string;
    session_id?: string;
  }> {
    try {
      return JSON.parse(localStorage.getItem('experiment_events') || '[]');
    } catch {
      return [];
    }
  }
}

// Singleton instance
export const abTestManager = new ABTestManager();
