'use client';

import { useState } from 'react';
import QuizQuestion, { type QuizOption } from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizLogger from '@/lib/quiz-logger';

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

interface QuizData {
  q1: string; // application type
  q2: string; // opaque/transparent
  q3: boolean; // camera needed
  q4: number; // magnification
  q5: string; // persona
  q6: number; // budget
  q7: string[]; // special features
}

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    label: 'What will you be observing?',
    type: 'multi_image_select' as const,
    options: [
      { label: 'Soil or microorganisms', map_to: 'Compound' },
      { label: 'Insects, rocks, plants', map_to: 'Stereo' },
      { label: 'Cell cultures or slides', map_to: 'Inverted' },
      { label: 'Need digital imaging', map_to: 'Digital' },
    ],
  },
  {
    id: 'q2',
    label: 'Are your samples opaque or transparent?',
    type: 'toggle' as const,
    options: [
      { label: 'Opaque', map_to: 'Stereo' },
      { label: 'Transparent', map_to: 'Compound' },
    ],
  },
  {
    id: 'q3',
    label: 'Do you need to capture images or connect to a camera?',
    type: 'boolean' as const,
  },
  {
    id: 'q4',
    label: 'What magnification range do you need?',
    type: 'slider' as const,
    min: 10,
    max: 2000,
  },
  {
    id: 'q5',
    label: 'Who is this microscope for?',
    type: 'single_select' as const,
    options: [
      { label: 'Classroom / Students', map_to: 'Education' },
      { label: 'Clinical / Lab', map_to: 'Clinical' },
      { label: 'Research / Advanced', map_to: 'Research' },
    ],
  },
  {
    id: 'q6',
    label: "What's your budget range?",
    type: 'range_slider' as const,
    min: 100,
    max: 2000,
  },
  {
    id: 'q7',
    label: 'Any special features you want?',
    type: 'checkbox_list' as const,
    options: [
      'LED illumination',
      'Mechanical stage',
      'USB camera',
      'Dual light',
      'Rechargeable battery',
    ],
  },
];

// Weighting from quiz spec
const WEIGHTS = {
  application: 0.4,
  magnification: 0.2,
  camera: 0.15,
  persona: 0.15,
  budget: 0.1,
};

