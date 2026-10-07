import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import type { Project, Section } from '../lib/types';
import { sectionStats, useStore } from '../lib/store';
import { timeAgo } from '../lib/util';
import { Icon } from './Icon';
import { PriorityTag } from './Tags';
import { Preview } from './Preview';
import { useToast } from './Toast';

interface Props {
  project: Project;
  activeId?: string;
  onOpen: (id: string) => void;
  onPeek: (id?: string) => void;
}

interface Drag {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  x: number;
  y: number;
  active: boolean;
  before: string[];
}

const THRESHOLD = 5;

function Card({ s, project, active }: { s: Section; project: Project; active: boolean }) {
  const { changes, latest } = sectionStats(project, s.id);
  return (
    <>
      <div className="ucard-head">
        <span className="grip" aria-hidden="true"><Icon name="grip" size={14} /></span>
        <span className="body2 ellipsis grow">{s.name}</span>
        {s.priority && s.priority !== 'low' && (s.size === 'small'
          ? <span className={`dot-only tag-${s.priority}`} role="img" aria-label={`${s.priority} priority`} />
          : <PriorityTag p={s.priority} />)}
      </div>
      <div className="ucard-preview">
        <Preview section={s} />
      </div>
      <div className="ucard-meta caption">
        <span>{changes} {changes === 1 ? 'change' : 'changes'}</span>
        <span>{latest ? `updated ${timeAgo(latest)}` : 'no feedback yet'}</span>
      </div>
      {active && <span className="sr-only">(viewing)</span>}
    </>
  );
}

/** "Updates in Work 1": every part of the project as a card the user can rearrange. */
export function UpdatesView({ project, activeId, onOpen, onPeek }: Props) {
  const { reorder } = useStore();
  const toast = useToast();
  const [order, setOrder] = useState(project.order);
  const [drag, setDrag] = useState<Drag | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLDivElement>());
  const prevPos = useRef(new Map<string, { x: number; y: number }>());
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;

  // Stay in sync when the project order changes elsewhere (undo, another tab).
  useLayoutEffect(() => {
    if (!dragRef.current) setOrder(project.order);
  }, [project.order]);

  // FLIP: cards slide to their new slots instead of jumping.
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els.current.forEach((el, id) => {
      const prev = prevPos.current.get(id);
      const now = { x: el.offsetLeft, y: el.offsetTop };
      prevPos.current.set(id, now);
      if (!prev || reduce || id === dragRef.current?.id) return;
      const dx = prev.x - now.x;
      const dy = prev.y - now.y;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.translate = `${dx}px ${dy}px`;
      requestAnimationFrame(() => {
        el.style.transition = '';
        el.style.translate = '';
      });
    });
  }, [order]);

  const sections = order.map((id) => project.sections.find((s) => s.id === id)).filter(Boolean) as Section[];

  const onDown = (e: RPointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return;
    const el = els.current.get(id)!;
    const r = el.getBoundingClientRect();
    setDrag({ id, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, grabX: e.clientX - r.left, grabY: e.clientY - r.top, x: e.clientX, y: e.clientY, active: false, before: order });
    el.setPointerCapture(e.pointerId);
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>, id: string) => {
    const d = dragRef.current;
    const el = els.current.get(id);
    if (!d || d.id !== id) {
      // Hover tilt: the card leans a little toward the pointer, hinting it can be picked up.
      if (el && e.pointerType === 'mouse') {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', `${((e.clientY - r.top) / r.height - 0.5) * -4}deg`);
        el.style.setProperty('--ty', `${((e.clientX - r.left) / r.width - 0.5) * 4}deg`);
      }
      return;
    }
    const moved = Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > THRESHOLD;
    const next = { ...d, x: e.clientX, y: e.clientY, active: d.active || moved };
    setDrag(next);
    if (!next.active) return;
    // Find the card under the pointer and take its slot.
    for (const [oid, oel] of els.current) {
      if (oid === id) continue;
      const r = oel.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        setOrder((cur) => {
          const from = cur.indexOf(id);
          const to = cur.indexOf(oid);
          if (from === to) return cur;
          const copy = cur.filter((x) => x !== id);
          copy.splice(to, 0, id);
          return copy;
        });
        break;
      }
    }
  };

  const onUp = (id: string) => {
    const d = dragRef.current;
    setDrag(null);
    if (!d || d.id !== id) return;
    if (!d.active) return onOpen(id);
    const name = project.sections.find((s) => s.id === id)?.name ?? 'Card';
    if (order.join() !== d.before.join()) {
      reorder(project.id, order);
      toast(`Moved ${name}`, { label: 'Undo', run: () => reorder(project.id, d.before) });
    }
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      return onOpen(id);
    }
    // Alt + arrow keys move the focused card, so reordering works without a mouse.
    if (e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const i = order.indexOf(id);
      const j = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : i + 1;
      if (j < 0 || j >= order.length) return;
      const next = [...order];
      [next[i], next[j]] = [next[j], next[i]];
      setOrder(next);
      reorder(project.id, next);
      toast(`Moved ${project.sections.find((s) => s.id === id)?.name}`);
      requestAnimationFrame(() => els.current.get(id)?.focus());
    }
  };

  return (
    <>
      <p className="caption hint">Drag cards to arrange by priority. Click one to see its feedback.</p>
      <div className="ugrid" ref={grid}>
        {sections.map((s) => {
          const dragging = drag?.active && drag.id === s.id;
          let style: React.CSSProperties = { background: s.tint };
          if (dragging && drag) {
            const el = els.current.get(s.id)!;
            const gr = grid.current!.getBoundingClientRect();
            const dx = drag.x - drag.grabX - (gr.left + el.offsetLeft);
            const dy = drag.y - drag.grabY - (gr.top + el.offsetTop);
            style = { ...style, translate: `${dx}px ${dy}px` };
          }
          return (
            <div
              key={s.id}
              ref={(el) => (el ? els.current.set(s.id, el) : els.current.delete(s.id))}
              className={`ucard ucard-${s.size}${s.id === activeId ? ' is-active' : ''}${dragging ? ' is-dragging' : ''}`}
              style={style}
              role="button"
              tabIndex={0}
              aria-label={`${s.name}. Press Enter to open feedback, Alt plus arrow keys to move.`}
              onPointerDown={(e) => onDown(e, s.id)}
              onPointerMove={(e) => onMove(e, s.id)}
              onPointerUp={() => onUp(s.id)}
              onPointerCancel={() => setDrag(null)}
              onPointerEnter={() => onPeek(s.id)}
              onPointerLeave={(e) => {
                onPeek(undefined);
                e.currentTarget.style.removeProperty('--tx');
                e.currentTarget.style.removeProperty('--ty');
              }}
              onFocus={() => onPeek(s.id)}
              onBlur={() => onPeek(undefined)}
              onKeyDown={(e) => onKey(e, s.id)}
            >
              <Card s={s} project={project} active={s.id === activeId} />
            </div>
          );
        })}
      </div>
    </>
  );
}
