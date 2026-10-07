import type { Section } from '../lib/types';
import { Mock } from './Mocks';
import { figmaEmbedUrl } from '../lib/util';

/** Static thumbnail of a section's screen for cards. */
export function Preview({ section, live = false }: { section: Section; live?: boolean }) {
  if (section.kind === 'mock' && section.mock) return <Mock name={section.mock} className="preview-fill" />;
  if (section.kind === 'image' && section.url) return <img className="preview-fill preview-img" src={section.url} alt="" draggable={false} />;
  if (section.kind === 'figma' && section.url) {
    return live ? (
      <iframe className="preview-fill" title={section.name} src={figmaEmbedUrl(section.url)} allowFullScreen />
    ) : (
      <span className="preview-figma"><span className="figma-mark" aria-hidden="true" /><span className="caption">Figma file</span></span>
    );
  }
  return null;
}
