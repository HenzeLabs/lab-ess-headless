#!/usr/bin/env python3
"""
Microscope Quiz Validation & Optimization Script

This script:
1. Loads synthetic test cases
2. Loads Shopify product data
3. Runs the quiz scoring algorithm
4. Compares results to expert expectations
5. Generates accuracy reports
6. Optimizes weights using grid search
"""

import csv
import json
import sys
from typing import Dict, List, Tuple
from collections import defaultdict
import itertools


class Product:
    """Represents a microscope product with metafields"""

    def __init__(self, data: Dict):
        self.id = data.get('id', '')
        self.title = data.get('title', '')
        self.handle = data.get('handle', '')
        self.price = float(data.get('price', 0))
        self.metafields = data.get('metafields', {})

        # Extract metafield values
        self.features = self.metafields.get('features', '')
        self.applications = self.metafields.get('applications', '')
        self.specs = self.metafields.get('specs', '')
        self.equipment_category = self.metafields.get('equipment_category', '')

    def get_type(self) -> str:
        """Determine product type (compound, stereo, inverted, digital)"""
        title_lower = self.title.lower()

        if 'inverted' in title_lower or 'inverted' in self.applications.lower():
            return 'inverted'
        elif 'stereo' in title_lower or 'stereo' in self.applications.lower():
            return 'stereo'
        elif 'digital' in title_lower or 'camera' in title_lower:
            return 'digital'
        elif 'compound' in title_lower or 'compound' in self.applications.lower():
            return 'compound'
        else:
            # Default based on transparency
            return 'compound'


