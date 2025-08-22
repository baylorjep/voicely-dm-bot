const OpenAI = require('openai');

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Decide action based on user text and voice/persona config
 */
async function decideAction({ userText, voice, persona }) {
  const systemPrompt = `You are a DM assistant that writes like the creator.

Your #1 job is to build connection in the creator's voice.

Do not jump to pricing unless user explicitly asks or scope is clear.

Never invent prices; you may only choose package/add-ons; server computes totals.

Stay concise; ask at most 1–2 clarifying questions at a time.

Avoid: ${voice.no_go_phrases.join(', ')}

Voice tone: ${voice.tone}
Emoji policy: ${voice.emoji_policy}

Available packages: mini, standard, wedding_base
Available addons: second_shooter, extra_hour, rush_edit

${persona.boundaries.when_to_quote}
Handoff if: ${persona.boundaries.handoff_if.join(', ')}`;

  const tools = [
    {
      type: "function",
      function: {
        name: "warm_reply",
        description: "Send a warm, on-brand reply in creator's voice",
        parameters: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The reply text in creator's voice"
            }
          },
          required: ["text"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ask_clarifying",
        description: "Ask clarifying questions to gather more information",
        parameters: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" },
              description: "List of clarifying questions to ask"
            }
          },
          required: ["questions"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "make_quote",
        description: "Request a quote with specific package and options",
        parameters: {
          type: "object",
          properties: {
            package_key: {
              type: "string",
              enum: ["mini", "standard", "wedding_base"],
              description: "The package to quote"
            },
            hours: {
              type: "number",
              description: "Number of hours needed (optional)"
            },
            addons: {
              type: "array",
              items: { type: "string" },
              description: "List of addon keys (optional)"
            },
            distance_miles: {
              type: "number",
              description: "Distance in miles for travel fee (optional)"
            },
            notes: {
              type: "string",
              description: "Additional notes for the quote (optional)"
            }
          },
          required: ["package_key"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "booking",
        description: "Provide booking link to user",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The booking URL"
            }
          },
          required: ["url"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "handoff_to_human",
        description: "Hand off to human for complex requests",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "Reason for handoff"
            }
          },
          required: ["reason"]
        }
      }
    }
  ];

  if (!openai) {
    console.error('OpenAI API key not configured');
    return { type: 'WARM_REPLY', text: "Thanks for reaching out! How can I help?" };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText }
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.5,
    });

    const response = completion.choices[0];
    
    if (response.message.tool_calls && response.message.tool_calls.length > 0) {
      const toolCall = response.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      
      switch (toolCall.function.name) {
        case 'warm_reply':
          return { type: 'WARM_REPLY', text: args.text };
        case 'ask_clarifying':
          return { type: 'ASK', questions: args.questions };
        case 'make_quote':
          return { type: 'QUOTE_REQUEST', args };
        case 'booking':
          return { type: 'BOOKING', url: args.url };
        case 'handoff_to_human':
          return { type: 'HUMAN', reason: args.reason };
        default:
          return { type: 'WARM_REPLY', text: "Thanks for reaching out! How can I help?" };
      }
    } else {
      // Fallback to warm reply if no tool call
      return { type: 'WARM_REPLY', text: response.message.content || "Thanks for reaching out! How can I help?" };
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error.message);
    return { type: 'WARM_REPLY', text: "Thanks for reaching out! How can I help?" };
  }
}

module.exports = {
  decideAction
};
