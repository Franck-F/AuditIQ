"""
Enhanced Fairness Service - Main Orchestrator

Integrates all fairness modules:
- Comprehensive metrics calculation
- AI-powered recommendations
- Bias mitigation strategies
- Visualization generation
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models.dataset import Dataset, Audit
import json
import os
import asyncio

# Import our new fairness modules
from services.fairness.metrics import ComprehensiveFairnessCalculator, FairnessMetricsResult
from services.fairness.ai_recommendations import get_recommendation_engine
from services.fairness.mitigation import BiasMitigationEngine

# Scikit-learn
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression


class EnhancedFairnessService:
    """
    Main service for comprehensive fairness auditing
    """
    
    def __init__(self):
        self.ai_engine = get_recommendation_engine()
        self.mitigation_engine = BiasMitigationEngine()
    
    async def perform_comprehensive_audit(
        self,
        audit: Audit,
        dataset: Dataset,
        db: Session
    ) -> Dict[str, Any]:
        """
        Perform complete fairness audit with all enhancements
        
        Args:
            audit: Audit object
            dataset: Dataset object
            db: Database session
        
        Returns:
            Complete audit results
        """
        try:
            # Update status
            audit.status = "processing"
            db.commit()
            
            # 1. Load and prepare data
            df, y_true, y_pred, y_prob, sensitive_attrs = self._load_and_prepare_data(
                dataset, audit
            )
            
            if df is None:
                raise ValueError("Failed to load data")
            
            # 2. Calculate comprehensive metrics
            metrics_calculator = ComprehensiveFairnessCalculator(
                sensitive_features=audit.sensitive_attributes
            )
            
            metrics_result = metrics_calculator.calculate_all_metrics(
                y_true=y_true,
                y_pred=y_pred,
                y_prob=y_prob,
                sensitive_attrs=sensitive_attrs
            )
            
            # 3. Generate AI recommendations
            ai_recommendations = await self.ai_engine.generate_bias_recommendations(
                metrics_results=metrics_result.fairness_scores,
                sensitive_attributes=audit.sensitive_attributes,
                context={
                    "domain": audit.domain if hasattr(audit, 'domain') else "General",
                    "use_case": "Classification",
                    "regulations": ["AI Act", "RGPD"]
                }
            )
            
            # 4. Get mitigation strategy recommendations
            mitigation_recommendations = self.mitigation_engine.get_strategy_recommendations(
                fairness_metrics=metrics_result.fairness_scores,
                context={"data_size": len(df)}
            )
            
            # 5. Compile complete results
            complete_results = {
                "overall_metrics": metrics_result.overall_metrics,
                "fairness_scores": metrics_result.fairness_scores,
                "disaggregated_metrics": metrics_result.disaggregated_metrics,
                "group_metrics": metrics_result.group_metrics,
                "risk_assessment": metrics_result.risk_assessment,
                "basic_recommendations": metrics_result.recommendations,
                "ai_recommendations": ai_recommendations,
                "mitigation_strategies": mitigation_recommendations,
                "audit_metadata": {
                    "total_samples": len(df),
                    "sensitive_attributes": audit.sensitive_attributes,
                    "target_column": audit.target_column,
                    "timestamp": pd.Timestamp.now().isoformat()
                }
            }
            
            # 6. Update audit object
            audit.metrics_results = metrics_result.fairness_scores
            audit.overall_score = self._calculate_overall_score(metrics_result)
            audit.risk_level = metrics_result.risk_assessment["risk_level"]
            audit.status = "completed"
            
            # Store detailed results in new fields
            if hasattr(audit, 'detailed_metrics'):
                audit.detailed_metrics = complete_results
            if hasattr(audit, 'ai_recommendations'):
                audit.ai_recommendations = ai_recommendations
            if hasattr(audit, 'mitigation_recommendations'):
                audit.mitigation_recommendations = mitigation_recommendations
            
            db.commit()
            
            return complete_results
            
        except Exception as e:
            print(f"Error in comprehensive audit: {e}")
            import traceback
            traceback.print_exc()
            
            audit.status = "failed"
            audit.error_message = str(e)
            db.commit()
            
            raise e
    
    def _load_and_prepare_data(
        self,
        dataset: Dataset,
        audit: Audit
    ) -> tuple:
        """
        Load dataset and prepare for analysis
        
        Returns:
            (df, y_true, y_pred, y_prob, sensitive_attrs)
        """
        try:
            # Load dataset
            file_path = dataset.filename
            
            if not os.path.exists(file_path):
                potential_path = f"uploads/{file_path}"
                if os.path.exists(potential_path):
                    file_path = potential_path
            
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return None, None, None, None, None
            
            df = pd.read_csv(file_path)
            
            # Extract target column
            if audit.target_column not in df.columns:
                raise ValueError(f"Target column '{audit.target_column}' not found")
            
            y_true = df[audit.target_column].values
            
            # Check if predictions exist
            prediction_col = audit.prediction_column if hasattr(audit, 'prediction_column') else None
            
            if prediction_col and prediction_col in df.columns:
                y_pred = df[prediction_col].values
                
                # Check for probability column
                prob_col = audit.probability_column if hasattr(audit, 'probability_column') else None
                if prob_col and prob_col in df.columns:
                    y_prob = df[prob_col].values
                else:
                    y_prob = None
            else:
                # Train a simple model if no predictions provided
                print("No predictions found, training baseline model...")
                y_pred, y_prob = self._train_baseline_model(df, audit)
            
            # Extract sensitive attributes
            sensitive_attrs = df[audit.sensitive_attributes].copy()
            
            return df, y_true, y_pred, y_prob, sensitive_attrs
            
        except Exception as e:
            print(f"Error loading data: {e}")
            return None, None, None, None, None
    
    def _train_baseline_model(
        self,
        df: pd.DataFrame,
        audit: Audit
    ) -> tuple:
        """Train a baseline model if predictions not provided"""
        
        try:
            # Prepare features (exclude target and sensitive attributes)
            exclude_cols = [audit.target_column] + audit.sensitive_attributes
            feature_cols = [col for col in df.columns if col not in exclude_cols]
            
            X = df[feature_cols].select_dtypes(include=[np.number]).fillna(0)
            y = df[audit.target_column].values
            
            # Train simple logistic regression
            model = LogisticRegression(max_iter=1000, random_state=42)
            model.fit(X, y)
            
            y_pred = model.predict(X)
            y_prob = model.predict_proba(X)[:, 1] if hasattr(model, 'predict_proba') else None
            
            return y_pred, y_prob
            
        except Exception as e:
            print(f"Error training baseline model: {e}")
            # Return dummy predictions
            return np.zeros(len(df)), None
    
    def _calculate_overall_score(self, metrics_result: FairnessMetricsResult) -> float:
        """
        Calculate overall fairness score (0-100)
        
        Higher is better. Combines multiple fairness metrics.
        """
        risk_score = metrics_result.risk_assessment.get("risk_score", 2)
        
        # Convert risk score (1-4) to fairness score (100-0)
        # Risk 1 (Low) = Score 90-100
        # Risk 2 (Medium) = Score 70-89
        # Risk 3 (High) = Score 40-69
        # Risk 4 (Critical) = Score 0-39
        
        score_mapping = {
            1: 95,   # Low risk
            2: 80,   # Medium risk
            3: 55,   # High risk
            4: 25    # Critical risk
        }
        
        base_score = score_mapping.get(risk_score, 50)
        
        # Adjust based on number of violations
        violations = metrics_result.risk_assessment.get("total_violations", 0)
        penalty = min(violations * 5, 30)  # Max 30 point penalty
        
        final_score = max(0, base_score - penalty)
        
        return float(final_score)
    
    async def apply_mitigation_strategy(
        self,
        audit: Audit,
        dataset: Dataset,
        strategy_name: str,
        strategy_params: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        """
        Apply a specific mitigation strategy
        
        Args:
            audit: Audit object
            dataset: Dataset object
            strategy_name: Name of mitigation strategy
            strategy_params: Parameters for the strategy
            db: Database session
        
        Returns:
            Mitigation results with before/after comparison
        """
        try:
            # Load data
            df, y_true, y_pred, y_prob, sensitive_attrs = self._load_and_prepare_data(
                dataset, audit
            )
            
            if df is None:
                raise ValueError("Failed to load data")
            
            # Prepare features
            exclude_cols = [audit.target_column] + audit.sensitive_attributes
            if hasattr(audit, 'prediction_column') and audit.prediction_column:
                exclude_cols.append(audit.prediction_column)
            
            feature_cols = [col for col in df.columns if col not in exclude_cols]
            X = df[feature_cols].select_dtypes(include=[np.number]).fillna(0)
            
            # Split data
            X_train, X_test, y_train, y_test, sens_train, sens_test = train_test_split(
                X, y_true, sensitive_attrs, test_size=0.3, random_state=42
            )
            
            # Calculate metrics before mitigation
            calc_before = ComprehensiveFairnessCalculator(audit.sensitive_attributes)
            metrics_before = calc_before.calculate_all_metrics(
                y_true=y_test,
                y_pred=y_pred[X_test.index] if len(y_pred) == len(df) else y_pred[:len(y_test)],
                y_prob=None,
                sensitive_attrs=sens_test
            )
            
            # Apply mitigation strategy
            if strategy_name == "threshold_optimizer":
                # Train baseline model
                base_model = LogisticRegression(max_iter=1000)
                base_model.fit(X_train, y_train)
                
                mitigated_model, info = self.mitigation_engine.apply_threshold_optimizer(
                    base_model=base_model,
                    X_train=X_train,
                    y_train=y_train,
                    sensitive_features_train=sens_train,
                    constraint=strategy_params.get("constraint", "demographic_parity")
                )
                
                # Get predictions
                y_pred_mitigated = mitigated_model.predict(X_test)
                
            elif strategy_name == "exponentiated_gradient":
                mitigated_model, info = self.mitigation_engine.apply_exponentiated_gradient(
                    X_train=X_train,
                    y_train=y_train,
                    sensitive_features_train=sens_train,
                    constraint=strategy_params.get("constraint", "demographic_parity")
                )
                
                y_pred_mitigated = mitigated_model.predict(X_test)
                
            elif strategy_name == "correlation_remover":
                X_train_transformed, transformer = self.mitigation_engine.apply_correlation_remover(
                    X=X_train,
                    sensitive_features=sens_train,
                    alpha=strategy_params.get("alpha", 1.0)
                )
                
                # Train model on transformed features
                model = LogisticRegression(max_iter=1000)
                model.fit(X_train_transformed, y_train)
                
                # Transform test data and predict
                X_test_transformed = transformer.transform(X_test)
                y_pred_mitigated = model.predict(X_test_transformed)
                
                mitigated_model = (transformer, model)
                info = {"method": "correlation_remover"}
                
            else:
                raise ValueError(f"Unknown strategy: {strategy_name}")
            
            # Calculate metrics after mitigation
            calc_after = ComprehensiveFairnessCalculator(audit.sensitive_attributes)
            metrics_after = calc_after.calculate_all_metrics(
                y_true=y_test,
                y_pred=y_pred_mitigated,
                y_prob=None,
                sensitive_attrs=sens_test
            )
            
            # Compare results
            improvement = self._calculate_improvement(
                metrics_before.fairness_scores,
                metrics_after.fairness_scores
            )
            
            results = {
                "strategy_name": strategy_name,
                "strategy_params": strategy_params,
                "metrics_before": metrics_before.fairness_scores,
                "metrics_after": metrics_after.fairness_scores,
                "performance_before": metrics_before.overall_metrics,
                "performance_after": metrics_after.overall_metrics,
                "improvement": improvement,
                "mitigation_info": info,
                "recommendation": self._get_mitigation_recommendation(improvement)
            }
            
            # Store results
            if hasattr(audit, 'mitigation_results'):
                if audit.mitigation_results is None:
                    audit.mitigation_results = {}
                audit.mitigation_results[strategy_name] = results
                db.commit()
            
            return results
            
        except Exception as e:
            print(f"Error applying mitigation: {e}")
            import traceback
            traceback.print_exc()
            raise e
    
    def _calculate_improvement(
        self,
        before: Dict[str, float],
        after: Dict[str, float]
    ) -> Dict[str, Any]:
        """Calculate improvement metrics"""
        
        improvements = {}
        
        for key in before.keys():
            if key in after:
                before_val = abs(before[key])
                after_val = abs(after[key])
                
                if before_val > 0:
                    pct_improvement = ((before_val - after_val) / before_val) * 100
                else:
                    pct_improvement = 0
                
                improvements[key] = {
                    "before": before_val,
                    "after": after_val,
                    "absolute_improvement": before_val - after_val,
                    "percentage_improvement": pct_improvement,
                    "improved": after_val < before_val
                }
        
        # Overall assessment
        improved_count = sum(1 for v in improvements.values() if v.get("improved", False))
        total_count = len(improvements)
        
        return {
            "detailed": improvements,
            "summary": {
                "metrics_improved": improved_count,
                "total_metrics": total_count,
                "improvement_rate": (improved_count / total_count * 100) if total_count > 0 else 0
            }
        }
    
    def _get_mitigation_recommendation(self, improvement: Dict[str, Any]) -> str:
        """Generate recommendation based on improvement"""
        
        rate = improvement["summary"]["improvement_rate"]
        
        if rate >= 70:
            return "✅ Excellent improvement! Recommend deploying this mitigation strategy."
        elif rate >= 50:
            return "👍 Good improvement. Consider deploying with monitoring."
        elif rate >= 30:
            return "⚠️ Moderate improvement. May need additional strategies."
        else:
            return "❌ Limited improvement. Try alternative mitigation strategies."


# Legacy function for backward compatibility
def calculate_fairness(audit: Audit, dataset: Dataset, db: Session):
    """
    Legacy function - now uses enhanced service
    """
    service = EnhancedFairnessService()
    
    # Run async function in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(
            service.perform_comprehensive_audit(audit, dataset, db)
        )
        return result
    finally:
        loop.close()