class QuizEngine:
    """Quiz scoring engine with configurable weights"""

    def __init__(self, weights: Dict[str, float] = None):
        """Initialize with default or custom weights"""
        self.weights = weights or {
            'application': 0.40,
            'magnification': 0.20,
            'camera': 0.15,
            'persona': 0.15,
            'budget': 0.10,
        }

    def score_product(self, product: Product, test_case: Dict) -> float:
        """Score a product against a test case"""
        score = 0.0

        # Q1: Application type (based on sample type and opacity)
        expected_type = self._map_sample_to_type(
            test_case['sample_type'],
            test_case['sample_opacity']
        )

        product_type = product.get_type()

        if expected_type == product_type:
            score += self.weights['application']
        elif expected_type in ['compound', 'inverted'] and product_type in ['compound', 'inverted']:
            # Partial credit for similar types
            score += self.weights['application'] * 0.5

        # Q2: Opacity bonus (already factored into Q1)
        if test_case['sample_opacity'] == 'opaque' and product_type == 'stereo':
            score += 0.05
        elif test_case['sample_opacity'] == 'transparent' and product_type in ['compound', 'inverted']:
            score += 0.05

        # Q3: Camera needed
        camera_needed = test_case['camera_need'] == 'yes'
        has_camera = self._has_camera(product)

        if camera_needed == has_camera:
            score += self.weights['camera']
        elif not camera_needed and has_camera:
            # Minor penalty for over-spec
            score += self.weights['camera'] * 0.5

        # Q4: Magnification
        target_mag = int(test_case['magnification'])
        product_mag = self._extract_magnification(product)

        if product_mag:
            # Score based on how close the magnification is
            difference = abs(product_mag - target_mag)
            max_difference = 2000
            similarity = 1 - min(difference / max_difference, 1)
            score += self.weights['magnification'] * similarity

        # Q5: Persona (education, clinical, research)
        persona = test_case['persona']
        category_lower = product.equipment_category.lower()
        title_lower = product.title.lower()

        if persona == 'education' and ('education' in category_lower or 'student' in title_lower):
            score += self.weights['persona']
        elif persona == 'clinical' and ('clinical' in category_lower or 'clinical' in title_lower):
            score += self.weights['persona']
        elif persona == 'research' and ('research' in category_lower or 'professional' in title_lower):
            score += self.weights['persona']
        else:
            # Partial credit for price range matching persona
            if persona == 'education' and product.price < 600:
                score += self.weights['persona'] * 0.3
            elif persona == 'clinical' and 600 <= product.price < 1400:
                score += self.weights['persona'] * 0.3
            elif persona == 'research' and product.price >= 1400:
                score += self.weights['persona'] * 0.3

        # Q6: Budget
        budget = int(test_case['budget'])
        if product.price <= budget:
            # Full score if within budget
            score += self.weights['budget']
        else:
            # Penalty based on how far over budget
            difference = product.price - budget
            penalty = min(difference / budget, 1)
            score += self.weights['budget'] * (1 - penalty)

        # Q7: Special features (bonus scoring)
        if test_case['special_features']:
            requested_features = [f.strip() for f in test_case['special_features'].split('|')]
            features_lower = product.features.lower()

            matches = sum(1 for feature in requested_features if feature.lower() in features_lower)
            if requested_features:
                feature_bonus = (matches / len(requested_features)) * 0.1
                score += feature_bonus

        return score

    def _map_sample_to_type(self, sample_type: str, opacity: str) -> str:
        """Map sample type to microscope type"""
        sample_lower = sample_type.lower()

        # Inverted indicators
        if any(term in sample_lower for term in ['cell culture', 'cells', 'tissue culture',
                                                   'embryo', 'oocyte', 'stem cell', 'neuron',
                                                   'culture', 'adherent', 'monolayer']):
            return 'inverted'

        # Stereo indicators (opaque 3D samples)
        if opacity == 'opaque' or any(term in sample_lower for term in [
            'insect', 'rock', 'mineral', 'circuit', 'fiber', 'metal',
            'pollen', 'gemstone', 'solder', 'lichen', 'moss', 'fossil',
            'textile', '3d', 'coin', 'arthropod', 'wood', 'welding',
            'jewelry', 'seed', 'tree ring', 'coral', 'stamp', 'flower',
            'beetle', 'butterfly', 'wire', 'component', 'surface mount'
        ]):
            return 'stereo'

        # Everything else defaults to compound
        return 'compound'

    def _has_camera(self, product: Product) -> bool:
        """Check if product has camera capability"""
        features_lower = product.features.lower()
        title_lower = product.title.lower()

        return any(term in features_lower or term in title_lower for term in [
            'camera', 'trinocular', 'digital', 'usb', 'imaging'
        ])

    def _extract_magnification(self, product: Product) -> int:
        """Extract maximum magnification from specs"""
        import re

        # Try to find magnification in specs
        specs_text = product.specs + ' ' + product.title

        # Look for patterns like "400x", "1000X", "40-400x"
        matches = re.findall(r'(\d+)[-–]?(\d+)?x', specs_text, re.IGNORECASE)

        if matches:
            # Get the highest magnification found
            mags = []
            for match in matches:
                if match[1]:  # Range like "40-400x"
                    mags.append(int(match[1]))
                else:  # Single value like "400x"
                    mags.append(int(match[0]))

            if mags:
                return max(mags)

        return 0

    def predict(self, test_case: Dict, products: List[Product]) -> Tuple[Product, float]:
        """Predict best product for a test case"""
        if not products:
            return None, 0.0

        scores = [(product, self.score_product(product, test_case)) for product in products]
        scores.sort(key=lambda x: x[1], reverse=True)

        return scores[0]


