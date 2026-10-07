import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { highCount, useStore } from '../lib/store';
import type { Project } from '../lib/types';
import { timeAgo } from '../lib/util';
import { Sidebar, TopBar } from '../components/Shell';
import { PriorityTag } from '../components/Tags';
import { Preview } from '../components/Preview';

type Filter = 'all' | 'pending' | 'resolved';

function ProjectCard({ p }: { p: Project }) {
  const nav = useNavigate();
  const high = highCount(p);
  const open = p.tasks.filter((t) => !t.doneAt).length;
  const comments = p.comments.filter((c) => !c.parentId).length;
  const first = p.order.map((id) => p.sections.find((s) => s.id === id)).find(Boolean);
  const go = () => nav(`/p/${p.id}`);
  return (
    <article className="pcard" onClick={go} aria-label={p.name}>
      <div className="pcard-preview" style={{ background: p.tint }}>
        {first ? <Preview section={first} /> : <span className="body2 muted">No screens yet</span>}
      </div>
      <div className="pcard-row">
        <Link to={`/p/${p.id}`} className="h1 pcard-title" onClick={(e) => e.stopPropagation()}>{p.name}</Link>
        {high > 0 ? <PriorityTag p="high" label={`${high} High Priority`} /> : open === 0 ? <PriorityTag p="done" label="Resolved" /> : null}
      </div>
      <div className="pcard-row pcard-meta">
        <div className="pcard-stats body2">
          <span>Updated {timeAgo(p.updatedAt)}</span>
          <span>{comments} {comments === 1 ? 'comment' : 'comments'}</span>
        </div>
        <button className="btn btn-gray" onClick={(e) => { e.stopPropagation(); go(); }}>View feedback</button>
      </div>
    </article>
  );
}

export function Projects() {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const list = [...state.projects]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((p) => {
      const open = p.tasks.some((t) => !t.doneAt);
      return filter === 'all' || (filter === 'pending' ? open : !open);
    });
  return (
    <div className="app">
      <Sidebar />
      <main className="page">
        <TopBar />
        <div className="projects-head">
          <h1 className="h4">Projects</h1>
          <div className="seg seg-gray" role="tablist" aria-label="Filter projects">
            {(['all', 'pending', 'resolved'] as Filter[]).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className={`seg-btn${filter === f ? ' is-on' : ''}`} onClick={() => setFilter(f)}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {list.length ? (
          <div className="pgrid">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        ) : (
          <p className="body1 muted">{filter === 'resolved' ? 'No fully resolved projects yet.' : 'Nothing pending. Nice work.'}</p>
        )}
      </main>
    </div>
  );
}
