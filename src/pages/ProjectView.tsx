import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Sidebar, TopBar } from '../components/Shell';
import { Canvas } from '../components/Canvas';
import { Overlay, type View } from '../components/Overlay';

/** Canvas page: the design on the left, the feedback overlay on the right. */
export function ProjectView() {
  const { id } = useParams();
  const { project: get } = useStore();
  const project = get(id);
  const [view, setView] = useState<View>('updates');
  const [minimized, setMinimized] = useState(false);
  const [activeId, setActiveId] = useState<string>();
  const [peekId, setPeekId] = useState<string>();

  if (!project) {
    return (
      <div className="app">
        <Sidebar />
        <main className="page">
          <p className="body1">This project isn’t in this browser.</p>
          <p className="body2 muted">Projects are saved on the device that created them. <Link to="/projects">See your projects</Link></p>
        </main>
      </div>
    );
  }

  // One click from a card or a screen opens its feedback.
  const open = (sid: string) => {
    setActiveId(sid);
    setView('feedback');
    setMinimized(false);
  };

  return (
    <div className="app">
      <Sidebar forceCompact />
      <main className="workspace">
        <TopBar projectId={project.id} hideAdd={view !== 'tasks' || minimized} />
        <Canvas project={project} activeId={view === 'updates' ? undefined : activeId} peekId={peekId ?? (view === 'updates' ? activeId : undefined)} onOpen={open} onPeek={setPeekId} />
        <Overlay project={project} view={view} setView={setView} minimized={minimized} setMinimized={setMinimized} activeId={activeId} open={open} peek={setPeekId} />
      </main>
    </div>
  );
}
