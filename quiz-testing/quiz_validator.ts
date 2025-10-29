/**
 * TypeScript Quiz Validator
 *
 * Alternative to Python version for easier integration with Next.js
 */

import fs from 'fs';
import path from 'path';

interface Product {
  id: string;
  title: string;
  handle: string;
  price: number;
  metafields: {
    features?: string;
    applications?: string;
    specs?: string;
    equipment_category?: string;
  };
}

interface TestCase {
  test_id: string;
  sample_type: string;
  sample_opacity: string;
  persona: string;
  camera_need: string;
  magnification: string;
  budget: string;
  special_features: string;
  expected_type: string;
  expected_product_category: string;
  notes: string;
}

interface Weights {
  application: number;
  magnification: number;
  camera: number;
  persona: number;
  budget: number;
}

interface ScoredProduct {
  product: Product;
  score: number;
}

interface ValidationResults {
  total: number;
  correct_type: number;
  correct_category: number;
  type_accuracy: number;
  category_accuracy: number;
  mismatches: Array<{
    test_id: string;
    sample: string;
    expected_type: string;
    predicted_type: string;
    expected_category: string;
    predicted_category: string;
    product: string;
    score: number;
  }>;
  confusion_matrix: Record<string, Record<string, number>>;
}

class QuizEngine {
  weights: Weights;

  constructor(weights?: Partial<Weights>) {
    this.weights = {
      application: 0.4,
      magnification: 0.2,
      camera: 0.15,
      persona: 0.15,
      budget: 0.1,
      ...weights,
    };
  }

  scoreProduct(product: Product, testCase: TestCase): number {
    let score = 0;

    // Q1: Application type
    const expectedType = this.mapSampleToType(
      testCase.sample_type,
      testCase.sample_opacity,
    );
    const productType = this.getProductType(product);

    if (expectedType === productType) {
      score += this.weights.application;
    } else if (
      ['compound', 'inverted'].includes(expectedType) &&
      ['compound', 'inverted'].includes(productType)
    ) {
      score += this.weights.application * 0.5;
    }

    // Q2: Opacity bonus
    if (testCase.sample_opacity === 'opaque' && productType === 'stereo') {
      score += 0.05;
    } else if (
      testCase.sample_opacity === 'transparent' &&
      ['compound', 'inverted'].includes(productType)
    ) {
      score += 0.05;
    }

    // Q3: Camera
    const cameraNeeded = testCase.camera_need === 'yes';
    const hasCamera = this.hasCamera(product);

    if (cameraNeeded === hasCamera) {
      score += this.weights.camera;
    } else if (!cameraNeeded && hasCamera) {
      score += this.weights.camera * 0.5;
    }

    // Q4: Magnification
    const targetMag = parseInt(testCase.magnification);
    const productMag = this.extractMagnification(product);

    if (productMag > 0) {
      const difference = Math.abs(productMag - targetMag);
      const maxDifference = 2000;
      const similarity = 1 - Math.min(difference / maxDifference, 1);
      score += this.weights.magnification * similarity;
    }

    // Q5: Persona
    const persona = testCase.persona;
    const categoryLower = (
      product.metafields.equipment_category || ''
    ).toLowerCase();
    const titleLower = product.title.toLowerCase();

    if (
      (persona === 'education' &&
        (categoryLower.includes('education') ||
          titleLower.includes('student'))) ||
      (persona === 'clinical' &&
        (categoryLower.includes('clinical') ||
          titleLower.includes('clinical'))) ||
      (persona === 'research' &&
        (categoryLower.includes('research') ||
          titleLower.includes('professional')))
    ) {
      score += this.weights.persona;
    } else {
      // Partial credit for price range
      if (persona === 'education' && product.price < 600) {
        score += this.weights.persona * 0.3;
      } else if (
        persona === 'clinical' &&
        product.price >= 600 &&
        product.price < 1400
      ) {
        score += this.weights.persona * 0.3;
      } else if (persona === 'research' && product.price >= 1400) {
        score += this.weights.persona * 0.3;
      }
    }

    // Q6: Budget
    const budget = parseInt(testCase.budget);
    if (product.price <= budget) {
      score += this.weights.budget;
    } else {
      const difference = product.price - budget;
      const penalty = Math.min(difference / budget, 1);
      score += this.weights.budget * (1 - penalty);
    }

    // Q7: Special features (bonus)
    if (testCase.special_features) {
      const requestedFeatures = testCase.special_features
        .split('|')
        .map((f) => f.trim());
      const featuresLower = (product.metafields.features || '').toLowerCase();

      let matches = 0;
      requestedFeatures.forEach((feature) => {
        if (featuresLower.includes(feature.toLowerCase())) {
          matches++;
        }
      });

      if (requestedFeatures.length > 0) {
        const featureBonus = (matches / requestedFeatures.length) * 0.1;
        score += featureBonus;
      }
    }

    return score;
  }

