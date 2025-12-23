
import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.fairness.ai_recommendations import AIRecommendationEngine
from services.fairness.service import EnhancedFairnessService

async def verify_richness():
    engine = AIRecommendationEngine()
    
    # Mock metrics
    metrics = {
        "overall_score": 55, # Under 60 (Critical)
        "sex_demographic_parity": 45  # Blatant bias
    }
    
    # 1. Test Fallback Richness
    print("Testing Fallback Recommendations...")
    recs = engine._fallback_recommendations(metrics)
    
    strategies = recs.get('mitigation_strategies', [])
    print(f"Found {len(strategies)} strategies.")
    
    required_fields = ['name', 'technique', 'description', 'impact', 'effort', 'priority']
    
    for i, s in enumerate(strategies):
        print(f"\nChecking Strategy {i+1}: {s.get('name')}")
        missing = [f for f in required_fields if f not in s]
        if missing:
            print(f"❌ Missing fields: {missing}")
        else:
            print(f"✅ All fields present: {list(s.keys())}")
            print(f"   Technique: {s['technique']}, Effort: {s['effort']}, Priority: {s['priority']}")

    # 2. Test Technique Diversity
    techniques = [s.get('technique') for s in strategies]
    if len(set(techniques)) >= 3:
        print("\n✅ Diverse techniques found (Pre/In/Post).")
    else:
        print(f"\n❌ Need more diverse techniques. Found: {techniques}")

if __name__ == "__main__":
    asyncio.run(verify_richness())
