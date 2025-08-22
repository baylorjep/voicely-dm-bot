const fs = require('fs');

/**
 * Load voice configuration from JSON file
 */
function loadVoice(path) {
  try {
    const fileContent = fs.readFileSync(path, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading voice config from ${path}:`, error.message);
    throw error;
  }
}

/**
 * Load persona configuration from JSON file
 */
function loadPersona(path) {
  try {
    const fileContent = fs.readFileSync(path, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading persona config from ${path}:`, error.message);
    throw error;
  }
}

/**
 * Draft quote text in creator's voice
 */
function draftQuoteText({ voice, quote, persona }) {
  const currencySymbol = quote.currency === 'USD' ? '$' : quote.currency;
  
  // Quick opener in voice
  const opener = "Here's what that would look like:";
  
  // Line items as bullets
  const lineItems = quote.items.map(item => 
    `• ${item.label}: ${currencySymbol}${item.price}`
  ).join('\n');
  
  // Total with currency symbol
  const total = `${quote.currency === 'USD' ? 'Total' : 'Total'}: ${currencySymbol}${quote.total}`;
  
  // Soft CTA from persona
  const cta = persona.booking.softener;
  
  // Combine with minimal emoji (0-1 per message policy)
  const message = `${opener}\n\n${lineItems}\n\n${total}\n\n${cta}`;
  
  return message;
}

module.exports = {
  loadVoice,
  loadPersona,
  draftQuoteText
};
