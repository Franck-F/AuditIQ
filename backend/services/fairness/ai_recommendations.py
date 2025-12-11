"""
AI-Powered Fairness Recommendations Engine

This module uses Google Gemini AI to generate:
- Bias mitigation recommendations
- Fairness improvement strategies
- Contextual explanations of metrics
- Action plans for compliance
"""

import os
from typing import Dict, List, Any, Optional
import json

# Try importing Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ Google Generative AI not found. AI recommendations will be limited.")


class AIRecommendationEngine:
    """Generate AI-powered fairness recommendations"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if GEMINI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
    
    async def generate_bias_recommendations(
        self,
        metrics_results: Dict[str, Any],
        sensitive_attributes: List[str],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive bias mitigation recommendations
        
        Args:
            metrics_results: Calculated fairness metrics
            sensitive_attributes: List of sensitive attributes analyzed
            context: Additional context (domain, use case, etc.)
        
        Returns:
            Dictionary with recommendations, severity, and action plans
        """
        if not self.model:
            return self._fallback_recommendations(metrics_results)
        
        # Prepare prompt for Gemini
        prompt = self._build_recommendation_prompt(
            metrics_results, 
            sensitive_attributes, 
            context
        )
        
        try:
            response = self.model.generate_content(prompt)
            recommendations = self._parse_ai_response(response.text)
            return recommendations
        except Exception as e:
            print(f"Error generating AI recommendations: {e}")
            return self._fallback_recommendations(metrics_results)
    
    def _build_recommendation_prompt(
        self,
        metrics: Dict[str, Any],
        attributes: List[str],
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Build detailed prompt for Gemini"""
        
        context_str = ""
        if context:
            context_str = f"""
**Context:**
- Domain: {context.get('domain', 'General')}
- Use Case: {context.get('use_case', 'Classification')}
- Regulations: {context.get('regulations', ['AI Act', 'GDPR'])}
"""
        
        prompt = f"""You are an expert in AI fairness and bias mitigation. Analyze the following fairness audit results and provide comprehensive, actionable recommendations.

**Fairness Metrics Results:**
```json
{json.dumps(metrics, indent=2)}
```

**Sensitive Attributes Analyzed:**
{', '.join(attributes)}

{context_str}

**Please provide:**

1. **Severity Assessment** (Critical/High/Medium/Low)
   - Overall bias severity
   - Most problematic metrics
   - Groups most affected

2. **Root Cause Analysis**
   - Likely sources of bias
   - Data quality issues
   - Model architecture concerns

3. **Mitigation Strategies** (Prioritized)
   For each strategy, specify:
   - Strategy name
   - Implementation approach (preprocessing/in-processing/post-processing)
   - Expected impact
   - Implementation complexity (Low/Medium/High)
   - Estimated timeline

4. **Immediate Actions** (Top 3)
   - Quick wins that can be implemented immediately
   - Specific steps for each action

5. **Long-term Improvements**
   - Systemic changes needed
   - Process improvements
   - Monitoring recommendations

6. **Compliance Considerations**
   - AI Act compliance status
   - GDPR considerations
   - Documentation requirements

7. **Metrics Explanation**
   - Plain language explanation of each metric
   - Why certain metrics are concerning
   - Target values for compliance

Format your response as structured JSON with the following schema:
{{
  "severity": "Critical|High|Medium|Low",
  "overall_assessment": "Brief summary",
  "problematic_metrics": ["metric1", "metric2"],
  "affected_groups": ["group1", "group2"],
  "root_causes": [
    {{"cause": "...", "likelihood": "High|Medium|Low", "description": "..."}}
  ],
  "mitigation_strategies": [
    {{
      "name": "...",
      "type": "preprocessing|inprocessing|postprocessing",
      "description": "...",
      "expected_impact": "...",
      "complexity": "Low|Medium|High",
      "timeline": "...",
      "steps": ["step1", "step2"]
    }}
  ],
  "immediate_actions": [
    {{"action": "...", "steps": ["..."], "impact": "..."}}
  ],
  "long_term_improvements": [
    {{"improvement": "...", "rationale": "...", "timeline": "..."}}
  ],
  "compliance": {{
    "ai_act_status": "Compliant|Non-Compliant|Needs Review",
    "gdpr_status": "Compliant|Non-Compliant|Needs Review",
    "required_documentation": ["doc1", "doc2"]
  }},
  "metrics_explanations": {{
    "metric_name": {{"value": 0.x, "interpretation": "...", "target": "...", "status": "Good|Warning|Critical"}}
  }}
}}
"""
        return prompt
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemini response into structured format"""
        try:
            # Try to extract JSON from response
            # Gemini sometimes wraps JSON in markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
            else:
                json_str = response_text.strip()
            
            recommendations = json.loads(json_str)
            return recommendations
        except json.JSONDecodeError:
            # Fallback: return raw text
            return {
                "severity": "Unknown",
                "overall_assessment": response_text,
                "raw_response": response_text
            }
    
    def _fallback_recommendations(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback recommendations when AI is not available"""
        
        # Simple rule-based recommendations
        severity = "Low"
        problematic_metrics = []
        
        for metric_name, metric_data in metrics.items():
            if isinstance(metric_data, dict):
                for attr, values in metric_data.items():
                    if isinstance(values, dict):
                        # Check demographic parity
                        if 'demographic_parity' in values:
                            if abs(values['demographic_parity']) > 0.2:
                                severity = "High"
                                problematic_metrics.append(f"{metric_name}_{attr}_demographic_parity")
                        
                        # Check equal opportunity
                        if 'equal_opportunity' in values:
                            if abs(values['equal_opportunity']) > 0.15:
                                if severity != "High":
                                    severity = "Medium"
                                problematic_metrics.append(f"{metric_name}_{attr}_equal_opportunity")
        
        return {
            "severity": severity,
            "overall_assessment": f"Automated analysis detected {len(problematic_metrics)} potential fairness issues.",
            "problematic_metrics": problematic_metrics,
            "mitigation_strategies": [
                {
                    "name": "Reweighting",
                    "type": "preprocessing",
                    "description": "Adjust sample weights to balance representation across groups",
                    "complexity": "Low",
                    "timeline": "1-2 days"
                },
                {
                    "name": "Threshold Optimization",
                    "type": "postprocessing",
                    "description": "Optimize decision thresholds per group to achieve fairness",
                    "complexity": "Medium",
                    "timeline": "3-5 days"
                }
            ],
            "immediate_actions": [
                {
                    "action": "Review data collection process",
                    "steps": [
                        "Check for sampling bias",
                        "Verify data quality across groups",
                        "Identify underrepresented groups"
                    ]
                }
            ],
            "note": "AI recommendations unavailable. Using rule-based fallback."
        }
    
    async def explain_metric(self, metric_name: str, value: float, context: str = "") -> str:
        """Generate plain-language explanation of a metric"""
        
        if not self.model:
            return self._fallback_metric_explanation(metric_name, value)
        
        prompt = f"""Explain the fairness metric "{metric_name}" with value {value} in simple terms.

Context: {context}

Provide:
1. What this metric measures
2. How to interpret the value {value}
3. Whether this value is concerning (and why)
4. What actions should be taken

Keep the explanation concise (2-3 sentences) and accessible to non-technical stakeholders."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return self._fallback_metric_explanation(metric_name, value)
    
    def _fallback_metric_explanation(self, metric_name: str, value: float) -> str:
        """Fallback metric explanations"""
        
        explanations = {
            "demographic_parity_difference": f"Demographic Parity Difference of {value:.3f} measures the difference in positive prediction rates between groups. Values close to 0 are ideal. Your value of {value:.3f} {'is concerning and indicates bias' if abs(value) > 0.1 else 'is acceptable'}.",
            
            "equal_opportunity_difference": f"Equal Opportunity Difference of {value:.3f} measures fairness in true positive rates. Values close to 0 indicate equal opportunity. Your value {'suggests unfair treatment' if abs(value) > 0.1 else 'is within acceptable range'}.",
            
            "equalized_odds_difference": f"Equalized Odds Difference of {value:.3f} measures fairness across both true positive and false positive rates. Lower values are better. {'Immediate action recommended' if abs(value) > 0.15 else 'Monitor this metric'}."
        }
        
        return explanations.get(
            metric_name,
            f"{metric_name}: {value:.3f}. Please consult fairness documentation for interpretation."
        )


# Singleton instance
_recommendation_engine = None

def get_recommendation_engine() -> AIRecommendationEngine:
    """Get singleton recommendation engine instance"""
    global _recommendation_engine
    if _recommendation_engine is None:
        _recommendation_engine = AIRecommendationEngine()
    return _recommendation_engine
