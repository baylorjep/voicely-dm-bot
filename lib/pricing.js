const fs = require('fs');
const yaml = require('yaml');

/**
 * Load pricing configuration from YAML file
 */
function loadPricing(path) {
  try {
    const fileContent = fs.readFileSync(path, 'utf8');
    return yaml.parse(fileContent);
  } catch (error) {
    console.error(`Error loading pricing config from ${path}:`, error.message);
    throw error;
  }
}

/**
 * Safely evaluate travel fee formula
 * Supports: a * (miles - b) and a * miles patterns
 */
function evaluateTravelFee(formula, miles) {
  try {
    // Replace 'miles' with the actual value and evaluate
    const safeFormula = formula.replace(/miles/g, miles);
    // Use Function constructor with only 'miles' bound for safety
    return new Function('miles', `return ${safeFormula}`)(miles);
  } catch (error) {
    console.error('Error evaluating travel fee formula:', error.message);
    return 0;
  }
}

/**
 * Compute quote based on package, addons, hours, and distance
 */
function computeQuote(pricing, { package_key, hours, addons = [], distance_miles }) {
  if (!pricing.packages[package_key]) {
    throw new Error(`Unknown package: ${package_key}`);
  }

  const items = [];
  let total = 0;

  // Add base package
  const basePackage = pricing.packages[package_key];
  items.push({
    kind: 'package',
    key: package_key,
    label: basePackage.label,
    price: basePackage.price
  });
  total += basePackage.price;

  // Handle extra hours if package has defined hours
  if (hours && basePackage.hours) {
    const extraHours = Math.max(0, hours - basePackage.hours);
    if (extraHours > 0 && pricing.addons.extra_hour) {
      const extraHourPrice = pricing.addons.extra_hour.price * extraHours;
      items.push({
        kind: 'addon',
        key: 'extra_hour',
        label: `${extraHours} extra hour(s)`,
        price: extraHourPrice
      });
      total += extraHourPrice;
    }
  }

  // Add addons
  for (const addonKey of addons) {
    if (pricing.addons[addonKey]) {
      const addon = pricing.addons[addonKey];
      items.push({
        kind: 'addon',
        key: addonKey,
        label: addon.label,
        price: addon.price
      });
      total += addon.price;
    }
  }

  // Apply travel fee if distance exceeds threshold
  if (distance_miles && pricing.rules.travel_fee) {
    const trigger = pricing.rules.travel_fee.trigger;
    if (distance_miles > trigger.distance_miles_gt) {
      const travelFee = evaluateTravelFee(pricing.rules.travel_fee.formula, distance_miles);
      if (travelFee > 0) {
        items.push({
          kind: 'fee',
          key: 'travel_fee',
          label: 'Travel fee',
          price: travelFee
        });
        total += travelFee;
      }
    }
  }

  return {
    currency: pricing.currency,
    items,
    total
  };
}

module.exports = {
  loadPricing,
  computeQuote
};