  predict(testCase: TestCase, products: Product[]): ScoredProduct | null {
    if (products.length === 0) return null;

    const scoredProducts = products
      .map((product) => ({
        product,
        score: this.scoreProduct(product, testCase),
      }))
      .sort((a, b) => b.score - a.score);

    return scoredProducts[0];
  }

  private mapSampleToType(sampleType: string, opacity: string): string {
    const sampleLower = sampleType.toLowerCase();

    // Inverted indicators
    const invertedTerms = [
      'cell culture',
      'cells',
      'tissue culture',
      'embryo',
      'oocyte',
      'stem cell',
      'neuron',
      'culture',
      'adherent',
      'monolayer',
    ];

    if (invertedTerms.some((term) => sampleLower.includes(term))) {
      return 'inverted';
    }

    // Stereo indicators
    const stereoTerms = [
      'insect',
      'rock',
      'mineral',
      'circuit',
      'fiber',
      'metal',
      'pollen',
      'gemstone',
      'solder',
      'lichen',
      'moss',
      'fossil',
      'textile',
      '3d',
      'coin',
      'arthropod',
      'wood',
      'welding',
      'jewelry',
      'seed',
      'tree ring',
      'coral',
      'stamp',
      'flower',
      'beetle',
      'butterfly',
      'wire',
      'component',
      'surface mount',
    ];

    if (
      opacity === 'opaque' ||
      stereoTerms.some((term) => sampleLower.includes(term))
    ) {
      return 'stereo';
    }

    return 'compound';
  }

  private getProductType(product: Product): string {
    const titleLower = product.title.toLowerCase();
    const applicationsLower = (
      product.metafields.applications || ''
    ).toLowerCase();

    if (
      titleLower.includes('inverted') ||
      applicationsLower.includes('inverted')
    ) {
      return 'inverted';
    } else if (
      titleLower.includes('stereo') ||
      applicationsLower.includes('stereo')
    ) {
      return 'stereo';
    } else if (
      titleLower.includes('digital') ||
      titleLower.includes('camera')
    ) {
      return 'digital';
    } else if (
      titleLower.includes('compound') ||
      applicationsLower.includes('compound')
    ) {
      return 'compound';
    }

    return 'compound';
  }

  private hasCamera(product: Product): boolean {
    const featuresLower = (product.metafields.features || '').toLowerCase();
    const titleLower = product.title.toLowerCase();

    const cameraTerms = ['camera', 'trinocular', 'digital', 'usb', 'imaging'];
    return cameraTerms.some(
      (term) => featuresLower.includes(term) || titleLower.includes(term),
    );
  }

  private extractMagnification(product: Product): number {
    const specsText = `${product.metafields.specs || ''} ${product.title}`;
    const matches = specsText.match(/(\d+)[-–]?(\d+)?x/gi);

    if (!matches) return 0;

    const mags: number[] = [];
    matches.forEach((match) => {
      const parts = match.match(/(\d+)[-–]?(\d+)?/);
      if (parts) {
        if (parts[2]) {
          mags.push(parseInt(parts[2]));
        } else {
          mags.push(parseInt(parts[1]));
        }
      }
    });

    return mags.length > 0 ? Math.max(...mags) : 0;
  }
}

class QuizValidator {
  testCases: TestCase[] = [];
  products: Product[] = [];
  engine: QuizEngine;

  constructor(testCasesFile: string, productsFile: string) {
    this.loadTestCases(testCasesFile);
    this.loadProducts(productsFile);
    this.engine = new QuizEngine();
  }

  private loadTestCases(filename: string): void {
    const content = fs.readFileSync(filename, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const testCase: any = {};

      headers.forEach((header, index) => {
        testCase[header.trim()] = values[index]?.trim() || '';
      });

      this.testCases.push(testCase as TestCase);
    }

    console.log(`✓ Loaded ${this.testCases.length} test cases`);
  }

