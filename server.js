import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// serve the static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API endpoint for prompt
app.post('/prompt', async (req, res) => {
  const category = (req.body?.category || '').trim();
  const categoryText = category ? ` in the category: ${category}` : '';
  try {
    const r = await openai.responses.create({
      model: 'gpt-4o-mini',
      input:
        `Generate ONE thoughtful, non-cliché journaling prompt${categoryText}.
         Constraints:
         - 1–2 sentences, open-ended, introspective, specific enough to spark writing.
         - No lists, no quotes, no emojis, no “write about …”.
         - Return ONLY the prompt text.`
    });

    const text = (r.output_text || '').trim() || 'What felt most meaningful today, and why?';
    res.json({ prompt: text });
  } catch (err) {
    console.error('[ERROR] /prompt:', err?.response?.data || err.message || err);
    // Return a safe fallback prompt so the page doesn't break
    res.status(200).json({ prompt: 'Where did you show courage—large or small—today?' });
  }
});

// IMPORTANT for Render: bind to PORT **and** host 0.0.0.0
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
