import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { getSystemInfo } from './lib/system.js';
import { getModelCatalog, generateAssistantReply } from './lib/llm.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'PC assistant backend is running', timestamp: new Date().toISOString() });
});

app.get('/api/models', (_req, res) => {
  res.json(getModelCatalog());
});

app.get('/api/system-info', (_req, res) => {
  res.json(getSystemInfo());
});

app.post('/api/chat', async (req, res) => {
  const { message, model } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const selectedModel = model || process.env.DEFAULT_MODEL || 'gpt-4o-mini';

  try {
    const reply = await generateAssistantReply({
      message: message.trim(),
      model: selectedModel,
    });

    res.json({
      response: reply,
      model: selectedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to generate a response from the selected LLM.',
      details: messageText,
    });
  }
});

app.listen(port, () => {
  console.log(`PC assistant API listening on http://localhost:${port}`);
});
