import React from "react";
import { C } from "../constants";

// Helper to shade colors for gradients
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

interface SpriteProps {
  uid?: string;
  accent?: string;
  isHurt?: boolean;
}

export function KnightSprite({ uid = "k", accent = C.gold, isHurt }: SpriteProps) {
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f3f6" />
          <stop offset="50%" stopColor="#8c97a5" />
          <stop offset="100%" stopColor="#555f6c" />
        </linearGradient>
        <linearGradient id={`${uid}-metal-dark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a8594" />
          <stop offset="100%" stopColor="#3c434d" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe67a" />
          <stop offset="100%" stopColor="#9e7c11" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="40" cy="92" rx="20" ry="5" fill="#000000" opacity="0.45" />

      {/* Body & Legs */}
      <g className="animate-[walkBob_1.8s_ease-in-out_infinite]">
        <rect x="28" y="68" width="10" height="20" rx="4" fill={`url(#${uid}-metal-dark)`} />
        <rect x="42" y="68" width="10" height="20" rx="4" fill={`url(#${uid}-metal-dark)`} />
        
        {/* Foot plates */}
        <path d="M24 88 h14 v5 h-16 z" fill="#3c434d" />
        <path d="M42 88 h14 v5 h-16 z" fill="#3c434d" />

        {/* Cape */}
        <path d="M22 38 L14 80 Q32 88 50 80 L42 38 Z" fill="#6e1b1b" opacity="0.9" />
        
        {/* Torso Plate */}
        <path d="M22 36 L18 64 Q40 74 62 64 L58 36 Z" fill={`url(#${uid}-metal)`} stroke="#2a2f35" strokeWidth="1.5" />
        <path d="M30 36 L34 68 M50 36 L46 68" stroke={`url(#${uid}-metal-dark)`} strokeWidth="1" opacity="0.6" />
        {/* Golden Crest */}
        <polygon points="40,40 46,48 40,56 34,48" fill={`url(#${uid}-gold)`} />
        <rect x="20" y="46" width="40" height="4" fill={accent} opacity="0.7" />

        {/* Shoulders */}
        <circle cx="18" cy="40" r="8" fill={`url(#${uid}-metal-dark)`} />
        <circle cx="62" cy="40" r="8" fill={`url(#${uid}-metal-dark)`} />
        <circle cx="18" cy="40" r="5" fill={`url(#${uid}-gold)`} />
        <circle cx="62" cy="40" r="5" fill={`url(#${uid}-gold)`} />

        {/* Head / Helmet */}
        <g transform="translate(0, -2)">
          <circle cx="40" cy="22" r="14" fill={`url(#${uid}-metal)`} stroke="#2a2f35" strokeWidth="1.5" />
          {/* Visor slit */}
          <path d="M28 20 h24 v6 h-24 z" fill="#15181c" />
          {/* Visor glowing eyes */}
          <circle cx="35" cy="23" r="1.5" fill="#ff4d4d" filter={`url(#${uid}-glow)`} />
          <circle cx="45" cy="23" r="1.5" fill="#ff4d4d" filter={`url(#${uid}-glow)`} />
          {/* Helmet plume */}
          <path d="M40 8 Q46 0 56 6 Q46 12 40 10 Z" fill="#9c2424" />
          <path d="M40 8 Q34 0 24 6 Q34 12 40 10 Z" fill="#c12d2d" />
        </g>

        {/* Shield (Left arm) */}
        <g transform="translate(-6, 12)">
          <path d="M12 20 Q12 10 24 10 Q36 10 36 20 Q36 40 24 50 Q12 40 12 20 Z" fill={`url(#${uid}-metal-dark)`} stroke="#1b1e22" strokeWidth="1.5" />
          <path d="M15 22 Q15 13 24 13 Q33 13 33 22 Q33 38 24 46 Q15 38 15 22 Z" fill="#20242a" />
          <path d="M24 13 v33" stroke={`url(#${uid}-gold)`} strokeWidth="2" opacity="0.9" />
          <circle cx="24" cy="28" r="4" fill={`url(#${uid}-gold)`} />
        </g>

        {/* Sword (Right arm) */}
        <g transform="translate(56, 32) rotate(15)" style={{ transformOrigin: "10px 40px" }} className="animate-[floatIdle_2.4s_ease-in-out_infinite]">
          {/* Blade */}
          <path d="M8 -25 L12 -25 L14 28 L6 28 Z" fill={`url(#${uid}-metal)`} />
          {/* Sword tip */}
          <polygon points="10,-32 14,-25 6,-25" fill="#f0f3f6" />
          {/* Crossguard */}
          <rect x="0" y="28" width="20" height="5" rx="1.5" fill={`url(#${uid}-gold)`} />
          {/* Hilt / Grip */}
          <rect x="7" y="33" width="6" height="12" rx="1" fill="#442a13" />
          {/* Pommel */}
          <circle cx="10" cy="47" r="3.5" fill={`url(#${uid}-gold)`} />
          {/* Glow edge */}
          <line x1="10" y1="-28" x2="10" y2="28" stroke="#ffffff" strokeWidth="1" opacity="0.65" />
        </g>
      </g>
    </svg>
  );
}

export function MageSprite({ uid = "m", accent = C.arcane, isHurt }: SpriteProps) {
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
      <defs>
        <linearGradient id={`${uid}-robe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={shade(accent, -0.55)} />
        </linearGradient>
        <radialGradient id={`${uid}-orb-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor={shade(accent, 0.4)} />
          <stop offset="70%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-magic-glow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="40" cy="92" rx="18" ry="4.5" fill="#000000" opacity="0.5" />

      {/* Mage Body */}
      <g className="animate-[walkBob_2s_ease-in-out_infinite]">
        {/* Cloak/Robe lower */}
        <path d="M26 88 L16 50 Q40 44 64 50 L54 88 Z" fill={`url(#${uid}-robe)`} stroke="#181310" strokeWidth="1.5" />
        <path d="M34 50 L31 88 M46 50 L49 88" stroke={shade(accent, -0.35)} strokeWidth="1.5" opacity="0.7" />

        {/* Chest Plate / Vest */}
        <path d="M24 38 L20 54 Q40 60 60 54 L56 38 Z" fill="#2b211a" stroke="#423429" strokeWidth="1.5" />
        <circle cx="40" cy="46" r="3" fill={accent} filter={`url(#${uid}-magic-glow)`} />

        {/* Shoulders / Sleeves */}
        <path d="M24 38 Q12 44 14 56" stroke={`url(#${uid}-robe)`} strokeWidth="8" strokeLinecap="round" />
        <path d="M56 38 Q68 44 66 56" stroke={`url(#${uid}-robe)`} strokeWidth="8" strokeLinecap="round" />

        {/* Hood & Head */}
        <g transform="translate(0, -4)">
          <circle cx="40" cy="24" r="12" fill="#140f0c" />
          {/* Wizard Hat / Hood */}
          <path d="M18 28 Q40 18 62 28 Q40 0 18 28 Z" fill={`url(#${uid}-robe)`} stroke="#140f0c" strokeWidth="1" />
          <path d="M30 18 L40 -6 L50 18 Z" fill={shade(accent, -0.2)} />
          {/* Glowing Eyes inside dark hood */}
          <circle cx="35" cy="25" r="2.5" fill="#80b3ff" filter={`url(#${uid}-magic-glow)`} />
          <circle cx="45" cy="25" r="2.5" fill="#80b3ff" filter={`url(#${uid}-magic-glow)`} />
        </g>

        {/* Staff (Right Hand) */}
        <g transform="translate(10, 18)" className="animate-[floatIdle_2.5s_ease-in-out_infinite]">
          {/* Wood shaft */}
          <line x1="2" y1="-10" x2="2" y2="70" stroke="#4a3b2c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="2" y1="-10" x2="2" y2="70" stroke="#735d47" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          
          {/* Staff Crown */}
          <path d="M-4 -12 Q2 -24 8 -12 Q2 -16 -4 -12 Z" fill="#30251c" />
          <path d="M-8 -15 Q2 -30 12 -15 Q2 -20 -8 -15 Z" fill="#6e5641" />

          {/* Floating Orb of Magic */}
          <circle cx="2" cy="-26" r="14" fill={`url(#${uid}-orb-glow)`} />
          <circle cx="2" cy="-26" r="6" fill="#ffffff" filter={`url(#${uid}-magic-glow)`} />
          {/* Sparkles rising */}
          <circle cx="-6" cy="-34" r="1" fill="#fff" opacity="0.8" />
          <circle cx="10" cy="-38" r="1.5" fill="#b0cfff" opacity="0.7" />
          <circle cx="2" cy="-44" r="1" fill="#fff" opacity="0.9" />
        </g>

        {/* Left hand summoning spell effect */}
        <g transform="translate(64, 52)" className="animate-[floatIdle_2s_ease-in-out_infinite]">
          <circle cx="0" cy="0" r="10" fill={`url(#${uid}-orb-glow)`} opacity="0.85" />
          <circle cx="0" cy="0" r="3.5" fill="#fff" filter={`url(#${uid}-magic-glow)`} />
        </g>
      </g>
    </svg>
  );
}

export function RogueSprite({ uid = "r", accent = C.moss, isHurt }: SpriteProps) {
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
      <defs>
        <linearGradient id={`${uid}-cloak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={shade(accent, -0.5)} />
        </linearGradient>
        <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e1e8f0" />
          <stop offset="100%" stopColor="#55606d" />
        </linearGradient>
        <filter id={`${uid}-dagger-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="40" cy="92" rx="16" ry="4" fill="#000000" opacity="0.5" />

      {/* Rogue Body */}
      <g className="animate-[walkBob_1.6s_ease-in-out_infinite]">
        {/* Legs / Leather trousers */}
        <rect x="30" y="72" width="8" height="16" rx="2" fill="#241e1b" />
        <rect x="42" y="72" width="8" height="16" rx="2" fill="#241e1b" />

        {/* Cloak / Hood */}
        <path d="M22 84 L14 42 Q40 34 66 42 L58 84 Z" fill={`url(#${uid}-cloak)`} stroke="#141913" strokeWidth="1.5" />
        
        {/* Dark leather armor */}
        <path d="M25 40 L22 62 Q40 68 58 62 L55 40 Z" fill="#302925" stroke="#1d1917" strokeWidth="1.5" />
        <path d="M30 40 L30 62 M50 40 L50 62" stroke="#1a1513" strokeWidth="1" />
        {/* Accent belt */}
        <rect x="23" y="56" width="34" height="4" fill={shade(accent, -0.3)} />
        <circle cx="40" cy="58" r="3" fill="#bfa15c" />

        {/* Mask and Head */}
        <g transform="translate(0, -3)">
          <circle cx="40" cy="26" r="11" fill="#d2bba0" />
          {/* Hood overlay */}
          <path d="M26 28 Q40 12 54 28 Q40 18 26 28 Z" fill={`url(#${uid}-cloak)`} />
          {/* Mask covering lower half */}
          <path d="M29 26 Q40 36 51 26 L48 38 Q40 42 32 38 Z" fill="#201a18" />
          {/* Sharp Glowing green eyes */}
          <polygon points="32,23 38,21 37,25" fill="#4dff88" filter={`url(#${uid}-dagger-glow)`} />
          <polygon points="48,23 42,21 43,25" fill="#4dff88" filter={`url(#${uid}-dagger-glow)`} />
        </g>

        {/* Daggers in hands */}
        {/* Left hand dagger */}
        <g transform="translate(14, 52) rotate(-40)" className="animate-[floatIdle_2s_ease-in-out_infinite]">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#403225" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M-2 -24 L2 -24 L3 0 L-3 0 Z" fill={`url(#${uid}-steel)`} />
          <polygon points="0,-30 2,-24 -2,-24" fill="#ffffff" />
          <line x1="0" y1="-26" x2="0" y2="0" stroke="#7affb8" strokeWidth="1" filter={`url(#${uid}-dagger-glow)`} opacity="0.7" />
        </g>

        {/* Right hand dagger */}
        <g transform="translate(66, 52) rotate(40)" className="animate-[floatIdle_1.8s_ease-in-out_infinite]">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#403225" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M-2 -24 L2 -24 L3 0 L-3 0 Z" fill={`url(#${uid}-steel)`} />
          <polygon points="0,-30 2,-24 -2,-24" fill="#ffffff" />
          <line x1="0" y1="-26" x2="0" y2="0" stroke="#7affb8" strokeWidth="1" filter={`url(#${uid}-dagger-glow)`} opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}

export function HollowKingSprite({ uid = "hk", isHurt }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
      <defs>
        <linearGradient id={`${uid}-crown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#7a5200" />
        </linearGradient>
        <linearGradient id={`${uid}-cloak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e1414" />
          <stop offset="100%" stopColor="#080303" />
        </linearGradient>
        <radialGradient id={`${uid}-veil-glow`}>
          <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#800000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#140202" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-glowing-rift`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="112" rx="26" ry="6" fill="#000000" opacity="0.65" />

      {/* Pulsing Veil Energy Backdrop */}
      <circle cx="50" cy="55" r="42" fill={`url(#${uid}-veil-glow)`} className="animate-[flicker_2.4s_ease-in-out_infinite]" />

      <g className="animate-[floatIdle_2.4s_ease-in-out_infinite]">
        {/* Heavy Chains hanging */}
        <path d="M34 60 Q34 85 42 94" fill="none" stroke="#2c2c2c" strokeWidth="2.5" strokeDasharray="3 3" />
        <path d="M66 60 Q66 85 58 94" fill="none" stroke="#2c2c2c" strokeWidth="2.5" strokeDasharray="3 3" />

        {/* Gaping robes of emptiness */}
        <path d="M22 108 L12 50 Q50 34 88 50 L78 108 Q50 116 22 108 Z" fill={`url(#${uid}-cloak)`} stroke="#1f0909" strokeWidth="2" />
        <path d="M42 50 L36 108 M58 50 L64 108" stroke="#1c0707" strokeWidth="1.5" />

        {/* Skeletal ribs showing inside the dark void */}
        <g stroke="#806d6d" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
          <line x1="42" y1="58" x2="58" y2="58" />
          <line x1="40" y1="66" x2="60" y2="66" />
          <line x1="42" y1="74" x2="58" y2="74" />
          <line x1="45" y1="82" x2="55" y2="82" />
          {/* Spine */}
          <line x1="50" y1="50" x2="50" y2="90" strokeWidth="4" />
        </g>

        {/* Shoulders / Pauldrons */}
        <path d="M12 48 Q22 40 32 46" stroke="#4a3e3e" strokeWidth="8" strokeLinecap="round" />
        <path d="M88 48 Q78 40 68 46" stroke="#4a3e3e" strokeWidth="8" strokeLinecap="round" />

        {/* Head / Dark rift */}
        <g transform="translate(0, -6)">
          <circle cx="50" cy="34" r="16" fill="#0d0404" stroke="#2e1414" strokeWidth="1.5" />
          {/* Crimson Glowing Eyes */}
          <circle cx="43" cy="34" r="3" fill="#ff3333" filter={`url(#${uid}-glowing-rift)`} />
          <circle cx="57" cy="34" r="3" fill="#ff3333" filter={`url(#${uid}-glowing-rift)`} />

          {/* Broken crown */}
          <polygon points="32,22 36,4 42,16 50,-2 58,16 64,4 68,22" fill={`url(#${uid}-crown)`} stroke="#3d2c00" strokeWidth="1" />
          {/* Jewels on crown */}
          <circle cx="50" cy="8" r="2" fill="#ff3333" />
          <circle cx="36" cy="14" r="1.5" fill="#3399ff" />
          <circle cx="64" cy="14" r="1.5" fill="#3399ff" />
        </g>
      </g>
    </svg>
  );
}

export function MonsterSprite({ enemy, uid = "mon", isHurt }: { enemy: any; uid?: string; isHurt?: boolean }) {
  const c = enemy.color || "#7a7264";
  const variant = enemy.variant || "humanoid";

  if (variant === "small") {
    // Rat, Moth Swarms
    const isMoth = enemy.name.includes("Moth");
    if (isMoth) {
      return (
        <svg viewBox="0 0 60 60" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
          <defs>
            <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bf9fff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#401a75" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="30" cy="48" rx="14" ry="4" fill="#000" opacity="0.35" />
          <g className="animate-[floatIdle_1.4s_ease-in-out_infinite]">
            {/* Glowing Aura */}
            <circle cx="30" cy="26" r="20" fill={`url(#${uid}-glow)`} />
            {/* Main Moth Wings */}
            <path d="M30 26 L12 10 Q14 30 30 28 Z" fill="#584b73" opacity="0.85" />
            <path d="M30 26 L48 10 Q46 30 30 28 Z" fill="#584b73" opacity="0.85" />
            
            {/* Lower Wings */}
            <path d="M30 26 L20 38 Q25 42 30 32 Z" fill="#403459" />
            <path d="M30 26 L40 38 Q35 42 30 32 Z" fill="#403459" />

            {/* Body */}
            <ellipse cx="30" cy="26" rx="4" ry="10" fill="#201533" />
            {/* Glowing eyes */}
            <circle cx="28" cy="20" r="1.2" fill="#d94bfa" />
            <circle cx="32" cy="20" r="1.2" fill="#d94bfa" />
          </g>
        </svg>
      );
    }

    // Default Small: Rat
    return (
      <svg viewBox="0 0 60 60" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
        <ellipse cx="30" cy="48" rx="16" ry="4.5" fill="#000" opacity="0.4" />
        <g className="animate-[walkBob_1.2s_ease-in-out_infinite]" style={{ transformOrigin: "30px 48px" }}>
          {/* Tail */}
          <path d="M14 42 Q4 42 8 32" fill="none" stroke="#a1847c" strokeWidth="2" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="32" cy="40" rx="15" ry="10" fill={c} />
          {/* Head */}
          <ellipse cx="44" cy="35" rx="8" ry="6" fill={shade(c, 0.1)} />
          {/* Ears */}
          <circle cx="40" cy="28" r="4.5" fill="#e89d97" stroke={c} strokeWidth="1.5" />
          {/* Eye */}
          <circle cx="46" cy="33" r="1.5" fill="#ff3333" />
          {/* Whiskers */}
          <line x1="48" y1="36" x2="56" y2="34" stroke="#4a403d" strokeWidth="1" />
          <line x1="48" y1="38" x2="54" y2="41" stroke="#4a403d" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  if (variant === "ghost") {
    // Ethereal Ghost / Ghast
    return (
      <svg viewBox="0 0 60 70" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(c, 0.35)} stopOpacity="0.95" />
            <stop offset="60%" stopColor={c} stopOpacity="0.6" />
            <stop offset="100%" stopColor={shade(c, -0.4)} stopOpacity="0" />
          </linearGradient>
          <filter id={`${uid}-ghost-glow`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="animate-[floatIdle_2.2s_ease-in-out_infinite]">
          {/* Wisp trail */}
          <path d="M15 56 Q12 36 30 14 Q48 36 45 56 Q38 46 30 56 Q22 46 15 56 Z" fill={`url(#${uid}-g)`} />
          {/* Ethereal hands */}
          <path d="M18 34 Q8 34 12 42" fill="none" stroke={shade(c, 0.1)} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
          <path d="M42 34 Q52 34 48 42" fill="none" stroke={shade(c, 0.1)} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
          
          {/* Eerie Face */}
          <circle cx="23" cy="26" r="3" fill="#ffffff" filter={`url(#${uid}-ghost-glow)`} />
          <circle cx="37" cy="26" r="3" fill="#ffffff" filter={`url(#${uid}-ghost-glow)`} />
          <ellipse cx="30" cy="34" rx="2.5" ry="5" fill="#152b21" opacity="0.8" />
        </g>
      </svg>
    );
  }

  if (variant === "stone") {
    // Stone Gargoyle / Stone Golems
    return (
      <svg viewBox="0 0 60 70" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
        <defs>
          <linearGradient id={`${uid}-s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(c, 0.15)} />
            <stop offset="100%" stopColor={shade(c, -0.4)} />
          </linearGradient>
        </defs>
        <ellipse cx="30" cy="62" rx="18" ry="4.5" fill="#000" opacity="0.45" />
        <g className="animate-[walkBob_2.5s_ease-in-out_infinite]" style={{ transformOrigin: "30px 62px" }}>
          {/* Stone Horns */}
          <polygon points="18,18 10,4 22,12" fill={shade(c, -0.25)} />
          <polygon points="42,18 50,4 38,12" fill={shade(c, -0.25)} />

          {/* Main Blocky Body */}
          <rect x="14" y="16" width="32" height="42" rx="5" fill={`url(#${uid}-s)`} stroke="#1f2124" strokeWidth="2" />
          {/* Cracked details */}
          <path d="M20 24 L26 30 L22 38" fill="none" stroke="#101112" strokeWidth="1.5" />
          <path d="M42 42 L36 48 L40 52" fill="none" stroke="#101112" strokeWidth="1.5" />

          {/* Mossy details */}
          <circle cx="18" cy="46" r="4" fill="#3e5236" opacity="0.8" />
          <circle cx="40" cy="26" r="3" fill="#3e5236" opacity="0.8" />

          {/* Glowing Ruby Eyes */}
          <circle cx="23" cy="28" r="3.5" fill="#ff3333" style={{ filter: "drop-shadow(0 0 4px #ff3333)" }} />
          <circle cx="37" cy="28" r="3.5" fill="#ff3333" style={{ filter: "drop-shadow(0 0 4px #ff3333)" }} />
        </g>
      </svg>
    );
  }

  // Humanoid standard (Cultist, Watchman)
  return (
    <svg viewBox="0 0 60 70" width="100%" height="100%" className={`select-none ${isHurt ? "animate-[hurtShake_0.3s_ease]" : ""}`}>
      <defs>
        <linearGradient id={`${uid}-h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(c, 0.1)} />
          <stop offset="100%" stopColor={shade(c, -0.45)} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="62" rx="16" ry="4" fill="#000" opacity="0.4" />
      <g className="animate-[walkBob_1.8s_ease-in-out_infinite]" style={{ transformOrigin: "30px 62px" }}>
        {/* Robe torso */}
        <path d="M16 58 L12 30 Q30 18 48 30 L44 58 Z" fill={`url(#${uid}-h)`} stroke="#1b1c1e" strokeWidth="1.5" />
        
        {/* Hood & Head */}
        <circle cx="30" cy="20" r="11" fill="#0f0f10" />
        <path d="M18 22 Q30 10 42 22 Q30 16 18 22 Z" fill={shade(c, -0.1)} />

        {/* Shadow Face glowing eyes */}
        <circle cx="25" cy="22" r="2" fill="#ff4d4d" style={{ filter: "drop-shadow(0 0 3px #ff4d4d)" }} />
        <circle cx="35" cy="22" r="2" fill="#ff4d4d" style={{ filter: "drop-shadow(0 0 3px #ff4d4d)" }} />

        {/* Weapons */}
        {enemy.name.includes("Priest") || enemy.name.includes("Lord") ? (
          // Candle Staff
          <g transform="translate(46, 12)">
            <line x1="2" y1="0" x2="2" y2="48" stroke="#332a24" strokeWidth="2.5" />
            <rect x="-1" y="-6" width="6" height="8" fill="#dfd0c0" />
            <circle cx="2" cy="-10" r="4.5" fill="#fca130" style={{ animation: "flicker 1s linear infinite" }} />
          </g>
        ) : (
          // Iron Rusty Blade
          <g transform="translate(44, 26) rotate(25)" style={{ transformOrigin: "2px 25px" }}>
            <rect x="0" y="-14" width="4" height="24" rx="1" fill="#69625d" stroke="#332e2c" strokeWidth="1" />
            <rect x="-3" y="10" width="10" height="2" fill="#9e7b16" />
            <rect x="1" y="12" width="2" height="6" fill="#30251c" />
          </g>
        )}
      </g>
    </svg>
  );
}

export function ClassSprite({ classKey, accent, isHurt }: { classKey: string; accent: string; isHurt?: boolean }) {
  if (classKey === "knight") return <KnightSprite accent={accent} isHurt={isHurt} />;
  if (classKey === "mage") return <MageSprite accent={accent} isHurt={isHurt} />;
  return <RogueSprite accent={accent} isHurt={isHurt} />;
}

export function EnemySprite({ enemy, isHurt }: { enemy: any; isHurt?: boolean }) {
  if (enemy.boss) return <HollowKingSprite isHurt={isHurt} />;
  return <MonsterSprite enemy={enemy} uid={enemy.name.replace(/\s/g, "")} isHurt={isHurt} />;
}
