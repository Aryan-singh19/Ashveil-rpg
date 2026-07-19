import React from "react";
import { C } from "../constants";

// Helper to shade colors for gradients
function shadeColor(hex: string, pct: number) {
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

interface PortraitProps {
  accent?: string;
  isSpeaking?: boolean;
}

// ==================== PLAYER PORTRAITS ====================

export function KnightPortrait({ accent = C.gold, isSpeaking = true }: PortraitProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(212,167,40,0.3)]" : "scale-95 opacity-50 grayscale-[40%]"
      }`}
    >
      <defs>
        <linearGradient id="knight-armor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f4f8" />
          <stop offset="50%" stopColor="#7a889b" />
          <stop offset="100%" stopColor="#3b4452" />
        </linearGradient>
        <linearGradient id="knight-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe47e" />
          <stop offset="100%" stopColor="#b28c11" />
        </linearGradient>
        <filter id="knight-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cape back */}
      <path d="M40 140 Q10 210 20 240 L180 240 Q190 210 160 140 Z" fill="#7a1a1a" />
      <path d="M45 150 Q15 210 25 240" stroke="#9e2323" strokeWidth="3" opacity="0.4" />

      {/* Shoulders / Pauldrons */}
      <path d="M25 150 C25 110 70 120 70 150 L60 210 L25 210 Z" fill="url(#knight-armor)" stroke="#1a1f26" strokeWidth="2" />
      <path d="M175 150 C175 110 130 120 130 150 L140 210 L175 210 Z" fill="url(#knight-armor)" stroke="#1a1f26" strokeWidth="2" />
      
      {/* Shoulder Gold trims */}
      <path d="M25 150 Q45 130 70 150" fill="none" stroke="url(#knight-gold)" strokeWidth="4" />
      <path d="M175 150 Q155 130 130 150" fill="none" stroke="url(#knight-gold)" strokeWidth="4" />

      {/* Neck Guard */}
      <polygon points="75,135 125,135 135,165 65,165" fill="#303845" stroke="#1a1f26" strokeWidth="2" />

      {/* Torso Plate */}
      <path d="M60 160 Q100 170 140 160 L145 240 L55 240 Z" fill="#4d5869" stroke="#1a1f26" strokeWidth="2" />
      {/* Golden breast crest */}
      <polygon points="100,170 115,190 100,210 85,190" fill="url(#knight-gold)" />
      <line x1="100" y1="160" x2="100" y2="230" stroke="#1a1f26" strokeWidth="1.5" opacity="0.6" />

      {/* Head / Helmet */}
      <g>
        {/* Plume */}
        <path d="M100 65 Q115 15 150 25 Q115 50 100 60" fill="#9e1a1a" />
        <path d="M100 65 Q85 15 50 25 Q85 50 100 60" fill="#cc2424" />

        {/* Helmet base dome */}
        <path d="M60 90 C60 45 140 45 140 90 Q140 135 100 142 Q60 135 60 90 Z" fill="url(#knight-armor)" stroke="#1a1f26" strokeWidth="2.5" />
        
        {/* Ridge */}
        <path d="M100 48 Q103 90 100 140" fill="none" stroke="url(#knight-gold)" strokeWidth="3.5" />

        {/* Visor Slit */}
        <path d="M68 85 Q100 78 132 85 Q135 100 132 100 Q100 95 68 100 Q65 85 68 85 Z" fill="#11141a" stroke="#242b36" strokeWidth="1.5" />

        {/* Glowing Eyes inside slit */}
        <circle cx="85" cy="92" r="3.5" fill="#ff3333" filter="url(#knight-glow)" />
        <circle cx="115" cy="92" r="3.5" fill="#ff3333" filter="url(#knight-glow)" />
        <path d="M80 88 L90 91" stroke="#ff8080" strokeWidth="1" opacity="0.8" />
        <path d="M120 88 L110 91" stroke="#ff8080" strokeWidth="1" opacity="0.8" />

        {/* Breath holes/grill on lower helm */}
        <circle cx="85" cy="118" r="1.5" fill="#1a1f26" />
        <circle cx="91" cy="122" r="1.5" fill="#1a1f26" />
        <circle cx="100" cy="124" r="1.5" fill="#1a1f26" />
        <circle cx="109" cy="122" r="1.5" fill="#1a1f26" />
        <circle cx="115" cy="118" r="1.5" fill="#1a1f26" />
      </g>
    </svg>
  );
}

export function MagePortrait({ accent = C.arcane, isSpeaking = true }: PortraitProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(86,121,219,0.35)]" : "scale-95 opacity-50 grayscale-[40%]"
      }`}
    >
      <defs>
        <linearGradient id="mage-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#12182d" />
        </linearGradient>
        <linearGradient id="magic-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <filter id="arcane-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cosmic Sparkles Background */}
      <g opacity={isSpeaking ? "0.6" : "0.2"}>
        <circle cx="40" cy="50" r="1.5" fill="#fff" />
        <circle cx="160" cy="80" r="2" fill="#80b3ff" filter="url(#arcane-blur)" />
        <circle cx="170" cy="40" r="1" fill="#fff" />
        <circle cx="30" cy="150" r="2.5" fill="#fff" />
      </g>

      {/* Robe shoulders */}
      <path d="M30 160 C30 115 65 110 100 120 C135 110 170 115 170 160 L180 240 L20 240 Z" fill="url(#mage-robe)" stroke="#090d1a" strokeWidth="1.5" />
      {/* Golden embroidered trims */}
      <path d="M30 160 C55 130 100 135 100 135 C100 135 145 130 170 160" fill="none" stroke="#e0c068" strokeWidth="2.5" opacity="0.8" />
      <path d="M90 135 L90 240 M110 135 L110 240" stroke="#e0c068" strokeWidth="1.5" opacity="0.6" />

      {/* Undergarment chest plate */}
      <polygon points="80,140 120,140 130,175 70,175" fill="#181310" stroke="#3d2c1e" strokeWidth="1.5" />
      <circle cx="100" cy="155" r="4.5" fill="url(#magic-glow)" filter="url(#arcane-blur)" />

      {/* Hood cowl */}
      <path d="M45 110 C45 35 155 35 155 110 C155 140 140 160 100 160 C60 140 45 140 45 110 Z" fill="#1f253d" stroke="#090d1a" strokeWidth="2" />
      
      {/* Shadow deep inside hood */}
      <path d="M55 110 C55 55 145 55 145 110 C145 135 130 145 100 145 C70 145 55 135 55 110 Z" fill="#090a12" />

      {/* Glowing Mage Eyes in Void */}
      <g filter="url(#arcane-blur)">
        <ellipse cx="80" cy="100" rx="6" ry="3" fill="#80b3ff" />
        <ellipse cx="120" cy="100" rx="6" ry="3" fill="#80b3ff" />
        <circle cx="80" cy="100" r="2" fill="#fff" />
        <circle cx="120" cy="100" r="2" fill="#fff" />
      </g>
      
      {/* Arcane runes on forehead/brow level */}
      <path d="M92 72 L108 72 M100 66 L100 78" stroke={accent} strokeWidth="2.5" filter="url(#arcane-blur)" opacity="0.8" />
      <path d="M96 70 L104 74" stroke="#fff" strokeWidth="1" />
    </svg>
  );
}

