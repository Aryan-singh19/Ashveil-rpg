import React from "react";
import { C } from "../constants";

interface TerrainCellProps {
  tile: string;
  x: number;
  y: number;
  isVisited: boolean;
  glow: number;
  visual: React.ReactNode;
  onClick?: () => void;
  threeD?: boolean;
}

export function TerrainCell({ tile, x, y, isVisited, glow, visual, onClick, threeD }: TerrainCellProps) {
  // Determine a stable pseudorandom variant for this coordinate
  const variant = (x * 7 + y * 13) % 4;
  const isWall = tile === "wall";

  // Check if this floor cell contains a "route/pathway" vs a "grass/moss corner"
  const isPath = (x + y) % 2 === 0 || Math.abs(x - y) <= 1;
  const hasGrass = !isWall && !isPath && (x * y) % 3 === 0;

  if (!isVisited) {
    return (
      <div
        id={`tile-${x}-${y}`}
        onClick={onClick}
        style={{
          aspectRatio: "1",
          background: "#020101",
          borderRadius: 4,
          border: "1px solid #140d0a",
          opacity: 0.85,
          cursor: "pointer",
        }}
      />
    );
  }

  return (
    <div
      id={`tile-${x}-${y}`}
      onClick={onClick}
      style={{
        aspectRatio: "1",
        borderRadius: 4,
        position: "relative",
        overflow: "visible", // Allow 3D standees and shadows to overflow slightly for realism!
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        // Shading gradients for 3D depth
        background: isWall
          ? "linear-gradient(180deg, #332a22 0%, #17120e 100%)" // Beautiful slate-roof wall top block gradient
          : `radial-gradient(circle at ${40 + variant * 10}% ${40 + variant * 10}%, #201a16, #140f0c)`,
        border: `1px solid ${isWall ? "#100c0a" : "#1f1814"}`,
        boxShadow: isWall
          ? "0 4px 10px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "inset 0 0 8px rgba(0, 0, 0, 0.95)",
        opacity: 0.35 + glow * 0.65,
        transition: "opacity 0.25s ease, background 0.25s ease",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 3D Wall Extrusion & Bricks Artwork overlay */}
      {isWall ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 40 40"
          style={{ zIndex: 2 }}
        >
          {/* Top surface/roof of the wall block */}
          <rect x="0" y="0" width="40" height="11" fill="#40342a" />
          <line x1="0" y1="11" x2="40" y2="11" stroke="#5c4b3d" strokeWidth="1" />
          <line x1="0" y1="0" x2="40" y2="0" stroke="#5c4b3d" strokeWidth="0.5" opacity="0.4" />
          
          {/* Front extruded vertical wall faces */}
          <rect x="0" y="11" width="40" height="29" fill="#1b130e" />
          
          {/* Mortar Brick details & splits */}
          <line x1="13" y1="11" x2="13" y2="40" stroke="#090604" strokeWidth="1.5" />
          <line x1="27" y1="11" x2="27" y2="40" stroke="#090604" strokeWidth="1.5" />
          <line x1="0" y1="25" x2="40" y2="25" stroke="#090604" strokeWidth="1.2" opacity="0.8" />
          
          {/* Subtle lighting edge trim on bricks */}
          <line x1="14" y1="12" x2="14" y2="39" stroke="#3d2a1f" strokeWidth="0.8" opacity="0.6" />
          <line x1="28" y1="12" x2="28" y2="39" stroke="#3d2a1f" strokeWidth="0.8" opacity="0.6" />
        </svg>
      ) : (
        // Floor details (cracks, grass, pathway stones)
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 40 40">
          {isPath ? (
            // Render Paved Pathways (Cobblestones / Routes)
            <g opacity="0.22">
              <rect x="2" y="4" width="16" height="12" rx="2" fill="#52463b" />
              <rect x="20" y="2" width="18" height="14" rx="2" fill="#52463b" />
              <rect x="4" y="18" width="18" height="16" rx="2" fill="#52463b" />
              <rect x="24" y="20" width="14" height="16" rx="2" fill="#52463b" />
            </g>
          ) : (
            // Render Dirt Floor cracks
            <path
              d={
                variant === 0
                  ? "M 10,10 L 15,18 L 12,28"
                  : variant === 1
                  ? "M 5,30 L 18,32 L 28,38"
                  : "M 30,5 L 25,15 L 35,22"
              }
              fill="none"
              stroke="#0f0b08"
              strokeWidth="1.2"
              opacity="0.65"
            />
          )}

          {/* Procedural Waving Grass & Moss */}
          {hasGrass && (
            <g opacity="0.7" className="animate-[sway_3s_ease-in-out_infinite]" style={{ transformOrigin: "20px 38px" }}>
              {/* Blade 1 */}
              <path d="M 12,36 Q 10,24 6,22 Q 13,28 14,36 Z" fill="#4d6642" />
              {/* Blade 2 */}
              <path d="M 15,37 Q 16,21 21,18 Q 18,29 16,37 Z" fill="#3e5235" />
              {/* Little stone near grass */}
              <circle cx="8" cy="36" r="2" fill="#423b35" />
            </g>
          )}

          {/* Random debris: tiny stones/dust */}
          {variant === 2 && !hasGrass && (
            <g opacity="0.3">
              <polygon points="12,12 16,10 14,15 11,14" fill="#695c50" />
              <polygon points="28,30 32,29 30,34" fill="#38312a" />
            </g>
          )}
        </svg>
      )}

      {/* 3D STANDEE ENTITIES (Chests, NPCs, Portal, Enemies) */}
      {visual && (
        <div
          className="absolute inset-0 flex items-center justify-center p-1"
          style={{
            zIndex: 15,
            transform: threeD
              ? "rotateZ(45deg) rotateX(-55deg) translateY(-14px) scale(1.15)"
              : "translateY(-5px)", // Lift entity upwards in perspective
            filter: "drop-shadow(0 7px 5px rgba(0,0,0,0.85))", // Standee drop shadow casting back down!
            transformStyle: "preserve-3d",
            animation:
              tile === "brazier"
                ? "flicker 1.5s ease-in-out infinite"
                : tile === "enemy" || tile === "npc" || tile === "merchant" || tile === "portal" || tile === "portal-back"
                ? "floatIdle 2s ease-in-out infinite"
                : "none",
          }}
        >
          {visual}
        </div>
      )}

      {/* Atmospheric lighting glow overlay */}
      {!isWall && tile === "brazier" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(232, 134, 44, 0.18) 0%, transparent 75%)",
            animation: "flicker 1.2s ease-in-out infinite",
            zIndex: 12,
          }}
        />
      )}
    </div>
  );
}
