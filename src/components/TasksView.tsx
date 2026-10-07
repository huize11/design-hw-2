import { useState } from 'react';
import type { Priority, Project, Task } from '../lib/types';
import { useStore } from '../lib/store';
import { parseTaskInput } from '../lib/ai';
import { Icon } from './Icon';
import { useToast } from './Toast';
import { UpdateComposer } from './UpdateComposer';

const GROUPS: { p: Priority; label: string }[] = [
  { p: 'high', label: 'High Priority' },
  { p: 'medium', label: 'Medium Priority' },
  { p: 'low', label: 'Low Priority' },
];

function TaskRow({ t, project, checked, onCheck }: { t: Task; project: Project; checked: boolean; onCheck: (v: boolean) => void }) {
  const { setTaskDone } = useStore();
  const toast = useToast();
  const section = project.sections.find((s) => s.id === t.sectionId);
  const resolve = () => {
    setTaskDone(project.id, t.id, true);
    onCheck(false);
    toast(`Resolved “${t.title}”`, { label: 'Undo', run: () => setTaskDone(project.id, t.id, false) });
  };
  return (
    <div className={`task${checked ? ' is-checked' : ''}`}>
      <label className="task-check">
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} aria-label={`Done: ${t.title}`} />
        <span className="box" aria-hidden="true"><Icon name="check" size={12} strokeWidth={3} /></span>
      </label>
      <div className="task-text">
        <div className="body1">{t.title}</div>
        <div className="body2 task-meta">
          <span>{t.assignee ?? 'Unassigned'}</span>
          {t.due && <span>Due {t.due}</span>}
          {section && <span className="muted">{section.name}</span>}
        </div>
      </div>
      {checked && (
        <button className="btn btn-white btn-bordered resolve-pop" onClick={resolve} autoFocus>
          Mark as resolved
        </button>
      )}
    </div>
  );
}

export function TasksView({ project, sectionId }: { project: Project; sectionId?: string }) {
  const { addTask, setTaskDone } = useStore();
  const toast = useToast();
  const [checked, setChecked] = useState<string | null>(null);
  const [closed, setClosed] = useState<Record<string, boolean>>({ done: true });
  const [composing, setComposing] = useState(false);
  const [adding, setAdding] = useState('');
  const open = project.tasks.filter((t) => !t.doneAt);
  const done = project.tasks.filter((t) => t.doneAt).sort((a, b) => b.doneAt! - a.doneAt!);

  const add = () => {
    const v = adding.trim();
    if (!v) return;
    const t = parseTaskInput(v);
    addTask(project.id, { title: t.title, priority: t.priority, due: t.due, sectionId, assignee: 'You' });
    setAdding('');
    toast(`Task added to ${t.priority} priority`);
  };

  const head = (key: string, label: string, count: number) => (
    <button className="group-head" aria-expanded={!closed[key]} onClick={() => setClosed((c) => ({ ...c, [key]: !c[key] }))}>
      <span className="h2">{label}</span>
      <span className="body1">{count}</span>
      <span className="grow" />
      <Icon name="chevronDown" size={20} className={`chev${closed[key] ? ' is-closed' : ''}`} />
    </button>
  );

  return (
    <div className="tasks">
      <div className="tasks-scroll">
        {GROUPS.map(({ p, label }) => {
          const items = open.filter((t) => t.priority === p);
          return (
            <section key={p} className="group">
              {head(p, label, items.length)}
              {!closed[p] && items.map((t) => <TaskRow key={t.id} t={t} project={project} checked={checked === t.id} onCheck={(v) => setChecked(v ? t.id : null)} />)}
              {!closed[p] && items.length === 0 && <p className="body2 muted empty-group">Nothing here.</p>}
            </section>
          );
        })}
        <section className="group">
          {head('done', 'Resolved', done.length)}
          {!closed.done &&
            done.map((t) => (
              <div key={t.id} className="task is-done">
                <span className="task-check"><span className="box is-done" aria-hidden="true"><Icon name="check" size={12} strokeWidth={3} /></span></span>
                <div className="task-text"><div className="body1">{t.title}</div><div className="body2 task-meta"><span>{t.assignee ?? 'Unassigned'}</span></div></div>
                <button className="link-btn body2" onClick={() => { setTaskDone(project.id, t.id, false); toast('Task reopened'); }}>Reopen</button>
              </div>
            ))}
        </section>
        <form className="add-task" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <Icon name="plus" size={16} />
          <label className="sr-only" htmlFor="add-task">Add a task</label>
          <input id="add-task" placeholder="Add a task, e.g. “tighten footer by Fri !high”" value={adding} onChange={(e) => setAdding(e.target.value)} />
        </form>
      </div>

      {composing ? (
        <UpdateComposer project={project} onClose={() => setComposing(false)} />
      ) : (
        <div className="tasks-foot">
          <button className="btn btn-black btn-r8" onClick={() => setComposing(true)}>Post progress update</button>
        </div>
      )}
    </div>
  );
}
