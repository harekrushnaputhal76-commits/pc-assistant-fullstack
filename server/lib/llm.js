import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export function getModelCatalog() {
  return [
    {
      id: 'gpt-4o-mini',
      provider: 'openai',
      label: 'OpenAI GPT-4o-mini',
      enabled: Boolean(process.env.OPENAI_API_KEY),
    },
    {
      id: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      label: 'Anthropic Claude 3.5 Sonnet',
      enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    {
      id: 'llama3.1',
      provider: 'ollama',
      label: 'Ollama Llama 3.1',
      enabled: Boolean(process.env.OLLAMA_BASE_URL),
    },
  ];
}

async function callOpenAI(message, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: message }],
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || 'No response from OpenAI.';
}

async function callAnthropic(message, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured.');
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  });

  const text = response.content
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('\n')
    .trim();

  return text || 'No response from Anthropic.';
}

async function callOllama(message, model) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.message?.content?.trim() || 'No response from Ollama.';
}

export async function generateAssistantReply({ message, model }) {
  const lowerModel = model.toLowerCase();

  if (lowerModel.includes('gpt')) {
    return callOpenAI(message, model);
  }

  if (lowerModel.includes('claude')) {
    return callAnthropic(message, model);
  }

  if (lowerModel.includes('llama') || lowerModel.includes('mistral') || model === 'ollama') {
    return callOllama(message, model);
  }

  const providers = getModelCatalog();
  const provider = providers.find((item) => item.id === model)?.provider;

  if (provider === 'openai') return callOpenAI(message, model);
  if (provider === 'anthropic') return callAnthropic(message, model);
  if (provider === 'ollama') return callOllama(message, model);

  return `Model "${model}" is not supported. Use one of the configured providers.`;
}
