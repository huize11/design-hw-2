import { useEffect, useState } from 'react';
import type { Attachment } from '../lib/types';
import { Icon } from './Icon';

/** Moodboard expanded: grows from where it was clicked, arrows to browse, Esc to close. */
export function Lightbox({ images, index, origin, onClose }: { images: Attachment[]; index: number; origin?: DOMRect; onClose: () => void }) {
  const [i, setI] = useState(index);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % images.length);
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => {
    setOpen(false);
    setTimeout(onClose, 220);
  };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const from = origin
    ? `translate(${origin.left + origin.width / 2 - vw / 2}px, ${origin.top + origin.height / 2 - vh / 2}px) scale(${Math.max(0.15, origin.width / Math.min(vw * 0.8, 1100))})`
    : 'scale(0.9)';
  return (
    <div className={`lightbox${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Moodboard" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="lightbox-stage" style={{ transform: open ? 'none' : from }}>
        <img src={images[i].url} alt={images[i].name ?? `Image ${i + 1}`} />
      </div>
      <div className="lightbox-bar">
        {images.length > 1 && <button className="lb-btn" onClick={() => setI((v) => (v - 1 + images.length) % images.length)} aria-label="Previous image"><Icon name="arrowLeft" /></button>}
        <span className="body2">{i + 1} of {images.length}</span>
        {images.length > 1 && <button className="lb-btn" onClick={() => setI((v) => (v + 1) % images.length)} aria-label="Next image"><Icon name="arrowLeft" style={{ transform: 'scaleX(-1)' }} /></button>}
        <button className="lb-btn" onClick={close} aria-label="Close"><Icon name="close" /></button>
      </div>
    </div>
  );
}
