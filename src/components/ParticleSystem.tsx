import React, { useEffect, useState } from "react";

interface AshParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  swaySpeed: number;
  delay: number;
  opacity: number;
  color: string;
}

export function ParticleSystem({ count = 24 }: { count?: number }) {
  const [particles, setParticles] = useState<AshParticle[]>([]);

  useEffect(() => {
    // Generate static parameters for particles
    const arr: AshParticle[] = [];
    for (let i = 0; i < count; i++) {
      const isRed = Math.random() > 0.6; // Red glowing embers vs black/gray soot
      arr.push({
        id: i,
        x: Math.random() * 100, // percentage x start
        y: Math.random() * -30 - 10, // start above screen
        size: Math.random() * 3 + 1.5, // 1.5px to 4.5px
        speed: Math.random() * 5 + 3, // speed factor
        swaySpeed: Math.random() * 2 + 1,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.2,
        color: isRed ? "rgba(224, 80, 52, 0.7)" : "rgba(100, 90, 85, 0.4)",
      });
    }
    setParticles(arr);
  }, [count]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: "50%",
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: p.color.includes("rgba(224") ? "0 0 5px rgba(224, 80, 52, 0.8)" : "none",
            opacity: p.opacity,
            animation: `drift ${p.speed}s linear infinite, sway ${p.swaySpeed}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes drift {
          0% {
            transform: translateY(0vh);
          }
          100% {
            transform: translateY(115vh);
          }
        }
        @keyframes sway {
          0% {
            margin-left: -15px;
          }
          100% {
            margin-left: 15px;
          }
        }
      `}</style>
    </div>
  );
}
