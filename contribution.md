# Contributing to Ashveil RPG

Thank you for your interest in contributing to **Ashveil RPG**! We aim to build a highly immersive, lightweight browser role-playing game using procedural generation, custom procedural SVG rendering, and real-time audio synthesis.

This document outlines the development guidelines, architecture overview, and instructions on how to make changes.

---

## 🛠️ Tech Stack & Structure

The codebase is split into modular components inside `/src`:
*   `types.ts`: Global interfaces and types for players, enemies, items, and map configurations.
*   `constants.ts`: Lore databases, class templates, level progression formulas, and spawn rates.
*   `App.tsx`: Core application controller, coordinating game loops, movement, and menus.
*   `components/`: Sub-components for visual elements:
    *   `Sprites.tsx`: SVG vector models for characters, enemies, and interactive objects.
    *   `TerrainCell.tsx`: Procedural drawing of grassy patches, cobblestone pathways, and walls.
    *   `ParticleSystem.tsx`: Ambient weather (falling embers, ash drift) and combat spell visual effects.
    *   `DialogSystem.tsx`: Branching narrative dialog overlays.

---

## 📐 General Code Guidelines

### 1. TypeScript & Type Safety
*   Do not use `any` types. All entities—including players, enemies, items, and nodes—must have explicit type definitions inside `types.ts`.
*   Maintain complete, precise interfaces for game state updates.
*   Use standard `enum` definitions rather than `const enum`.

### 2. Styling and Colors (Gothic Slate & Bone)
*   The game uses **Tailwind CSS** as its primary styling engine.
*   Adhere strictly to the theme color variables (Slate, Bone, Deep Blood, Moss, and Arcane Blue).
*   Avoid standard saturated gradients. Use soft radial glows or noise overlays to keep the gothic atmosphere dark and authentic.

### 3. Procedural SVG Assets
*   Do not import external image files or icon packages besides `lucide-react`.
*   All assets (characters, environmental props, chest states) must be drawn directly using inline SVGs inside `Sprites.tsx` or `TerrainCell.tsx`.
*   Use standard CSS animations to animate SVG nodes (e.g., breathing bobbing, combat lunges, flickering torches, and fading ashes).

### 4. Interactive Music and Sound
*   All sound effects and background melodies are generated dynamically in real-time. Do not import MP3, WAV, or OGG files.
*   If you modify audio triggers, use the `sound` hooks that bridge Tone.js synths. Keep synthesizer volumes conservative to avoid clipping.

---

## 🚀 How to Add Content

### Adding a New Item
Items are defined in `constants.ts`. To add a new weapon or relic:
1. Open `src/types.ts` and ensure its subcategory exists.
2. In `src/constants.ts`, insert the item with its stats, icon SVG configuration, and type.
3. Update `grantItem()` inside `src/App.tsx` to handle its passive stat boosts or consumable triggers.

### Adding an Enemy
Enemies are defined inside the `ENEMY_TABLE` in `constants.ts`:
1. Provide a name, base HP, attack power, armor defense, and gold/XP reward rates.
2. Under `Sprites.tsx`, configure a visual representation (either standard humanoid with custom coloring, or a completely new SVG layout).
