import type { MockName } from '../lib/types';

/* Low-fidelity screens that stand in for the designs being reviewed.
   Drawn at 320x206 and scaled by their container. */

const line = (x: number, y: number, w: number, h = 3, fill = '#E4E4E4') => <rect x={x} y={y} width={w} height={h} rx={1} fill={fill} />;

function Rows({ x, y, w, n, h = 15 }: { x: number; y: number; w: number; n: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={8} fill="#fff" stroke="#BDBDBD" strokeWidth={0.4} />
      {line(x + 4, y + 3, 14, 2.5, '#9E9E9E')}
      {[0.42, 0.55, 0.68, 0.8, 0.92].map((p) => line(x + w * p, y + 3, 9, 2, '#B5B5B5'))}
      {Array.from({ length: n }, (_, i) => {
        const ry = y + 8 + i * h;
        return (
          <g key={i}>
            <rect x={x} y={ry} width={w} height={h} fill="#fff" stroke="#E0E0E0" strokeWidth={0.3} />
            <rect x={x + 4} y={ry + 3} width={18} height={h - 6} rx={1} fill="#E1E1E1" />
            {line(x + 26, ry + 4, 22, 2.5, '#6E6E6E')}
            {line(x + 26, ry + 8.5, 14, 2)}
            {line(x + w * 0.42, ry + 6, 8, 2, '#9E9E9E')}
            <rect x={x + w * 0.55} y={ry + 5} width={13} height={4} rx={2} fill="#CDF5ED" />
            {line(x + w * 0.68, ry + 6, 8, 2, '#9E9E9E')}
            {line(x + w * 0.8, ry + 6, 8, 2, '#9E9E9E')}
            {line(x + w * 0.92, ry + 6, 6, 2, '#6E6E6E')}
          </g>
        );
      })}
    </g>
  );
}

function Search() {
  return (
    <>
      <rect width={320} height={206} fill="#fff" />
      <rect width={10} height={206} fill="#E9E9E9" />
      <rect x={2} y={4} width={6} height={6} rx={3} fill="#007468" />
      <rect x={10} width={58} height={206} fill="#FAFAFA" stroke="#DDD" strokeWidth={0.4} />
      {line(14, 12, 14, 3, '#333')}
      {[22, 40, 50, 60, 70, 80].map((y) => <rect key={y} x={14} y={y} width={50} height={y === 22 ? 14 : 7} rx={2} fill="none" stroke="#C9C9C9" strokeWidth={0.4} />)}
      <rect x={16} y={30} width={10} height={4} rx={2} fill="#A9ECC8" />
      <rect x={28} y={30} width={10} height={4} rx={2} fill="#FAEED4" />
      <rect x={40} y={30} width={10} height={4} rx={2} fill="#FFE3DA" />
      {line(14, 96, 22, 3, '#333')}
      {[104, 112, 120, 128, 136].map((y) => <rect key={y} x={14} y={y} width={50} height={6} rx={1.5} fill="none" stroke="#C9C9C9" strokeWidth={0.4} />)}
      {line(77, 6, 26, 4, '#111')}
      {line(78, 15, 28, 2.5, '#777')}
      {[110, 124, 140, 158].map((x) => <rect key={x} x={x} y={14} width={12} height={4} rx={2} fill="#DEDEDE" />)}
      <rect x={76} y={20} width={179} height={60} rx={1.5} fill="#fff" stroke="#BDBDBD" strokeWidth={0.4} />
      {line(80, 24, 26, 2.5, '#333')}
      <rect x={110} y={23} width={22} height={4} rx={2} fill="#BEBEBE" />
      {[31, 35, 39, 43, 47].map((y) => line(80, y, 62, 2))}
      <line x1={150} y1={22} x2={150} y2={78} stroke="#CCC" strokeWidth={0.4} />
      {[156, 184, 208].map((x) => <g key={x}>{line(x, 24, 16, 2, '#9A9A9A')}{line(x, 29, 10, 4, '#222')}</g>)}
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={156 + i * 6.5} y={52 - (3 + ((i * 7) % 10))} width={4.5} height={3 + ((i * 7) % 10)} fill="#D9D9D9" />)}
      <rect x={156} y={66} width={96} height={6} fill="#DEDEDE" />
      <rect x={156} y={66} width={30} height={6} fill="#9D9D9D" />
      <rect x={186} y={66} width={22} height={6} fill="#B9B9B9" />
      <Rows x={76} y={84} w={179} n={5} />
      <rect x={258} y={20} width={58} height={182} fill="#fff" stroke="#BDBDBD" strokeWidth={0.4} />
      {line(262, 24, 20, 2.5, '#333')}
      <rect x={274} y={34} width={38} height={10} rx={4} fill="#CEEADD" />
      <rect x={276} y={60} width={34} height={6} rx={3} fill="#CDF5ED" />
      {line(262, 50, 44, 2)}
      {line(262, 72, 40, 2)}
      <rect x={260} y={178} width={54} height={20} rx={4} fill="none" stroke="#C9C9C9" strokeWidth={0.4} />
      <rect x={298} y={190} width={12} height={5} rx={2.5} fill="#007468" />
      <rect x={267} y={5} width={22} height={4} rx={2} fill="#CDF5ED" />
      <rect x={293} y={5} width={15} height={4} rx={2} fill="#CDF5ED" />
    </>
  );
}