  private loadProducts(filename: string): void {
    const content = fs.readFileSync(filename, 'utf-8');
    const data = JSON.parse(content);

    const productList = Array.isArray(data) ? data : data.products || [data];

    this.products = productList.map((item: any) => ({
      id: item.id,
      title: item.title,
      handle: item.handle,
      price:
        item.price ||
        parseFloat(item.priceRange?.minVariantPrice?.amount || '0'),
      metafields: item.metafields || {},
    }));

    console.log(`✓ Loaded ${this.products.length} products`);
  }

  runValidation(): ValidationResults {
    const results: ValidationResults = {
      total: this.testCases.length,
      correct_type: 0,
      correct_category: 0,
      type_accuracy: 0,
      category_accuracy: 0,
      mismatches: [],
      confusion_matrix: {},
    };

    this.testCases.forEach((testCase) => {
      const prediction = this.engine.predict(testCase, this.products);

      if (!prediction) return;

      const expectedType = testCase.expected_type;
      const predictedType = this.engine.getProductType(prediction.product);
      const expectedCategory = testCase.expected_product_category;
      const predictedCategory = this.categorizeProduct(prediction.product);

      // Check type match
      if (expectedType === predictedType) {
        results.correct_type++;
      } else {
        results.mismatches.push({
          test_id: testCase.test_id,
          sample: testCase.sample_type,
          expected_type: expectedType,
          predicted_type: predictedType,
          expected_category: expectedCategory,
          predicted_category: predictedCategory,
          product: prediction.product.title,
          score: prediction.score,
        });
      }

      // Check category match
      if (expectedCategory === predictedCategory) {
        results.correct_category++;
      }

      // Update confusion matrix
      if (!results.confusion_matrix[expectedType]) {
        results.confusion_matrix[expectedType] = {};
      }
      results.confusion_matrix[expectedType][predictedType] =
        (results.confusion_matrix[expectedType][predictedType] || 0) + 1;
    });

    results.type_accuracy = (results.correct_type / results.total) * 100;
    results.category_accuracy =
      (results.correct_category / results.total) * 100;

    return results;
  }

  private categorizeProduct(product: Product): string {
    const categoryLower = (
      product.metafields.equipment_category || ''
    ).toLowerCase();
    const titleLower = product.title.toLowerCase();

    if (categoryLower.includes('education') || titleLower.includes('student')) {
      return 'education';
    } else if (
      categoryLower.includes('clinical') ||
      titleLower.includes('clinical')
    ) {
      return 'clinical';
    } else if (
      categoryLower.includes('research') ||
      titleLower.includes('professional')
    ) {
      return 'research';
    }

    // Categorize by price
    if (product.price < 600) return 'education';
    if (product.price < 1400) return 'clinical';
    return 'research';
  }

  optimizeWeights(maxIterations: number = 1000): {
    accuracy: number;
    weights: Weights;
  } {
    console.log('\n🔧 Optimizing weights...');

    let bestAccuracy = 0;
    let bestWeights = { ...this.engine.weights };

    const ranges = {
      application: [0.3, 0.35, 0.4, 0.45, 0.5],
      magnification: [0.15, 0.2, 0.25],
      camera: [0.1, 0.15, 0.2],
      persona: [0.1, 0.15, 0.2],
      budget: [0.05, 0.1, 0.15],
    };

    let tested = 0;

    for (const app of ranges.application) {
      for (const mag of ranges.magnification) {
        for (const cam of ranges.camera) {
          for (const per of ranges.persona) {
            for (const bud of ranges.budget) {
              const total = app + mag + cam + per + bud;
              if (total < 0.95 || total > 1.05) continue;

              const weights: Weights = {
                application: app,
                magnification: mag,
                camera: cam,
                persona: per,
                budget: bud,
              };

              this.engine.weights = weights;
              const results = this.runValidation();

              if (results.type_accuracy > bestAccuracy) {
                bestAccuracy = results.type_accuracy;
                bestWeights = { ...weights };
                console.log(
                  `  New best: ${bestAccuracy.toFixed(1)}% with weights:`,
                  weights,
                );
              }

              tested++;
              if (tested >= maxIterations) break;
            }
            if (tested >= maxIterations) break;
          }
          if (tested >= maxIterations) break;
        }
        if (tested >= maxIterations) break;
      }
      if (tested >= maxIterations) break;
    }

    console.log(`\n✓ Tested ${tested} weight combinations`);
    this.engine.weights = bestWeights;

    return { accuracy: bestAccuracy, weights: bestWeights };
  }

