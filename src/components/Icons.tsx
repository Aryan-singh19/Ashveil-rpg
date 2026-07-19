import React from "react";

export function ItemIcon({ item }: { item: any }) {
  const t = item.type;
  if (t === "potion") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M10 3h4v3l3 5v8a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8l3-5z" fill="#ebd9c8" opacity="0.9" />
      <path d="M8 14h8v5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="#c14848" />
      <rect x="9" y="2" width="6" height="2" rx="0.6" fill="#8a7a63" />
      {/* Liquid bubbles */}
      <circle cx="12" cy="16" r="1.2" fill="#fff" opacity="0.6" />
      <circle cx="10" cy="18" r="0.8" fill="#fff" opacity="0.4" />
    </svg>
  );

  if (t === "scroll") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="4" y="8" width="16" height="8" rx="2" fill="#e0ceab" />
      <circle cx="4" cy="12" r="2.4" fill="#a8956d" />
      <circle cx="20" cy="12" r="2.4" fill="#a8956d" />
      {/* Crimson ribbon ribbon tie */}
      <rect x="11" y="8" width="2" height="8" fill="#a62828" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="#8c2f2f" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );

  if (t === "key") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <circle cx="7" cy="12" r="4.5" fill="none" stroke="#d4a728" strokeWidth="2.5" />
      <rect x="11.5" y="10.8" width="9.5" height="2.4" fill="#d4a728" />
      <rect x="17" y="13.2" width="2" height="3" fill="#d4a728" />
      <rect x="19.5" y="13.2" width="2" height="3.6" fill="#d4a728" />
    </svg>
  );

  if (t === "gold") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <ellipse cx="9" cy="15" rx="5.5" ry="2.8" fill="#a17b1d" />
      <ellipse cx="9" cy="13.5" rx="5.5" ry="2.8" fill="#f2c130" />
      <ellipse cx="15" cy="12" rx="5.5" ry="2.8" fill="#a17b1d" />
      <ellipse cx="15" cy="10.5" rx="5.5" ry="2.8" fill="#ffd55c" />
    </svg>
  );

  if (t === "atk") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <line x1="4" y1="20" x2="18" y2="6" stroke="#e6ecf2" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="14" y1="20" x2="20" y2="14" stroke="#a38255" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  if (t === "def") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 2 L21 6 V12 C21 18 17 21 12 23 C7 21 3 18 3 12 V6 Z" fill="#58616c" />
      <path d="M12 4.5 L18.5 7.3 V12 C18.5 16.4 15.7 18.7 12 20.4 C8.3 18.7 5.5 16.4 5.5 12 V7.3 Z" fill="#83909e" />
    </svg>
  );

  if (t === "maxhp") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <polygon points="12,2 20,9 16,22 8,22 4,9" fill="#5a8bbf" opacity="0.9" />
      <polygon points="12,5 17,9.5 14,19 10,19 7,9.5" fill="#a3ceff" />
    </svg>
  );

  if (t === "focus") return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 3 L17 9 V17 L12 21 L7 17 V9 Z" fill="#304e9c" opacity="0.9" />
      <path d="M12 6 L15 10 V15.5 L12 18 L9 15.5 V10 Z" fill="#82a5f5" />
    </svg>
  );

  return null;
}

export function ChestIcon({ opened }: { opened?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="3" y="11" width="18" height="9" rx="1.5" fill="#523924" />
      <rect x="3" y="6" width="18" height="6" rx="1.5" fill="#7a5536" />
      {/* Lock or metal reinforcement lock */}
      <rect x="10.5" y="9.5" width="3" height="4.5" rx="0.6" fill={opened ? "#425c3a" : "#d4a728"} />
      <rect x="3" y="11.5" width="18" height="1.6" fill="#2d1c10" />
    </svg>
  );
}

export function StairsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <polygon points="4,20 4,15 9,15 9,10 14,10 14,5 20,5 20,20" fill="#7c7366" opacity="0.9" />
      <polygon points="4,20 20,20 20,17 4,17" fill="#302924" />
    </svg>
  );
}

export function PortalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" className="animate-[spinSlow_5s_linear_infinite]">
      <defs>
        <radialGradient id="portalG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#5679db" />
          <stop offset="100%" stopColor="#1e1030" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#portalG)" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#aa9df5" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function BrazierIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M8 15 Q5 19 12 20 Q19 19 16 15 Z" fill="#2d2722" />
      <path d="M12 2 Q8 8 11 11 Q9 12 10 15 Q12 17 14 15 Q15 12 13 11 Q16 8 12 2 Z" fill="#f58022" className="animate-[flicker_1.2s_ease-in-out_infinite]" />
    </svg>
  );
}

export function LoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <rect x="5" y="4" width="14" height="17" rx="1.5" fill="#4d443a" stroke="#2a241f" strokeWidth="1" />
      {/* Book details */}
      <rect x="7" y="7" width="10" height="1.6" fill="#1f1a16" />
      <rect x="7" y="10.5" width="10" height="1.6" fill="#1f1a16" />
      <rect x="7" y="14" width="6" height="1.6" fill="#1f1a16" />
      {/* Bookmark ribbon */}
      <path d="M14 4 L14 12 L16 10 L18 12 L18 4 Z" fill="#a62424" />
    </svg>
  );
}

export function NpcIcon({ kind }: { kind?: string }) {
  const colors: Record<string, string> = {
    soldier: "#60734a",
    ghost: "#8fc4b4",
    prisoner: "#857362",
    bard: "#cc9e1f",
    merchant: "#704c2b",
  };
  const c = colors[kind || ""] || "#9e8e7a";
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M7 21 L6 13 Q12 7 18 13 L17 21 Z" fill={c} stroke="#1d1916" strokeWidth="0.8" />
      <circle cx="12" cy="7" r="4" fill={shade(c, 0.2)} stroke="#1d1916" strokeWidth="0.8" />
      {kind === "prisoner" && <line x1="8" y1="16" x2="16" y2="18" stroke="#201a16" strokeWidth="1.5" />}
      {kind === "bard" && <path d="M16 14 Q19 12 17 19 Q15 21 16 14" fill="#4a2c14" />}
      {kind === "merchant" && <path d="M5 8 Q12 1 19 8 L17 10 Q12 5 7 10 Z" fill="#2d1d11" />}
    </svg>
  );
}

function shade(hex: string, pct: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h, 16);
  let r = (num >> 16) + Math.round(255 * pct);
  let g = ((num >> 8) & 0xff) + Math.round(255 * pct);
  let b = (num & 0xff) + Math.round(255 * pct);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
