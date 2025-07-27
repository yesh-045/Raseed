import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
# from 

import json
import os
import sys

# Firebase Configuration
class FirebaseConfig:
    def __init__(self, credentials_path: str, user_id:str ):
        base_dir = os.path.dirname(os.path.abspath(__file__))  # Directory of this file
        self.credentials_path = os.path.abspath(os.path.join(base_dir, credentials_path))
        self.user_id = user_id
        self.db = None
        self._initialize_firebase()
        

    def get_db_schema(self) -> Dict[str, Any]:
            """
            Retrieves the Firestore database schema: collections and sample fields.
            Returns:
                Dict containing collections and their sample fields
            """
            try:
                schema = {}
                collections = self.db.collections()
                for collection in collections:
                    collection_name = collection.id
                    docs = list(collection.limit(1).stream())
                    if docs:
                        sample_doc = docs[0].to_dict()
                        schema[collection_name] = list(sample_doc.keys())
                    else:
                        schema[collection_name] = []
                return {
                    "success": True,
                    "schema": schema,
                    "message": "Database schema retrieved successfully"
                }
            except Exception as e:
                return {
                    "success": False,
                    "schema": {},
                    "message": f"Error retrieving database schema: {str(e)}"
                }
    
    def _initialize_firebase(self  ):
        """Initialize Firebase connection"""
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(self.credentials_path)
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("✅ Firebase initialized successfully")
        except Exception as e:
            print(f"❌ Firebase initialization error: {e}")
            raise

firebase_config = FirebaseConfig("receipt_wallet.json",user_id='user002')

def get_user_profile() -> Dict[str, Any]:
    """
    Retrieves the user's profile information including budget, preferences, and financial health score.
    
    Returns:
        Dict containing user profile data or error information
    """
    try:

        users_ref = firebase_config.db.collection('users')
        query = users_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        docs = query.get()
        
        for doc in docs:
            profile_data = doc.to_dict()
            profile_data['_doc_id'] = doc.id
            return {
                "success": True,
                "data": profile_data,
                "message": "User profile retrieved successfully"
            }
        
        return {
            "success": False,
            "data": None,
            "message": f"No profile found for user {firebase_config.user_id}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "message": f"Error retrieving user profile: {str(e)}"
        }

def get_recent_receipts() -> str:
    """
    Fetches the most recent receipts for a given user.
    
    """
    try:
        # 1. Get the database client internally. This is "manual parsing".
        db = firebase_config.db
        
        # 2. Use the client to perform your query.
        receipts_ref = db.collection('users').document(firebase_config.user_id).collection('receipts')
        query = receipts_ref.order_by('timestamp', direction='DESCENDING').limit(5)
        
        docs = query.stream()
        print("Recent receipt documents:", docs)
        receipts = [doc.to_dict() for doc in docs]
        
        
        if not receipts:
            return "No recent receipts found for this user."
            
        # 3. Return a simple, string-based result.
        return f"Found {len(receipts)} recent receipts: {str(receipts)}"

    except Exception as e:
        return f"An error occurred while fetching receipts: {e}"

def get_receipts_by_store(store_name: str ) -> Dict[str, Any]:
    """
    Retrieves receipts from a specific store.
    
    Args:
        store_name: Name of the store to filter by    
    Returns:
        Dict containing store-specific receipts or error information
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        query = query.where(filter=FieldFilter('store', '==', store_name))
    
        query = query.order_by('timestamp', direction=firestore.Query.DESCENDING)
        
        docs = query.get()
        receipts = []
        
        for doc in docs:
            receipt_data = doc.to_dict()
            receipt_data['_doc_id'] = doc.id
            receipts.append(receipt_data)
        
        return {
            "success": True,
            "data": receipts,
            "count": len(receipts),
            "store": store_name,
            "message": f"Retrieved {len(receipts)} receipts from {store_name}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "message": f"Error retrieving receipts for store {store_name}: {str(e)}"
        }

def get_spending_by_amount_range(min_amount: float, max_amount: float , days_back: int,  ) -> Dict[str, Any]:
    """
    Retrieves receipts within a specific spending amount range.
    
    Args:
        min_amount: Minimum spending amount (default: 0)
        max_amount: Maximum spending amount (default: 10000)
        days_back: Number of days to look back (default: 30)
    
    Returns:
        Dict containing receipts within the amount range
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        
        # Add date filter
        cutoff_date = datetime.now() - timedelta(days=days_back)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        query = query.order_by('timestamp', direction=firestore.Query.DESCENDING)
        
        docs = query.get()
        filtered_receipts = []
        
        for doc in docs:
            receipt_data = doc.to_dict()
            total_amount = receipt_data.get('total_amount', 0)
            
            if min_amount <= total_amount <= max_amount:
                receipt_data['_doc_id'] = doc.id
                filtered_receipts.append(receipt_data)
        
        return {
            "success": True,
            "data": filtered_receipts,
            "count": len(filtered_receipts),
            "amount_range": f"${min_amount} - ${max_amount}",
            "message": f"Retrieved {len(filtered_receipts)} receipts in amount range ${min_amount}-${max_amount}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "message": f"Error retrieving receipts by amount: {str(e)}"
        }

