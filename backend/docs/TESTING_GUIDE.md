# Testing Guide

## Running Tests

### Install Test Dependencies
```bash
pip install -r requirements-test.txt
```

### Run All Tests
```bash
pytest
```

### Run Specific Test Files
```bash
# Metrics tests
pytest tests/test_fairness_metrics.py -v

# What-If tests
pytest tests/test_whatif.py -v

# API integration tests
pytest tests/test_api_integration.py -v
```

### Run with Coverage
```bash
pytest --cov=services --cov=routers --cov-report=html
```

View coverage report: `open htmlcov/index.html`

### Run Specific Tests
```bash
# Run single test
pytest tests/test_fairness_metrics.py::TestComprehensiveFairnessCalculator::test_calculate_all_metrics -v

# Run tests matching pattern
pytest -k "counterfactual" -v
```

## Test Structure

```
backend/tests/
├── test_fairness_metrics.py    # Unit tests for metrics
├── test_whatif.py               # Unit tests for What-If
├── test_api_integration.py      # Integration tests for API
└── conftest.py                  # Shared fixtures (if needed)
```

## Writing Tests

### Unit Test Example
```python
def test_metric_calculation():
    calculator = ComprehensiveFairnessCalculator(['gender'])
    result = calculator.calculate_all_metrics(y_true, y_pred, y_prob, sensitive_attrs)
    assert 'accuracy' in result.overall_metrics
    assert 0 <= result.overall_metrics['accuracy'] <= 1
```

### Integration Test Example
```python
def test_api_endpoint(client, auth_headers):
    response = client.get("/api/audits/enhanced/1/metrics/detailed", headers=auth_headers)
    assert response.status_code == 200
    assert "overall_metrics" in response.json()
```

## Continuous Integration

### GitHub Actions
Create `.github/workflows/tests.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt -r requirements-test.txt
      - run: pytest --cov
```

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All API endpoints
- **Critical Paths**: 100% coverage for fairness calculations

## Troubleshooting Tests

### Tests Fail with Import Errors
```bash
# Ensure backend is in PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
```

### Database Errors
```bash
# Tests use SQLite by default
# Ensure test.db is writable
chmod 666 test.db
```

### Slow Tests
```bash
# Run only fast tests
pytest -m "not slow"

# Skip integration tests
pytest tests/test_fairness_metrics.py tests/test_whatif.py
```
