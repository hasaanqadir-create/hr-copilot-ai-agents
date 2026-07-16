import { env } from '../../config/env';
import { AiClient, AiCompletionOptions } from './types';

export class GeminiClient implements AiClient {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = env.geminiApiKey;
    this.model = env.geminiModel;
  }

  async complete(options: AiCompletionOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Add it to backend/.env to enable AI agents.');
    }

    const systemMsg = options.messages.find((m) => m.role === 'system');
    const conversational = options.messages.filter((m) => m.role !== 'system');

    const contents = conversational.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.3,
        thinkingConfig: { thinkingLevel: 'minimal' },
        ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };
    
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}
