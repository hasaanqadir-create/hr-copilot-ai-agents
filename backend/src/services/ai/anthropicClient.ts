import { env } from '../../config/env';
import { AiClient, AiCompletionOptions } from './types';

export class AnthropicClient implements AiClient {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = env.anthropicApiKey;
    this.model = env.anthropicModel;
  }

  async complete(options: AiCompletionOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set. Add it to backend/.env to enable AI agents.');
    }

    const systemMsg = options.messages.find((m) => m.role === 'system');
    const conversational = options.messages.filter((m) => m.role !== 'system');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.3,
        system: systemMsg?.content,
        messages: conversational.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const textBlock = data.content?.find((c: { type: string }) => c.type === 'text');
    return textBlock?.text ?? '';
  }
}
