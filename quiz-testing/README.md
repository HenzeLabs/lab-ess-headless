# Microscope Quiz Validation & Optimization System

This system validates and optimizes the microscope quiz algorithm to achieve ≥90% match accuracy versus expert selections.

## 📁 Files

- **quiz_test_cases.csv** - 100 synthetic test cases representing real quiz scenarios
- **quiz_validator.py** - Python script that validates quiz accuracy and optimizes weights
- **export_products.js** - Node.js script to export Shopify products for testing
- **products_export.json** - (generated) Shopify product data
- **initial_validation_report.txt** - (generated) Initial accuracy report
- **optimized_validation_report.txt** - (generated) Post-optimization report
- **optimized_weights.json** - (generated) Best weight configuration

## 🚀 Quick Start

### 1. Export Products from Shopify

```bash
cd quiz-testing
node export_products.js
```

This will create `products_export.json` with all your microscope products.

### 2. Run Initial Validation

```bash
python3 quiz_validator.py
```

This will:
- Load 100 test cases
- Run quiz algorithm on each
- Compare to expert expectations
- Generate accuracy report
- Auto-optimize weights if accuracy < 90%

### 3. Review Results

Check the generated reports:

```bash
cat initial_validation_report.txt
cat optimized_validation_report.txt
cat optimized_weights.json
```

## 📊 Understanding the Test Cases

Each test case represents a real user scenario:

| Field | Description | Example |
|-------|-------------|---------|
| `test_id` | Unique identifier | 1 |
| `sample_type` | What user is observing | "soil microbes" |
| `sample_opacity` | Opaque or transparent | "transparent" |
| `persona` | User type | "education" |
| `camera_need` | Imaging required | "yes" |
| `magnification` | Required magnification | 400 |
| `budget` | Max budget | 500 |
| `special_features` | Desired features | "LED illumination" |
| `expected_type` | Expert recommendation | "compound" |
| `expected_product_category` | Expected tier | "education" |

## 🎯 Scoring Algorithm

The quiz uses weighted scoring:

```python
weights = {
    'application': 0.40,  # Sample type → microscope type
    'magnification': 0.20,  # Magnification match
    'camera': 0.15,  # Camera requirement
    'persona': 0.15,  # User type (education/clinical/research)
    'budget': 0.10,  # Price constraint
}
```

**Bonus scoring:**
- Special features: +0.1 max
- Opacity match: +0.05

## 📈 Optimization Process

The validator uses **grid search** to find optimal weights:

1. **Search Space**: Tests combinations of weights
   - Application: 0.30 - 0.50
   - Magnification: 0.15 - 0.25
   - Camera: 0.10 - 0.20
   - Persona: 0.10 - 0.20
   - Budget: 0.05 - 0.15

2. **Validation**: For each weight combination:
   - Runs all 100 test cases
   - Calculates accuracy
   - Tracks best performing weights

3. **Convergence**: Stops when accuracy plateaus or reaches 100%

## 📋 Validation Reports

### Type Accuracy
Measures if the quiz recommends the correct microscope type:
- Compound vs Stereo vs Inverted vs Digital

### Category Accuracy
Measures if the quiz recommends the correct tier:
- Education vs Clinical vs Research

### Confusion Matrix
Shows where mismatches occur:

```
Expected        Predicted       Count
compound        compound        45      ✓
compound        stereo          3       ✗
stereo          stereo          38      ✓
inverted        inverted        12      ✓
```

## 🔧 Customization

### Add More Test Cases

Edit `quiz_test_cases.csv`:

```csv
101,mycobacteria,transparent,clinical,yes,1000,1400,LED illumination,compound,clinical,TB testing
```

### Adjust Weight Ranges

Edit `quiz_validator.py`:

```python
application_range = [0.35, 0.40, 0.45]  # More focused search
```

### Change Optimization Strategy

The validator supports multiple strategies:

1. **Grid Search** (current) - Tests all combinations
2. **Random Search** - Samples random combinations
3. **Gradient Descent** - Iterative improvement

## 📊 Understanding Results

### Good Results (≥90% accuracy)

```
Type accuracy: 92.0% (92/100)
Category accuracy: 88.0% (88/100)
```

**Action**: Deploy weights to production

### Poor Results (<80% accuracy)

```
Type accuracy: 75.0% (75/100)
Category accuracy: 70.0% (70/100)
```