def get_overspending_transactions(days_back: int , ) -> Dict[str, Any]:
    """
    Retrieves transactions where the user overspent compared to their goals.
    
    Args:
        days_back: Number of days to look back (default: 30)
    
    Returns:
        Dict containing overspending transactions
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        query = query.where(filter=FieldFilter('overspent', '==', True))
        
        # Add date filter
        cutoff_date = datetime.now() - timedelta(days=days_back)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        query = query.order_by('timestamp', direction=firestore.Query.DESCENDING)
        
        docs = query.get()
        overspent_receipts = []
        total_overspent_amount = 0
        
        for doc in docs:
            receipt_data = doc.to_dict()
            receipt_data['_doc_id'] = doc.id
            overspent_receipts.append(receipt_data)
            
            # Calculate overspend amount
            total_amount = receipt_data.get('total_amount', 0)
            goal_amount = receipt_data.get('goal_amount', 0)
            if total_amount > goal_amount:
                total_overspent_amount += (total_amount - goal_amount)
        
        return {
            "success": True,
            "data": overspent_receipts,
            "count": len(overspent_receipts),
            "total_overspent_amount": round(total_overspent_amount, 2),
            "message": f"Found {len(overspent_receipts)} overspending transactions totaling ${total_overspent_amount:.2f} over budget"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "message": f"Error retrieving overspending transactions: {str(e)}"
        }

def search_items_by_name(item_name: str, days_back: int , ) -> Dict[str, Any]:
    """
    Searches for specific items across all receipts.
    
    Args:
        item_name: Name of the item to search for
        days_back: Number of days to look back (default: 60)
    
    Returns:
        Dict containing matching items across all receipts
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        
        # Add date filter
        cutoff_date = datetime.now() - timedelta(days=days_back)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        
        docs = query.get()
        matching_items = []
        total_spent_on_item = 0
        total_quantity = 0
        
        for doc in docs:
            receipt_data = doc.to_dict()
            items = receipt_data.get('items', [])
            
            for item in items:
                if item_name.lower() in item.get('item_name', '').lower():
                    item_info = {
                        'receipt_id': receipt_data.get('receipt_id'),
                        'store': receipt_data.get('store'),
                        'purchase_date': receipt_data.get('timestamp'),
                        'item_details': item,
                        'total_amount': receipt_data.get('total_amount')
                    }
                    matching_items.append(item_info)
                    
                    # Calculate totals
                    item_total = item.get('quantity', 0) * item.get('unit_price', 0)
                    total_spent_on_item += item_total
                    total_quantity += item.get('quantity', 0)
        
        return {
            "success": True,
            "data": matching_items,
            "search_term": item_name,
            "count": len(matching_items),
            "total_spent": round(total_spent_on_item, 2),
            "total_quantity": total_quantity,
            "message": f"Found {len(matching_items)} instances of '{item_name}' with total spending of ${total_spent_on_item:.2f}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "message": f"Error searching for item '{item_name}': {str(e)}"
        }

