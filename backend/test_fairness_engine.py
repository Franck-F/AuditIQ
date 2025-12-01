import asyncio
import pandas as pd
from services.fairness import calculate_fairness_metrics

def test_fairness_logic():
    print("Testing Fairness Logic...")
    
    # Create dummy data
    data = {
        "gender": ["M", "M", "F", "F", "M", "F", "M", "F"],
        "hired":  [1,   1,   0,   1,   1,   0,   0,   0]
    }
    df = pd.DataFrame(data)
    
    config = {
        "target_column": "hired",
        "sensitive_attributes": ["gender"],
        "fairness_metrics": ["demographic_parity"]
    }
    
    results = calculate_fairness_metrics(df, config)
    print("Results:", results)
    
    # Check expected values
    # M: 3/4 = 0.75
    # F: 1/4 = 0.25
    # Disparate Impact: 0.25 / 0.75 = 0.33
    
    details = results["details"]["gender"]["demographic_parity"]
    assert details["groups"]["M"]["selection_rate"] == 0.75
    assert details["groups"]["F"]["selection_rate"] == 0.25
    assert abs(details["disparate_impact"] - 0.333) < 0.01
    
    print("✅ Fairness Logic Test Passed!")

if __name__ == "__main__":
    test_fairness_logic()
