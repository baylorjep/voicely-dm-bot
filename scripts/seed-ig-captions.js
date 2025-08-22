#!/usr/bin/env node

/**
 * Seed script to fetch recent IG captions and update the style guide
 * 
 * This script demonstrates the expected structure for:
 * 1. Fetching recent captions from Instagram API
 * 2. Analyzing common phrases and emoji usage
 * 3. Updating voice configuration
 */

const fs = require('fs');
const path = require('path');

// Mock Instagram API response (replace with actual API call)
const mockInstagramResponse = {
  data: [
    {
      id: '123456789',
      caption: 'So pumped to share these shots from yesterday\'s session! ✨ The light was absolutely perfect and the couple was amazing to work with. Love when everything comes together like this 🙌 #photography #coupleshoot'
    },
    {
      id: '123456790',
      caption: 'Behind the scenes from today\'s wedding! The venue was stunning and the couple was so in love. Can\'t wait to share the final images with you all 💕 #weddingphotography #behindthescenes'
    },
    {
      id: '123456791',
      caption: 'Just wrapped up an incredible engagement session! The sunset was everything and these two were so natural in front of the camera. Love this job! 🌅 #engagement #sunset'
    },
    {
      id: '123456792',
      caption: 'Happy to announce I\'m now booking for spring 2024! Limited dates available, so reach out soon if you\'re interested in working together 📸 #spring2024 #booking'
    },
    {
      id: '123456793',
      caption: 'Thank you to everyone who reached out about the mini sessions! You all are the best. Still have a few spots left for next weekend if anyone is interested 🙏 #minisessions'
    }
  ]
};

/**
 * Analyze captions for common phrases and emoji usage
 */
function analyzeCaptions(captions) {
  const phrases = [];
  const emojiCount = {};
  
  captions.forEach(post => {
    if (post.caption) {
      // Extract common phrases (simple approach for MVP)
      const sentences = post.caption.split(/[.!?]+/).filter(s => s.trim().length > 10);
      phrases.push(...sentences);
      
      // Count emojis
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojis = post.caption.match(emojiRegex) || [];
      
      emojis.forEach(emoji => {
        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
      });
    }
  });
  
  return { phrases, emojiCount };
}

/**
 * Generate voice captions configuration
 */
function generateVoiceCaptions(analysis) {
  const topPhrases = analysis.phrases
    .slice(0, 20)
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length > 0);
  
  const topEmojis = Object.entries(analysis.emojiCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));
  
  return {
    top_phrases: topPhrases,
    emoji_frequency: topEmojis,
    generated_at: new Date().toISOString()
  };
}

/**
 * Update voice configuration with new insights
 */
function updateVoiceConfig(voiceCaptions, merge = false) {
  const voicePath = path.join(__dirname, '../config/voice.sample.json');
  const currentVoice = JSON.parse(fs.readFileSync(voicePath, 'utf8'));
  
  if (merge) {
    // Merge new phrases with existing ones
    const existingPhrases = currentVoice.style_examples || [];
    const newPhrases = voiceCaptions.top_phrases.slice(0, 5); // Take top 5 new phrases
    currentVoice.style_examples = [...existingPhrases, ...newPhrases];
    
    // Update emoji policy if new favorites found
    const topEmoji = voiceCaptions.emoji_frequency[0]?.emoji;
    if (topEmoji && !currentVoice.emoji_policy.includes(topEmoji)) {
      currentVoice.emoji_policy = currentVoice.emoji_policy.replace(
        'favorites: ✨🙌',
        `favorites: ✨🙌${topEmoji}`
      );
    }
    
    fs.writeFileSync(voicePath, JSON.stringify(currentVoice, null, 2));
    console.log('✅ Voice configuration updated with new insights');
  }
}

/**
 * Main execution
 */
function main() {
  console.log('📸 Fetching Instagram captions...');
  
  // In production, this would be an actual API call:
  // const response = await axios.get(`https://graph.facebook.com/v18.0/${process.env.IG_USER_ID}/media?fields=caption&access_token=${process.env.PAGE_ACCESS_TOKEN}`);
  
  const captions = mockInstagramResponse.data;
  console.log(`📝 Found ${captions.length} posts with captions`);
  
  // Analyze captions
  const analysis = analyzeCaptions(captions);
  console.log(`🔍 Analyzed ${analysis.phrases.length} phrases and ${Object.keys(analysis.emojiCount).length} emojis`);
  
  // Generate voice captions config
  const voiceCaptions = generateVoiceCaptions(analysis);
  
  // Write to file
  const outputPath = path.join(__dirname, '../config/voice.captions.json');
  fs.writeFileSync(outputPath, JSON.stringify(voiceCaptions, null, 2));
  console.log(`💾 Voice captions saved to ${outputPath}`);
  
  // Check if --merge flag is provided
  const shouldMerge = process.argv.includes('--merge');
  if (shouldMerge) {
    updateVoiceConfig(voiceCaptions, true);
  }
  
  console.log('\n📊 Analysis Summary:');
  console.log('Top phrases:', voiceCaptions.top_phrases.slice(0, 3));
  console.log('Top emojis:', voiceCaptions.emoji_frequency.slice(0, 3));
  
  console.log('\n✅ Seed script completed!');
  console.log('\nTo use with real Instagram API:');
  console.log('1. Set IG_USER_ID and PAGE_ACCESS_TOKEN in .env');
  console.log('2. Replace mockInstagramResponse with actual API call');
  console.log('3. Run: node scripts/seed-ig-captions.js --merge');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeCaptions,
  generateVoiceCaptions,
  updateVoiceConfig
};