export function RoguePortrait({ accent = C.moss, isSpeaking = true }: PortraitProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(86,122,77,0.35)]" : "scale-95 opacity-50 grayscale-[40%]"
      }`}
    >
      <defs>
        <linearGradient id="rogue-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#111a0e" />
        </linearGradient>
        <linearGradient id="poison-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4dff88" />
          <stop offset="100%" stopColor="#145928" />
        </linearGradient>
        <filter id="dagger-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark poison smoke wisps */}
      <path d="M15 180 Q30 110 15 80" fill="none" stroke="#244d1f" strokeWidth="5" strokeLinecap="round" opacity="0.3" filter="url(#dagger-glow)" />
      <path d="M185 180 Q170 110 185 80" fill="none" stroke="#244d1f" strokeWidth="5" strokeLinecap="round" opacity="0.3" filter="url(#dagger-glow)" />

      {/* Cloak Shoulders */}
      <path d="M25 155 C25 115 60 110 100 120 C140 110 175 115 175 155 L185 240 L15 240 Z" fill="url(#rogue-cloak)" stroke="#0e140c" strokeWidth="2" />

      {/* Leather straps and bandages */}
      <path d="M65 145 L135 180" stroke="#33241b" strokeWidth="6" />
      <path d="M135 145 L65 180" stroke="#33241b" strokeWidth="6" />
      <circle cx="100" cy="162" r="5" fill="#cca33d" stroke="#1d1510" strokeWidth="1.5" />

      {/* Rogue Face / Head skin backing */}
      <path d="M60 100 C60 55 140 55 140 100 C140 125 125 140 100 140 C75 140 60 125 60 100 Z" fill="#e0b896" />

      {/* Rogue Shadow Hood */}
      <path d="M45 95 C45 30 155 30 155 95 C155 125 140 145 100 145 C60 145 45 125 45 95 Z" fill="#1b2618" stroke="#0b100a" strokeWidth="2" />
      <path d="M52 95 C52 45 148 45 148 95 C148 118 135 133 100 133 C65 133 52 118 52 95 Z" fill="#090d07" />

      {/* Fabric Face Mask (covers mouth and nose) */}
      <path d="M58 100 L142 100 L130 136 Q100 145 70 136 Z" fill="#291e18" stroke="#140e0b" strokeWidth="1.5" />
      {/* Creases on mask */}
      <path d="M80 112 Q100 122 120 112" fill="none" stroke="#140e0b" strokeWidth="1.5" />
      <path d="M85 124 Q100 132 115 124" fill="none" stroke="#140e0b" strokeWidth="1.5" />

      {/* Glowing Green Dagger Eyes */}
      <g filter="url(#dagger-glow)">
        <polygon points="68,85 86,81 83,91" fill="#4fffa1" />
        <polygon points="132,85 114,81 117,91" fill="#4fffa1" />
        <circle cx="74" cy="85" r="1.5" fill="#fff" />
        <circle cx="126" cy="85" r="1.5" fill="#fff" />
      </g>
    </svg>
  );
}


// ==================== NPC PORTRAITS ====================

export function SoldierPortrait({ isSpeaking = true }: PortraitProps) {
  // Robert the Weary
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(86,122,77,0.3)]" : "scale-95 opacity-50 grayscale-[40%]"
      }`}
    >
      <defs>
        <linearGradient id="robert-iron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8c99a8" />
          <stop offset="100%" stopColor="#2c333d" />
        </linearGradient>
      </defs>

      {/* Tattered green cape wrap */}
      <path d="M35 150 Q10 215 15 240 L185 240 Q190 215 165 150 Z" fill="#2c3d25" />
      <path d="M30 180 L50 240 M170 180 L150 240" stroke="#1e2b19" strokeWidth="3" opacity="0.5" />

      {/* Heavily scratched armor shoulders */}
      <path d="M25 155 C25 120 65 125 65 155 L55 210 L25 210 Z" fill="url(#robert-iron)" stroke="#1c2128" strokeWidth="2" />
      <path d="M175 155 C175 120 135 125 135 155 L145 210 L175 210 Z" fill="url(#robert-iron)" stroke="#1c2128" strokeWidth="2" />
      
      {/* Scratches/Dents on armor */}
      <line x1="35" y1="145" x2="45" y2="155" stroke="#14181f" strokeWidth="1.5" />
      <line x1="42" y1="140" x2="48" y2="148" stroke="#14181f" strokeWidth="1.5" />

      {/* Tired, bearded face */}
      <path d="M60 100 C60 55 140 55 140 100 C140 138 125 150 100 150 C75 150 60 138 60 100 Z" fill="#d2a085" stroke="#1c2128" strokeWidth="1.5" />
      
      {/* Grizzled Beard */}
      <path d="M60 105 C60 155 140 155 140 105 C140 145 130 162 100 162 C70 162 60 145 60 105 Z" fill="#544c45" opacity="0.9" />
      {/* Beard hair lines */}
      <path d="M70 120 L65 135 M130 120 L135 135 M90 148 L90 158 M110 148 L110 158 M100 150 L100 161" stroke="#332c28" strokeWidth="1.5" />

      {/* Tired, weary eyes */}
      {/* Right Eye: Scarred eyepatch */}
      <path d="M52 90 L88 112 M85 85 L55 108" stroke="#1c1815" strokeWidth="4" />
      <rect x="62" y="90" width="14" height="14" rx="2" fill="#1c1815" transform="rotate(15, 69, 97)" />

      {/* Left Eye: Bloodshot and heavy lid */}
      <ellipse cx="118" cy="94" rx="9" ry="5" fill="#fcf6f2" stroke="#4d241c" strokeWidth="1.5" />
      <circle cx="118" cy="94" r="3.5" fill="#4d3527" />
      <circle cx="120" cy="92" r="1.2" fill="#fff" />
      <path d="M108 88 Q118 84 128 89" stroke="#3d221c" strokeWidth="2.5" /> {/* Brow */}
      <path d="M109 91 Q118 90 127 91" stroke="#1a0d0a" strokeWidth="1.5" /> {/* Lid */}

      {/* Scar running down face */}
      <path d="M112 75 L124 115" stroke="#a35448" strokeWidth="2" opacity="0.75" strokeLinecap="round" />

      {/* Battle-worn helmet */}
      <path d="M54 80 C54 35 146 35 146 80 L152 86 L48 86 Z" fill="url(#robert-iron)" stroke="#1c2128" strokeWidth="2" />
      <path d="M44 84 L156 84 L150 92 L50 92 Z" fill="#485361" stroke="#1c2128" strokeWidth="1.5" />
      {/* Rusty spots */}
      <circle cx="85" cy="55" r="5" fill="#8f5b3c" opacity="0.4" />
      <circle cx="120" cy="48" r="4.5" fill="#8f5b3c" opacity="0.3" />
    </svg>
  );
}

