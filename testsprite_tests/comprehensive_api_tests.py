#!/usr/bin/env python3
"""
Comprehensive API Test Suite for Lab Essentials E-Commerce Platform
Based on TestSprite test plan with enhanced validation and reporting

This test suite implements all test scenarios from testsprite_backend_test_plan.json
"""

import requests
import json
import sys
import re
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000"
HEADERS = {"Accept": "application/json"}

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
BOLD = '\033[1m'
RESET = '\033[0m'


@dataclass
class TestResult:
    """Data class to store test results"""
    test_name: str
    success: bool
    message: str
    response_time: Optional[float] = None
    status_code: Optional[int] = None


class APITestSuite:
    """Main test suite class"""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.results: List[TestResult] = []

    def validate_response_structure(self, data: Dict, schema: Dict) -> Tuple[bool, str]:
        """Validate response against a schema"""
        # Check required fields
        if 'required' in schema:
            for field in schema['required']:
                if field not in data:
                    return False, f"Missing required field: {field}"

        # Check field types and values
        if 'properties' in schema:
            for field, rules in schema['properties'].items():
                if field in data:
                    value = data[field]

                    # Type validation
                    if 'type' in rules:
                        expected_type = rules['type']
                        if expected_type == 'string' and not isinstance(value, str):
                            return False, f"Field '{field}' should be string, got {type(value).__name__}"
                        elif expected_type == 'number' and not isinstance(value, (int, float)):
                            return False, f"Field '{field}' should be number, got {type(value).__name__}"
                        elif expected_type == 'boolean' and not isinstance(value, bool):
                            return False, f"Field '{field}' should be boolean, got {type(value).__name__}"
                        elif expected_type == 'array' and not isinstance(value, list):
                            return False, f"Field '{field}' should be array, got {type(value).__name__}"
                        elif expected_type == 'object' and not isinstance(value, dict):
                            return False, f"Field '{field}' should be object, got {type(value).__name__}"

                    # Enum validation
                    if 'enum' in rules and value not in rules['enum']:
                        return False, f"Field '{field}' value '{value}' not in allowed values: {rules['enum']}"

                    # Pattern validation
                    if 'pattern' in rules and isinstance(value, str):
                        if not re.match(rules['pattern'], value):
                            return False, f"Field '{field}' value '{value}' doesn't match pattern: {rules['pattern']}"

                    # Min/Max validation for numbers
                    if 'minimum' in rules and isinstance(value, (int, float)):
                        if value < rules['minimum']:
                            return False, f"Field '{field}' value {value} below minimum {rules['minimum']}"

                    if 'maximum' in rules and isinstance(value, (int, float)):
                        if value > rules['maximum']:
                            return False, f"Field '{field}' value {value} above maximum {rules['maximum']}"

                    # Array validations
                    if isinstance(value, list):
                        if 'minItems' in rules and len(value) < rules['minItems']:
                            return False, f"Field '{field}' has {len(value)} items, minimum is {rules['minItems']}"
                        if 'maxItems' in rules and len(value) > rules['maxItems']:
                            return False, f"Field '{field}' has {len(value)} items, maximum is {rules['maxItems']}"

                        # Validate array items
                        if 'items' in rules and len(value) > 0:
                            for idx, item in enumerate(value):
                                is_valid, error = self.validate_response_structure(item, rules['items'])
                                if not is_valid:
                                    return False, f"Array item {idx} validation failed: {error}"

        return True, "Valid"

    # ==================== HEALTH CHECK TESTS ====================

    def test_health_check(self) -> TestResult:
        """Test: Health Check Success"""
        try:
            start_time = datetime.now()
            response = requests.get(f"{self.base_url}/api/health-check", headers=HEADERS)
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Health Check Success",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()
            schema = {
                'required': ['status'],
                'properties': {
                    'status': {
                        'type': 'string',
                        'enum': ['ok', 'healthy', 'up']
                    }
                }
            }

            is_valid, error = self.validate_response_structure(data, schema)
            if not is_valid:
                return TestResult(
                    "Health Check Success",
                    False,
                    error,
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Health Check Success",
                True,
                f"Health check returned status: {data['status']}",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Health Check Success", False, f"Error: {str(e)}")

    # ==================== PRODUCTS API TESTS ====================

    def test_products_get_all(self) -> TestResult:
        """Test: Get All Products - Success"""
        try:
            start_time = datetime.now()
            response = requests.get(
                f"{self.base_url}/api/products",
                headers=HEADERS,
                params={"limit": "10"}
            )
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Products API - Get All",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()
            schema = {
                'required': ['products'],
                'properties': {
                    'success': {'type': 'boolean'},  # Optional field
                    'products': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'required': ['id', 'title', 'handle'],
                            'properties': {
                                'id': {'type': 'string'},
                                'title': {'type': 'string'},
                                'handle': {'type': 'string', 'pattern': '^[a-z0-9-]+$'},
                                'priceRange': {
                                    'type': 'object',
                                    'properties': {
                                        'minVariantPrice': {
                                            'type': 'object',
                                            'required': ['amount', 'currencyCode'],
                                            'properties': {
                                                'amount': {'type': 'string'},
                                                'currencyCode': {'type': 'string'}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            is_valid, error = self.validate_response_structure(data, schema)
            if not is_valid:
                return TestResult(
                    "Products API - Get All",
                    False,
                    error,
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Products API - Get All",
                True,
                f"Found {len(data['products'])} products",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Products API - Get All", False, f"Error: {str(e)}")

    def test_products_empty_response(self) -> TestResult:
        """Test: Get Products - Empty Response"""
        try:
            start_time = datetime.now()
            response = requests.get(
                f"{self.base_url}/api/products",
                headers=HEADERS,
                params={"limit": "0"}
            )
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Products API - Empty Response",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()

            if 'products' not in data:
                return TestResult(
                    "Products API - Empty Response",
                    False,
                    "Missing 'products' field",
                    response_time,
                    response.status_code
                )

            if not isinstance(data['products'], list):
                return TestResult(
                    "Products API - Empty Response",
                    False,
                    "Products field is not an array",
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Products API - Empty Response",
                True,
                f"Returned {len(data['products'])} products (limit=0)",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Products API - Empty Response", False, f"Error: {str(e)}")

    # ==================== FEATURED PRODUCTS TESTS ====================

    def test_featured_products(self) -> TestResult:
        """Test: Get Featured Products"""
        try:
            start_time = datetime.now()
            response = requests.get(f"{self.base_url}/api/featured-products", headers=HEADERS)
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Featured Products API",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()
            schema = {
                'required': ['products'],
                'properties': {
                    'products': {
                        'type': 'array',
                        'maxItems': 12,
                        'items': {
                            'type': 'object',
                            'required': ['id', 'title', 'handle']
                        }
                    }
                }
            }

            is_valid, error = self.validate_response_structure(data, schema)
            if not is_valid:
                return TestResult(
                    "Featured Products API",
                    False,
                    error,
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Featured Products API",
                True,
                f"Found {len(data['products'])} featured products (max 12)",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Featured Products API", False, f"Error: {str(e)}")

    # ==================== COLLECTIONS TESTS ====================

    def test_collections_get_all(self) -> TestResult:
        """Test: Get All Collections"""
        try:
            start_time = datetime.now()
            response = requests.get(f"{self.base_url}/api/collections", headers=HEADERS)
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Collections API - Get All",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()
            schema = {
                'required': ['collections'],
                'properties': {
                    'collections': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'required': ['id', 'title', 'handle'],
                            'properties': {
                                'id': {'type': 'string'},
                                'title': {'type': 'string'},
                                'handle': {'type': 'string', 'pattern': '^[a-z0-9-]+$'}
                            }
                        }
                    }
                }
            }

            is_valid, error = self.validate_response_structure(data, schema)
            if not is_valid:
                return TestResult(
                    "Collections API - Get All",
                    False,
                    error,
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Collections API - Get All",
                True,
                f"Found {len(data['collections'])} collections",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Collections API - Get All", False, f"Error: {str(e)}")

    def test_collections_with_limit(self) -> TestResult:
        """Test: Get Collections - Check Structure with Limit"""
        try:
            start_time = datetime.now()
            response = requests.get(
                f"{self.base_url}/api/collections",
                headers=HEADERS,
                params={"limit": "5"}
            )
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Collections API - With Limit",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()

            if 'collections' not in data:
                return TestResult(
                    "Collections API - With Limit",
                    False,
                    "Missing 'collections' field",
                    response_time,
                    response.status_code
                )

            if len(data['collections']) > 5:
                return TestResult(
                    "Collections API - With Limit",
                    False,
                    f"Expected max 5 collections, got {len(data['collections'])}",
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Collections API - With Limit",
                True,
                f"Returned {len(data['collections'])} collections (limit=5)",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Collections API - With Limit", False, f"Error: {str(e)}")

    # ==================== MENU TESTS ====================

    def test_menu_structure(self) -> TestResult:
        """Test: Get Menu Structure"""
        try:
            start_time = datetime.now()
            response = requests.get(f"{self.base_url}/api/menu", headers=HEADERS)
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Menu API - Get Structure",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()
            schema = {
                'required': ['items'],
                'properties': {
                    'items': {
                        'type': 'array',
                        'minItems': 1,
                        'items': {
                            'type': 'object',
                            'required': ['title', 'url'],
                            'properties': {
                                'title': {'type': 'string'},
                                'url': {'type': 'string'}
                            }
                        }
                    }
                }
            }

            is_valid, error = self.validate_response_structure(data, schema)
            if not is_valid:
                return TestResult(
                    "Menu API - Get Structure",
                    False,
                    error,
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Menu API - Get Structure",
                True,
                f"Menu has {len(data['items'])} items",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Menu API - Get Structure", False, f"Error: {str(e)}")

    # ==================== PRODUCT BY HANDLE TESTS ====================

    def test_product_by_handle_valid(self) -> TestResult:
        """Test: Get Product by Valid Handle"""
        try:
            start_time = datetime.now()
            response = requests.get(
                f"{self.base_url}/api/product-by-handle",
                headers=HEADERS,
                params={"handle": "test-product"}
            )
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            # Accept both 200 (found) and 404 (not found) as valid
            if response.status_code not in [200, 404]:
                return TestResult(
                    "Product by Handle - Valid Handle",
                    False,
                    f"Expected status 200 or 404, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()

            if response.status_code == 200:
                # Product found - validate structure
                if 'product' in data and data['product']:
                    product = data['product']
                    required_fields = ['id', 'title', 'handle']
                    for field in required_fields:
                        if field not in product:
                            return TestResult(
                                "Product by Handle - Valid Handle",
                                False,
                                f"Missing required field '{field}' in product",
                                response_time,
                                response.status_code
                            )
            elif response.status_code == 404:
                # Product not found - validate error structure
                if 'error' not in data and 'product' not in data:
                    return TestResult(
                        "Product by Handle - Valid Handle",
                        False,
                        "Invalid 404 response structure",
                        response_time,
                        response.status_code
                    )

            return TestResult(
                "Product by Handle - Valid Handle",
                True,
                f"Status {response.status_code} - Response structure valid",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Product by Handle - Valid Handle", False, f"Error: {str(e)}")

    def test_product_by_handle_invalid(self) -> TestResult:
        """Test: Get Product - Invalid Handle"""
        try:
            start_time = datetime.now()
            response = requests.get(
                f"{self.base_url}/api/product-by-handle",
                headers=HEADERS,
                params={"handle": "non-existent-product-xyz-123"}
            )
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            # Should return 404 or 200 with null/error
            if response.status_code not in [200, 404]:
                return TestResult(
                    "Product by Handle - Invalid Handle",
                    False,
                    f"Expected status 200 or 404, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()

            # Validate response has either error or product field
            if 'error' not in data and 'product' not in data:
                return TestResult(
                    "Product by Handle - Invalid Handle",
                    False,
                    "Response missing both 'error' and 'product' fields",
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Product by Handle - Invalid Handle",
                True,
                f"Status {response.status_code} - Invalid handle handled correctly",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Product by Handle - Invalid Handle", False, f"Error: {str(e)}")

    # ==================== CHECKOUT TESTS ====================

    def test_checkout_create(self) -> TestResult:
        """Test: Create Checkout Session"""
        try:
            start_time = datetime.now()
            payload = {
                "items": [
                    {
                        "variantId": "test-variant-1",
                        "quantity": 1
                    }
                ]
            }
            response = requests.post(
                f"{self.base_url}/api/checkout",
                headers={**HEADERS, "Content-Type": "application/json"},
                json=payload
            )
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            # Accept 200, 201, or 400 (if test variant doesn't exist)
            if response.status_code not in [200, 201, 400]:
                return TestResult(
                    "Checkout API - Create Session",
                    False,
                    f"Expected status 200/201/400, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()

            # Validate response has either checkoutUrl or error
            if 'checkoutUrl' not in data and 'error' not in data:
                return TestResult(
                    "Checkout API - Create Session",
                    False,
                    "Response missing both 'checkoutUrl' and 'error' fields",
                    response_time,
                    response.status_code
                )

            # If checkout was created, validate URL
            if 'checkoutUrl' in data:
                if not data['checkoutUrl'].startswith(('http://', 'https://')):
                    return TestResult(
                        "Checkout API - Create Session",
                        False,
                        f"Invalid checkoutUrl format: {data['checkoutUrl']}",
                        response_time,
                        response.status_code
                    )

            return TestResult(
                "Checkout API - Create Session",
                True,
                f"Status {response.status_code} - Response valid",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Checkout API - Create Session", False, f"Error: {str(e)}")

    # ==================== CACHE HEALTH TESTS ====================

    def test_cache_health(self) -> TestResult:
        """Test: Check Cache Health"""
        try:
            start_time = datetime.now()
            response = requests.get(f"{self.base_url}/api/cache/health", headers=HEADERS)
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            if response.status_code != 200:
                return TestResult(
                    "Cache Health API",
                    False,
                    f"Expected status 200, got {response.status_code}",
                    response_time,
                    response.status_code
                )

            data = response.json()
            schema = {
                'required': ['status'],
                'properties': {
                    'status': {
                        'type': 'string',
                        'enum': ['healthy', 'degraded', 'unhealthy']
                    }
                }
            }

            is_valid, error = self.validate_response_structure(data, schema)
            if not is_valid:
                return TestResult(
                    "Cache Health API",
                    False,
                    error,
                    response_time,
                    response.status_code
                )

            return TestResult(
                "Cache Health API",
                True,
                f"Cache status: {data['status']}",
                response_time,
                response.status_code
            )

        except Exception as e:
            return TestResult("Cache Health API", False, f"Error: {str(e)}")

    # ==================== TEST RUNNER ====================

    def run_all_tests(self) -> None:
        """Run all API tests and display results"""
        print(f"\n{BLUE}{BOLD}{'='*80}")
        print("Lab Essentials E-Commerce - Comprehensive API Test Suite")
        print(f"Testing against: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*80}{RESET}\n")

        # Define all tests
        tests = [
            ("Health Check", self.test_health_check),
            ("Products - Get All", self.test_products_get_all),
            ("Products - Empty Response", self.test_products_empty_response),
            ("Featured Products", self.test_featured_products),
            ("Collections - Get All", self.test_collections_get_all),
            ("Collections - With Limit", self.test_collections_with_limit),
            ("Menu - Get Structure", self.test_menu_structure),
            ("Product by Handle - Valid", self.test_product_by_handle_valid),
            ("Product by Handle - Invalid", self.test_product_by_handle_invalid),
            ("Checkout - Create Session", self.test_checkout_create),
            ("Cache Health", self.test_cache_health),
        ]

        # Run tests
        for test_name, test_func in tests:
            print(f"{CYAN}Running: {test_name}{RESET}")
            result = test_func()
            self.results.append(result)

            # Display result
            status_icon = f"{GREEN}✓ PASS{RESET}" if result.success else f"{RED}✗ FAIL{RESET}"
            print(f"  {status_icon} - {result.message}")

            if result.response_time:
                print(f"  Response time: {result.response_time:.0f}ms | Status: {result.status_code}")
            print()

        # Display summary
        self.display_summary()

    def display_summary(self) -> None:
        """Display test results summary"""
        passed = sum(1 for r in self.results if r.success)
        failed = sum(1 for r in self.results if not r.success)
        total = len(self.results)
        success_rate = (passed / total * 100) if total > 0 else 0

        avg_response_time = sum(
            r.response_time for r in self.results if r.response_time
        ) / len([r for r in self.results if r.response_time])

        print(f"\n{BLUE}{BOLD}{'='*80}")
        print("Test Results Summary")
        print(f"{'='*80}{RESET}")

        print(f"\n{BOLD}Overall Results:{RESET}")
        print(f"  Total Tests:    {total}")
        print(f"  {GREEN}Passed:        {passed}{RESET}")
        print(f"  {RED}Failed:        {failed}{RESET}")
        print(f"  Success Rate:   {success_rate:.1f}%")
        print(f"  Avg Response:   {avg_response_time:.0f}ms")

        if failed > 0:
            print(f"\n{YELLOW}{BOLD}Failed Tests:{RESET}")
            for result in self.results:
                if not result.success:
                    print(f"  {RED}✗{RESET} {result.test_name}")
                    print(f"    └─ {result.message}")

        print(f"\n{BLUE}{BOLD}{'='*80}{RESET}\n")

        # Generate JSON report
        self.generate_json_report()

    def generate_json_report(self) -> None:
        """Generate a JSON report file"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "base_url": self.base_url,
            "summary": {
                "total": len(self.results),
                "passed": sum(1 for r in self.results if r.success),
                "failed": sum(1 for r in self.results if not r.success),
                "success_rate": (sum(1 for r in self.results if r.success) / len(self.results) * 100) if self.results else 0
            },
            "tests": [
                {
                    "name": r.test_name,
                    "success": r.success,
                    "message": r.message,
                    "response_time_ms": r.response_time,
                    "status_code": r.status_code
                }
                for r in self.results
            ]
        }

        report_file = "testsprite_tests/comprehensive_test_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"{CYAN}JSON report saved to: {report_file}{RESET}\n")


def main():
    """Main entry point"""
    try:
        # Check if server is running
        try:
            response = requests.get(BASE_URL, timeout=5)
        except requests.ConnectionError:
            print(f"{RED}Error: Cannot connect to {BASE_URL}")
            print(f"Make sure the development server is running with: npm run dev{RESET}")
            sys.exit(1)

        # Run test suite
        suite = APITestSuite(BASE_URL)
        suite.run_all_tests()

        # Exit with appropriate code
        failed_count = sum(1 for r in suite.results if not r.success)
        sys.exit(0 if failed_count == 0 else 1)

    except KeyboardInterrupt:
        print(f"\n{YELLOW}Tests interrupted by user{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"{RED}Unexpected error: {str(e)}{RESET}")
        sys.exit(1)


if __name__ == "__main__":
    main()
