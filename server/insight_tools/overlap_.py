"""
Spending Overlap & Duplicate Subscription Detection - Minimized
"""
from utils import get_db, fetch_user_receipts, parse_timestamp, safe_float, generate_ai_insight
from collections import defaultdict

def detect_spending_overlaps(user_id):
    """Detect overlapping subscriptions and redundant spending patterns"""
    receipts = list(fetch_user_receipts(user_id, 120))  # 4 months
    
    # Track vendors and subscription patterns
    vendor_patterns = defaultdict(list)
    subscription_candidates = []
    category_overlap = defaultdict(list)
    
    for receipt_doc in receipts:
        try:
            receipt = receipt_doc.to_dict() if hasattr(receipt_doc, 'to_dict') else receipt_doc
            if not receipt:
                continue
            
            timestamp = parse_timestamp(receipt.get("timestamp"))
            if not timestamp:
                continue
            
            store_name = receipt.get("store_name", "").lower()
            total_amount = safe_float(receipt.get("total_amount", 0))
            
            if total_amount > 0 and store_name:
                vendor_patterns[store_name].append({
                    "date": timestamp,
                    "amount": total_amount,
                    "month": timestamp.strftime("%Y-%m")
                })
            
            # Categorize spending for overlap detection
            for item in receipt.get("items", []):
                if not isinstance(item, dict):
                    continue
                
                category = item.get("category", "").lower()
                item_name = item.get("item_name", "").lower()
                price = safe_float(item.get("unit_price", 0))
                
                if category and price > 0:
                    category_overlap[category].append({
                        "item": item_name,
                        "price": price,
                        "store": store_name,
                        "date": timestamp
                    })
                    
        except Exception:
            continue
    
    # Detect subscription patterns (consistent monthly charges)
    for vendor, purchases in vendor_patterns.items():
        if len(purchases) >= 3:  # At least 3 purchases
            amounts = [p["amount"] for p in purchases]
            dates = [p["date"] for p in purchases]
            
            # Check for consistent monthly charges
            amount_variance = max(amounts) - min(amounts)
            if amount_variance < 5:  # Very consistent amounts
                # Check intervals between purchases
                sorted_dates = sorted(dates)
                intervals = []
                for i in range(1, len(sorted_dates)):
                    interval = (sorted_dates[i] - sorted_dates[i-1]).days
                    intervals.append(interval)
                
                avg_interval = sum(intervals) / len(intervals) if intervals else 0
                
                # Monthly subscription pattern (25-35 days)
                if 25 <= avg_interval <= 35:
                    subscription_candidates.append({
                        "vendor": vendor,
                        "avg_amount": round(sum(amounts) / len(amounts), 2),
                        "frequency": "monthly",
                        "confidence": "high" if amount_variance < 2 else "medium",
                        "purchase_count": len(purchases),
                        "last_charge": max(dates).strftime("%Y-%m-%d")
                    })
    
    # Detect overlapping services/categories
    overlapping_services = []
    
    # Common overlapping service categories
    overlap_categories = {
        "streaming": ["netflix", "hulu", "disney", "prime", "spotify", "apple music", "youtube"],
        "fitness": ["gym", "planet fitness", "la fitness", "peloton", "fitbit"],
        "cloud storage": ["dropbox", "google drive", "icloud", "onedrive"],
        "delivery": ["doordash", "uber eats", "grubhub", "postmates"]
    }
    
    for service_type, keywords in overlap_categories.items():
        detected_services = []
        total_cost = 0
        
        for vendor in subscription_candidates:
            vendor_name = vendor["vendor"].lower()
            for keyword in keywords:
                if keyword in vendor_name:
                    detected_services.append(vendor)
                    total_cost += vendor["avg_amount"]
                    break
        
        if len(detected_services) >= 2:  # Multiple services in same category
            overlapping_services.append({
                "category": service_type,
                "services": detected_services,
                "total_monthly_cost": round(total_cost, 2),
                "potential_savings": round(total_cost * 0.4, 2),  # Assume 40% savings by consolidating
                "recommendation": f"Consider consolidating {service_type} services"
            })
    
    # Category spending overlap analysis
    category_overlaps = []
    for category, items in category_overlap.items():
        if len(items) >= 5:  # Significant activity in category
            stores = defaultdict(float)
            for item in items:
                stores[item["store"]] += item["price"]
            
            if len(stores) >= 3:  # Shopping at multiple stores for same category
                total_spending = sum(stores.values())
                category_overlaps.append({
                    "category": category,
                    "store_count": len(stores),
                    "total_spending": round(total_spending, 2),
                    "stores": dict(stores),
                    "recommendation": f"Consider consolidating {category} purchases to fewer stores for better deals"
                })
    
    # Calculate total potential savings
    total_subscription_savings = sum(service["potential_savings"] for service in overlapping_services)
    
    # Generate insights
    insights = []
    if subscription_candidates:
        total_subscription_cost = sum(s["avg_amount"] for s in subscription_candidates)
        insights.append(f"💳 {len(subscription_candidates)} subscriptions detected (${total_subscription_cost:.2f}/month)")
    
    if overlapping_services:
        insights.append(f"⚠️ {len(overlapping_services)} overlapping service categories found")
        insights.append(f"💰 Potential savings: ${total_subscription_savings:.2f}/month by consolidating")
    
    if category_overlaps:
        top_overlap = max(category_overlaps, key=lambda x: x["store_count"])
        insights.append(f"🛍️ Shopping at {top_overlap['store_count']} stores for {top_overlap['category']}")
    
    try:
        ai_insight = generate_ai_insight(
            "Analyze spending overlaps and suggest consolidation strategies:",
            {
                "overlapping_services": overlapping_services,
                "subscription_candidates": subscription_candidates[:5],
                "category_overlaps": category_overlaps[:3]
            }
        )
        insights.append(ai_insight)
    except:
        pass
    
    return {
        "type": "overlap_analysis",
        "user_id": user_id,
        "subscription_candidates": subscription_candidates,
        "overlapping_services": overlapping_services,
        "category_overlaps": category_overlaps,
        "total_potential_savings": round(total_subscription_savings, 2),
        "insights": insights
    }

if __name__ == "__main__":
    result = detect_spending_overlaps("user001")
    print(result)