function Compare() {
  return (
    <>
      <rect width={320} height={206} fill="#fff" />
      <rect width={51} height={206} fill="#F4F4F4" />
      <rect x={4} y={4} width={7} height={7} rx={3.5} fill="#007468" />
      {line(14, 6, 24, 2.5, '#555')}
      {[24, 31, 38, 45, 52, 70, 77, 84].map((y) => line(8, y, 30, 2.5, '#999'))}
      <rect x={4} y={192} width={43} height={9} rx={4} fill="#D4D4D4" />
      <circle cx={10} cy={196.5} r={3} fill="#007468" />
      {line(64, 8, 4, 3, '#333')}
      {line(64, 16, 46, 5, '#111')}
      {line(64, 25, 18, 2.5, '#777')}
      {line(64, 38, 11, 2.5, '#888')}
      {line(76, 37, 12, 4, '#222')}
      <rect x={64} y={46} width={40} height={20} rx={1} fill="none" stroke="#BDBDBD" strokeWidth={0.4} />
      {[46, 51, 64].map((y) => line(108, y, 18, 2.5, '#888'))}
      <rect x={292} y={6} width={15} height={4} rx={2} fill="#CDF5ED" />
      <rect x={63} y={73} width={245} height={116} rx={1.5} fill="#fff" stroke="#BDBDBD" strokeWidth={0.4} />
      {line(70, 76, 14, 2.5, '#333')}
      {[168, 188, 210, 232, 256, 276].map((x) => line(x, 76, 14, 2, '#888'))}
      {[0, 1, 2].map((i) => {
        const y = 82 + i * 32;
        return (
          <g key={i}>
            <line x1={63} y1={y} x2={308} y2={y} stroke="#DDD" strokeWidth={0.4} />
            <rect x={70} y={y + 3} width={46} height={26} fill="#E1E1E1" />
            {line(124, y + 7, 24, 3, '#333')}
            {[12, 17, 22].map((d) => line(124, y + d, 12, 2, '#9A9A9A'))}
            {[176, 194, 210, 232, 252].map((x) => line(x, y + 15, 12, 2, '#777'))}
            <rect x={270} y={y + 12} width={20} height={4} rx={1} fill="#DEDEDE" />
            <rect x={270} y={y + 12} width={14} height={4} rx={1} fill="#9AD9C8" />
          </g>
        );
      })}
      <rect x={270} y={180} width={28} height={6} rx={3} fill="#CDF5ED" />
    </>
  );
}

