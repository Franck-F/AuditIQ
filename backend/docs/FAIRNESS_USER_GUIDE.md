# Fairness Audit - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Running a Fairness Audit](#running-a-fairness-audit)
4. [Understanding Metrics](#understanding-metrics)
5. [AI Recommendations](#ai-recommendations)
6. [Mitigation Strategies](#mitigation-strategies)
7. [Advanced Analysis](#advanced-analysis)
8. [What-If Tool](#what-if-tool)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

The Fairness Audit module helps you identify and mitigate bias in your AI models. It provides:

- **Comprehensive Metrics**: 15+ fairness metrics from Fairlearn
- **AI-Powered Recommendations**: Gemini-generated mitigation strategies
- **Interactive Tools**: What-If analysis and counterfactual generation
- **Compliance Support**: AI Act and GDPR compliance assessment

---

## Getting Started

### Prerequisites
- Dataset with predictions or a trained model
- Identified sensitive attributes (e.g., gender, race, age)
- Target column (what your model predicts)

### Quick Start

1. **Upload Your Dataset**
   - Navigate to Dashboard → Upload
   - Select your CSV file
   - Ensure it contains: features, target column, and sensitive attributes

2. **Create an Audit**
   - Click "New Audit"
   - Select your dataset
   - Choose target column
   - Select sensitive attributes
   - Click "Run Audit"

3. **View Results**
   - Navigate to the Enhanced Fairness Dashboard
   - Explore metrics, recommendations, and visualizations

---

## Running a Fairness Audit

### Step 1: Configure Audit

```
Audit Name: "Loan Approval Model - Q4 2024"
Target Column: "approved"
Sensitive Attributes: ["gender", "race", "age_group"]
Use Case: "Credit Scoring"
```

### Step 2: Run Analysis

The system will:
1. Calculate 15+ fairness metrics
2. Generate AI recommendations
3. Identify vulnerable subgroups
4. Assess compliance status

### Step 3: Review Results

Navigate through 4 tabs:
- **Metrics**: Detailed fairness scores
- **AI Recommendations**: Mitigation strategies
- **Groups**: Performance comparison
- **Mitigation**: Apply bias reduction techniques

---

## Understanding Metrics

### Demographic Parity
**What it measures**: Equal positive prediction rates across groups

**Interpretation**:
- **Value close to 0**: Fair (equal rates)
- **Value > 0.1**: Concerning disparity
- **Value > 0.2**: Critical violation

**Example**:
```
Demographic Parity Difference: 0.15
Meaning: 15% difference in approval rates between groups
Action: Apply mitigation strategies
```

### Equalized Odds
**What it measures**: Equal true positive and false positive rates

**Interpretation**:
- **Value < 0.05**: Excellent
- **Value 0.05-0.15**: Acceptable
- **Value > 0.15**: Requires action

### Equal Opportunity
**What it measures**: Equal true positive rates (recall)

**Use case**: When false negatives are costly (e.g., medical diagnosis)

---

## AI Recommendations

### Severity Levels

**Critical** 🔴
- Immediate action required
- Model deployment should be halted
- Legal/compliance risk

**High** 🟠
- Significant bias detected
- Mitigation needed before production
- Monitor closely

**Medium** 🟡
- Notable disparities
- Plan mitigation strategies
- Acceptable for non-critical applications

**Low** 🟢
- Minor issues or no bias
- Continue monitoring
- Document findings

### Reading Recommendations

Each recommendation includes:

1. **Root Cause**: Why bias exists
2. **Mitigation Strategy**: How to fix it
3. **Expected Impact**: Improvement estimate
4. **Implementation Time**: Effort required
5. **Complexity**: Technical difficulty

**Example**:
```
Strategy: Threshold Optimizer
Type: Post-processing
Expected Impact: 20-40% reduction in disparity
Complexity: Low
Timeline: < 1 day
Steps:
  1. Train baseline model
  2. Apply threshold optimization
  3. Validate on test set
```

---

## Mitigation Strategies

### 1. Preprocessing

**Correlation Remover**
- **When to use**: Features correlated with sensitive attributes
- **How it works**: Removes statistical correlation
- **Pros**: Simple, fast
- **Cons**: May reduce model performance

**Reweighting**
- **When to use**: Imbalanced group representation
- **How it works**: Adjusts sample weights
- **Pros**: Easy to implement
- **Cons**: Requires sufficient data per group

### 2. In-Processing

**Exponentiated Gradient**
- **When to use**: Training new models
- **How it works**: Adds fairness constraints during training
- **Pros**: Strong fairness guarantees
- **Cons**: Slower training

**Grid Search**
- **When to use**: Finding optimal fairness-performance balance
- **How it works**: Searches parameter space
- **Pros**: Finds Pareto optimal solutions
- **Cons**: Computationally expensive

### 3. Post-Processing

**Threshold Optimizer**
- **When to use**: Quick fix for existing models
- **How it works**: Adjusts decision thresholds per group
- **Pros**: Fast, no retraining needed
- **Cons**: May not address root causes

### Applying Mitigation

1. Go to **Mitigation** tab
2. Select strategy
3. Configure parameters
4. Click "Apply Strategy"
5. Review before/after comparison
6. Accept or try another strategy

---

## Advanced Analysis

### Intersectional Analysis

Analyzes fairness across **combinations** of attributes.

**Example**:
- Not just "gender" or "race"
- But "Black women", "Asian men", etc.

**How to use**:
1. Navigate to Advanced Analysis
2. Select "Intersectional Analysis"
3. Set max combination size (2-3 recommended)
4. Review vulnerable subgroups

**Interpreting Results**:
- **Worst Subgroups**: Groups with lowest performance
- **Disparity Matrix**: Performance gaps
- **Vulnerability Score**: Combined risk metric

### Subgroup Discovery

Automatically identifies groups needing protection.

**Metrics**:
- **Vulnerability Score**: Higher = more vulnerable
- **Size**: Group representation
- **Performance**: Accuracy, precision, recall

**Actions**:
- Focus data collection on underrepresented groups
- Apply targeted interventions
- Monitor closely in production

### Trend Analysis

Compare fairness over time.

**Use cases**:
- Track improvement after mitigation
- Detect fairness degradation
- Validate model updates

**How to use**:
1. Run multiple audits over time
2. Select "Trend Analysis"
3. Choose historical audits to compare
4. Review trend direction

### Model Comparison

Compare multiple models on fairness-performance tradeoff.

**Pareto Frontier**:
- Models where no other model is better in both fairness AND performance
- Optimal choices for deployment

**How to use**:
1. Run audits for each model
2. Select "Model Comparison"
3. Choose audits to compare
4. Identify Pareto optimal models

---

## What-If Tool

Interactive exploration of model predictions.

### Counterfactual Generation

**What it does**: Finds minimal changes to flip prediction

**Example**:
```
Original: Loan Denied (80% confidence)
Counterfactual: Loan Approved (65% confidence)
Changes: 
  - Income: $45k → $52k
  - Credit Score: 680 → 720
```

**How to use**:
1. Select instance to explore
2. Choose desired outcome
3. Click "Generate Counterfactual"
4. Review minimal changes needed

**Use cases**:
- Explain rejections to applicants
- Identify actionable improvements
- Validate model logic

### Feature Importance

**Methods**:
- **SHAP**: Most accurate, slower
- **Coefficients**: Fast, linear models only
- **Permutation**: Model-agnostic

**Interpreting Results**:
- Higher values = more important
- Top 5-10 features drive most predictions
- Use to focus mitigation efforts

### Interactive Exploration

**Sensitivity Analysis**:
- See how predictions change as features vary
- Identify critical thresholds
- Understand model behavior

**How to use**:
1. Select instance
2. Click "Explore Prediction"
3. Review sensitivity for each feature
4. Identify most influential features

---

## Best Practices

### 1. Data Preparation
✅ Clean and validate data
✅ Ensure sufficient samples per group (min 30)
✅ Document data collection process
✅ Check for proxy variables

### 2. Audit Configuration
✅ Select all relevant sensitive attributes
✅ Choose appropriate use case
✅ Document business context
✅ Set realistic fairness goals

### 3. Interpretation
✅ Consider multiple metrics
✅ Understand business impact
✅ Consult domain experts
✅ Document decisions

### 4. Mitigation
✅ Start with simple strategies
✅ Validate on held-out data
✅ Monitor in production
✅ Iterate and improve

### 5. Compliance
✅ Document all audits
✅ Keep audit trail
✅ Review regularly (quarterly)
✅ Update as regulations evolve

---

## Troubleshooting

### "Detailed metrics not available"
**Cause**: Audit not completed
**Solution**: Wait for audit to finish or re-run

### "SHAP calculation failed"
**Cause**: Dataset too large or model incompatible
**Solution**: Use smaller sample size or try 'coefficients' method

### "No counterfactual found"
**Cause**: Instance already has desired outcome or constraints too strict
**Solution**: Try different instance or relax max_changes parameter

### "High disparity detected but mitigation doesn't help"
**Cause**: Bias in data, not model
**Solution**: Review data collection process, consider resampling

### "AI recommendations unavailable"
**Cause**: Gemini API not configured
**Solution**: Set GEMINI_API_KEY environment variable or use basic recommendations

---

## Support

For additional help:
- **Documentation**: `/docs` in the application
- **API Reference**: `/api/docs` (Swagger)
- **GitHub Issues**: Report bugs and request features
- **Email**: support@auditiq.com

---

**Last Updated**: December 2024
**Version**: 1.0.0
