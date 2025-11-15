import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve the frontend

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /prompt  ->  { category?: "gratitude" | "growth" | ... }
app.post('/prompt', async (req, res) => {
  const category = (req.body?.category || '').trim();
  const categoryText = category ? ` in the category: ${category}` : '';

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input:
        `Generate ONE thoughtful, non-cliché journaling prompt${categoryText}.
         Constraints:
         - 1–2 sentences, open-ended, introspective, specific enough to spark writing.
         - No lists, no quotes, no emojis, no “write about …” boilerplate.
         - Return ONLY the prompt text.`
    });

    const text =
      response.output_text?.trim() ||
      response.output?.[0]?.content?.[0]?.text?.trim() ||
      'What felt most meaningful today, and why?';

    res.json({ prompt: text });
  } catch (err) {
    console.error('[ERROR] /prompt:', err?.response?.data || err.message || err);
    // Provide a graceful fallback so the UI still works.
    res.status(200).json({ prompt: 'Where did you show courage—large or small—today?' });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