export function GhostPortrait({ isSpeaking = true }: PortraitProps) {
  // Sorrowful Lilly
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(143,196,180,0.5)]" : "scale-95 opacity-50 grayscale-[50%]"
      }`}
    >
      <defs>
        <linearGradient id="lilly-spirit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4f4e8" />
          <stop offset="50%" stopColor="#8fc4b4" />
          <stop offset="100%" stopColor="#2c5e4f" stopOpacity="0" />
        </linearGradient>
        <filter id="spirit-glow">
          <feGaussianBlur stdDeviation="5.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Spectral particles aura */}
      <g filter="url(#spirit-glow)" opacity={isSpeaking ? "0.8" : "0.4"}>
        <circle cx="100" cy="110" r="46" fill="#8fc4b4" opacity="0.2" />
        <circle cx="50" cy="80" r="8" fill="#d4f4e8" opacity="0.45" />
        <circle cx="150" cy="120" r="6" fill="#8fc4b4" opacity="0.4" />
        <circle cx="70" cy="170" r="12" fill="#d4f4e8" opacity="0.3" />
      </g>

      {/* Ethereal flowing hair backdrop */}
      <path d="M50 100 Q15 110 30 180 Q50 240 100 230 Q150 240 170 180 Q185 110 150 100" fill="url(#lilly-spirit)" opacity="0.5" />

      {/* Ghostly dress shoulders */}
      <path d="M45 160 C45 125 70 125 100 130 C130 125 155 125 155 160 L160 240 L40 240 Z" fill="url(#lilly-spirit)" stroke="#3e7a68" strokeWidth="1" opacity="0.8" />
      
      {/* Spectral sad girl face */}
      <path d="M65 105 C65 65 135 65 135 105 C135 140 122 152 100 152 C78 152 65 140 65 105 Z" fill="#bcece0" stroke="#4fa38c" strokeWidth="1" opacity="0.9" />

      {/* Sad hollow spectral eyes */}
      <g opacity="0.8">
        {/* Soft glowing orbits */}
        <circle cx="85" cy="102" r="7" fill="#4fa38c" opacity="0.3" filter="url(#spirit-glow)" />
        <circle cx="115" cy="102" r="7" fill="#4fa38c" opacity="0.3" filter="url(#spirit-glow)" />
        
        {/* Teary glowing white pupils */}
        <circle cx="85" cy="102" r="3" fill="#ffffff" filter="url(#spirit-glow)" />
        <circle cx="115" cy="102" r="3" fill="#ffffff" filter="url(#spirit-glow)" />
        <circle cx="86" cy="101" r="1" fill="#fff" />
        <circle cx="116" cy="101" r="1" fill="#fff" />

        {/* Sad, sloped eyebrows */}
        <path d="M76 93 Q85 91 91 96" fill="none" stroke="#2c5e4f" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M124 93 Q115 91 109 96" fill="none" stroke="#2c5e4f" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Fragile, small mouth */}
      <path d="M94 126 Q100 129 106 126" fill="none" stroke="#2c5e4f" strokeWidth="2" strokeLinecap="round" />

      {/* Hair strands overlay */}
      <path d="M65 92 Q45 25 100 30 Q155 25 135 92 C145 140 155 170 150 210 Q100 230 50 210 C45 170 55 140 65 92 Z" fill="none" stroke="#d4f4e8" strokeWidth="1.5" opacity="0.4" />
      <path d="M72 82 Q100 50 128 82" fill="none" stroke="#d4f4e8" strokeWidth="2.5" opacity="0.7" />
    </svg>
  );
}

export function PrisonerPortrait({ isSpeaking = true }: PortraitProps) {
  // Scribe Vaelen
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(212,167,40,0.25)]" : "scale-95 opacity-50 grayscale-[55%]"
      }`}
    >
      <defs>
        <linearGradient id="vaelen-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d3525" />
          <stop offset="100%" stopColor="#1a120c" />
        </linearGradient>
      </defs>

      {/* Tattered, torn scholar hood */}
      <path d="M35 160 C35 125 70 120 100 125 C130 120 165 125 165 160 L175 240 L25 240 Z" fill="url(#vaelen-robe)" stroke="#1a120c" strokeWidth="2" />
      {/* Rips and patches */}
      <rect x="42" y="180" width="15" height="15" rx="2" fill="#5c4535" stroke="#1a120c" strokeWidth="1" />
      <line x1="42" y1="185" x2="57" y2="185" stroke="#1a120c" />
      <line x1="50" y1="180" x2="50" y2="195" stroke="#1a120c" />

      {/* Scholar face */}
      <path d="M62 100 C62 55 138 55 138 100 C138 138 124 150 100 150 C76 150 62 138 62 100 Z" fill="#dfb395" stroke="#1a120c" strokeWidth="1.5" />
      
      {/* Messy scholar hair & beard */}
      <path d="M60 105 C60 160 140 160 140 105 C140 152 125 164 100 164 C75 164 60 152 60 105 Z" fill="#856b53" opacity="0.8" />
      <path d="M55 85 Q100 50 145 85 L145 110 L135 105 L135 90 Q100 70 65 90 L65 105 L55 85 Z" fill="#856b53" />

      {/* Intellectual spectrals / spectacles */}
      <circle cx="84" cy="98" r="11" fill="none" stroke="#d4a728" strokeWidth="3" />
      <circle cx="116" cy="98" r="11" fill="none" stroke="#d4a728" strokeWidth="3" />
      <line x1="95" y1="98" x2="105" y2="98" stroke="#d4a728" strokeWidth="3" />
      {/* Glare in glasses */}
      <path d="M78 92 L90 104" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
      <path d="M110 92 L122 104" stroke="#fff" strokeWidth="1.5" opacity="0.6" />

      {/* Concerned eyes behind glasses */}
      <circle cx="84" cy="98" r="3" fill="#291b10" />
      <circle cx="116" cy="98" r="3" fill="#291b10" />

      {/* Wrinkled forehead lines */}
      <path d="M85 74 Q100 71 115 74" fill="none" stroke="#9e7456" strokeWidth="1.5" />
      <path d="M90 80 Q100 78 110 80" fill="none" stroke="#9e7456" strokeWidth="1.5" />

      {/* Iron Chain collar around neck */}
      <rect x="75" y="146" width="50" height="10" rx="3" fill="#30343d" stroke="#12141a" strokeWidth="2" />
      <circle cx="100" cy="151" r="3.5" fill="#12141a" />
    </svg>
  );
}

