
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.reporting import generate_audit_report

async def verify_plotly_report():
    # Mock data
    audit_data = {
        "name": "Audit Test Plotly",
        "score": 75,
        "risk_level": "Medium",
        "status": "completed",
        "results": {
            "demographic_parity": 82.5,
            "equal_opportunity": 68.0,
            "disparate_impact": 72.1
        },
        "group_metrics": {
            "Sex": {
                "Male": {"selection_rate": 0.45},
                "Female": {"selection_rate": 0.32}
            }
        },
        "mitigation_recommendations": {
            "recommendations": [
                {
                    "name": "Reweighting",
                    "priority": "High",
                    "impact": "High",
                    "effort": "Low",
                    "description": "Adjust sample weights."
                }
            ]
        }
    }
    
    output_path = Path("test_plotly_report.pdf")
    print(f"Generating report to {output_path}...")
    
    try:
        generate_audit_report(audit_data, output_path)
        if output_path.exists():
            print(f"✅ Report generated successfully at {output_path}")
            print(f"File size: {output_path.stat().st_size} bytes")
        else:
            print("❌ Report file not found")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify_plotly_report())
