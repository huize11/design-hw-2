import type { Priority } from '../lib/types';

const LABEL: Record<Priority, string> = { high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' };

/** Priority pill from the components frame: dot plus label on a tinted background. */
export function PriorityTag({ p, label }: { p: Priority | 'done'; label?: string }) {
  return (
    <span className={`tag tag-${p}`}>
      <span className="tag-dot" aria-hidden="true" />
      {label ?? (p === 'done' ? 'Resolved' : LABEL[p])}
    </span>
  );
}
