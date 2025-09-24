'use client';

import { useState } from 'react';
import { Star, StarHalf, Shield, Award, CheckCircle } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  title: string;
  institution: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

const sampleReviews: Review[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'Research Director',
    institution: 'Stanford University',
    rating: 5,
    date: '2024-08-15',
    comment:
      'Exceptional precision and reliability. Our lab has been using this for 6 months with zero issues. The calibration holds perfectly and the results are consistently accurate.',
    verified: true,
    helpful: 12,
  },
  {
    id: '2',
    name: 'Lab Manager Mike R.',
    title: 'Senior Lab Tech',
    institution: 'Johns Hopkins Medical',
    rating: 4.5,
    date: '2024-07-22',
    comment:
      'Great build quality and excellent customer support. Setup was straightforward and the technical documentation is comprehensive.',
    verified: true,
    helpful: 8,
  },
  {
    id: '3',
    name: 'Dr. Amanda Rodriguez',
    title: 'Principal Investigator',
    institution: 'MIT Biology Dept',
    rating: 5,
    date: '2024-06-10',
    comment:
      'This equipment has transformed our workflow efficiency. The precision measurements and consistent performance make it indispensable for our research.',
    verified: true,
    helpful: 15,
  },
];

const trustBadges = [
  {
    icon: Shield,
    title: 'ISO 9001 Certified',
    description: 'Quality management systems',
    color: 'text-blue-600',
  },
  {
    icon: Award,
    title: 'FDA Compliant',
    description: 'Medical device standards',
    color: 'text-green-600',
  },
  {
    icon: CheckCircle,
    title: 'CE Marked',
    description: 'European conformity',
    color: 'text-purple-600',
  },
];

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <StarHalf
        key="half"
        className="h-4 w-4 fill-yellow-400 text-yellow-400"
      />,
    );
  }

  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return stars;
};

export default function ReviewsAndTrust() {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'certifications'>(
    'reviews',
  );

  const averageRating =
    sampleReviews.reduce((acc, review) => acc + review.rating, 0) /
    sampleReviews.length;
  const totalReviews = sampleReviews.length;

  const displayedReviews = showAllReviews
    ? sampleReviews
    : sampleReviews.slice(0, 2);

  return (
    <div className="space-y-6 border-t border-border/50 pt-6">
      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3">
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20 border border-border/30"
            >
              <Icon className={`h-6 w-6 ${badge.color} mb-1`} />
              <div className="text-xs font-semibold text-foreground">
                {badge.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-lg bg-background p-1 border border-border/30">
          {(['reviews', 'certifications'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[hsl(var(--brand))] text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'reviews' && `Reviews (${totalReviews})`}
              {tab === 'certifications' && 'Lab Certifications'}
            </button>
          ))}
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Rating Summary */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-1">
                {renderStars(averageRating)}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  out of 5 ({totalReviews} lab reviews)
                </span>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border/30 rounded-lg p-4 bg-background"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {review.name}
                        </span>
                        {review.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {review.title} at {review.institution}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-sm text-foreground mb-3">
                    {review.comment}
                  </p>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{review.helpful} researchers found this helpful</span>
                  </div>
                </div>
              ))}
            </div>

            {!showAllReviews && sampleReviews.length > 2 && (
              <button
                onClick={() => setShowAllReviews(true)}
                className="w-full text-sm text-[hsl(var(--brand))] hover:underline py-2"
              >
                Show all {totalReviews} reviews
              </button>
            )}
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="border border-border/30 rounded-lg p-4 bg-background">
                <h4 className="font-semibold text-foreground mb-2">
                  Laboratory Quality Standards
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    ISO 9001:2015 Quality Management Systems
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    FDA 21 CFR Part 820 Medical Device Quality
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    CE Marking for European Union Compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    NIST Traceable Calibration Certificates
                  </li>
                </ul>
              </div>

              <div className="border border-border/30 rounded-lg p-4 bg-background">
                <h4 className="font-semibold text-foreground mb-2">
                  Safety & Environmental
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    RoHS Compliant - Lead-free materials
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    UL Listed electrical safety standards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    REACH Regulation chemical compliance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
