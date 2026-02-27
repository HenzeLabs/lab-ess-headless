#!/usr/bin/env python3
"""
API Test Script for Lab Essentials E-Commerce Platform
This script tests the backend APIs based on the TestSprite test plan schemas
"""

import requests
import json
import sys
from typing import Dict, Any, List, Tuple

# Configuration
BASE_URL = "http://localhost:3000"
HEADERS = {"Accept": "application/json"}

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def test_health_check() -> Tuple[bool, str]:
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health-check", headers=HEADERS)
        
        # Check status code
        if response.status_code != 200:
            return False, f"Expected status 200, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        if 'status' not in data:
            return False, "Missing 'status' field in response"
        
        if data['status'] not in ['ok', 'healthy', 'up']:
            return False, f"Invalid status value: {data['status']}"
        
        return True, "Health check passed"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_products_api() -> Tuple[bool, str]:
    """Test the products API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/products", headers=HEADERS, params={"limit": "10"})
        
        # Check status code
        if response.status_code != 200:
            return False, f"Expected status 200, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        
        # Check required fields
        if 'products' not in data:
            return False, "Missing 'products' field in response"
        
        if not isinstance(data['products'], list):
            return False, "Products field is not an array"
        
        # Check product structure if products exist
        if len(data['products']) > 0:
            product = data['products'][0]
            required_fields = ['id', 'title', 'handle']
            for field in required_fields:
                if field not in product:
                    return False, f"Missing required field '{field}' in product"
            
            # Validate ID pattern (should start with gid://shopify/)
            if not product['id'].startswith('gid://shopify/'):
                return False, f"Invalid product ID format: {product['id']}"
            
            # Check price structure if present
            if 'priceRange' in product:
                if 'minVariantPrice' not in product['priceRange']:
                    return False, "Missing minVariantPrice in priceRange"
                
                price = product['priceRange']['minVariantPrice']
                if 'amount' not in price or 'currencyCode' not in price:
                    return False, "Invalid price structure"
        
        return True, f"Products API passed - Found {len(data['products'])} products"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_featured_products_api() -> Tuple[bool, str]:
    """Test the featured products API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/featured-products", headers=HEADERS)
        
        # Check status code
        if response.status_code != 200:
            return False, f"Expected status 200, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        
        # Check required fields
        if 'products' not in data:
            return False, "Missing 'products' field in response"
        
        if not isinstance(data['products'], list):
            return False, "Products field is not an array"
        
        # Check max items constraint (should be <= 12)
        if len(data['products']) > 12:
            return False, f"Too many featured products: {len(data['products'])} (max 12)"
        
        return True, f"Featured Products API passed - Found {len(data['products'])} products"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_collections_api() -> Tuple[bool, str]:
    """Test the collections API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/collections", headers=HEADERS)
        
        # Check status code
        if response.status_code != 200:
            return False, f"Expected status 200, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        
        # Check required fields
        if 'collections' not in data:
            return False, "Missing 'collections' field in response"
        
        if not isinstance(data['collections'], list):
            return False, "Collections field is not an array"
        
        # Check collection structure if collections exist
        if len(data['collections']) > 0:
            collection = data['collections'][0]
            required_fields = ['id', 'title', 'handle']
            for field in required_fields:
                if field not in collection:
                    return False, f"Missing required field '{field}' in collection"
        
        return True, f"Collections API passed - Found {len(data['collections'])} collections"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_menu_api() -> Tuple[bool, str]:
    """Test the menu API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/menu", headers=HEADERS)
        
        # Check status code
        if response.status_code != 200:
            return False, f"Expected status 200, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        
        # Check required fields
        if 'items' not in data:
            return False, "Missing 'items' field in response"
        
        if not isinstance(data['items'], list):
            return False, "Items field is not an array"
        
        # Check that at least one menu item exists
        if len(data['items']) < 1:
            return False, "Menu should have at least one item"
        
        # Check menu item structure if items exist
        if len(data['items']) > 0:
            item = data['items'][0]
            required_fields = ['title', 'url']
            for field in required_fields:
                if field not in item:
                    return False, f"Missing required field '{field}' in menu item"
        
        return True, f"Menu API passed - Found {len(data['items'])} menu items"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_product_by_handle() -> Tuple[bool, str]:
    """Test the product by handle API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/product-by-handle", 
                                headers=HEADERS, 
                                params={"handle": "test-product"})
        
        # Check status code (can be 200 or 404)
        if response.status_code not in [200, 404]:
            return False, f"Expected status 200 or 404, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        
        if response.status_code == 200:
            # If product found, check structure
            if 'product' in data and data['product']:
                product = data['product']
                required_fields = ['id', 'title', 'handle']
                for field in required_fields:
                    if field not in product:
                        return False, f"Missing required field '{field}' in product"
        elif response.status_code == 404:
            # If not found, check error message
            if 'error' not in data and 'product' not in data:
                return False, "Invalid 404 response structure"
        
        return True, f"Product by Handle API passed - Status: {response.status_code}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_cache_health() -> Tuple[bool, str]:
    """Test the cache health API endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/cache/health", headers=HEADERS)
        
        # Check status code
        if response.status_code != 200:
            return False, f"Expected status 200, got {response.status_code}"
        
        # Check response structure
        data = response.json()
        
        # Check required fields
        if 'status' not in data:
            return False, "Missing 'status' field in response"
        
        if data['status'] not in ['healthy', 'degraded', 'unhealthy']:
            return False, f"Invalid cache status value: {data['status']}"
        
        return True, "Cache Health API passed"
    except Exception as e:
        return False, f"Error: {str(e)}"

def run_all_tests():
    """Run all API tests and display results"""
    print(f"\n{BLUE}{'='*60}")
    print("Lab Essentials E-Commerce API Test Suite")
    print(f"Testing against: {BASE_URL}")
    print(f"{'='*60}{RESET}\n")
    
    tests = [
        ("Health Check API", test_health_check),
        ("Products API", test_products_api),
        ("Featured Products API", test_featured_products_api),
        ("Collections API", test_collections_api),
        ("Menu API", test_menu_api),
        ("Product by Handle API", test_product_by_handle),
        ("Cache Health API", test_cache_health),
    ]
    
    passed = 0
    failed = 0
    results = []
    
    for test_name, test_func in tests:
        print(f"Testing {test_name}...", end=" ")
        success, message = test_func()
        
        if success:
            print(f"{GREEN}✓ PASSED{RESET}")
            print(f"  └─ {message}")
            passed += 1
        else:
            print(f"{RED}✗ FAILED{RESET}")
            print(f"  └─ {message}")
            failed += 1
        
        results.append((test_name, success, message))
        print()
    
    # Summary
    print(f"\n{BLUE}{'='*60}")
    print("Test Summary")
    print(f"{'='*60}{RESET}")
    
    total = passed + failed
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"Total Tests: {total}")
    print(f"{GREEN}Passed: {passed}{RESET}")
    print(f"{RED}Failed: {failed}{RESET}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if failed > 0:
        print(f"\n{YELLOW}Failed Tests:{RESET}")
        for test_name, success, message in results:
            if not success:
                print(f"  - {test_name}: {message}")
    
    print(f"\n{BLUE}{'='*60}{RESET}\n")
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    try:
        # Check if server is running
        response = requests.get(BASE_URL, timeout=5)
        run_all_tests()
    except requests.ConnectionError:
        print(f"{RED}Error: Cannot connect to {BASE_URL}")
        print(f"Make sure the development server is running with: npm run dev{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"{RED}Error: {str(e)}{RESET}")
        sys.exit(1)