def get_category_spending_breakdown(days_back: int, ) -> Dict[str, Any]:
    """
    Provides a breakdown of spending by category.
    
    Args:
        days_back: Number of days to look back (default: 30)
    
    Returns:
        Dict containing category-wise spending breakdown
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        
        # Add date filter
        cutoff_date = datetime.now() - timedelta(days=days_back)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        
        docs = query.get()
        category_spending = {}
        total_spending = 0
        
        for doc in docs:
            receipt_data = doc.to_dict()
            gemini_inference = receipt_data.get('gemini_inference', {})
            category_spend = gemini_inference.get('category_spend', {})
            
            for category, amount in category_spend.items():
                category_spending[category] = category_spending.get(category, 0) + amount
                total_spending += amount
        
        # Calculate percentages
        category_percentages = {}
        for category, amount in category_spending.items():
            percentage = (amount / total_spending * 100) if total_spending > 0 else 0
            category_percentages[category] = {
                'amount': round(amount, 2),
                'percentage': round(percentage, 2)
            }
        
        # Sort by spending amount
        sorted_categories = dict(sorted(category_percentages.items(), 
                                     key=lambda x: x[1]['amount'], reverse=True))
        
        return {
            "success": True,
            "data": sorted_categories,
            "total_spending": round(total_spending, 2),
            "period_days": days_back,
            "message": f"Category breakdown for last {days_back} days with total spending of ${total_spending:.2f}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Error calculating category breakdown: {str(e)}"
        }

def get_essential_vs_nonessential_spending(days_back: int , ) -> Dict[str, Any]:
    """
    Analyzes essential vs non-essential spending patterns.
    
    Args:
        days_back: Number of days to look back (default: 30)
    
    Returns:
        Dict containing essential vs non-essential spending analysis
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        
        # Add date filter
        cutoff_date = datetime.now() - timedelta(days=days_back)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        
        docs = query.get()
        essential_spending = 0
        nonessential_spending = 0
        total_spending = 0
        
        for doc in docs:
            receipt_data = doc.to_dict()
            receipt_total = receipt_data.get('total_amount', 0)
            total_spending += receipt_total
            
            gemini_inference = receipt_data.get('gemini_inference', {})
            need_want_split = gemini_inference.get('need_vs_want_split', {})
            
            essential_pct = need_want_split.get('essential', 0) / 100
            nonessential_pct = need_want_split.get('non_essential', 0) / 100
            
            essential_spending += receipt_total * essential_pct
            nonessential_spending += receipt_total * nonessential_pct
        
        essential_percentage = (essential_spending / total_spending * 100) if total_spending > 0 else 0
        nonessential_percentage = (nonessential_spending / total_spending * 100) if total_spending > 0 else 0
        
        return {
            "success": True,
            "data": {
                "essential_spending": round(essential_spending, 2),
                "nonessential_spending": round(nonessential_spending, 2),
                "essential_percentage": round(essential_percentage, 2),
                "nonessential_percentage": round(nonessential_percentage, 2),
                "total_spending": round(total_spending, 2)
            },
            "period_days": days_back,
            "message": f"Essential: ${essential_spending:.2f} ({essential_percentage:.1f}%), Non-essential: ${nonessential_spending:.2f} ({nonessential_percentage:.1f}%)"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Error analyzing essential vs non-essential spending: {str(e)}"
        }

