import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as db from './db';
import { seedState, TINTS } from './seed';
import type { Access, AppState, Attachment, Person, Priority, Project, Section, Task, Update } from './types';
import { uid } from './util';

const KEY = 'state-v2';

export interface NewSection {
  name: string;
  kind: Section['kind'];
  url?: string;
}

interface StoreApi {
  state: AppState;
  me: Person;
  personById: (id: string) => Person | undefined;
  project: (id?: string) => Project | undefined;
  createProject: (name: string, sections: NewSection[]) => string;
  addSections: (pid: string, sections: NewSection[]) => void;
  reorder: (pid: string, order: string[]) => void;
  setSectionPriority: (pid: string, sid: string, p: Priority | undefined) => void;
  addComment: (pid: string, sid: string, body: string, attachments?: Attachment[], parentId?: string) => void;
  addTask: (pid: string, t: Omit<Task, 'id' | 'createdAt'>) => void;
  setTaskDone: (pid: string, tid: string, done: boolean) => void;
  postUpdate: (pid: string, u: Omit<Update, 'id' | 'createdAt' | 'authorId'>) => void;
  invite: (pid: string, nameOrEmail: string, access: Access) => string;
  setAccess: (pid: string, memberId: string, access: Access) => void;
  removeMember: (pid: string, memberId: string) => void;
  setSidebar: (open: boolean) => void;
  resetDemo: () => void;
}

const Ctx = createContext<StoreApi | null>(null);

/** Lay new screens out on the canvas in rows of three. */
function place(existing: Section[], i: number, figma: boolean) {
  const n = existing.length + i;
  if (figma) return { x: 40, y: 40 + Math.max(0, ...existing.map((s) => s.y + s.h + 60 - 40)), w: 640, h: 420 };
  return { x: n % 2 ? 250 : 40, y: 40 + n * 260, w: 316, h: 204 };
}

function makeSections(existing: Section[], input: NewSection[]): Section[] {
  return input.map((s, i) => ({
    id: uid(),
    name: s.name,
    kind: s.kind,
    url: s.url,
    tint: TINTS[(existing.length + i) % TINTS.length],
    size: (existing.length + i) % 3 === 0 ? 'tall' : 'small',
    ...place(existing, i, s.kind === 'figma'),
  }));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    db.get<AppState>(KEY)
      .then((s) => setState(s && s.version === 2 ? s : seedState()))
      .catch(() => setState(seedState()));
  }, []);

  useEffect(() => {
    if (!state) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void db.set(KEY, state).catch(() => {}), 200);
  }, [state]);

  const mutate = useCallback((fn: (s: AppState) => void) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const withProject = useCallback(
    (pid: string, fn: (p: Project, s: AppState) => void) =>
      mutate((s) => {
        const p = s.projects.find((x) => x.id === pid);
        if (!p) return;
        fn(p, s);
        p.updatedAt = Date.now();
      }),
    [mutate],
  );

  const api = useMemo<StoreApi | null>(() => {
    if (!state) return null;
    return {
      state,
      me: state.me,
      personById: (id) => state.people.find((p) => p.id === id),
      project: (id) => state.projects.find((p) => p.id === id),
      createProject: (name, input) => {
        const id = uid();
        mutate((s) => {
          const sections = makeSections([], input);
          s.projects.unshift({
            id,
            name,
            description: '',
            tint: TINTS[s.projects.length % TINTS.length],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sections,
            order: sections.map((x) => x.id),
            members: [{ ...s.me, access: 'Owner' }],
            comments: [],
            tasks: [],
            updates: [],
          });
        });
        return id;
      },
      addSections: (pid, input) =>
        withProject(pid, (p) => {
          const made = makeSections(p.sections, input);
          p.sections.push(...made);
          p.order.push(...made.map((x) => x.id));
        }),
      reorder: (pid, order) => withProject(pid, (p) => void (p.order = order)),
      setSectionPriority: (pid, sid, pr) =>
        withProject(pid, (p) => {
          const s = p.sections.find((x) => x.id === sid);
          if (s) s.priority = pr;
        }),
      addComment: (pid, sid, body, attachments = [], parentId) =>
        withProject(pid, (p, s) => p.comments.push({ id: uid(), sectionId: sid, authorId: s.me.id, body, createdAt: Date.now(), attachments, parentId })),
      addTask: (pid, t) => withProject(pid, (p) => p.tasks.push({ ...t, id: uid(), createdAt: Date.now() })),
      setTaskDone: (pid, tid, done) =>
        withProject(pid, (p) => {
          const t = p.tasks.find((x) => x.id === tid);
          if (t) t.doneAt = done ? Date.now() : undefined;
        }),
      postUpdate: (pid, u) => withProject(pid, (p, s) => p.updates.unshift({ ...u, id: uid(), createdAt: Date.now(), authorId: s.me.id })),
      invite: (pid, raw, access) => {
        const email = /\S+@\S+\.\S+/.test(raw) ? raw : undefined;
        const name = email ? raw.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : raw;
        withProject(pid, (p, s) => {
          let person = s.people.find((x) => x.name.toLowerCase() === name.toLowerCase());
          if (!person) {
            person = { id: uid(), name, role: 'Collaborator' };
            s.people.push(person);
          }
          if (!p.members.some((m) => m.id === person!.id)) p.members.push({ ...person, email, access });
        });
        return name;
      },
      setAccess: (pid, mid, access) =>
        withProject(pid, (p) => {
          const m = p.members.find((x) => x.id === mid);
          if (m) m.access = access;
        }),
      removeMember: (pid, mid) => withProject(pid, (p) => void (p.members = p.members.filter((m) => m.id !== mid))),
      setSidebar: (open) => mutate((s) => void (s.sidebarOpen = open)),
      resetDemo: () => setState(seedState()),
    };
  }, [state, mutate, withProject]);

  if (!api) return <div className="boot" aria-busy="true" />;
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}

/** Derived counts used across screens. */
export function sectionStats(p: Project, sid: string) {
  const comments = p.comments.filter((c) => c.sectionId === sid && !c.parentId);
  const latest = Math.max(0, ...p.comments.filter((c) => c.sectionId === sid).map((c) => c.createdAt));
  return { changes: comments.length, latest };
}

export function highCount(p: Project) {
  return p.sections.filter((s) => s.priority === 'high').length;
}
