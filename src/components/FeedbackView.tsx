import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Attachment, Comment, Priority, Project, Section } from '../lib/types';
import { useStore } from '../lib/store';
import { detectPriority, summarizeComments } from '../lib/ai';
import { fileToDataUrl, findUrls, hostname, isImageUrl, shortAgo, uid } from '../lib/util';
import { Icon, Sparkle } from './Icon';
import { PriorityTag } from './Tags';
import { Lightbox } from './Lightbox';
import { useToast } from './Toast';

const CYCLE: (Priority | undefined)[] = ['high', 'medium', 'low', undefined];

function Moodboard({ images }: { images: Attachment[] }) {
  const [open, setOpen] = useState<{ i: number; rect: DOMRect } | null>(null);
  if (!images.length) return null;
  const show = (i: number, el: HTMLElement) => setOpen({ i, rect: el.getBoundingClientRect() });
  return (
    <>
      <div className={`mood mood-${Math.min(images.length, 3)}`}>
        {images.slice(0, 3).map((a, i) => (
          <button key={a.id} className={`mood-tile mood-tile-${i}`} onClick={(e) => show(i, e.currentTarget)} aria-label={`Expand image ${i + 1}`}>
            <img src={a.url} alt={a.name ?? ''} loading="lazy" />
            {i === 2 && images.length > 3 && <span className="mood-more">+{images.length - 3}</span>}
          </button>
        ))}
        <button className="mood-expand" aria-label="Expand moodboard" onClick={(e) => show(0, e.currentTarget.parentElement!)}>
          <Icon name="expand" size={16} />
        </button>
      </div>
      {open && <Lightbox images={images} index={open.i} origin={open.rect} onClose={() => setOpen(null)} />}
    </>
  );
}

function LinkRow({ url }: { url: string }) {
  return (
    <div className="link-row">
      <span className="link-thumb" aria-hidden="true">
        <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname(url))}&sz=64`} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} referrerPolicy="no-referrer" />
      </span>
      <span className="body2 grow ellipsis">{hostname(url)}</span>
      <a className="btn btn-gray btn-sm" href={url} target="_blank" rel="noreferrer">Open</a>
    </div>
  );
}

function CommentItem({ c, onTask }: { c: Comment; onTask?: () => void }) {
  const { personById, me } = useStore();
  const who = personById(c.authorId);
  const mine = c.authorId === me.id;
  const images = c.attachments.filter((a) => a.kind === 'image' || isImageUrl(a.url));
  const links = c.attachments.filter((a) => a.kind === 'link' && !isImageUrl(a.url));
  return (
    <article className={`comment${mine ? ' is-mine' : ''}`}>
      <header className="comment-head">
        <span className={`avatar-dot${mine ? ' is-me' : ''}`} aria-hidden="true" />
        <span className="body1">{mine ? 'You' : who?.name ?? 'Someone'}</span>
        <span className="body1 muted">{shortAgo(c.createdAt)}</span>
      </header>
      <div className="comment-body">
        <p className="body2">{c.body}</p>
        <Moodboard images={images} />
        {links.length > 0 && links.length < 3 && links.map((a) => <LinkRow key={a.id} url={a.url} />)}
        {!mine && onTask && <button className="link-btn caption-l" onClick={onTask}>+ Add to tasks</button>}
      </div>
    </article>
  );
}

export function FeedbackView({ project, section }: { project: Project; section: Section }) {
  const { me, addComment, addTask, setSectionPriority, personById } = useStore();
  const toast = useToast();
  const [showComments, setShowComments] = useState(true);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const comments = project.comments.filter((c) => c.sectionId === section.id).sort((a, b) => a.createdAt - b.createdAt);
  const fromOthers = comments.filter((c) => c.authorId !== me.id);
  const summary = useMemo(() => section.summary ?? summarizeComments(fromOthers.map((c) => c.body)), [section.summary, fromOthers]);
  const manager = personById(fromOthers[fromOthers.length - 1]?.authorId ?? '')?.name ?? 'the team';

  const send = () => {
    const body = text.trim();
    if (!body && !files.length) return;
    const links: Attachment[] = findUrls(body).map((url) => ({ id: uid(), kind: 'link', url }));
    addComment(project.id, section.id, body, [...files, ...links]);
    setText('');
    setFiles([]);
    toast(`Reply sent to ${manager}`);
    setShowComments(true);
    requestAnimationFrame(() => list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }));
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const cyclePriority = () => {
    const next = CYCLE[(CYCLE.indexOf(section.priority) + 1) % CYCLE.length];
    setSectionPriority(project.id, section.id, next);
    toast(next ? `Marked ${next} priority` : 'Priority cleared');
  };

  return (
    <div className="fb">
      <div className="fb-scroll" ref={list}>
        <div className="fb-title">
          <h2 className="h1">{section.name}</h2>
          <button className="tag-btn" onClick={cyclePriority} aria-label={`Priority: ${section.priority ?? 'none'}. Click to change.`} title="Click to change priority">
            {section.priority ? <PriorityTag p={section.priority} /> : <span className="tag tag-none">Set priority</span>}
          </button>
        </div>

        <section className="fb-overview">
          <h3 className="h2 row gap-8">Requested changes overview <Sparkle size={12} /></h3>
          <p className="body2">{summary}</p>
        </section>

        <div className="divider" />

        <button className="fb-section-head" aria-expanded={showComments} onClick={() => setShowComments((v) => !v)}>
          <span className="body1">Comments</span>
          <span className="body1">{comments.length}</span>
          <span className="grow" />
          <Icon name="chevronDown" size={20} className={`chev${showComments ? '' : ' is-closed'}`} />
        </button>

        {showComments && (
          <div className="comments">
            {comments.length === 0 && <p className="body2 muted">No comments on this part yet.</p>}
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                c={c}
                onTask={() => {
                  addTask(project.id, { title: c.body.replace(/\bhttps?:\/\/\S+/g, '').split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, ''), sectionId: section.id, priority: section.priority ?? detectPriority(c.body), assignee: 'You' });
                  toast('Added to tasks');
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="reply">
        {files.length > 0 && (
          <div className="reply-files">
            {files.map((f) => (
              <span key={f.id} className="reply-file">
                <img src={f.url} alt={f.name ?? ''} />
                <button aria-label="Remove image" onClick={() => setFiles((xs) => xs.filter((x) => x.id !== f.id))}><Icon name="close" size={10} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="reply-bar">
          <label className="sr-only" htmlFor="reply">Reply</label>
          <textarea id="reply" rows={1} placeholder="Reply" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey}
            onPaste={(e) => {
              const imgs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
              if (!imgs.length) return;
              e.preventDefault();
              void Promise.all(imgs.map(async (f) => ({ id: uid(), kind: 'image' as const, url: await fileToDataUrl(f, 1400), name: f.name }))).then((a) => setFiles((x) => [...x, ...a]));
            }}
          />
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={async (e) => {
            const list = Array.from(e.target.files ?? []);
            const added = await Promise.all(list.map(async (f) => ({ id: uid(), kind: 'image' as const, url: await fileToDataUrl(f, 1400), name: f.name })));
            setFiles((x) => [...x, ...added]);
            if (added.length) toast(`${added.length} ${added.length === 1 ? 'image' : 'images'} attached`);
            e.target.value = '';
          }} />
          <button className="icon-btn" aria-label="Attach images" onClick={() => fileInput.current?.click()}><Icon name="plus" size={18} /></button>
          <button className="send" aria-label="Send reply" onClick={send} disabled={!text.trim() && !files.length}><Icon name="send" size={16} strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  );
}
