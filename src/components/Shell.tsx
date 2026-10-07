import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { useStore } from '../lib/store';
import { NewProjectModal } from './NewProjectModal';
import { ShareModal } from './ShareModal';
import { useToast } from './Toast';

const today = () => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

function ProfileMenu({ compact }: { compact?: boolean }) {
  const { state, resetDemo } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const unread = state.projects.reduce((n, p) => n + p.comments.filter((c) => c.authorId !== state.me.id && Date.now() - c.createdAt < 86400_000).length, 0);
  return (
    <div className={`side-foot${compact ? ' is-compact' : ''}`}>
      <button className="profile" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="avatar-grad" aria-hidden="true" />
        {!compact && <span className="body1">Username</span>}
      </button>
      {!compact && (
        <button className="icon-btn bell" aria-label={`Notifications${unread ? `, ${unread} new` : ''}`} onClick={() => { nav('/projects'); toast(unread ? `${unread} new comments today` : 'You’re all caught up'); }}>
          <Icon name="bell" size={20} />
          {unread > 0 && <span className="bell-dot" />}
        </button>
      )}
      {open && (
        <div className="menu menu-up" role="menu" onMouseLeave={() => setOpen(false)}>
          <button role="menuitem" className="menu-item" onClick={() => { if (confirm('Reset to the demo projects? Your changes in this browser will be replaced.')) { resetDemo(); nav('/projects'); toast('Demo data restored'); } setOpen(false); }}>
            <Icon name="undo" /> Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ forceCompact }: { forceCompact?: boolean }) {
  const { state, setSidebar } = useStore();
  // On the canvas the rail starts collapsed to give the design room; it can still be expanded.
  const [canvasOpen, setCanvasOpen] = useState(false);
  const open = forceCompact ? canvasOpen : state.sidebarOpen;
  const toggle = () => (forceCompact ? setCanvasOpen((v) => !v) : setSidebar(!state.sidebarOpen));
  const loc = useLocation();
  const path = loc.pathname;
  const folders = new URLSearchParams(loc.search).get('view') === 'folders';
  const activeFor = (icon: string) =>
    icon === 'home' ? path === '/' : icon === 'folder' ? path === '/projects' && folders : (path === '/projects' && !folders) || path.startsWith('/p/');
  const item = (to: string, icon: 'home' | 'layers' | 'folder', label: string) => (
    <NavLink to={to} className={() => `nav-item${activeFor(icon) ? ' is-active' : ''}`} aria-label={label} aria-current={activeFor(icon) ? 'page' : undefined} title={open ? undefined : label}>
      <Icon name={icon} size={18} />
      {open && <span className="body2">{label}</span>}
    </NavLink>
  );
  return (
    <nav className={`sidebar${open ? '' : ' is-compact'}`} aria-label="Main">
      <div className="side-head">
        {open && (
          <span className="ws">
            <span className="ws-mark" aria-hidden="true" />
            <span className="h2">Company 1 Workspace</span>
          </span>
        )}
        <button className="icon-btn" aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'} onClick={toggle}>
          <Icon name="sidebar" size={22} />
        </button>
      </div>
      <div className="nav">
        {item('/', 'home', 'Home')}
        {item('/projects', 'layers', 'Projects')}
        {item('/projects?view=folders', 'folder', 'Folders')}
      </div>
      <ProfileMenu compact={!open} />
    </nav>
  );
}

/** Date on the left; Add new and Share on the right, as in every screen. */
export function TopBar({ projectId, children, hideAdd }: { projectId?: string; children?: ReactNode; hideAdd?: boolean }) {
  const [adding, setAdding] = useState(false);
  const [sharing, setSharing] = useState(false);
  return (
    <header className="topbar">
      <span className="body1">{today()}</span>
      {children}
      <span className="grow" />
      {!hideAdd && (
        <button className="btn btn-white" onClick={() => setAdding(true)}>
          <Icon name="plus" size={15} strokeWidth={1.8} /> Add new
        </button>
      )}
      <button className="btn btn-black" onClick={() => setSharing(true)}>Share</button>
      {adding && <NewProjectModal onClose={() => setAdding(false)} />}
      {sharing && <ShareModal projectId={projectId} onClose={() => setSharing(false)} />}
    </header>
  );
}
