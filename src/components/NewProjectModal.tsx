import { useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { useStore, type NewSection } from '../lib/store';
import { useToast } from './Toast';
import { fileToDataUrl, figmaFileName, isFigmaUrl } from '../lib/util';

export async function filesToSections(files: FileList | File[]): Promise<NewSection[]> {
  const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
  return Promise.all(imgs.map(async (f) => ({ name: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), kind: 'image' as const, url: await fileToDataUrl(f) })));
}

/** Add new: name a project and optionally drop screens or paste a Figma link. Enter creates it. */
export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { createProject } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<NewSection[]>([]);
  const [over, setOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const linkBad = link.trim() !== '' && !isFigmaUrl(link.trim());

  const take = async (list: FileList | File[]) => {
    const made = await filesToSections(list);
    if (!made.length) return toast('Only images can be added: PNG, JPG, GIF, WebP or SVG.');
    setFiles((xs) => [...xs, ...made]);
    if (!name) setName(made[0].name);
  };

  const create = () => {
    if (linkBad) return;
    const sections: NewSection[] = [...files];
    if (link.trim()) sections.push({ name: figmaFileName(link.trim()), kind: 'figma', url: link.trim() });
    const finalName = name.trim() || (link.trim() ? figmaFileName(link.trim()) : 'Untitled project');
    const id = createProject(finalName, sections);
    toast(`${finalName} created`);
    onClose();
    nav(`/p/${id}`);
  };

  return (
    <Modal title="New project" onClose={onClose} width={520}>
      <form className="np" onSubmit={(e) => { e.preventDefault(); create(); }}>
        <label className="field-label body2" htmlFor="np-name">Name</label>
        <input id="np-name" className="field" placeholder="e.g. Checkout redesign" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <div
          className={`np-drop${over ? ' is-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e: DragEvent) => { e.preventDefault(); setOver(false); void take(e.dataTransfer.files); }}
          onClick={() => fileInput.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fileInput.current?.click())}
        >
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && void take(e.target.files)} />
          {files.length ? (
            <div className="np-thumbs">
              {files.map((f, i) => <img key={i} src={f.url} alt={f.name} />)}
              <span className="body2 muted">{files.length} {files.length === 1 ? 'screen' : 'screens'} added</span>
            </div>
          ) : (
            <><Icon name="upload" size={22} /><span className="body2">Drop screens here or click to browse</span></>
          )}
        </div>
        <label className="field-label body2" htmlFor="np-link">Or attach a Figma link</label>
        <input id="np-link" className={`field${linkBad ? ' has-error' : ''}`} placeholder="figma.com/design/…" value={link} onChange={(e) => setLink(e.target.value)} aria-invalid={linkBad} />
        {linkBad && <p className="error caption-l">That isn’t a Figma file link. Copy it from Share → Copy link in Figma.</p>}
        <div className="np-actions">
          <button type="button" className="btn btn-white btn-outline-soft" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-black" disabled={linkBad}>Create project</button>
        </div>
      </form>
    </Modal>
  );
}