class QuizValidator:
    """Validates quiz accuracy and optimizes weights"""

    def __init__(self, test_cases_file: str, products_file: str):
        """Load test cases and products"""
        self.test_cases = self._load_test_cases(test_cases_file)
        self.products = self._load_products(products_file)
        self.engine = QuizEngine()

    def _load_test_cases(self, filename: str) -> List[Dict]:
        """Load test cases from CSV"""
        test_cases = []

        with open(filename, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                test_cases.append(row)

        print(f"✓ Loaded {len(test_cases)} test cases")
        return test_cases

    def _load_products(self, filename: str) -> List[Product]:
        """Load products from JSON export"""
        with open(filename, 'r') as f:
            data = json.load(f)

        products = []

        # Handle different JSON structures
        if isinstance(data, list):
            product_list = data
        elif 'products' in data:
            product_list = data['products']
        else:
            product_list = [data]

        for item in product_list:
            products.append(Product(item))

        print(f"✓ Loaded {len(products)} products")
        return products

    def run_validation(self) -> Dict:
        """Run validation and return detailed results"""
        results = {
            'total': len(self.test_cases),
            'correct_type': 0,
            'correct_category': 0,
            'mismatches': [],
            'type_confusion_matrix': defaultdict(lambda: defaultdict(int)),
            'question_impact': defaultdict(int),
        }

        for test_case in self.test_cases:
            predicted_product, score = self.engine.predict(test_case, self.products)

            if not predicted_product:
                continue

            expected_type = test_case['expected_type']
            predicted_type = predicted_product.get_type()
            expected_category = test_case['expected_product_category']
            predicted_category = self._categorize_product(predicted_product)

            # Check type match
            if expected_type == predicted_type:
                results['correct_type'] += 1
            else:
                results['mismatches'].append({
                    'test_id': test_case['test_id'],
                    'sample': test_case['sample_type'],
                    'expected_type': expected_type,
                    'predicted_type': predicted_type,
                    'expected_category': expected_category,
                    'predicted_category': predicted_category,
                    'product': predicted_product.title,
                    'score': score,
                })

            # Check category match
            if expected_category == predicted_category:
                results['correct_category'] += 1

            # Update confusion matrix
            results['type_confusion_matrix'][expected_type][predicted_type] += 1

        # Calculate accuracy
        results['type_accuracy'] = results['correct_type'] / results['total'] * 100
        results['category_accuracy'] = results['correct_category'] / results['total'] * 100

        return results

    def _categorize_product(self, product: Product) -> str:
        """Categorize product as education/clinical/research"""
        category_lower = product.equipment_category.lower()
        title_lower = product.title.lower()

        if 'education' in category_lower or 'student' in title_lower:
            return 'education'
        elif 'clinical' in category_lower or 'clinical' in title_lower:
            return 'clinical'
        elif 'research' in category_lower or 'professional' in title_lower:
            return 'research'
        else:
            # Categorize by price
            if product.price < 600:
                return 'education'
            elif product.price < 1400:
                return 'clinical'
            else:
                return 'research'

    def optimize_weights(self, iterations: int = 50) -> Dict:
        """Optimize weights using grid search"""
        print("\n🔧 Optimizing weights...")

        best_accuracy = 0
        best_weights = None

        # Define search space
        application_range = [0.30, 0.35, 0.40, 0.45, 0.50]
        magnification_range = [0.15, 0.20, 0.25]
        camera_range = [0.10, 0.15, 0.20]
        persona_range = [0.10, 0.15, 0.20]
        budget_range = [0.05, 0.10, 0.15]

        total_combinations = (len(application_range) * len(magnification_range) *
                            len(camera_range) * len(persona_range) * len(budget_range))

        print(f"Testing {total_combinations} weight combinations...")

        tested = 0
        for app_w in application_range:
            for mag_w in magnification_range:
                for cam_w in camera_range:
                    for per_w in persona_range:
                        for bud_w in budget_range:
                            # Ensure weights sum to ~1.0
                            total = app_w + mag_w + cam_w + per_w + bud_w
                            if not (0.95 <= total <= 1.05):
                                continue

                            weights = {
                                'application': app_w,
                                'magnification': mag_w,
                                'camera': cam_w,
                                'persona': per_w,
                                'budget': bud_w,
                            }

                            # Test these weights
                            self.engine.weights = weights
                            results = self.run_validation()
                            accuracy = results['type_accuracy']

                            if accuracy > best_accuracy:
                                best_accuracy = accuracy
                                best_weights = weights.copy()
                                print(f"  New best: {accuracy:.1f}% with weights: {weights}")

                            tested += 1
                            if tested % 100 == 0:
                                print(f"  Tested {tested}/{total_combinations} combinations...")

        print(f"\n✓ Optimization complete!")
        print(f"Best accuracy: {best_accuracy:.1f}%")
        print(f"Best weights: {best_weights}")

        # Set the best weights
        self.engine.weights = best_weights

        return {
            'best_accuracy': best_accuracy,
            'best_weights': best_weights,
            'combinations_tested': tested,
        }

    def generate_report(self, output_file: str = 'quiz_validation_report.txt'):
        """Generate detailed validation report"""
        results = self.run_validation()

        with open(output_file, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("MICROSCOPE QUIZ VALIDATION REPORT\n")
            f.write("=" * 80 + "\n\n")

            f.write("OVERALL ACCURACY\n")
            f.write("-" * 80 + "\n")
            f.write(f"Total test cases: {results['total']}\n")
            f.write(f"Type accuracy: {results['type_accuracy']:.1f}% ({results['correct_type']}/{results['total']})\n")
            f.write(f"Category accuracy: {results['category_accuracy']:.1f}% ({results['correct_category']}/{results['total']})\n\n")

            f.write("CURRENT WEIGHTS\n")
            f.write("-" * 80 + "\n")
            for key, value in self.engine.weights.items():
                f.write(f"{key:15s}: {value:.2f}\n")
            f.write("\n")

            f.write("TYPE CONFUSION MATRIX\n")
            f.write("-" * 80 + "\n")
            f.write(f"{'Expected':<15} {'Predicted':<15} {'Count':<10}\n")
            f.write("-" * 80 + "\n")
            for expected, predicted_dict in results['type_confusion_matrix'].items():
                for predicted, count in predicted_dict.items():
                    marker = "✓" if expected == predicted else "✗"
                    f.write(f"{expected:<15} {predicted:<15} {count:<10} {marker}\n")
            f.write("\n")

            f.write("MISMATCHES (First 20)\n")
            f.write("-" * 80 + "\n")
            for mismatch in results['mismatches'][:20]:
                f.write(f"Test #{mismatch['test_id']}: {mismatch['sample']}\n")
                f.write(f"  Expected: {mismatch['expected_type']} ({mismatch['expected_category']})\n")
                f.write(f"  Predicted: {mismatch['predicted_type']} ({mismatch['predicted_category']})\n")
                f.write(f"  Product: {mismatch['product']}\n")
                f.write(f"  Score: {mismatch['score']:.3f}\n\n")

            f.write("=" * 80 + "\n")

        print(f"\n✓ Report saved to: {output_file}")
        return results


def main():
    """Main execution"""
    import os

    print("🔬 Microscope Quiz Validator\n")

    # File paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_cases_file = os.path.join(script_dir, 'quiz_test_cases.csv')
    products_file = os.path.join(script_dir, 'products_export.json')

    # Check if files exist
    if not os.path.exists(test_cases_file):
        print(f"❌ Test cases file not found: {test_cases_file}")
        sys.exit(1)

    if not os.path.exists(products_file):
        print(f"❌ Products file not found: {products_file}")
        print(f"   Please export your Shopify products to: {products_file}")
        sys.exit(1)

    # Create validator
    validator = QuizValidator(test_cases_file, products_file)

    # Run initial validation
    print("\n📊 Running initial validation...")
    initial_results = validator.generate_report('initial_validation_report.txt')

    print(f"\nInitial Type Accuracy: {initial_results['type_accuracy']:.1f}%")
    print(f"Initial Category Accuracy: {initial_results['category_accuracy']:.1f}%")

    # Optimize if accuracy is below 90%
    if initial_results['type_accuracy'] < 90:
        print(f"\n⚠️  Accuracy below 90%, running optimization...")
        optimization_results = validator.optimize_weights()

        # Run validation with optimized weights
        print("\n📊 Running validation with optimized weights...")
        final_results = validator.generate_report('optimized_validation_report.txt')

        print(f"\nFinal Type Accuracy: {final_results['type_accuracy']:.1f}%")
        print(f"Final Category Accuracy: {final_results['category_accuracy']:.1f}%")
        print(f"Improvement: +{final_results['type_accuracy'] - initial_results['type_accuracy']:.1f}%")

        # Save optimized weights
        with open('optimized_weights.json', 'w') as f:
            json.dump(optimization_results['best_weights'], f, indent=2)
        print(f"\n✓ Optimized weights saved to: optimized_weights.json")
    else:
        print(f"\n✅ Accuracy already above 90%! No optimization needed.")

    print("\n✓ Validation complete!")


if __name__ == '__main__':
    main()
