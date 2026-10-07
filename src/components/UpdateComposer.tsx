import { useEffect, useRef, useState } from 'react';
import type { Project } from '../lib/types';
import { useStore } from '../lib/store';
import { draftUpdate, draftUpdateOffline, editDraft } from '../lib/ai';
import { copyText, downloadUpdate, updateToMailto, updateToSlack } from '../lib/exporters';
import { Icon } from './Icon';
import { useToast } from './Toast';

type Extra = 'Slack' | 'Email' | 'Download';

/** Task overlay 2: send a summary and resolved tasks to the team, in the app first. */
export function UpdateComposer({ project, onClose }: { project: Project; onClose: () => void }) {
  const { me, postUpdate } = useStore();
  const toast = useToast();
  const since = project.updates[0]?.createdAt ?? 0;
  const resolved = project.tasks.filter((t) => t.doneAt && t.doneAt > since);
  const [body, setBody] = useState(() => draftUpdateOffline(project));
  const [ask, setAsk] = useState('');
  const [busy, setBusy] = useState(false);
  const [extras, setExtras] = useState<Set<Extra>>(new Set());
  const [leaving, setLeaving] = useState(false);
  const askRef = useRef<HTMLInputElement>(null);
  const others = project.members.filter((m) => m.id !== me.id);

  useEffect(() => {
    let live = true;
    void draftUpdate(project).then((t) => live && setBody(t));
    askRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      live = false;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setLeaving(true);
    setTimeout(onClose, 200);
  };

  const applyAsk = async () => {
    const a = ask.trim();
    if (!a) return;
    setBusy(true);
    const r = await editDraft(body, a, project);
    setBusy(false);
    if (r.understood) {
      setBody(r.text);
      setAsk('');
      toast('Draft updated');
    } else toast('Try “shorter”, “friendlier”, “tag Manager” or “add next steps”');
  };

  const post = async () => {
    if (!body.trim()) return;
    const u = { body: body.trim(), resolved: resolved.map((t) => t.id), alsoSentTo: [...extras] };
    postUpdate(project.id, u);
    const full = { ...u, id: 'tmp', createdAt: Date.now(), authorId: me.id };
    const link = window.location.href;
    const notes: string[] = [];
    let slackText: string | undefined;
    if (extras.has('Slack')) {
      const msg = updateToSlack(project, full, link);
      if (await copyText(msg)) notes.push('Slack message copied, paste it in your channel');
      else slackText = msg;
    }
    if (extras.has('Download')) {
      downloadUpdate(project, full);
      notes.push('downloaded');
    }
    if (extras.has('Email')) {
      window.location.href = updateToMailto(project, full, link, others.map((m) => m.email).filter(Boolean) as string[]);
      notes.push('email draft opened');
    }
    const who = others.length ? `${others.map((m) => m.name).join(' and ')} notified` : 'saved to the project';
    toast(
      `Update posted to My Team, ${who}.${notes.length ? ' ' + notes.join(', ') + '.' : ''}`,
      slackText ? { label: 'Copy for Slack', run: () => window.prompt('Copy this message into Slack:', slackText) } : undefined,
    );
    close();
  };

  const toggle = (x: Extra) =>
    setExtras((s) => {
      const n = new Set(s);
      if (n.has(x)) n.delete(x);
      else n.add(x);
      return n;
    });

  return (
    <div className={`composer${leaving ? ' is-leaving' : ''}`} role="region" aria-label="Post progress update">
      <div className="composer-head">
        <span className="caption-l row gap-8"><Icon name="check" size={12} /> {resolved.length} {resolved.length === 1 ? 'Task' : 'Tasks'} Resolved</span>
        <span className="grow" />
        <button className="icon-btn" aria-label="Close update" onClick={close}><Icon name="close" size={16} /></button>
      </div>
      <div className="composer-to body2">
        To: <span className="to-chip caption-l"><span className="to-swatch" aria-hidden="true" />My Team</span>
      </div>
      <label className="sr-only" htmlFor="update-body">Update message</label>
      <textarea id="update-body" className="composer-body body2" rows={3} value={body} onChange={(e) => setBody(e.target.value)} aria-busy={busy} />
      <div className="composer-extras">
        <span className="body2 muted">Also send to</span>
        {(['Slack', 'Email', 'Download'] as Extra[]).map((x) => (
          <button key={x} className={`chip${extras.has(x) ? ' is-on' : ''}`} aria-pressed={extras.has(x)} onClick={() => toggle(x)}>{x}</button>
        ))}
      </div>
      <form className="composer-bar" onSubmit={(e) => { e.preventDefault(); void applyAsk(); }}>
        <label className="sr-only" htmlFor="ask-ai">Ask AI to edit</label>
        <input id="ask-ai" ref={askRef} placeholder="Ask AI to edit" value={ask} onChange={(e) => setAsk(e.target.value)} />
        <button type="button" className="btn btn-black btn-r8" onClick={() => void post()} disabled={busy || !body.trim()}>
          {extras.size ? `Post update + ${extras.size}` : 'Post update'}
        </button>
      </form>
    </div>
  );
}
