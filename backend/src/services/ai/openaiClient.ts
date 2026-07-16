import { env } from '../../config/env';
import { AiClient, AiCompletionOptions } from './types';

export class OpenAiClient implements AiClient {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = env.openaiApiKey;
    this.model = env.openaiModel;
  }

  async complete(options: AiCompletionOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Add it to backend/.env to enable AI agents.');
    }

    const messages = options.jsonMode
      ? [
          ...options.messages.slice(0, -1),
          {
            ...options.messages[options.messages.length - 1],
            content:
              options.messages[options.messages.length - 1].content +
              '\n\nRespond with ONLY valid JSON. No markdown fences, no preamble.',
          },
        ]
      : options.messages;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.3,
        ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}
