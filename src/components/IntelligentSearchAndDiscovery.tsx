'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Filter,
  Star,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Microscope,
} from 'lucide-react';

// Types for intelligent search and discovery
interface SearchFilter {
  id: string;
  name: string;
  type: 'range' | 'select' | 'checkbox' | 'text';
  category: 'technical' | 'application' | 'brand' | 'price' | 'availability';
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  description?: string;
}

interface ProductSpecification {
  name: string;
  value: string | number;
  unit?: string;
  category: 'technical' | 'performance' | 'physical' | 'environmental';
}

interface SearchResult {
  id: string;
  title: string;
  price: number;
  currency: string;
  brand: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  relevanceScore: number;
  aiMatchScore: number;
  specifications: ProductSpecification[];
  applications: string[];
  tags: string[];
  inStock: boolean;
  leadTime?: string;
  featured?: boolean;
  discount?: number;
}

interface SearchQuery {
  text: string;
  filters: Record<string, unknown>;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
  labType?: string;
  researchField?: string;
  applicationArea?: string;
}

interface AISearchInsight {
  type: 'suggestion' | 'recommendation' | 'alternative' | 'upsell';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  productIds?: string[];
}

// Advanced search filters for lab equipment
const searchFilters: SearchFilter[] = [
  {
    id: 'price',
    name: 'Price Range',
    type: 'range',
    category: 'price',
    min: 0,
    max: 50000,
    unit: 'USD',
  },
  {
    id: 'brand',
    name: 'Brand',
    type: 'select',
    category: 'brand',
    options: [
      'Thermo Fisher',
      'Agilent',
      'Waters',
      'Shimadzu',
      'PerkinElmer',
      'Bruker',
      'JEOL',
      'Leica',
    ],
  },
  {
    id: 'accuracy',
    name: 'Accuracy',
    type: 'range',
    category: 'technical',
    min: 0.1,
    max: 10.0,
    unit: '%',
    description: 'Measurement accuracy percentage',
  },
  {
    id: 'resolution',
    name: 'Resolution',
    type: 'range',
    category: 'technical',
    min: 0.1,
    max: 1000,
    unit: 'nm',
    description: 'Optical or analytical resolution',
  },
  {
    id: 'sample_capacity',
    name: 'Sample Capacity',
    type: 'range',
    category: 'technical',
    min: 1,
    max: 1000,
    unit: 'samples',
  },
  {
    id: 'temperature_range',
    name: 'Temperature Range',
    type: 'range',
    category: 'technical',
    min: -200,
    max: 1500,
    unit: '°C',
  },
  {
    id: 'automation_level',
    name: 'Automation Level',
    type: 'select',
    category: 'technical',
    options: ['Manual', 'Semi-Automated', 'Fully Automated'],
  },
  {
    id: 'application',
    name: 'Application Area',
    type: 'select',
    category: 'application',
    options: [
      'Analytical Chemistry',
      'Biotechnology',
      'Materials Science',
      'Environmental',
      'Food Safety',
      'Pharmaceuticals',
    ],
  },
  {
    id: 'lab_type',
    name: 'Lab Type',
    type: 'select',
    category: 'application',
    options: [
      'Research',
      'QC/QA',
      'Production',
      'Academic',
      'Clinical',
      'Government',
    ],
  },
  {
    id: 'compliance',
    name: 'Regulatory Compliance',
    type: 'checkbox',
    category: 'technical',
    options: ['FDA 21 CFR Part 11', 'ISO 17025', 'GLP', 'GMP', 'CLIA'],
  },
];

