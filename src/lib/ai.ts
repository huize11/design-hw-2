import type { Priority, Project } from './types';

/**
 * Feedback intelligence. Works offline with lightweight rules.
 * If VITE_AI_ENDPOINT is set (see /proxy), it asks Claude first and falls back to the rules.
 */
const ENDPOINT = (import.meta.env.VITE_AI_ENDPOINT as string | undefined)?.trim();

async function remote<T>(task: string, input: unknown): Promise<T | null> {
  if (!ENDPOINT) return null;
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, input }) });
    if (!res.ok) return null;
    return ((await res.json())?.result ?? null) as T | null;
  } catch {
    return null;
  }
}

const HIGH = /\b(urgent|asap|blocker|broken|bug|must|critical|launch|trust\w*|wrong|can'?t|confusing|hard to|deadline|contrast|harsh)\b/i;
const LOW = /\b(maybe|nit|nice to have|consider|minor|eventually|could|optional|small)\b/i;

export function detectPriority(text: string): Priority {
  if (HIGH.test(text)) return 'high';
  if (LOW.test(text)) return 'low';
  return 'medium';
}

const VAGUE: [RegExp, string][] = [
  [/\bpop\b|\bstand out\b/i, 'Raise contrast on the most important element'],
  [/\bplayful\b|\bfun\b|\bfriendl\w*\b/i, 'Use rounder shapes and a warmer, brighter palette'],
  [/\bcorporate\b|\bboring\b|\bbland\b/i, 'Add one accent color and a stronger focal point'],
  [/\bbrand(ing)?\b|\bmood ?board\b/i, 'Match the colors and type from the moodboard'],
  [/\bclean\w*\b|\bbusy\b|\bcluttered\b|\btoo many\b/i, 'Remove secondary elements and add whitespace'],
  [/\btrust\w*\b|\bsafe\b/i, 'Add security cues and tighten alignment'],
  [/\bhard to scan\b|\bconfus\w*\b/i, 'Make the hierarchy clearer with fewer type sizes'],
];

function firstSentence(s: string) {
  const clean = s.replace(/\bhttps?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  const m = clean.match(/^(.+?[.!?])(\s|$)/);
  const out = (m ? m[1] : clean).trim();
  return /[.!?]$/.test(out) ? out : `${out}.`;
}

/** One or two sentences summarizing what's being asked on a section. */
export function summarizeComments(bodies: string[]): string {
  if (!bodies.length) return 'No requested changes yet.';
  const lines = bodies.slice(0, 3).map((b) => {
    const hit = VAGUE.find(([re]) => re.test(b));
    return hit ? `${hit[1]}.` : firstSentence(b);
  });
  return Array.from(new Set(lines)).slice(0, 2).join(' ');
}

/** "Use AI to add task": plain language like "fix footer spacing by fri !high". */
export function parseTaskInput(text: string): { title: string; priority: Priority; due?: string } {
  let title = text.trim();
  let priority: Priority | undefined;
  const p = title.match(/!(high|med(ium)?|low)\b/i);
  if (p) {
    priority = p[1].toLowerCase().startsWith('h') ? 'high' : p[1].toLowerCase().startsWith('l') ? 'low' : 'medium';
    title = title.replace(p[0], '').trim();
  }
  let due: string | undefined;
  const d = title.match(/\b(?:by|due)\s+(today|tomorrow|mon|tue|wed|thu|fri|sat|sun)\w*\b/i);
  if (d) {
    due = d[1].charAt(0).toUpperCase() + d[1].slice(1).toLowerCase();
    title = title.replace(d[0], '').trim();
  }
  return { title: title.charAt(0).toUpperCase() + title.slice(1), priority: priority ?? detectPriority(text), due };
}

export function draftUpdateOffline(p: Project): string {
  const since = p.updates[0]?.createdAt ?? 0;
  const resolved = p.tasks.filter((t) => t.doneAt && t.doneAt > since);
  const open = p.tasks.filter((t) => !t.doneAt);
  const high = open.filter((t) => t.priority === 'high');
  const parts: string[] = [];
  if (resolved.length) parts.push(`Done: ${resolved.slice(0, 3).map((t) => t.title.toLowerCase()).join('; ')}${resolved.length > 3 ? ` and ${resolved.length - 3} more` : ''}.`);
  else parts.push('No tasks closed since the last update yet.');
  parts.push(`${open.length} still open${high.length ? `, ${high.length} high priority` : ''}.`);
  if (high[0] ?? open[0]) parts.push(`Next up: ${(high[0] ?? open[0]).title.toLowerCase()}.`);
  return parts.join(' ');
}

export async function draftUpdate(p: Project): Promise<string> {
  const r = await remote<string>('update', { project: p.name, tasks: p.tasks.map((t) => ({ title: t.title, priority: t.priority, done: !!t.doneAt })) });
  return r ?? draftUpdateOffline(p);
}

/** "Ask AI to edit" on the update draft. Offline mode understands common asks. */
export async function editDraft(text: string, ask: string, p: Project): Promise<{ text: string; understood: boolean }> {
  const r = await remote<string>('edit', { text, instruction: ask, project: p.name });
  if (r) return { text: r, understood: true };
  const a = ask.toLowerCase();
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];
  const tag = a.match(/\b(?:tag|mention|cc)\s+@?([a-z][\w.-]*)/i);
  if (tag) return { text: `@${tag[1].charAt(0).toUpperCase() + tag[1].slice(1)} ${text}`, understood: true };
  if (/short|brief|concise|tl;?dr/.test(a)) return { text: sentences.slice(0, 2).join(' '), understood: true };
  if (/friendl|casual|warm/.test(a)) return { text: `Hi team! ${text}`, understood: true };
  if (/formal|professional/.test(a)) return { text: `Hello everyone, here is today's progress on ${p.name}. ${text}`, understood: true };
  if (/question|thoughts|feedback|input/.test(a)) return { text: `${text} Any thoughts before I keep going?`, understood: true };
  if (/next|plan|left/.test(a)) {
    const open = p.tasks.filter((t) => !t.doneAt).slice(0, 3).map((t) => t.title.toLowerCase());
    return { text: `${text} Still on the list: ${open.join('; ')}.`, understood: true };
  }
  return { text, understood: false };
}
