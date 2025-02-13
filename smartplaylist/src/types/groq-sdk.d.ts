declare module '@groq/groq-sdk' {
  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatCompletionChoice {
    message?: ChatMessage;
    index: number;
    finish_reason?: string;
  }

  export interface ChatCompletion {
    id: string;
    choices: ChatCompletionChoice[];
    created: number;
    model: string;
  }

  export interface ChatCompletionOptions {
    messages: ChatMessage[];
    model: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }

  export class Groq {
    constructor(config: { apiKey: string });
    chat: {
      completions: {
        create(options: ChatCompletionOptions): Promise<ChatCompletion>;
      };
    };
  }
} 