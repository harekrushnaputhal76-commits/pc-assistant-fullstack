# PC Assistant Full Stack

A full-stack PC assistant app that connects to multiple LLM providers:
- OpenAI
- Anthropic
- Ollama

Features
- Multi-model chat UI
- Environment model switching
- PC/system info panel
- Backend API for chat and health checks
- Simple local-first architecture

Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- LLM providers: OpenAI, Anthropic, Ollama

Quick start
1. Copy the example environment file:
   cp .env.example .env
2. Fill in any API keys you want to enable.
3. Install dependencies:
   npm install
4. Start the app:
   npm run dev

App URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

Notes
- For local Ollama models, make sure Ollama is running and the model is installed.
- Example: `ollama pull llama3.1`
- If no API key is set for a provider, the model will be listed as unavailable in the UI.
