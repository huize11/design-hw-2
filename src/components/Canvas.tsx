import { useEffect, useRef } from 'react';
import type { Project } from '../lib/types';
import { Preview } from './Preview';

interface Props {
  project: Project;
  /** Section shown in the overlay right now: red stroke and handles. */
  activeId?: string;
  /** Section being hovered in the overlay: same highlight, as a preview. */
  peekId?: string;
  onOpen: (id: string) => void;
  onPeek: (id?: string) => void;
}

/** The design being reviewed. Screens sit where the designer placed them. */
export function Canvas({ project, activeId, peekId, onOpen, onPeek }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const width = Math.max(...project.sections.map((s) => s.x + s.w), 0) + 80;
  const height = Math.max(...project.sections.map((s) => s.y + s.h), 0) + 80;

  // Bring the active screen into view when it changes.
  useEffect(() => {
    if (!activeId) return;
    const el = scroller.current?.querySelector<HTMLElement>(`[data-screen="${activeId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  if (!project.sections.length) {
    return (
      <div className="canvas canvas-empty">
        <p className="body1 muted">No screens yet. Use Add new to drop screens or attach a Figma link.</p>
      </div>
    );
  }

  return (
    <div className="canvas" ref={scroller}>
      <div className="canvas-plane" style={{ width, height }}>
        {project.sections.map((s) => {
          const lit = s.id === activeId || s.id === peekId;
          return (
            <div key={s.id} className="screen" data-screen={s.id} style={{ left: s.x, top: s.y, width: s.w }}>
              <span className="screen-label caption-l">{s.name}</span>
              <button
                className={`screen-box${lit ? ' is-lit' : ''}${s.id === activeId ? ' is-active' : ''}`}
                style={{ height: s.h }}
                onClick={() => onOpen(s.id)}
                onPointerEnter={() => onPeek(s.id)}
                onPointerLeave={() => onPeek(undefined)}
                aria-label={`Open feedback for ${s.name}`}
                aria-current={s.id === activeId ? 'true' : undefined}
              >
                <Preview section={s} live={s.kind === 'figma'} />
                {lit && ['tl', 'tr', 'bl', 'br'].map((c) => <span key={c} className={`handle handle-${c}`} aria-hidden="true" />)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
