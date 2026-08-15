import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load secrets only on the server.
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || '*';

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not configured. /api/chat will not work until you set it.');
}

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin }));
app.use(express.json({ limit: '256kb' }));

// Small in-memory protection against accidental request floods.
const requestLog = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

function getClientKey(req) {
  return req.ip || req.headers['x-forwarded-for'] || 'unknown';
}

function allowedRequest(req) {
  const now = Date.now();
  const key = getClientKey(req);
  const old = requestLog.get(key) || [];
  const recent = old.filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, recent);
    return false;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return true;
}

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    ai_configured: Boolean(client),
    model: process.env.OPENAI_MODEL || 'gpt-5.6'
  });
});

app.post('/api/chat', async (req, res) => {
  if (!allowedRequest(req)) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'
    });
  }

  if (!client) {
    return res.status(500).json({
      success: false,
      error: 'La IA no está configurada en el servidor. Falta OPENAI_API_KEY.'
    });
  }

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const systemPrompt = typeof body.system_prompt === 'string' ? body.system_prompt : '';
  const requestedModel = typeof body.model === 'string' ? body.model : '';
  const reasoning = body.reasoning === 'high' ? 'high' : 'medium';

  if (!messages.length) {
    return res.status(400).json({ success: false, error: 'No se recibieron mensajes.' });
  }

  // Keep the request bounded so a giant browser payload cannot exhaust the server.
  const safeMessages = messages.slice(-30).map((message) => ({
    role: message?.role === 'assistant' ? 'assistant' : 'user',
    content: String(message?.content || '').slice(0, 12000)
  }));

  try {
    const response = await client.responses.create({
      // The frontend sends "high" as a UI quality level, not as a model name.
      // The actual API model is selected here on the server.
      model: process.env.OPENAI_MODEL || requestedModel || 'gpt-5.6',
      instructions: systemPrompt || undefined,
      input: safeMessages,
      reasoning: { effort: reasoning }
    });

    return res.json({
      success: true,
      response: String(response.output_text || '')
    });
  } catch (error) {
    console.error('OpenAI API error:', error?.status, error?.message || error);

    const status = Number(error?.status) >= 400 && Number(error?.status) < 600
      ? Number(error.status)
      : 502;

    return res.status(status).json({
      success: false,
      error: 'La IA no pudo responder. Revisa la configuración del servidor y vuelve a intentarlo.'
    });
  }
});

// Serve the existing website from the same server, so /api/chat and the page share one origin.
app.use(express.static(__dirname, { index: 'index.html' }));

app.listen(port, () => {
  console.log(`Aintegred running at http://localhost:${port}`);
});
