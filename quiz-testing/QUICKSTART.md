# Quiz Validation - Quick Start 🚀

Get your quiz accuracy results in 2 minutes!

## Option 1: Automated Script (Recommended)

```bash
cd quiz-testing
./run_validation.sh
```

That's it! The script will:
1. ✓ Export products from Shopify
2. ✓ Run validation on 100 test cases
3. ✓ Optimize weights if accuracy < 90%
4. ✓ Show you the results

## Option 2: Manual Steps

### Step 1: Export Products
```bash
node export_products.js
```

### Step 2: Run Validation

**Python** (if installed):
```bash
python3 quiz_validator.py
```

**OR TypeScript** (if tsx installed):
```bash
npx tsx quiz_validator.ts
```

### Step 3: Check Results
```bash
cat initial_validation_report.txt
```

## Reading the Results

### Good Results ✅
```
Type accuracy: 92.0% (92/100)
Category accuracy: 88.0% (88/100)
```
**Action**: Your quiz is ready! No changes needed.

### Needs Improvement ⚠️
```
Type accuracy: 75.0% (75/100)
Category accuracy: 70.0% (70/100)
```
**Action**: Review the optimization results or check product metafields.

### After Optimization 🎯
```
Final Type Accuracy: 94.0%
Improvement: +19.0%
```
**Action**: Copy optimized weights to `MicroscopeQuiz.tsx`

## Applying Optimized Weights

If the validator creates `optimized_weights.json`:

1. **View the weights**:
```bash
cat optimized_weights.json
```

2. **Update your quiz**:
```typescript
// src/components/quiz/MicroscopeQuiz.tsx

const WEIGHTS = {
  application: 0.45,  // <-- Update these values
  magnification: 0.18,
  camera: 0.12,
  persona: 0.18,
  budget: 0.07,
};
```

3. **Test locally**:
```bash
npm run dev
# Visit http://localhost:3000/quiz
```

4. **Deploy**:
```bash
git add .
git commit -m "Update quiz weights (accuracy: 94%)"
git push
```

## Troubleshooting

### Error: "Products file not found"
```bash
# Run the export first
node export_products.js
```

### Error: "python3 not found"
```bash
# Use TypeScript version instead
npx tsx quiz_validator.ts
```

### Low Accuracy (<70%)
Possible causes:
1. **Empty metafields** - Check your Shopify products
2. **Bad test cases** - Review `quiz_test_cases.csv`
3. **Algorithm issue** - Contact development team

### No Improvement After Optimization
This means your initial weights were already optimal!

## What's Next?

After validation passes:

1. **Manual Testing** ✓
   - Complete quiz yourself with known samples
   - Verify recommendations make sense

2. **Deploy to Production** ✓
   - Push your changes
   - Start collecting real user data

3. **Monitor Performance** ✓
   - Check `/api/quiz/analytics` after 1 week
   - Look for view rate and purchase rate

4. **Iterate Weekly** ✓
   - Re-run validation with real user data
   - Update weights as needed

## Quick Reference

| Command | Purpose |
|---------|---------|
| `./run_validation.sh` | Full pipeline (recommended) |
| `node export_products.js` | Export products only |
| `python3 quiz_validator.py` | Run validator (Python) |
| `npx tsx quiz_validator.ts` | Run validator (TypeScript) |
| `cat optimized_weights.json` | View optimized weights |

## Success Criteria

- [x] Validation script runs without errors
- [x] Initial accuracy report generated
- [ ] Type accuracy ≥ 90%
- [ ] Weights updated in quiz component
- [ ] Manual testing completed
- [ ] Deployed to production
- [ ] Real user logging active

## Need Help?

1. Check `README.md` for detailed documentation
2. Review `IMPLEMENTATION_SUMMARY.md` for system overview
3. Look at validation reports for specific errors
4. Check product metafields in Shopify admin

---

**Time to complete**: ~2-5 minutes
**Difficulty**: Easy
**Prerequisites**: Node.js installed, Shopify access token set

**Let's validate your quiz!** 🎯
