import type { Project } from '../lib/types';
import { highCount } from '../lib/store';
import { Icon } from './Icon';
import { PriorityTag } from './Tags';
import { UpdatesView } from './UpdatesView';
import { FeedbackView } from './FeedbackView';
import { TasksView } from './TasksView';

export type View = 'updates' | 'feedback' | 'tasks';

interface Props {
  project: Project;
  view: View;
  setView: (v: View) => void;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  activeId?: string;
  open: (id: string) => void;
  peek: (id?: string) => void;
}

function Tabs({ view, setView, openTasks, onPick }: { view: View; setView: (v: View) => void; openTasks: number; onPick?: () => void }) {
  return (
    <div className="seg" role="tablist" aria-label="Panel">
      <button role="tab" aria-selected={view === 'feedback'} className={`seg-btn${view === 'feedback' ? ' is-on' : ''}`} onClick={() => { setView('feedback'); onPick?.(); }}>
        Feedback
      </button>
      <button role="tab" aria-selected={view === 'tasks'} className={`seg-btn${view === 'tasks' ? ' is-on' : ''}`} onClick={() => { setView('tasks'); onPick?.(); }}>
        Tasks <span className="count">{openTasks}</span>
      </button>
    </div>
  );
}

/** The right-hand overlay. Minimizing keeps the place, so reopening lands where the user left off. */
export function Overlay({ project, view, setView, minimized, setMinimized, activeId, open, peek }: Props) {
  const section = project.sections.find((s) => s.id === activeId);
  const openTasks = project.tasks.filter((t) => !t.doneAt).length;
  const high = highCount(project);
  const tag = high > 0 ? <PriorityTag p="high" label={`${high} High Priority`} /> : null;
  const v: View = view !== 'updates' && !section ? 'updates' : view;

  if (minimized) {
    return v === 'updates' ? (
      <button className="panel panel-min" onClick={() => setMinimized(false)} aria-label={`Expand updates in ${project.name}`}>
        <span className="h1 ellipsis">Updates in {project.name}</span>
        <span className="grow" />
        {tag}
        <Icon name="chevronDown" size={22} />
      </button>
    ) : (
      <div className="panel panel-min" role="region" aria-label="Feedback, minimized">
        <Tabs view={v} setView={setView} openTasks={openTasks} onPick={() => setMinimized(false)} />
        <span className="grow" />
        {section?.priority ? <PriorityTag p={section.priority} /> : tag}
        <button className="icon-btn" aria-label="Expand panel" onClick={() => setMinimized(false)}><Icon name="chevronDown" size={22} /></button>
      </div>
    );
  }

  return (
    <aside className={`panel panel-${v}`} aria-label={v === 'updates' ? `Updates in ${project.name}` : 'Feedback'}>
      {v === 'updates' ? (
        <>
          <div className="panel-head">
            <h2 className="h1">Updates in {project.name}</h2>
            <span className="grow" />
            {tag}
            <button className="icon-btn" aria-label="Minimize panel" onClick={() => setMinimized(true)}><Icon name="chevronDown" size={22} /></button>
          </div>
          <div className="panel-body">
            <UpdatesView project={project} activeId={activeId} onOpen={open} onPeek={peek} />
          </div>
        </>
      ) : (
        <>
          <div className="panel-head panel-head-nav">
            <button className="icon-btn" aria-label={`Back to updates in ${project.name}`} onClick={() => setView('updates')}><Icon name="arrowLeft" size={22} /></button>
            <span className="grow" />
            <button className="icon-btn" aria-label="Minimize panel" onClick={() => setMinimized(true)}><Icon name={v === 'tasks' ? 'minus' : 'chevronDown'} size={22} /></button>
          </div>
          <div className="panel-tabs">
            <Tabs view={v} setView={setView} openTasks={openTasks} />
          </div>
          {v === 'feedback' && section && <FeedbackView key={section.id} project={project} section={section} />}
          {v === 'tasks' && <TasksView project={project} sectionId={activeId} />}
        </>
      )}
    </aside>
  );
}