  generateReport(outputFile: string): void {
    const results = this.runValidation();

    let report = '';
    report += '='.repeat(80) + '\n';
    report += 'MICROSCOPE QUIZ VALIDATION REPORT\n';
    report += '='.repeat(80) + '\n\n';

    report += 'OVERALL ACCURACY\n';
    report += '-'.repeat(80) + '\n';
    report += `Total test cases: ${results.total}\n`;
    report += `Type accuracy: ${results.type_accuracy.toFixed(1)}% (${results.correct_type}/${
      results.total
    })\n`;
    report += `Category accuracy: ${results.category_accuracy.toFixed(1)}% (${
      results.correct_category
    }/${results.total})\n\n`;

    report += 'CURRENT WEIGHTS\n';
    report += '-'.repeat(80) + '\n';
    Object.entries(this.engine.weights).forEach(([key, value]) => {
      report += `${key.padEnd(15)}: ${value.toFixed(2)}\n`;
    });
    report += '\n';

    report += 'TYPE CONFUSION MATRIX\n';
    report += '-'.repeat(80) + '\n';
    report += `${'Expected'.padEnd(15)} ${'Predicted'.padEnd(15)} ${'Count'.padEnd(10)}\n`;
    report += '-'.repeat(80) + '\n';

    Object.entries(results.confusion_matrix).forEach(
      ([expected, predictedDict]) => {
        Object.entries(predictedDict).forEach(([predicted, count]) => {
          const marker = expected === predicted ? '✓' : '✗';
          report += `${expected.padEnd(15)} ${predicted.padEnd(15)} ${String(
            count,
          ).padEnd(10)} ${marker}\n`;
        });
      },
    );
    report += '\n';

    report += 'MISMATCHES (First 20)\n';
    report += '-'.repeat(80) + '\n';
    results.mismatches.slice(0, 20).forEach((mismatch) => {
      report += `Test #${mismatch.test_id}: ${mismatch.sample}\n`;
      report += `  Expected: ${mismatch.expected_type} (${mismatch.expected_category})\n`;
      report += `  Predicted: ${mismatch.predicted_type} (${mismatch.predicted_category})\n`;
      report += `  Product: ${mismatch.product}\n`;
      report += `  Score: ${mismatch.score.toFixed(3)}\n\n`;
    });

    report += '='.repeat(80) + '\n';

    fs.writeFileSync(outputFile, report);
    console.log(`\n✓ Report saved to: ${outputFile}`);
  }
}

// Main execution
async function main() {
  console.log('🔬 Microscope Quiz Validator (TypeScript)\n');

  const scriptDir = __dirname;
  const testCasesFile = path.join(scriptDir, 'quiz_test_cases.csv');
  const productsFile = path.join(scriptDir, 'products_export.json');

  if (!fs.existsSync(testCasesFile)) {
    console.error(`❌ Test cases file not found: ${testCasesFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(productsFile)) {
    console.error(`❌ Products file not found: ${productsFile}`);
    console.error(`   Run: node export_products.js`);
    process.exit(1);
  }

  const validator = new QuizValidator(testCasesFile, productsFile);

  console.log('\n📊 Running initial validation...');
  validator.generateReport('initial_validation_report.txt');

  const initialResults = validator.runValidation();
  console.log(
    `\nInitial Type Accuracy: ${initialResults.type_accuracy.toFixed(1)}%`,
  );
  console.log(
    `Initial Category Accuracy: ${initialResults.category_accuracy.toFixed(1)}%`,
  );

  if (initialResults.type_accuracy < 90) {
    console.log('\n⚠️  Accuracy below 90%, running optimization...');
    const optimizationResults = validator.optimizeWeights();

    console.log('\n📊 Running validation with optimized weights...');
    validator.generateReport('optimized_validation_report.txt');

    const finalResults = validator.runValidation();
    console.log(
      `\nFinal Type Accuracy: ${finalResults.type_accuracy.toFixed(1)}%`,
    );
    console.log(
      `Final Category Accuracy: ${finalResults.category_accuracy.toFixed(1)}%`,
    );
    console.log(
      `Improvement: +${(finalResults.type_accuracy - initialResults.type_accuracy).toFixed(1)}%`,
    );

    fs.writeFileSync(
      'optimized_weights.json',
      JSON.stringify(optimizationResults.weights, null, 2),
    );
    console.log('\n✓ Optimized weights saved to: optimized_weights.json');
  } else {
    console.log('\n✅ Accuracy already above 90%! No optimization needed.');
  }

  console.log('\n✓ Validation complete!');
}

if (require.main === module) {
  main();
}

export { QuizEngine, QuizValidator };
