import { useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { figmaFileName, isFigmaUrl } from '../lib/util';
import { Icon } from '../components/Icon';
import { Sidebar, TopBar } from '../components/Shell';
import { useToast } from '../components/Toast';
import { filesToSections } from '../components/NewProjectModal';

/** Home: drop screens or attach a Figma link. One action starts a project. */
export function Home() {
  const { createProject } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [over, setOver] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const fromFiles = async (files: FileList | File[]) => {
    const sections = await filesToSections(files);
    if (!sections.length) return toast('Only images can be added: PNG, JPG, GIF, WebP or SVG.');
    const name = sections[0].name;
    const id = createProject(name, sections);
    toast(`${sections.length} ${sections.length === 1 ? 'screen' : 'screens'} added to ${name}`);
    nav(`/p/${id}`);
  };

  const attach = () => {
    const url = link.trim();
    if (!isFigmaUrl(url)) return setError('That isn’t a Figma file link. Copy it from Share → Copy link in Figma.');
    const name = figmaFileName(url);
    const id = createProject(name, [{ name, kind: 'figma', url }]);
    toast(`${name} attached`);
    nav(`/p/${id}`);
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="page">
        <TopBar />
        <label
          className={`drop${over ? ' is-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e: DragEvent) => { e.preventDefault(); setOver(false); void fromFiles(e.dataTransfer.files); }}
        >
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => e.target.files && void fromFiles(e.target.files)} />
          <span className="drop-icon"><Icon name="upload" size={40} strokeWidth={1.4} /></span>
          <span className="h3">Drop files here</span>
          <span className="body1">Screens, moodboards, screenshots</span>
        </label>
        <form className="attach" onSubmit={(e) => { e.preventDefault(); attach(); }}>
          <label htmlFor="figma-link" className="body1">Or attach a figma link</label>
          <div className={`attach-bar${error ? ' has-error' : ''}`}>
            <Icon name="link" size={14} />
            <input id="figma-link" placeholder="figma.com" value={link} onChange={(e) => { setLink(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'link-error' : undefined} />
            <button className="btn btn-black" type="submit" disabled={!link.trim()}>Attach</button>
          </div>
          {error && <p id="link-error" className="error caption-l">{error}</p>}
        </form>
      </main>
    </div>
  );
}