// Main intelligent search component
export const IntelligentSearchAndDiscovery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    text: '',
    filters: {},
    sortBy: 'relevance',
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {},
  );
  const [aiInsights, setAiInsights] = useState<AISearchInsight[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sample search results data
  const sampleResults: SearchResult[] = useMemo(
    () => [
      {
        id: 'spec_1',
        title: 'UltraSpec Pro 3000 Spectrophotometer',
        price: 15999,
        currency: 'USD',
        brand: 'Thermo Fisher',
        category: 'Spectroscopy',
        image: '/api/placeholder/200/150',
        rating: 4.8,
        reviewCount: 127,
        relevanceScore: 98.5,
        aiMatchScore: 94.2,
        specifications: [
          {
            name: 'Wavelength Range',
            value: '190-1100',
            unit: 'nm',
            category: 'technical',
          },
          {
            name: 'Bandwidth',
            value: '1.5',
            unit: 'nm',
            category: 'technical',
          },
          {
            name: 'Accuracy',
            value: '±0.3',
            unit: '%',
            category: 'performance',
          },
        ],
        applications: ['Analytical Chemistry', 'Quality Control', 'Research'],
        tags: ['UV-Vis', 'High Accuracy', 'Software Included'],
        inStock: true,
        featured: true,
      },
      {
        id: 'chrom_1',
        title: 'ChromMaster HPLC System',
        price: 45999,
        currency: 'USD',
        brand: 'Agilent',
        category: 'Chromatography',
        image: '/api/placeholder/200/150',
        rating: 4.9,
        reviewCount: 89,
        relevanceScore: 96.3,
        aiMatchScore: 92.7,
        specifications: [
          {
            name: 'Flow Rate',
            value: '0.01-10',
            unit: 'mL/min',
            category: 'technical',
          },
          { name: 'Pressure', value: 600, unit: 'bar', category: 'technical' },
          {
            name: 'Injection Volume',
            value: '0.1-100',
            unit: 'μL',
            category: 'technical',
          },
        ],
        applications: [
          'Pharmaceutical Analysis',
          'Environmental',
          'Food Safety',
        ],
        tags: ['HPLC', 'High Pressure', 'Automated'],
        inStock: true,
        discount: 10,
      },
      {
        id: 'micro_1',
        title: 'NanoScope Advanced Microscope',
        price: 89999,
        currency: 'USD',
        brand: 'JEOL',
        category: 'Microscopy',
        image: '/api/placeholder/200/150',
        rating: 4.7,
        reviewCount: 54,
        relevanceScore: 94.1,
        aiMatchScore: 89.3,
        specifications: [
          {
            name: 'Resolution',
            value: '0.05',
            unit: 'nm',
            category: 'technical',
          },
          {
            name: 'Magnification',
            value: '50x-2M',
            unit: 'x',
            category: 'technical',
          },
          {
            name: 'Acceleration Voltage',
            value: '0.2-30',
            unit: 'kV',
            category: 'technical',
          },
        ],
        applications: ['Materials Science', 'Nanotechnology', 'Research'],
        tags: ['SEM', 'High Resolution', 'AI Enhancement'],
        inStock: false,
        leadTime: '6-8 weeks',
      },
    ],
    [],
  );

  // AI-powered search insights
  const generateAIInsights = (query: string, results: SearchResult[]) => {
    const insights: AISearchInsight[] = [];

    if (query.toLowerCase().includes('spectro')) {
      insights.push({
        type: 'suggestion',
        title: 'Consider UV-Vis Range',
        description:
          'Based on your search, UV-Vis spectrophotometers might be ideal for your analytical needs',
        confidence: 87.3,
        reason: 'Query analysis indicates spectroscopic applications',
      });
    }

    if (results.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Bundle Opportunity',
        description:
          'Consider adding calibration standards and maintenance kits for optimal performance',
        confidence: 92.1,
        reason:
          'Customers who bought similar items often purchase these accessories',
      });
    }

    insights.push({
      type: 'alternative',
      title: 'Alternative Solution',
      description:
        'For budget-conscious labs, consider our certified refurbished options with full warranty',
      confidence: 78.9,
      reason: 'Price-sensitive search patterns detected',
    });

    return insights;
  };

  // Perform intelligent search
  const performSearch = async (query: SearchQuery) => {
    setIsSearching(true);

    // Simulate AI-powered search with delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter and rank results based on query
    let filteredResults = sampleResults;

    if (query.text) {
      filteredResults = filteredResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.text.toLowerCase()) ||
          result.brand.toLowerCase().includes(query.text.toLowerCase()) ||
          result.category.toLowerCase().includes(query.text.toLowerCase()) ||
          result.applications.some((app) =>
            app.toLowerCase().includes(query.text.toLowerCase()),
          ),
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterId, value]) => {
      const filter = searchFilters.find((f) => f.id === filterId);
      if (!filter || !value) return;

      filteredResults = filteredResults.filter((result) => {
        switch (filter.id) {
          case 'brand':
            return result.brand === value;
          case 'price':
            const priceRange = value as [number, number];
            return (
              result.price >= priceRange[0] && result.price <= priceRange[1]
            );
          default:
            return true;
        }
      });
    });

    // Sort results
    switch (query.sortBy) {
      case 'price_low':
        filteredResults.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredResults.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredResults.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    setSearchResults(filteredResults);
    setAiInsights(generateAIInsights(query.text, filteredResults));
    setIsSearching(false);
  };

  // Handle search input
  const handleSearch = (text: string) => {
    const newQuery = { ...searchQuery, text };
    setSearchQuery(newQuery);
    if (text.length > 2) {
      performSearch(newQuery);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: unknown) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(newFilters);
    const newQuery = { ...searchQuery, filters: newFilters };
    setSearchQuery(newQuery);
    performSearch(newQuery);
  };

  // Initialize with sample search
  useEffect(() => {
    const initialQuery = {
      text: '',
      filters: {},
      sortBy: 'relevance' as const,
    };
    performSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional for initialization

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Intelligent Search & Discovery
              </h3>
              <p className="text-blue-100">
                AI-powered search with lab equipment specification filtering
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Search Interface */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search lab equipment, specifications, applications..."
              value={searchQuery.text}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            'UV-Vis Spectrophotometer',
            'HPLC System',
            'Microscope',
            'pH Meter',
            'Centrifuge',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSearch(suggestion)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {showDetails && (
        <div className="p-6 space-y-6">
          {/* AI Insights */}
          {aiInsights.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                AI Search Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-yellow-800">
                        {insight.title}
                      </h5>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      {insight.description}
                    </p>
                    <div className="text-xs text-yellow-600">
                      {insight.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-500" />
                Advanced Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchFilters.slice(0, 6).map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {filter.name}
                      {filter.unit && (
                        <span className="text-gray-500"> ({filter.unit})</span>
                      )}
                    </label>
                    {filter.type === 'select' && (
                      <select
                        value={(activeFilters[filter.id] as string) || ''}
                        onChange={(e) =>
                          handleFilterChange(filter.id, e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All {filter.name}</option>
                        {filter.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {filter.type === 'range' && (
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={filter.min}
                          max={filter.max}
                          step={(filter.max! - filter.min!) / 100}
                          onChange={(e) =>
                            handleFilterChange(filter.id, [
                              filter.min,
                              Number(e.target.value),
                            ])
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {filter.min}
                            {filter.unit}
                          </span>
                          <span>
                            {filter.max}
                            {filter.unit}
                          </span>
                        </div>
                      </div>
                    )}
                    {filter.description && (
                      <p className="text-xs text-gray-500">
                        {filter.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-500" />
                Search Results ({searchResults.length})
              </h4>
              <select
                value={searchQuery.sortBy}
                onChange={(e) => {
                  const newQuery = {
                    ...searchQuery,
                    sortBy: e.target.value as SearchQuery['sortBy'],
                  };
                  setSearchQuery(newQuery);
                  performSearch(newQuery);
                }}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI is analyzing your search...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                        <Microscope className="h-16 w-16 text-gray-400" />
                      </div>
                      {result.featured && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </span>
                      )}
                      {result.discount && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{result.discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h5 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {result.title}
                      </h5>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-blue-600">
                          ${result.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {result.brand}
                        </span>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(result.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          ({result.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {result.inStock ? 'In Stock' : result.leadTime}
                        </span>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-medium">
                            {result.aiMatchScore}% match
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentSearchAndDiscovery;
