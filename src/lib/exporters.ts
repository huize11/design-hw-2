import type { Project, Update } from './types';
import { download, slugify } from './util';

function lines(p: Project, u: Update, mark: (done: boolean) => string) {
  const done = p.tasks.filter((t) => u.resolved.includes(t.id));
  const open = p.tasks.filter((t) => !t.doneAt);
  return [...done.map((t) => `${mark(true)} ${t.title}`), ...open.map((t) => `${mark(false)} ${t.title}${t.priority === 'high' ? ' (high)' : ''}`)];
}

export function updateToSlack(p: Project, u: Update, link: string) {
  return [`*${p.name}: progress update*`, u.body, '', ...lines(p, u, (d) => (d ? '✅' : '◻️')), '', `<${link}|Open the project>`].join('\n');
}

export function updateToMailto(p: Project, u: Update, link: string, to: string[]) {
  const body = [u.body, '', ...lines(p, u, (d) => (d ? '✓' : '○')), '', `Open the project: ${link}`].join('\n');
  return `mailto:${encodeURIComponent(to.join(','))}?subject=${encodeURIComponent(`${p.name}: progress update`)}&body=${encodeURIComponent(body)}`;
}

export function downloadUpdate(p: Project, u: Update) {
  const md = [`# ${p.name}: progress update`, `_${new Date(u.createdAt).toLocaleString()}_`, '', u.body, '', '## Tasks', ...lines(p, u, (d) => (d ? '- [x]' : '- [ ]')), ''].join('\n');
  download(`${slugify(p.name)}-update.md`, md, 'text/markdown');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
