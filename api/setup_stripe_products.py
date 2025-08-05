#!/usr/bin/env python3
"""
Setup Stripe products for img-to-uzdz credit packages
Run this after configuring your Stripe keys in .env
"""

import stripe
from settings import Settings

def setup_stripe_products():
    """Create the credit packages in Stripe"""
    
    settings = Settings()
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    if not stripe.api_key:
        print("❌ STRIPE_SECRET_KEY not found in environment")
        print("   Make sure your .env file has STRIPE_SECRET_KEY set")
        return
    
    print("🔑 Using Stripe API key:", stripe.api_key[:12] + "...")
    
    products_to_create = [
        {
            "name": "Starter Package",
            "description": "10 credits for 3D model generation",
            "credits": 10,
            "price_cents": 1000,  # $10.00
        },
        {
            "name": "Professional Package", 
            "description": "50 credits for 3D model generation (10% discount)",
            "credits": 50,
            "price_cents": 4500,  # $45.00
        },
        {
            "name": "Enterprise Package",
            "description": "200 credits for 3D model generation (20% discount)", 
            "credits": 200,
            "price_cents": 16000,  # $160.00
        }
    ]
    
    created_products = []
    
    try:
        for product_data in products_to_create:
            print(f"📦 Creating product: {product_data['name']}")
            
            # Create product
            product = stripe.Product.create(
                name=product_data["name"],
                description=product_data["description"],
                metadata={
                    "credits": str(product_data["credits"]),
                    "type": "credit_package"
                }
            )
            
            # Create price
            price = stripe.Price.create(
                product=product.id,
                unit_amount=product_data["price_cents"],
                currency="usd",
                nickname=f"{product_data['credits']} Credits"
            )
            
            created_products.append({
                "product_id": product.id,
                "price_id": price.id,
                "name": product_data["name"],
                "credits": product_data["credits"],
                "price": f"${product_data['price_cents'] / 100:.2f}"
            })
            
            print(f"   ✅ Product ID: {product.id}")
            print(f"   ✅ Price ID: {price.id}")
        
        print(f"")
        print(f"🎉 Successfully created {len(created_products)} Stripe products!")
        print(f"")
        print(f"📋 Summary:")
        for product in created_products:
            print(f"   {product['name']}: {product['credits']} credits for {product['price']}")
            print(f"      Product: {product['product_id']}")
            print(f"      Price: {product['price_id']}")
            print()
        
        print("💡 Next steps:")
        print("   1. Set up your webhook endpoint in Stripe Dashboard:")
        print("      URL: https://your-domain.com/billing/stripe/webhook")
        print("      Events: checkout.session.completed")
        print("   2. Add the webhook secret to your .env file as STRIPE_WEBHOOK_SECRET")
        print("   3. Test the credit packages in your application")
        
    except stripe.error.StripeError as e:
        print(f"❌ Stripe error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    setup_stripe_products()