import { env } from '../../config/env';
import { AiClient } from './types';
import { OpenAiClient } from './openaiClient';
import { GeminiClient } from './geminiClient';
import { AnthropicClient } from './anthropicClient';

let cachedClient: AiClient | null = null;

export function getAiClient(): AiClient {
  if (cachedClient) return cachedClient;

  switch (env.aiProvider) {
    case 'openai':
      cachedClient = new OpenAiClient();
      break;
    case 'gemini':
      cachedClient = new GeminiClient();
      break;
    case 'anthropic':
      cachedClient = new AnthropicClient();
      break;
    default:
      throw new Error(`Unknown AI_PROVIDER: ${env.aiProvider}`);
  }

  return cachedClient;
}

/**
 * Helper for agents that expect a JSON object back from the model.
 * Strips markdown code fences defensively in case the model ignores jsonMode.
 */
export async function completeJson<T>(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const client = getAiClient();
  const raw = await client.complete({
    messages: [
      { role: 'system', content: args.system },
      { role: 'user', content: args.user },
    ],
    jsonMode: true,
    maxTokens: args.maxTokens ?? 1200,
    temperature: 0.2,
  });

  const cleaned = raw.replace(/```json\s*|```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('[completeJson] FULL raw output (length:', raw.length, '):', raw);
    throw new Error(`AI did not return valid JSON. Raw output length: ${raw.length}. Last 200 chars: ${raw.slice(-200)}`);
  }
}