export function BardPortrait({ isSpeaking = true }: PortraitProps) {
  // Mournful Alistair
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(212,167,40,0.3)]" : "scale-95 opacity-50 grayscale-[40%]"
      }`}
    >
      <defs>
        <linearGradient id="alistair-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#802020" />
          <stop offset="100%" stopColor="#300d0d" />
        </linearGradient>
      </defs>

      {/* Velvet draped robes of the court minstrel */}
      <path d="M30 160 C30 120 70 115 100 122 C130 115 170 120 170 160 L180 240 L20 240 Z" fill="url(#alistair-robe)" stroke="#260909" strokeWidth="2" />
      {/* Golden lute strap */}
      <path d="M45 160 L155 240" stroke="#d4a728" strokeWidth="7" />
      <path d="M45 160 L155 240" stroke="#a17b12" strokeWidth="2" opacity="0.5" />

      {/* Blind, graceful face */}
      <path d="M62 98 C62 55 138 55 138 98 C138 136 124 148 100 148 C76 148 62 136 62 98 Z" fill="#ecc6ae" stroke="#260909" strokeWidth="1.5" />

      {/* Long white hair */}
      <path d="M55 85 C50 15 150 15 145 85 C145 130 155 170 150 200 L135 195 L135 100 C100 80 65 100 L65 195 L50 200 C45 170 55 130 55 85 Z" fill="#ebe5d8" stroke="#a19385" strokeWidth="1" />

      {/* Elegant blindfold covering eyes */}
      <polygon points="50,92 150,92 146,110 54,110" fill="#242220" stroke="#121110" strokeWidth="1" />
      {/* Tear trace leaking from beneath mask */}
      <path d="M120 111 Q122 125 119 130" fill="none" stroke="#a1caff" strokeWidth="1.5" opacity="0.65" />

      {/* Gentle mouth humming a ballad */}
      <path d="M92 128 Q100 134 108 128" fill="none" stroke="#8c4747" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function MerchantPortrait({ isSpeaking = true }: PortraitProps) {
  // Gideon the Scavenger
  return (
    <svg
      viewBox="0 0 200 240"
      width="100%"
      height="100%"
      className={`transition-all duration-300 ${
        isSpeaking ? "scale-100 opacity-100 drop-shadow-[0_0_15px_rgba(212,167,40,0.3)]" : "scale-95 opacity-50 grayscale-[40%]"
      }`}
    >
      <defs>
        <linearGradient id="gideon-cloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#594433" />
          <stop offset="100%" stopColor="#241910" />
        </linearGradient>
      </defs>

      {/* Huge backpack frames */}
      <rect x="25" y="100" width="35" height="100" rx="4" fill="#38291f" stroke="#18110c" strokeWidth="2" />
      <circle cx="35" cy="120" r="4" fill="#d4a728" />
      {/* Straps */}
      <path d="M25 140 C55 140 55 170 25 170" fill="none" stroke="#241910" strokeWidth="5" />
      <path d="M175 140 C145 140 145 170 175 170" fill="none" stroke="#241910" strokeWidth="5" />

      {/* Heavy traveler cloak */}
      <path d="M40 140 C40 110 70 105 100 115 C130 105 160 110 160 140 L170 240 L30 240 Z" fill="url(#gideon-cloak)" stroke="#1a110a" strokeWidth="2" />

      {/* Hood cowl */}
      <path d="M45 100 C45 35 155 35 155 100 Q155 135 100 135 Q45 135 45 100 Z" fill="#3c2f24" stroke="#1a110a" strokeWidth="2" />
      <path d="M52 100 C52 45 148 45 148 100 Q148 122 100 122 Q52 122 52 100 Z" fill="#140f0a" />

      {/* Giant copper goggles covering the eyes */}
      <g>
        {/* Brass Goggles frames */}
        <circle cx="80" cy="92" r="16" fill="#805d15" stroke="#cca13d" strokeWidth="2.5" />
        <circle cx="120" cy="92" r="16" fill="#805d15" stroke="#cca13d" strokeWidth="2.5" />
        <rect x="94" y="88" width="12" height="8" fill="#cca13d" />
        <path d="M64 92 H54 M136 92 H146" stroke="#cca13d" strokeWidth="3" />

        {/* Glowing glass lens inside */}
        <circle cx="80" cy="92" r="10" fill="#ccf5ff" style={{ filter: "drop-shadow(0 0 4px #00aaff)" }} />
        <circle cx="120" cy="92" r="10" fill="#ccf5ff" style={{ filter: "drop-shadow(0 0 4px #00aaff)" }} />
        {/* Sparkle reflection */}
        <circle cx="84" cy="88" r="2.5" fill="#fff" />
        <circle cx="124" cy="88" r="2.5" fill="#fff" />
      </g>

      {/* Heavy leather filter mask covering mouth */}
      <path d="M72 108 L128 108 L115 136 Q100 144 85 136 Z" fill="#2b1a0e" stroke="#140b05" strokeWidth="1.5" />
      <circle cx="100" cy="122" r="4.5" fill="#805d15" stroke="#140b05" strokeWidth="1" />
    </svg>
  );
}

// Portrait Resolver helper based on character type/kind
export function Portrait({ kind, isSpeaking = true, playerClass = "knight" }: { kind: string; isSpeaking?: boolean; playerClass?: string }) {
  if (kind === "player") {
    if (playerClass === "knight") return <KnightPortrait isSpeaking={isSpeaking} />;
    if (playerClass === "mage") return <MagePortrait isSpeaking={isSpeaking} />;
    return <RoguePortrait isSpeaking={isSpeaking} />;
  }
  if (kind === "soldier") return <SoldierPortrait isSpeaking={isSpeaking} />;
  if (kind === "ghost") return <GhostPortrait isSpeaking={isSpeaking} />;
  if (kind === "prisoner") return <PrisonerPortrait isSpeaking={isSpeaking} />;
  if (kind === "bard") return <BardPortrait isSpeaking={isSpeaking} />;
  if (kind === "merchant") return <MerchantPortrait isSpeaking={isSpeaking} />;
  return null;
}
