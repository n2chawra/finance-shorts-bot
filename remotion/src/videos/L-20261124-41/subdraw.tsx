// Titan drawn flat and big for the thumbnails: white fairing, black carbon band, titanium domes, the window,
// thrusters and the yellow rails. (x, y) is the centre, `L` the length in pixels; `crack` draws a glowing red
// crack across the carbon band.
import React from "react";

export const BigSub: React.FC<{ x: number; y: number; L: number; crack?: boolean; cut?: boolean; tilt?: number }> = ({ x, y, L, crack = false, cut = false, tilt = 0 }) => {
  const u = L / 100;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${u})`}>
      <ellipse cx={0} cy={30} rx={52} ry={6} fill="#000" opacity={0.25} />
      <path d="M -30 -15 L -50 -9 L -50 9 L -30 15 Z" fill="#e9edf1" stroke="#0a0f14" strokeWidth={1.2} />
      {[-11, 7].map((dy, i) => <rect key={i} x={-55} y={dy - 3} width={8} height={7} rx={2} fill="#22272e" />)}
      <rect x={-31} y={-17} width={56} height={34} rx={3} fill={cut ? "#2a2e35" : "#e9edf1"} stroke="#0a0f14" strokeWidth={1.2} />
      {!cut && <path d="M -31 -17 L 25 -17 L 25 -6 L -31 -6 Z" fill="#ffffff" />}
      <rect x={-22} y={cut ? -15 : -6} width={40} height={cut ? 30 : 21} fill="#1b1d21" />
      {[-14, -6, 2, 10].map((xx) => <line key={xx} x1={xx} y1={cut ? -15 : -6} x2={xx} y2={15} stroke="#2e333b" strokeWidth={0.8} />)}
      <rect x={-24} y={-16} width={3} height={32} fill="#aab0b7" />
      <rect x={17} y={-16} width={3} height={32} fill="#aab0b7" />
      <path d="M 20 -16 A 16 16 0 0 1 20 16 Z" fill="#b9bec4" stroke="#0a0f14" strokeWidth={1.2} />
      <circle cx={31} cy={0} r={4.5} fill="#9fd8ff" stroke="#0a0f14" strokeWidth={1} />
      <circle cx={31} cy={0} r={8} fill="#cfe9ff" opacity={0.25} />
      <rect x={-48} y={18} width={70} height={3} fill="#e8b21c" />
      {[-40, -20, 0, 15].map((xx) => <rect key={xx} x={xx} y={15} width={2} height={4} fill="#6d747c" />)}
      {crack && (
        <g>
          <path d="M -6 -6 L -2 0 L -7 5 L -1 10 L -4 15" fill="none" stroke="#ff2d2d" strokeWidth={1.6} />
          <path d="M -6 -6 L -2 0 L -7 5 L -1 10 L -4 15" fill="none" stroke="#ff8a6e" strokeWidth={4} opacity={0.35} />
        </g>
      )}
    </g>
  );
};
export default BigSub;
