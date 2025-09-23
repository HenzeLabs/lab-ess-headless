import { NextRequest, NextResponse } from 'next/server';
import { abTestManager } from '@/lib/experiments/manager';
import {
  ExperimentConfig,
  FeatureFlag,
  EXPERIMENT_CONFIGS,
  FEATURE_FLAGS,
} from '@/lib/experiments/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'experiments':
        const experiments = abTestManager.listExperiments();
        return NextResponse.json({ experiments });

      case 'feature-flags':
        const flags = abTestManager.listFeatureFlags();
        return NextResponse.json({ flags });

      case 'assignments':
        const assignments = abTestManager.getAssignments();
        return NextResponse.json({ assignments });

      case 'events':
        const events = abTestManager.getEvents();
        return NextResponse.json({ events });

      case 'built-in-experiments':
        return NextResponse.json({ experiments: EXPERIMENT_CONFIGS });

      case 'built-in-flags':
        return NextResponse.json({ flags: FEATURE_FLAGS });

      default:
        return NextResponse.json({
          experiments: abTestManager.listExperiments(),
          flags: abTestManager.listFeatureFlags(),
          assignments: abTestManager.getAssignments(),
          events: abTestManager.getEvents(),
        });
    }
  } catch (error) {
    console.error('Error fetching A/B test data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test data' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create-experiment':
        const experimentConfig: ExperimentConfig = {
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        abTestManager.createExperiment(experimentConfig);
        return NextResponse.json({
          success: true,
          experiment: experimentConfig,
        });

      case 'update-experiment':
        const { id, ...updates } = body;
        abTestManager.updateExperiment(id, updates);
        return NextResponse.json({ success: true });

      case 'create-flag':
        const flagConfig: FeatureFlag = {
          ...body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        abTestManager.createFeatureFlag(flagConfig);
        return NextResponse.json({ success: true, flag: flagConfig });

      case 'update-flag':
        const { id: flagId, ...flagUpdates } = body;
        abTestManager.updateFeatureFlag(flagId, flagUpdates);
        return NextResponse.json({ success: true });

      case 'initialize-built-ins':
        // Initialize built-in experiments and feature flags
        Object.entries(EXPERIMENT_CONFIGS).forEach(([id, config]) => {
          const fullConfig: ExperimentConfig = {
            id,
            status: 'draft',
            targeting: { audiences: [] },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...config,
          } as ExperimentConfig;

          try {
            abTestManager.createExperiment(fullConfig);
          } catch (error) {
            // Experiment might already exist
            console.log(`Experiment ${id} already exists`);
          }
        });

        Object.entries(FEATURE_FLAGS).forEach(([id, config]) => {
          const fullConfig: FeatureFlag = {
            id,
            targeting: { audiences: [] },
            createdAt: new Date(),
            updatedAt: new Date(),
            ...config,
          } as FeatureFlag;

          try {
            abTestManager.createFeatureFlag(fullConfig);
          } catch (error) {
            // Flag might already exist
            console.log(`Feature flag ${id} already exists`);
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Built-in configurations initialized',
        });

      case 'track-event':
        const { experimentId, variantId, event, value, userContext } = body;
        abTestManager.trackExperimentEvent(
          experimentId,
          variantId,
          event,
          value,
          userContext,
        );
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to manage A/B test' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    switch (type) {
      case 'experiment':
        abTestManager.deleteExperiment(id);
        return NextResponse.json({ success: true });

      case 'reset':
        abTestManager.reset();
        return NextResponse.json({
          success: true,
          message: 'All A/B test data cleared',
        });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting A/B test data:', error);
    return NextResponse.json(
      { error: 'Failed to delete A/B test data' },
      { status: 500 },
    );
  }
}
