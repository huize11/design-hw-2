// Optional AI proxy for Canvas Feedback.
// Keeps your Anthropic API key on a server instead of in the browser.
// Run locally:  ANTHROPIC_API_KEY=sk-ant-... node proxy/server.mjs
// Then build the app with VITE_AI_ENDPOINT=http://localhost:8787/ai
// Deploy anywhere that runs Node 18+ (Render, Railway, Fly.io, a VPS).
import { createServer } from 'node:http';

const PORT = process.env.PORT || 8787;
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.AI_MODEL || 'claude-sonnet-5-5';
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*'; // set to your Pages URL in production

const SYSTEM = `You help designers act on feedback from managers and stakeholders inside a design feedback tool.
Be concrete and brief. Speak in design terms (contrast, spacing, hierarchy, type, color). Never invent facts about the design.`;

const PROMPTS = {
  summarize: (i) => ({
    prompt: `Summarize these open feedback comments as 1-3 short, actionable sentences a designer can work from. Plain text only.\n\n${JSON.stringify(i.comments)}`,
    json: false,
  }),
  interpret: (i) => ({
    prompt: `A manager left this comment on a design: "${i.comment}".
If it is vague, return JSON {"phrase": the vague words, "meanings": up to 3 concrete design changes they likely mean, "followUp": one short question the designer can send to confirm}.
If it is already specific, return {"phrase":"", "meanings":[], "followUp":""}. Return JSON only.`,
    json: true,
  }),
  update: (i) => ({
    prompt: `Write a 2-3 sentence progress update for the project "${i.project}" from these tasks. Mention what was resolved, what is still open (call out high priority), and what is next. Plain text, no greeting.\n\n${JSON.stringify(i.tasks)}`,
    json: false,
  }),
  edit: (i) => ({
    prompt: `Rewrite this progress update for "${i.project}" following the instruction. Return only the new text.\n\nInstruction: ${i.instruction}\n\nUpdate: ${i.text}`,
    json: false,
  }),
};

async function ask(task, input) {
  const p = PROMPTS[task]?.(input ?? {});
  if (!p) throw new Error(`Unknown task: ${task}`);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, system: SYSTEM, messages: [{ role: 'user', content: p.prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  if (!p.json) return text;
  const parsed = JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
  return parsed.phrase ? parsed : null;
}

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  if (req.method !== 'POST' || !req.url.startsWith('/ai')) return res.writeHead(404).end();
  if (!KEY) return res.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set' }));
  let body = '';
  for await (const chunk of req) body += chunk;
  try {
    const { task, input } = JSON.parse(body || '{}');
    const result = await ask(task, input);
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ result }));
  } catch (err) {
    console.error(err);
    res.writeHead(502, { 'content-type': 'application/json' }).end(JSON.stringify({ error: String(err.message || err) }));
  }
}).listen(PORT, () => console.log(`AI proxy on http://localhost:${PORT}/ai (model ${MODEL})`));
