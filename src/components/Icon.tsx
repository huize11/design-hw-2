import type { SVGProps } from 'react';

const paths: Record<string, JSX.Element> = {
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  layers: <><path d="M12 4l9 5-9 5-9-5z" strokeLinejoin="round" /><path d="M3 14l9 5 9-5" strokeLinejoin="round" /></>,
  sidebar: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M13 13h5v4h-5z" /></>,
  grip: <>{[7, 12, 17].flatMap((y) => [<circle key={`a${y}`} cx="9" cy={y} r="1.3" fill="currentColor" stroke="none" />, <circle key={`b${y}`} cx="15" cy={y} r="1.3" fill="currentColor" stroke="none" />])}</>,
  chevronUp: <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  home: <path d="M4 10.5L12 4l8 6.5V20H4z" strokeLinejoin="round" />,
  homeFill: <path d="M4 10.5L12 4l8 6.5V20H4z" fill="currentColor" stroke="none" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>,
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  folder: <path d="M3 7h7l2 2h9v10H3z" strokeLinejoin="round" />,
  folderFill: <path d="M3 6.5h7l2 2h9V19H3z" fill="currentColor" stroke="none" />,
  bell: <><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" strokeLinejoin="round" /><path d="M10 20h4" /></>,
  minus: <path d="M6 12h12" strokeLinecap="round" />,
  chevronDown: <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  chevronRight: <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />,
  check: <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />,
  link: <><path d="M10 14a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1" strokeLinecap="round" /><path d="M14 10a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1" strokeLinecap="round" /></>,
  image: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M4 15l4.5-4.5 4 4 2.5-2.5 5 5" strokeLinejoin="round" /><circle cx="15.5" cy="8.5" r="1.5" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" /></>,
  send: <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  share: <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />,
  comment: <><path d="M12 4c4.4 0 8 3 8 7s-3.6 7-8 7c-1 0-2-.2-2.9-.5L5 19l1.1-3.3C4.8 14.4 4 12.8 4 11c0-4 3.6-7 8-7z" strokeLinejoin="round" /><path d="M9 10h6M9 13h4" strokeLinecap="round" /></>,
  more: <><circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17" /></>,
  compass: <><circle cx="12" cy="12" r="8" /><path d="M15 9l-2 4-4 2 2-4z" strokeLinejoin="round" /></>,
  download: <><path d="M12 4v12M7 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20h16" strokeLinecap="round" /></>,
  trash: <><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" strokeLinecap="round" strokeLinejoin="round" /></>,
  undo: <><path d="M9 7L4 12l5 5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 12h10a6 6 0 010 12" strokeLinecap="round" /></>,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 16, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...rest}>
      {paths[name]}
    </svg>
  );
}

export function Sparkle({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Written by AI" role="img" className="sparkle">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="currentColor" />
    </svg>
  );
}
