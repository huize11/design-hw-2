import type { AppState, Project, Section } from './types';

const swatch = (bg: string, fg: string) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="${bg}"/><circle cx="420" cy="140" r="120" fill="${fg}" opacity=".55"/><rect x="60" y="250" width="320" height="90" rx="20" fill="${fg}" opacity=".35"/></svg>`);

export const TINTS = ['#F5F2EC', '#E8E2EA', '#E1E6DD', '#EDE7DD', '#EFE6DB'];

export function seedState(): AppState {
  const now = Date.now();
  const h = 3600_000;
  const me = { id: 'p-me', name: 'You', role: 'Designer' };
  const mgr = { id: 'p-mgr', name: 'Manager', role: 'Manager' };
  const dev = { id: 'p-dev', name: 'Priya', role: 'Developer' };

  const sections: Section[] = [
    { id: 's-signin', name: 'Sign in flow', tint: '#F5F2EC', size: 'tall', kind: 'mock', mock: 'signin', x: 40, y: 560, w: 316, h: 204, priority: 'high', summary: 'Make the sign in form feel friendlier: softer button color and clearer error states.' },
    { id: 's-email', name: 'Email Templates', tint: '#E8E2EA', size: 'small', kind: 'mock', mock: 'email', x: 250, y: 820, w: 316, h: 204, priority: 'medium', summary: 'Change design to match the new moodboard. Change colors to be more playful.' },
    { id: 's-email2', name: 'Email Templates 2', tint: '#E8E2EA', size: 'small', kind: 'mock', mock: 'email', x: 40, y: 1080, w: 316, h: 204 },
    { id: 's-tokens', name: 'Design System', tint: '#E1E6DD', size: 'wide', kind: 'mock', mock: 'tokens', x: 250, y: 1340, w: 316, h: 204, summary: 'Swap the primary red for a warmer coral and add a tertiary background.' },
    { id: 's-home', name: 'Home Page', tint: '#F5F2EC', size: 'tall', kind: 'mock', mock: 'search', x: 40, y: 40, w: 316, h: 204, priority: 'high', summary: 'Simplify the filter column and raise contrast on the results table so the top match stands out.' },
    { id: 's-compare', name: 'Screen 2', tint: '#EDE7DD', size: 'small', kind: 'mock', mock: 'compare', x: 250, y: 300, w: 316, h: 204 },
  ];

  const work: Project = {
    id: 'work-1',
    name: 'Work 1',
    description: 'Patent search product: home, comparisons and emails.',
    tint: '#EDE7DD',
    createdAt: now - 96 * h,
    updatedAt: now - 2 * h,
    sections,
    order: ['s-signin', 's-email', 's-email2', 's-tokens', 's-home', 's-compare'],
    members: [
      { ...me, access: 'Owner' },
      { ...mgr, access: 'Can comment' },
    ],
    comments: [
      { id: 'c1', sectionId: 's-email', authorId: mgr.id, body: 'Change the branding. Reference this mood board instead.', createdAt: now - 2 * h, attachments: [
        { id: 'a1', kind: 'image', url: swatch('#DED3C6', '#C9B8A4'), name: 'Warm' },
        { id: 'a2', kind: 'image', url: swatch('#DFE6DD', '#BCCDB8'), name: 'Sage' },
        { id: 'a3', kind: 'image', url: swatch('#E6E1EA', '#C9BDD3'), name: 'Lilac' },
        { id: 'a4', kind: 'link', url: 'https://example.com' },
      ] },
      { id: 'c2', sectionId: 's-email', authorId: mgr.id, body: 'Can the colors be more playful? It feels a bit corporate.', createdAt: now - 90 * 60_000, attachments: [] },
      { id: 'c3', sectionId: 's-home', authorId: mgr.id, body: 'The results table is hard to scan. Make the top match pop more.', createdAt: now - h, attachments: [] },
      { id: 'c4', sectionId: 's-home', authorId: mgr.id, body: 'Too many filters on the left. Can we hide the less used ones?', createdAt: now - 50 * 60_000, attachments: [] },
      { id: 'c5', sectionId: 's-home', authorId: dev.id, body: 'Note: the filter panel collapses below 1280px.', createdAt: now - 40 * 60_000, attachments: [] },
      { id: 'c6', sectionId: 's-signin', authorId: mgr.id, body: 'The red button feels like an error. Something friendlier?', createdAt: now - 2 * h, attachments: [] },
      { id: 'c7', sectionId: 's-signin', authorId: mgr.id, body: 'Show the password rules before someone types.', createdAt: now - 2 * h, attachments: [] },
      { id: 'c8', sectionId: 's-tokens', authorId: mgr.id, body: 'Primary red is too harsh, try a warmer coral.', createdAt: now - 2 * h, attachments: [] },
    ],
    tasks: [
      { id: 't1', title: 'Update email branding to the new moodboard', sectionId: 's-email', assignee: 'You', due: '10/8', priority: 'high', createdAt: now - 2 * h },
      { id: 't2', title: 'Raise contrast on the top search result', sectionId: 's-home', assignee: 'You', due: '10/10', priority: 'high', createdAt: now - h },
      { id: 't3', title: 'Collapse rarely used filters', sectionId: 's-home', assignee: 'You', due: '10/10', priority: 'medium', createdAt: now - h },
      { id: 't4', title: 'Softer sign in button color', sectionId: 's-signin', assignee: 'Priya', due: '10/10', priority: 'medium', createdAt: now - 2 * h },
      { id: 't5', title: 'Try a warmer coral for primary', sectionId: 's-tokens', assignee: 'You', due: '10/12', priority: 'low', createdAt: now - 2 * h },
      { id: 't6', title: 'Show password rules up front', sectionId: 's-signin', assignee: 'You', priority: 'low', createdAt: now - 3 * h, doneAt: now - 70 * 60_000 },
      { id: 't7', title: 'Fix spacing in the email footer', sectionId: 's-email', assignee: 'You', priority: 'low', createdAt: now - 5 * h, doneAt: now - 30 * 60_000 },
    ],
    updates: [],
  };

  const side: Project = {
    id: 'side-1',
    name: 'Side Project',
    description: 'Personal portfolio refresh.',
    tint: '#E1E6DD',
    createdAt: now - 200 * h,
    updatedAt: now - 2 * h,
    sections: [
      { id: 's-p1', name: 'Profile Page', tint: '#EFE6DB', size: 'tall', kind: 'mock', mock: 'profile', x: 40, y: 40, w: 316, h: 204, priority: 'high', summary: 'Tighten the bio and make the contact button easier to find.' },
      { id: 's-p2', name: 'Case study', tint: '#E1E6DD', size: 'small', kind: 'mock', mock: 'signin', x: 250, y: 300, w: 316, h: 204 },
    ],
    order: ['s-p1', 's-p2'],
    members: [{ ...me, access: 'Owner' }, { ...mgr, access: 'Can comment' }],
    comments: [
      { id: 'c9', sectionId: 's-p1', authorId: mgr.id, body: 'Bio is too long. Contact button should be above the fold.', createdAt: now - 2 * h, attachments: [] },
    ],
    tasks: [{ id: 't8', title: 'Move contact button above the fold', sectionId: 's-p1', assignee: 'You', due: '10/9', priority: 'high', createdAt: now - 2 * h }],
    updates: [],
  };

  return { version: 2, me, people: [me, mgr, dev], projects: [work, side], sidebarOpen: true };
}
