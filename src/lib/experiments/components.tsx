'use client';

import { ReactNode, useEffect } from 'react';
import Image from 'next/image';
import { useExperiment, useFeatureFlag } from './hooks';
import { ExperimentVariant } from './types';

interface ExperimentProps {
  id: string;
  children: (variant: {
    variant: ExperimentVariant | null;
    isControl: boolean;
    config: Record<string, unknown>;
    track: (event: string, value?: number) => void;
  }) => ReactNode;
  fallback?: ReactNode;
}

export function Experiment({ id, children, fallback = null }: ExperimentProps) {
  const experiment = useExperiment(id);

  if (!experiment.variant) {
    return <>{fallback}</>;
  }

  return <>{children(experiment)}</>;
}

interface VariantProps {
  id: string;
  children: ReactNode;
  experimentId: string;
}

export function Variant({ id, children, experimentId }: VariantProps) {
  const { variant } = useExperiment(experimentId);

  if (variant?.id !== id) {
    return null;
  }

  return <>{children}</>;
}

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlagGate({
  flag,
  children,
  fallback = null,
}: FeatureFlagProps) {
  const { enabled } = useFeatureFlag(flag);

  return <>{enabled ? children : fallback}</>;
}

interface ABTestButtonProps {
  experimentId: string;
  variantConfigs: Record<
    string,
    {
      text: string;
      className?: string;
      style?: React.CSSProperties;
    }
  >;
  onClick: () => void;
  defaultConfig: {
    text: string;
    className?: string;
    style?: React.CSSProperties;
  };
  trackingEvent?: string;
}

export function ABTestButton({
  experimentId,
  variantConfigs,
  onClick,
  defaultConfig,
  trackingEvent = 'button_click',
}: ABTestButtonProps) {
  const { variant, track } = useExperiment(experimentId);

  const config =
    variant && variantConfigs[variant.id]
      ? variantConfigs[variant.id]
      : defaultConfig;

  const handleClick = () => {
    if (variant) {
      track(trackingEvent);
    }
    onClick();
  };

  return (
    <button
      className={config.className}
      style={config.style}
      onClick={handleClick}
    >
      {config.text}
    </button>
  );
}

interface ABTestImageProps {
  experimentId: string;
  variantConfigs: Record<
    string,
    {
      src: string;
      alt: string;
      className?: string;
      style?: React.CSSProperties;
    }
  >;
  defaultConfig: {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
  };
  trackingEvent?: string;
}

export function ABTestImage({
  experimentId,
  variantConfigs,
  defaultConfig,
  trackingEvent = 'image_view',
}: ABTestImageProps) {
  const { variant, track } = useExperiment(experimentId);

  const config =
    variant && variantConfigs[variant.id]
      ? variantConfigs[variant.id]
      : defaultConfig;

  const handleLoad = () => {
    if (variant) {
      track(trackingEvent);
    }
  };

  return (
    <Image
      src={config.src}
      alt={config.alt}
      className={config.className}
      style={config.style}
      width={400}
      height={300}
      onLoad={handleLoad}
    />
  );
}

interface ConditionalExperimentProps {
  experimentId: string;
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConditionalExperiment({
  experimentId,
  condition,
  children,
  fallback = null,
}: ConditionalExperimentProps) {
  const { variant } = useExperiment(experimentId);

  if (!condition || !variant) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component for A/B testing
export function withExperiment<P extends object>(
  Component: React.ComponentType<P>,
  experimentId: string,
  configMapper?: (variant: ExperimentVariant) => Partial<P>,
) {
  return function ExperimentWrappedComponent(props: P) {
    const { variant, config } = useExperiment(experimentId);

    if (!variant) {
      return <Component {...props} />;
    }

    const variantProps = configMapper ? configMapper(variant) : {};
    const mergedProps = { ...props, ...variantProps, ...config };

    return <Component {...mergedProps} />;
  };
}

// Component for tracking experiment views
interface ExperimentTrackerProps {
  experimentId: string;
  event?: string;
  value?: number;
  trackOnMount?: boolean;
  children?: ReactNode;
}

export function ExperimentTracker({
  experimentId,
  event = 'view',
  value,
  trackOnMount = true,
  children,
}: ExperimentTrackerProps) {
  const { variant, track } = useExperiment(experimentId);

  useEffect(() => {
    if (trackOnMount && variant) {
      track(event, value);
    }
  }, [variant, track, event, value, trackOnMount]);

  return children ? <>{children}</> : null;
}
