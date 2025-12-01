from services.reporting import generate_audit_report
from pathlib import Path
from datetime import datetime

def test_report_generation():
    print("Testing Report Generation...")
    
    # Dummy audit data
    audit_data = {
        "name": "Audit Test RH",
        "score": 85.5,
        "risk_level": "Low",
        "status": "completed",
        "results": {
            "gender": {
                "demographic_parity": {
                    "disparate_impact": 0.9,
                    "groups": {
                        "M": {"selection_rate": 0.5, "count": 100},
                        "F": {"selection_rate": 0.45, "count": 80}
                    }
                }
            }
        }
    }
    
    output_path = Path("test_report.pdf")
    
    try:
        generate_audit_report(audit_data, output_path)
        if output_path.exists():
            print(f"✅ Report generated successfully at {output_path.absolute()}")
        else:
            print("❌ Report file not found after generation")
            
    except Exception as e:
        print(f"❌ Error generating report: {e}")

if __name__ == "__main__":
    test_report_generation()
