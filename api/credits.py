from decimal import Decimal
from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session
from database import CreditsLedger, Org, Job
from sqlalchemy import func

class CreditsManager:
    """Manages credit transactions and balances"""
    
    @staticmethod
    def get_balance(org_id: str, db: Session) -> Decimal:
        """Get current credit balance for an organization"""
        result = db.query(func.sum(CreditsLedger.delta)).filter(
            CreditsLedger.org_id == org_id
        ).scalar()
        
        return result or Decimal("0")
    
    @staticmethod
    def get_usage_this_month(org_id: str, db: Session) -> Decimal:
        """Get credit usage for current month"""
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        result = db.query(func.sum(CreditsLedger.delta)).filter(
            CreditsLedger.org_id == org_id,
            CreditsLedger.delta < 0,  # Only debits
            CreditsLedger.created_at >= start_of_month
        ).scalar()
        
        usage = result or Decimal("0")
        return abs(usage)  # Return as positive number
    
    @staticmethod
    def add_credits(org_id: str, amount: Decimal, reason: str, 
                   stripe_tx_id: str = None, db: Session = None) -> bool:
        """Add credits to an organization"""
        try:
            credit_entry = CreditsLedger(
                org_id=org_id,
                delta=amount,
                reason=reason,
                stripe_tx_id=stripe_tx_id
            )
            db.add(credit_entry)
            db.commit()
            return True
        except Exception as e:
            print(f"Failed to add credits: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def debit_credits(org_id: str, amount: Decimal, reason: str,
                     job_id: str = None, db: Session = None) -> bool:
        """Debit credits from an organization"""
        try:
            # Check if sufficient balance
            current_balance = CreditsManager.get_balance(org_id, db)
            if current_balance < amount:
                return False
            
            debit_entry = CreditsLedger(
                org_id=org_id,
                delta=-amount,  # Negative for debit
                reason=reason,
                job_id=job_id
            )
            db.add(debit_entry)
            db.commit()
            return True
        except Exception as e:
            print(f"Failed to debit credits: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def get_transaction_history(org_id: str, limit: int = 50, 
                               db: Session = None) -> List[Dict]:
        """Get transaction history for an organization"""
        transactions = db.query(CreditsLedger).filter(
            CreditsLedger.org_id == org_id
        ).order_by(CreditsLedger.created_at.desc()).limit(limit).all()
        
        history = []
        for tx in transactions:
            history.append({
                "id": str(tx.id),
                "amount": float(tx.delta),
                "reason": tx.reason,
                "job_id": str(tx.job_id) if tx.job_id else None,
                "stripe_tx_id": tx.stripe_tx_id,
                "created_at": tx.created_at.isoformat()
            })
        
        return history
    
    @staticmethod
    def estimate_job_cost(quality: str, target_formats: List[str], 
                         settings) -> Dict:
        """Estimate cost for a job"""
        from validation import estimate_job_cost
        return estimate_job_cost(quality, target_formats)
    
    @staticmethod
    def can_afford_job(org_id: str, quality: str, target_formats: List[str],
                      settings, db: Session) -> bool:
        """Check if org can afford a job"""
        balance = CreditsManager.get_balance(org_id, db)
        estimate = CreditsManager.estimate_job_cost(quality, target_formats, settings)
        
        return balance >= estimate["credits"]

# Credit packages for purchase
CREDIT_PACKAGES = {
    "starter": {
        "credits": Decimal("10"),
        "price_cents": 1000,  # $10.00
        "stripe_price_id": "price_starter_pack"
    },
    "professional": {
        "credits": Decimal("50"),
        "price_cents": 4500,  # $45.00 (10% discount)
        "stripe_price_id": "price_professional_pack"
    },
    "enterprise": {
        "credits": Decimal("200"),
        "price_cents": 16000,  # $160.00 (20% discount)
        "stripe_price_id": "price_enterprise_pack"
    }
}