**Actions**:
1. Review confusion matrix - which types are confused?
2. Check test cases - are they realistic?
3. Review product metafields - are they accurate?
4. Adjust weight ranges
5. Add more test cases for problem areas

## 🧪 Manual Testing

After synthetic validation reaches ≥90%:

1. **Recruit 10-15 real users**:
   - Lab instructors
   - Clinicians
   - Students
   - Researchers

2. **Record their quiz results**:
   - Answers to each question
   - Recommended product
   - Did they agree with recommendation?
   - Which product did they actually choose/buy?

3. **Calculate real-world accuracy**:
   ```
   Accuracy = (Agreed recommendations) / (Total users)
   ```

## 🔄 Continuous Improvement

### Phase 1: Synthetic Testing (Current)
- 100 synthetic test cases
- Automated validation
- Weight optimization
- **Goal**: ≥90% synthetic accuracy

### Phase 2: Human QA
- 10-15 real users
- Manual validation
- **Goal**: ≥85% human agreement

### Phase 3: Production Logging
- Track real quiz completions
- Log recommendations vs purchases
- **Goal**: ≥80% purchase match rate

### Phase 4: Auto-Optimization (Future)
```javascript
// Weekly optimization based on real data
const realUserData = loadQuizCompletions();
const purchaseData = loadPurchases();

const accuracy = comparePredictionsToPurchases(
  realUserData,
  purchaseData
);

if (accuracy < 0.85) {
  const newWeights = optimizeWeights(realUserData, purchaseData);
  deployWeights(newWeights);
}
```

## 🎓 Example Workflow

```bash
# 1. Export latest products
node export_products.js

# 2. Run validation
python3 quiz_validator.py

# 3. Check results
cat optimized_validation_report.txt

# 4. If accuracy ≥ 90%, update quiz weights
cat optimized_weights.json

# 5. Copy weights to quiz component
# Update src/components/quiz/MicroscopeQuiz.tsx:
# const WEIGHTS = { ... }

# 6. Test in browser
npm run dev
# Visit http://localhost:3000/quiz

# 7. Deploy to production
git add .
git commit -m "Update quiz weights based on validation"
git push
```

## 📚 Advanced Topics

### A/B Testing

Test two weight configurations:

```python
# Control group
weights_a = {'application': 0.40, 'magnification': 0.20, ...}

# Test group
weights_b = {'application': 0.45, 'magnification': 0.18, ...}

# Split users 50/50 and compare conversion rates
```

### Reinforcement Learning

Treat the quiz as a recommendation system:

```python
# Reward = 1 if user purchases recommended product
# Reward = 0 if user purchases different product
# Reward = -1 if user doesn't purchase

# Update weights based on cumulative reward
```

### Multi-Objective Optimization

Optimize for multiple goals:

1. **Accuracy** - Correct recommendations
2. **Revenue** - Higher-value products
3. **Satisfaction** - User feedback scores
4. **Conversion** - Purchase rate

## 🐛 Troubleshooting

### Error: "Products file not found"

Run `node export_products.js` first to generate products_export.json

### Low Accuracy (<70%)

1. Check if test cases are realistic
2. Verify product metafields are populated
3. Review scoring algorithm logic
4. Expand weight search ranges

### High Variance (Accuracy fluctuates)

1. Add more test cases
2. Ensure test cases cover edge cases
3. Review for contradictory cases

## 📞 Support

For questions or issues with the validation system:

1. Check this README
2. Review validation reports
3. Check quiz_validator.py comments
4. Contact development team

## 🎯 Success Criteria

- [x] 100 synthetic test cases created
- [ ] Initial validation run (baseline accuracy)
- [ ] Optimization complete (≥90% synthetic accuracy)
- [ ] Weights deployed to production quiz
- [ ] 10+ real users tested (≥85% agreement)
- [ ] Production logging implemented
- [ ] Weekly auto-optimization running

## 📝 Next Steps

1. **Run the validation**: `python3 quiz_validator.py`
2. **Review results**: Check accuracy reports
3. **Update quiz**: Copy optimized weights to MicroscopeQuiz.tsx
4. **Test manually**: Complete quiz with known samples
5. **Deploy**: Push to production
6. **Monitor**: Track real user accuracy

---

**Last Updated**: 2025-01-23
**Version**: 1.0
**Maintainer**: Lab Essentials Development Team
