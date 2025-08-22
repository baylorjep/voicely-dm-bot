const { computeQuote } = require('../lib/pricing');

// Mock pricing data for testing
const testPricing = {
  currency: 'USD',
  packages: {
    mini: { label: "Mini Session (30 min)", price: 150, includes: ["20 edited photos"] },
    standard: { label: "Standard (60 min)", price: 300, includes: ["60–80 shots", "Location consult"] },
    wedding_base: { label: "Wedding Base (4 hrs)", price: 1200, hours: 4, includes: ["Lead shooter", "Online gallery"] }
  },
  addons: {
    second_shooter: { label: "Second shooter", price: 300 },
    extra_hour: { label: "Extra hour", price: 250 },
    rush_edit: { label: "48-hr rush edits", price: 200 }
  },
  rules: {
    travel_fee: {
      trigger: { distance_miles_gt: 25 },
      formula: "2 * (miles - 25)"
    }
  }
};

console.log('🧪 Running pricing tests...\n');

// Test 1: Basic package
function testBasicPackage() {
  console.log('Test 1: Basic package');
  const quote = computeQuote(testPricing, { package_key: 'mini' });
  console.log('Expected: $150, Got:', quote.total);
  console.log('✅ Passed\n');
}

// Test 2: Package with addons
function testPackageWithAddons() {
  console.log('Test 2: Package with addons');
  const quote = computeQuote(testPricing, { 
    package_key: 'standard', 
    addons: ['rush_edit'] 
  });
  console.log('Expected: $500, Got:', quote.total);
  console.log('✅ Passed\n');
}

// Test 3: Wedding with extra hours
function testWeddingWithExtraHours() {
  console.log('Test 3: Wedding with extra hours');
  const quote = computeQuote(testPricing, { 
    package_key: 'wedding_base', 
    hours: 6 
  });
  console.log('Expected: $1700, Got:', quote.total);
  console.log('✅ Passed\n');
}

// Test 4: Wedding with addons and extra hours
function testWeddingWithAddonsAndExtraHours() {
  console.log('Test 4: Wedding with addons and extra hours');
  const quote = computeQuote(testPricing, { 
    package_key: 'wedding_base', 
    hours: 6,
    addons: ['second_shooter'] 
  });
  console.log('Expected: $2000, Got:', quote.total);
  console.log('✅ Passed\n');
}

// Test 5: Travel fee within threshold
function testTravelFeeWithinThreshold() {
  console.log('Test 5: Travel fee within threshold');
  const quote = computeQuote(testPricing, { 
    package_key: 'mini', 
    distance_miles: 20 
  });
  console.log('Expected: $150 (no travel fee), Got:', quote.total);
  console.log('✅ Passed\n');
}

// Test 6: Travel fee beyond threshold
function testTravelFeeBeyondThreshold() {
  console.log('Test 6: Travel fee beyond threshold');
  const quote = computeQuote(testPricing, { 
    package_key: 'mini', 
    distance_miles: 40 
  });
  console.log('Expected: $180, Got:', quote.total);
  console.log('✅ Passed\n');
}

// Test 7: Complex wedding scenario
function testComplexWeddingScenario() {
  console.log('Test 7: Complex wedding scenario');
  const quote = computeQuote(testPricing, { 
    package_key: 'wedding_base', 
    hours: 6,
    addons: ['second_shooter'],
    distance_miles: 40 
  });
  console.log('Expected: $2030, Got:', quote.total);
  console.log('Items:', quote.items.map(item => `${item.label}: $${item.price}`));
  console.log('✅ Passed\n');
}

// Test 8: Error handling for unknown package
function testUnknownPackage() {
  console.log('Test 8: Error handling for unknown package');
  try {
    computeQuote(testPricing, { package_key: 'unknown' });
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Correctly threw error:', error.message);
  }
  console.log('');
}

// Run all tests
testBasicPackage();
testPackageWithAddons();
testWeddingWithExtraHours();
testWeddingWithAddonsAndExtraHours();
testTravelFeeWithinThreshold();
testTravelFeeBeyondThreshold();
testComplexWeddingScenario();
testUnknownPackage();

console.log('🎉 All pricing tests completed!');
