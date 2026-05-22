/**
 * NutriVision AI — OpenRouter AI Service
 * Modular adapter for vision + conversational AI.
 */
import { getAIConfig, isAPIConfigured } from '../utils/config';

/**
 * Recognize food items in an image using OpenRouter vision model.
 * @param {string} base64Image - Base64 encoded image
 * @returns {Object} { item, confidence, summary, raw }
 */
export async function recognizeImage(base64Image) {
  if (!isAPIConfigured()) {
    throw new AIError('API key not configured. Go to Settings to add your OpenRouter API key.', 'CONFIG_ERROR');
  }

  const config = getAIConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nutrivision.app',
        'X-Title': 'NutriVision AI',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.visionModel,
        max_tokens: config.maxTokensVision,
        messages: [
          {
            role: 'system',
            content: `You are a vision AI that identifies food items. Analyze the image carefully.

If the image contains food, respond in this exact JSON format (no markdown):
{"item":"food name","confidence":0.85,"summary":"Brief 1-sentence nutrition description","multiple":false,"items":["item1"],"isFood":true,"description":""}

If the image does NOT contain food, still describe what you see. Respond in this exact JSON format (no markdown):
{"item":"unknown","confidence":0.1,"summary":"Not a food item","multiple":false,"items":[],"isFood":false,"description":"Detailed 2-3 sentence description of the object, including what it is, its purpose, notable features, and any interesting facts about it."}

Always include the "description" and "isFood" fields.`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What food item is in this image? Identify it precisely.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new AIError(`API error: ${response.status} ${errBody}`, 'API_ERROR');
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new AIError('Empty response from AI', 'EMPTY_RESPONSE');
    }

    // Parse the JSON response
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        item: parsed.item || 'unknown',
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        summary: parsed.summary || `Detected: ${parsed.item}`,
        multiple: parsed.multiple || false,
        items: parsed.items || [parsed.item],
        isFood: parsed.isFood !== false,
        description: parsed.description || '',
        raw: content,
      };
    } catch {
      // Fallback: extract item name from text
      const itemMatch = content.match(/(?:item|food|detect)[:\s]*["']?(\w[\w\s]+)/i);
      return {
        item: itemMatch ? itemMatch[1].trim() : 'unknown',
        confidence: 0.5,
        summary: content.substring(0, 150),
        multiple: false,
        items: [],
        raw: content,
      };
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new AIError('Request timed out. Please try again.', 'TIMEOUT');
    }
    if (error instanceof AIError) throw error;
    throw new AIError(`Network error: ${error.message}`, 'NETWORK_ERROR');
  }
}

/**
 * Chat with AI assistant.
 * @param {Array} messages - Chat messages [{role, content}]
 * @param {string} systemPrompt - System context
 * @returns {string} AI response text
 */
export async function chatWithAI(messages, systemPrompt) {
  if (!isAPIConfigured()) {
    throw new AIError('API key not configured.', 'CONFIG_ERROR');
  }

  const config = getAIConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nutrivision.app',
        'X-Title': 'NutriVision AI',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.chatModel,
        max_tokens: config.maxTokensChat,
        messages: allMessages,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new AIError(`API error: ${response.status}`, 'API_ERROR');
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new AIError('Empty response from AI', 'EMPTY_RESPONSE');
    }

    return content.trim();
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new AIError('Request timed out.', 'TIMEOUT');
    }
    if (error instanceof AIError) throw error;
    throw new AIError(`Network error: ${error.message}`, 'NETWORK_ERROR');
  }
}

/**
 * Custom AI error class.
 */
export class AIError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}
