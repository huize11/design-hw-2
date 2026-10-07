import { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { useStore } from '../lib/store';
import { useToast } from './Toast';
import { copyText } from '../lib/exporters';
import type { Access, Member } from '../lib/types';

const ACCESS: Access[] = ['Can edit', 'Can comment', 'Can view'];
const SWATCH = ['#FFD4D4', '#F1E9DE', '#E1E6DD', '#E8E2EA'];

/** Share Project popup from Figma: add people, who has access, copy link. */
export function ShareModal({ projectId, onClose }: { projectId?: string; onClose: () => void }) {
  const { state, me, invite, setAccess, removeMember } = useStore();
  const toast = useToast();
  const [value, setValue] = useState('');
  const project = projectId ? state.projects.find((p) => p.id === projectId) : undefined;
  // Without a project (Home, Projects) sharing applies to the whole workspace.
  const targets = project ? [project] : state.projects;
  const members: Member[] = project
    ? project.members
    : Array.from(new Map(state.projects.flatMap((p) => p.members).map((m) => [m.id, m])).values());

  const send = () => {
    const v = value.trim();
    if (!v) return;
    let name = v;
    targets.forEach((p) => (name = invite(p.id, v, 'Can comment')));
    setValue('');
    toast(`Invite sent to ${name}`);
  };

  const label = (m: Member) => (m.id === me.id ? 'You' : m.name);

  return (
    <Modal title={project ? 'Share Project' : 'Share Workspace'} onClose={onClose} width={562}>
      <form className="share-invite" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <label className="sr-only" htmlFor="invite">Add people by name or email</label>
        <input id="invite" placeholder="Add people" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
        <button className="btn btn-black" type="submit" disabled={!value.trim()}>Invite</button>
      </form>
      <div className="share-list">
        <div className="body2">Who has access</div>
        {members.map((m, i) => (
          <div key={m.id} className="share-row">
            <span className="share-swatch" style={{ background: SWATCH[i % SWATCH.length] }} aria-hidden="true" />
            <span className="body1 grow ellipsis">{label(m)}</span>
            {m.access === 'Owner' ? (
              <span className="body1">Owner</span>
            ) : (
              <span className="access-wrap">
                <label className="sr-only" htmlFor={`acc-${m.id}`}>Access for {m.name}</label>
                <select
                  id={`acc-${m.id}`}
                  className="access-select"
                  value={m.access}
                  onChange={(e) => {
                    if (e.target.value === '__remove') {
                      targets.forEach((p) => removeMember(p.id, m.id));
                      toast(`${m.name} removed`);
                      return;
                    }
                    targets.forEach((p) => setAccess(p.id, m.id, e.target.value as Access));
                    toast(`${m.name} ${e.target.value.toLowerCase()}`);
                  }}
                >
                  {ACCESS.map((a) => <option key={a}>{a}</option>)}
                  <option value="__remove">Remove</option>
                </select>
                <Icon name="chevronDown" size={18} />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="share-foot">
        <button
          className="btn btn-outline"
          onClick={async () => toast((await copyText(window.location.href)) ? 'Link copied' : 'Couldn’t copy. Copy the address bar instead.')}
        >
          <Icon name="link" size={18} /> Copy link
        </button>
      </div>
    </Modal>
  );
}
