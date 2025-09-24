'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Download,
  Beaker,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getTechnicalSpecs,
  getTechnicalSpecsByProductType,
} from '@/lib/services/technical-specs';
import {
  TechnicalSpecifications,
  SupportedProductType,
} from '@/types/technical-specs';

interface TechnicalSpecsProps {
  productHandle?: string;
  productType?: SupportedProductType;
  className?: string;
}

export default function TechnicalSpecs({
  productHandle,
  productType = 'general',
  className = '',
}: TechnicalSpecsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'specs' | 'compatibility' | 'downloads'
  >('specs');
  const [specs, setSpecs] = useState<TechnicalSpecifications | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load specifications when component mounts or props change
  useEffect(() => {
    const loadSpecs = async () => {
      setLoading(true);
      setError(null);

      try {
        let specifications: TechnicalSpecifications;

        if (productHandle) {
          // Fetch by product handle (preferred)
          specifications = await getTechnicalSpecs(productHandle);
        } else {
          // Fallback to product type
          specifications = await getTechnicalSpecsByProductType(productType);
        }

        setSpecs(specifications);
      } catch (err) {
        console.error('Failed to load technical specifications:', err);
        setError('Failed to load technical specifications');
      } finally {
        setLoading(false);
      }
    };

    loadSpecs();
  }, [productHandle, productType]);

  // Group specifications by category
  const groupSpecsByCategory = (
    specifications: TechnicalSpecifications['specifications'],
  ) => {
    const grouped: Record<string, typeof specifications> = {};

    specifications.forEach((spec) => {
      const category = spec.category || 'general';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(spec);
    });

    return grouped;
  };

  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      optics: 'Optical System',
      lighting: 'Illumination',
      mechanics: 'Mechanical',
      electrical: 'Electrical',
      physical: 'Physical Dimensions',
      performance: 'Performance',
      capacity: 'Capacity',
      operation: 'Operation',
      connectivity: 'Connectivity',
      imaging: 'Imaging',
      environmental: 'Environmental',
      measurement: 'Measurement',
      precision: 'Precision',
      volume: 'Volume',
      optical: 'Optical',
      compliance: 'Compliance',
      general: 'General',
    };

    return (
      categoryNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  return (
    <div className={`space-y-4 border-t border-border/50 pt-6 ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Technical Specifications
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="animate-fade-in rounded-xl border border-border/50 bg-muted/20 p-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading && !specs && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading specifications...
              </span>
            </div>
          )}

          {specs && (
            <>
              {/* Tab Navigation */}
              <div className="mb-4 flex space-x-1 rounded-lg bg-background p-1">
                {(['specs', 'compatibility', 'downloads'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-[hsl(var(--brand))] text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'specs' && 'Specifications'}
                      {tab === 'compatibility' && 'Compatibility'}
                      {tab === 'downloads' && 'Downloads'}
                    </button>
                  ),
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'specs' && (
                <div className="space-y-6">
                  {Object.entries(
                    groupSpecsByCategory(specs.specifications),
                  ).map(([category, categorySpecs]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground border-b border-border/30 pb-1">
                        {getCategoryDisplayName(category)}
                      </h4>
                      <div className="space-y-2">
                        {categorySpecs
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((spec, index) => (
                            <div
                              key={`${spec.key}-${index}`}
                              className="flex justify-between border-b border-border/20 pb-2"
                            >
                              <span className="font-medium text-foreground">
                                {spec.key}
                              </span>
                              <span className="text-muted-foreground text-right">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'compatibility' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Beaker className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-foreground">
                      Laboratory Compatibility
                    </span>
                  </div>
                  {specs.compatibility.length > 0 ? (
                    <ul className="space-y-2">
                      {specs.compatibility.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No specific compatibility requirements listed.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Download className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-foreground">
                      Documentation & Software
                    </span>
                  </div>
                  {specs.downloads.length > 0 ? (
                    <div className="space-y-2">
                      {specs.downloads.map((download, index) => (
                        <button
                          key={download.id || index}
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg border border-border/30 p-3 hover:bg-background transition-colors text-left"
                          onClick={() => {
                            // TODO: Implement download functionality
                            console.log('Download:', download);
                          }}
                        >
                          <div>
                            <div className="font-medium text-foreground text-sm">
                              {download.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {download.type} • {download.size}
                              {download.category && ` • ${download.category}`}
                            </div>
                          </div>
                          <Download className="h-4 w-4 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No downloads available for this product.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