def analyze_spending_trends(months_back: int, ) -> Dict[str, Any]:
    """
    Analyzes spending trends over multiple months to identify patterns.
    
    Args:
        months_back: Number of months to analyze (default: 6)
    
    Returns:
        Dict containing trend analysis with monthly breakdown
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        
        # Get data for the specified months
        cutoff_date = datetime.now() - timedelta(days=months_back * 30)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        query = query.order_by('timestamp', direction=firestore.Query.ASCENDING)
        
        docs = query.get()
        monthly_data = {}
        
        for doc in docs:
            receipt_data = doc.to_dict()
            timestamp = receipt_data.get('timestamp')
            
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            month_key = timestamp.strftime('%Y-%m')
            total_amount = receipt_data.get('total_amount', 0)
            
            if month_key not in monthly_data:
                monthly_data[month_key] = {
                    'total_spent': 0,
                    'transaction_count': 0,
                    'avg_transaction': 0,
                    'overspent_count': 0
                }
            
            monthly_data[month_key]['total_spent'] += total_amount
            monthly_data[month_key]['transaction_count'] += 1
            
            if receipt_data.get('overspent', False):
                monthly_data[month_key]['overspent_count'] += 1
        
        # Calculate averages and trends
        for month in monthly_data:
            data = monthly_data[month]
            data['avg_transaction'] = round(
                data['total_spent'] / data['transaction_count'] if data['transaction_count'] > 0 else 0, 2
            )
            data['total_spent'] = round(data['total_spent'], 2)
        
        # Calculate trend direction
        months = sorted(monthly_data.keys())
        if len(months) >= 2:
            recent_avg = sum(monthly_data[m]['total_spent'] for m in months[-2:]) / 2
            earlier_avg = sum(monthly_data[m]['total_spent'] for m in months[:2]) / 2
            trend_direction = "increasing" if recent_avg > earlier_avg else "decreasing"
            trend_percentage = abs((recent_avg - earlier_avg) / earlier_avg * 100) if earlier_avg > 0 else 0
        else:
            trend_direction = "insufficient_data"
            trend_percentage = 0
        
        return {
            "success": True,
            "data": {
                "monthly_breakdown": monthly_data,
                "trend_direction": trend_direction,
                "trend_percentage": round(trend_percentage, 2),
                "months_analyzed": len(months),
                "total_period_spending": round(sum(data['total_spent'] for data in monthly_data.values()), 2)
            },
            "message": f"Analyzed {len(months)} months of spending data with {trend_direction} trend of {trend_percentage:.1f}%"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Error analyzing spending trends: {str(e)}"
        }

def get_budget_performance(days_back: int , ) -> Dict[str, Any]:
    """
    Compares actual spending against budget and provides performance metrics.
    
    Args:
        days_back: Number of days to analyze (default: 30)
    
    Returns:
        Dict containing budget vs actual performance analysis
    """
    try:
        # Get user profile for budget information
        profile_result = get_user_profile()
        if not profile_result["success"]:
            return profile_result
        
        user_profile = profile_result["data"]
        monthly_budget = user_profile.get('budget_monthly', 0)
        
        if monthly_budget == 0:
            return {
                "success": False,
                "message": "No budget set for user. Please set a monthly budget first."
            }
        
        # Calculate period budget
        period_budget = monthly_budget * (days_back / 30)
        
        # Get receipts for the period
        receipts_result = get_recent_receipts(limit=1000, days_back=days_back)
        if not receipts_result["success"]:
            return receipts_result
        
        receipts = receipts_result["data"]
        actual_spending = sum(receipt.get('total_amount', 0) for receipt in receipts)
        
        # Calculate performance metrics
        budget_utilization = (actual_spending / period_budget * 100) if period_budget > 0 else 0
        remaining_budget = period_budget - actual_spending
        daily_avg_spending = actual_spending / days_back if days_back > 0 else 0
        daily_budget_limit = period_budget / days_back if days_back > 0 else 0
        
        # Determine status
        if budget_utilization <= 80:
            status = "excellent"
        elif budget_utilization <= 100:
            status = "good"
        elif budget_utilization <= 120:
            status = "warning"
        else:
            status = "over_budget"
        
        return {
            "success": True,
            "data": {
                "period_budget": round(period_budget, 2),
                "actual_spending": round(actual_spending, 2),
                "remaining_budget": round(remaining_budget, 2),
                "budget_utilization_pct": round(budget_utilization, 2),
                "daily_avg_spending": round(daily_avg_spending, 2),
                "daily_budget_limit": round(daily_budget_limit, 2),
                "status": status,
                "days_analyzed": days_back,
                "transaction_count": len(receipts)
            },
            "message": f"Budget performance: {budget_utilization:.1f}% utilized ({status})"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Error analyzing budget performance: {str(e)}"
        }

def get_expensive_items_analysis(days_back: int, min_price_threshold: float, ) -> Dict[str, Any]:
    """
    Identifies items purchased above market price and expensive purchases.
    
    Args:
        days_back: Number of days to analyze (default: 30)
        min_price_threshold: Minimum price to consider as expensive (default: 50)
    
    Returns:
        Dict containing analysis of expensive and above-market-price items
    """
    try:
        receipts_ref = firebase_config.db.collection('receipts')
        query = receipts_ref.where(filter=FieldFilter('uid', '==', firebase_config.user_id))
        
        # Add date filter
        cutoff_date = datetime.now() - timedelta(days=days_back)
        query = query.where(filter=FieldFilter('timestamp', '>=', cutoff_date))
        
        docs = query.get()
        above_market_items = []
        expensive_items = []
        total_overpaid = 0
        
        for doc in docs:
            receipt_data = doc.to_dict()
            items = receipt_data.get('items', [])
            store = receipt_data.get('store', 'Unknown')
            purchase_date = receipt_data.get('timestamp')
            
            for item in items:
                unit_price = item.get('unit_price', 0)
                market_price = item.get('market_price', 0)
                quantity = item.get('quantity', 1)
                item_name = item.get('item_name', 'Unknown')
                
                # Check if above market price
                if item.get('above_market_price', False) and market_price > 0:
                    overpaid_amount = (unit_price - market_price) * quantity
                    total_overpaid += overpaid_amount
                    
                    above_market_items.append({
                        'item_name': item_name,
                        'store': store,
                        'purchase_date': purchase_date,
                        'unit_price': unit_price,
                        'market_price': market_price,
                        'quantity': quantity,
                        'overpaid_amount': round(overpaid_amount, 2),
                        'overpaid_percentage': round((unit_price - market_price) / market_price * 100, 2)
                    })
                
                # Check if expensive item
                total_item_cost = unit_price * quantity
                if total_item_cost >= min_price_threshold:
                    expensive_items.append({
                        'item_name': item_name,
                        'store': store,
                        'purchase_date': purchase_date,
                        'unit_price': unit_price,
                        'quantity': quantity,
                        'total_cost': round(total_item_cost, 2),
                        'category': item.get('category', 'Unknown'),
                        'classified_as': item.get('classified_as', 'Unknown')
                    })
        
        return {
            "success": True,
            "data": {
                "above_market_items": above_market_items,
                "expensive_items": expensive_items,
                "total_overpaid": round(total_overpaid, 2),
                "above_market_count": len(above_market_items),
                "expensive_items_count": len(expensive_items),
                "min_price_threshold": min_price_threshold
            },
            "period_days": days_back,
            "message": f"Found {len(above_market_items)} above-market items (overpaid ${total_overpaid:.2f}) and {len(expensive_items)} expensive items"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Error analyzing expensive items: {str(e)}"
        }

def get_pantry_status(item_name: Optional[str] , ) -> Dict[str, Any]:
    """
    Checks pantry inventory status for items purchased recently.
    
    Args:
        item_name: Specific item to check (optional)
    
    Returns:
        Dict containing pantry status information
    """
    try:
        # Get recent receipts to simulate pantry tracking
        receipts_result = get_recent_receipts(limit=100, days_back=60)
        if not receipts_result["success"]:
            return receipts_result
        
        receipts = receipts_result["data"]
        pantry_items = {}
        
        for receipt in receipts:
            items = receipt.get('items', [])
            purchase_date = receipt.get('timestamp')
            
            for item in items:
                current_item_name = item.get('item_name', '').lower()
                quantity = item.get('quantity', 0)
                category = item.get('category', 'Unknown')
                wastage_prob = item.get('wastage_probability', 0)
                
                # Filter by specific item if requested
                if item_name and item_name.lower() not in current_item_name:
                    continue
                
                if current_item_name in pantry_items:
                    pantry_items[current_item_name]['total_quantity'] += quantity
                    pantry_items[current_item_name]['purchase_count'] += 1
                else:
                    pantry_items[current_item_name] = {
                        'item_name': item.get('item_name', 'Unknown'),
                        'category': category,
                        'total_quantity': quantity,
                        'purchase_count': 1,
                        'last_purchase_date': purchase_date,
                        'wastage_probability': wastage_prob,
                        'estimated_remaining': max(0, quantity - (wastage_prob * quantity))
                    }
        
        # Sort by most recent purchases
        sorted_pantry = dict(sorted(pantry_items.items(), 
                                  key=lambda x: x[1]['last_purchase_date'], reverse=True))
        
        return {
            "success": True,
            "data": sorted_pantry,
            "total_items": len(sorted_pantry),
            "search_item": item_name,
            "message": f"Found {len(sorted_pantry)} items in pantry inventory"
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Error checking pantry status: {str(e)}"
        }

def get_financial_health_summary() -> Dict[str, Any]:
    """
    Provides a comprehensive financial health summary combining multiple metrics.
    
    Returns:
        Dict containing overall financial health analysis
    """
    try:
        # Get user profile
        profile_result = get_user_profile()
        if not profile_result["success"]:
            return profile_result
        
        user_profile = profile_result["data"]
        
        # Get various metrics
        budget_performance = get_budget_performance(days_back=30)
        category_breakdown = get_category_spending_breakdown(days_back=30)
        essential_analysis = get_essential_vs_nonessential_spending(days_back=30)
        overspending = get_overspending_transactions(days_back=30)
        trends = analyze_spending_trends(months_back=3)
        
        # Compile summary
        summary = {
            "user_info": {
                "name": user_profile.get('name', 'Unknown'),
                "preferred_currency": user_profile.get('preferred_currency', 'USD'),
                "monthly_budget": user_profile.get('budget_monthly', 0),
                "fhs_score": user_profile.get('fhs_score', 0),
               "savings_pct": user_profile.get('savings_pct', 0)
                },
                "budget_performance": budget_performance.get("data", {}),
                "category_breakdown": category_breakdown.get("data", {}),
                "essential_vs_nonessential": essential_analysis.get("data", {}),
                "overspending": overspending.get("data", {}),
                "spending_trends": trends.get("data", {})
                }

        return {
        "success": True,
        "data": summary,
        "message": "Financial health summary compiled successfully"
        }

    except Exception as e:
        return {
        "success": False,
        "data": {},
        "message": f"Error compiling financial health summary: {str(e)}"
        }