function Signin() {
  return (
    <>
      <rect width={320} height={206} fill="#F7F4EF" />
      <rect x={110} y={22} width={100} height={162} rx={8} fill="#fff" />
      {line(124, 38, 34, 6, '#222')}
      {line(124, 50, 54, 3, '#AAA')}
      {[64, 88, 112].map((y) => <g key={y}>{line(124, y, 22, 2.5, '#777')}<rect x={124} y={y + 5} width={72} height={12} rx={3} fill="#fff" stroke="#D0D0D0" strokeWidth={0.6} /></g>)}
      <rect x={124} y={142} width={72} height={14} rx={7} fill="#F34E4E" />
      {line(140, 164, 40, 2.5, '#BBB')}
    </>
  );
}

function Email() {
  return (
    <>
      <rect width={320} height={206} fill="#EFEBF2" />
      <rect x={90} y={12} width={140} height={182} rx={4} fill="#fff" />
      <rect x={102} y={22} width={30} height={8} rx={2} fill="#E8E2EA" />
      <rect x={102} y={38} width={116} height={58} rx={4} fill="#E8E2EA" />
      {line(102, 104, 80, 4, '#333')}
      {[112, 118, 124].map((y) => line(102, y, 108 - (y % 20), 2.5, '#BBB'))}
      <rect x={130} y={150} width={60} height={14} rx={7} fill="#282828" />
      {line(124, 178, 72, 2, '#DDD')}
    </>
  );
}

function Tokens() {
  const colors = ['#F34E4E', '#FF8686', '#FFDFDF', '#A21515', '#D54949', '#EED2D2', '#8F4500', '#E9A000', '#F9E6D5'];
  return (
    <>
      <rect width={320} height={206} fill="#fff" />
      {line(20, 18, 50, 6, '#222')}
      {[34, 46, 58, 70].map((y, i) => line(20, y, 40 - i * 4, 5 - i, '#333'))}
      {line(20, 92, 30, 2.5, '#777')}
      {line(20, 98, 26, 2.5, '#777')}
      {colors.map((c, i) => <rect key={c} x={110 + (i % 3) * 26} y={28 + Math.floor(i / 3) * 26} width={20} height={20} rx={4} fill={c} />)}
      {['#F5F2EC', '#E1E6DD', '#EDE7DD', '#E8E2EA'].map((c, i) => <rect key={c} x={210} y={28 + i * 24} width={20} height={20} rx={4} fill={c} stroke="#E5E5E5" strokeWidth={0.4} />)}
      <rect x={20} y={130} width={42} height={14} rx={6} fill="#282828" />
      <rect x={68} y={130} width={42} height={14} rx={6} fill="#fff" stroke="#CCC" strokeWidth={0.6} />
      <rect x={116} y={132} width={34} height={10} rx={5} fill="#EED2D2" />
      <rect x={156} y={132} width={34} height={10} rx={5} fill="#F9E6D5" />
    </>
  );
}

function Profile() {
  return (
    <>
      <rect width={320} height={206} fill="#F3EDE5" />
      <rect x={60} y={14} width={200} height={178} rx={4} fill="#fff" />
      <circle cx={100} cy={56} r={20} fill="#EFE6DB" />
      {line(130, 46, 70, 6, '#222')}
      {line(130, 58, 50, 3, '#AAA')}
      {[90, 112, 134].map((y) => <rect key={y} x={76} y={y} width={168} height={16} rx={3} fill="#F7F4EF" />)}
      <rect x={176} y={164} width={68} height={14} rx={7} fill="#282828" />
    </>
  );
}

const MAP: Record<MockName, () => JSX.Element> = { search: Search, compare: Compare, signin: Signin, email: Email, tokens: Tokens, profile: Profile };

export function Mock({ name, className }: { name: MockName; className?: string }) {
  const Draw = MAP[name];
  return (
    <svg className={className} viewBox="0 0 320 206" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Draw />
    </svg>
  );
}
