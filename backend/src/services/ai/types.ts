/**
 * Provider-agnostic AI client.
 *
 * Every agent calls `getAiClient().complete(...)` instead of talking to a
 * specific vendor SDK. This means switching AI_PROVIDER in .env (openai |
 * gemini | anthropic) changes the entire system's AI backend with zero
 * changes to agent logic.
 */

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  /** If true, instructs the model to return ONLY valid JSON (no prose, no markdown fences). */
  jsonMode?: boolean;
}

export interface AiClient {
  complete(options: AiCompletionOptions): Promise<string>;
}