export default function MicroscopeQuiz({ products }: { products: Product[] }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizData>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results and log completion
      const scoredProducts = getScoredProducts();

      // Log quiz completion
      QuizLogger.logCompletion({
        answers: answers as any,
        results: {
          topMatch: {
            productId: scoredProducts[0].product.id,
            productHandle: scoredProducts[0].product.handle,
            productTitle: scoredProducts[0].product.title,
            score: scoredProducts[0].score,
          },
          otherMatches: scoredProducts.slice(1, 3).map((sp) => ({
            productId: sp.product.id,
            productHandle: sp.product.handle,
            productTitle: sp.product.title,
            score: sp.score,
          })),
        },
      }).catch(console.error);

      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const calculateScore = (product: Product): number => {
    let score = 0;

    // Get metafields as a map - filter out null/undefined fields
    const metafieldsMap = (product.metafields || [])
      .filter((field) => field && field.key && field.value)
      .reduce(
        (acc, field) => {
          acc[field.key] = field.value;
          return acc;
        },
        {} as Record<string, string>,
      );

    // Q1: Application type (40% weight)
    if (answers.q1) {
      const applicationsValue = metafieldsMap.applications || '';
      const productType = product.title.toLowerCase();

      // Check if product type matches the application
      if (
        answers.q1 === 'Compound' &&
        (productType.includes('compound') ||
          applicationsValue.toLowerCase().includes('compound'))
      ) {
        score += WEIGHTS.application;
      } else if (
        answers.q1 === 'Stereo' &&
        (productType.includes('stereo') ||
          applicationsValue.toLowerCase().includes('stereo'))
      ) {
        score += WEIGHTS.application;
      } else if (
        answers.q1 === 'Inverted' &&
        (productType.includes('inverted') ||
          applicationsValue.toLowerCase().includes('inverted'))
      ) {
        score += WEIGHTS.application;
      } else if (
        answers.q1 === 'Digital' &&
        (productType.includes('digital') ||
          applicationsValue.toLowerCase().includes('digital'))
      ) {
        score += WEIGHTS.application;
      }
    }

    // Q2: Opaque/Transparent (affects type selection - bonus score)
    if (answers.q2) {
      const productType = product.title.toLowerCase();
      if (answers.q2 === 'Stereo' && productType.includes('stereo')) {
        score += 0.05;
      } else if (
        answers.q2 === 'Compound' &&
        productType.includes('compound')
      ) {
        score += 0.05;
      }
    }

    // Q3: Camera needed (15% weight)
    if (answers.q3 !== undefined) {
      const featuresValue = metafieldsMap.features || '';
      const hasCamera =
        featuresValue.toLowerCase().includes('camera') ||
        featuresValue.toLowerCase().includes('trinocular') ||
        product.title.toLowerCase().includes('camera') ||
        product.title.toLowerCase().includes('digital');

      if (answers.q3 === true && hasCamera) {
        score += WEIGHTS.camera;
      } else if (answers.q3 === false && !hasCamera) {
        score += WEIGHTS.camera;
      }
    }

    // Q4: Magnification (20% weight)
    if (answers.q4) {
      const specsValue = metafieldsMap.specs || '';
      // Try to extract magnification from specs
      const magMatch = specsValue.match(/(\d+)x/i);
      if (magMatch) {
        const productMag = parseInt(magMatch[1]);
        // Score based on how close the magnification is
        const difference = Math.abs(productMag - answers.q4);
        const maxDifference = 2000; // max range
        const similarity = 1 - difference / maxDifference;
        score += WEIGHTS.magnification * Math.max(0, similarity);
      }
    }

    // Q5: Persona (15% weight)
    if (answers.q5) {
      const categoryValue = metafieldsMap.equipment_category || '';
      const productTitle = product.title.toLowerCase();

      if (
        answers.q5 === 'Education' &&
        (categoryValue.toLowerCase().includes('education') ||
          productTitle.includes('student'))
      ) {
        score += WEIGHTS.persona;
      } else if (
        answers.q5 === 'Clinical' &&
        (categoryValue.toLowerCase().includes('clinical') ||
          productTitle.includes('clinical'))
      ) {
        score += WEIGHTS.persona;
      } else if (
        answers.q5 === 'Research' &&
        (categoryValue.toLowerCase().includes('research') ||
          productTitle.includes('professional'))
      ) {
        score += WEIGHTS.persona;
      }
    }

    // Q6: Budget (10% weight)
    if (answers.q6) {
      const productPrice = parseFloat(
        product.priceRange.minVariantPrice.amount,
      );
      if (productPrice <= answers.q6) {
        // Full score if within budget
        score += WEIGHTS.budget;
      } else {
        // Partial score based on how close
        const difference = productPrice - answers.q6;
        const penalty = Math.min(difference / answers.q6, 1);
        score += WEIGHTS.budget * (1 - penalty);
      }
    }

    // Q7: Special features (bonus)
    if (answers.q7 && answers.q7.length > 0) {
      const featuresValue = (metafieldsMap.features || '').toLowerCase();
      let featureMatches = 0;

      answers.q7.forEach((feature) => {
        if (featuresValue.includes(feature.toLowerCase())) {
          featureMatches++;
        }
      });

      // Bonus score based on feature matches
      const featureBonus = (featureMatches / answers.q7.length) * 0.1;
      score += featureBonus;
    }

    return score;
  };

  const getScoredProducts = () => {
    return products
      .map((product) => ({
        product,
        score: calculateScore(product),
      }))
      .sort((a, b) => b.score - a.score);
  };

  if (showResults) {
    const scoredProducts = getScoredProducts();
    return <QuizResults products={scoredProducts} onRestart={handleRestart} />;
  }

  const currentQuestionData = QUIZ_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQuestionData.id as keyof QuizData];
  const isAnswered =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="min-h-[500px] flex flex-col">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span className="text-sm font-semibold text-[hsl(var(--brand))]">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1">
        <QuizQuestion
          id={currentQuestionData.id}
          label={currentQuestionData.label}
          type={currentQuestionData.type}
          options={
            currentQuestionData.options
              ? typeof currentQuestionData.options[0] === 'string'
                ? []
                : (currentQuestionData.options as QuizOption[])
              : undefined
          }
          min={currentQuestionData.min}
          max={currentQuestionData.max}
          value={currentAnswer}
          onChange={(value) => handleAnswer(currentQuestionData.id, value)}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t-2 border-border/50">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-foreground border-2 border-border/50 hover:border-[hsl(var(--brand))]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
        >
          {currentQuestion === QUIZ_QUESTIONS.length - 1
            ? 'See Results'
            : 'Next'}
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
