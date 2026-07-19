import React, { useState } from "react";
import { Npc, PlayerStats } from "../types";
import { C, SERIF, MONO } from "../constants";
import { Portrait } from "./Portraits";

interface DialogSystemProps {
  npc: Npc;
  playerClass?: string;
  onClose: (rewardItem?: any, statBonus?: Partial<PlayerStats> & { pushLogMsg?: string }) => void;
}

export function DialogSystem({ npc, playerClass = "knight", onClose }: DialogSystemProps) {
  const [step, setStep] = useState(0);

  // Define dialog scripts for all NPCs inside the engine
  const SCRIPTS: Record<
    string,
    {
      name: string;
      title: string;
      avatar: string;
      accent: string;
      nodes: {
        text: string;
        speaker: "player" | "npc";
        choices: {
          text: string;
          next: number;
          effect?: () => { item?: any; stats?: any; msg: string };
        }[];
      }[];
    }
  > = {
    soldier: {
      name: "Robert the Weary",
      title: "Vanguard of the Gate Watch",
      avatar: "🛡️",
      accent: C.moss,
      nodes: [
        {
          text: "Ugh... hold your blade, wanderer. I wear the crest of Ashveil, though there's little left to guard. My leg is shattered, and my brothers... their bones walk the court now.",
          speaker: "npc",
          choices: [
            { text: "What happened the night the beacon went dark?", next: 1 },
            { text: "Here, let me bind your wounds.", next: 2 },
          ],
        },
        {
          text: "It wasn't an army that breached us. It was a command. King Aldric walked out of the crypt with that black iron crown in hand. A chill blew through the gates, and every soldier who fell asleep that night woke up without their skin. I crawled in here to rot.",
          speaker: "npc",
          choices: [
            { text: "How can I stop him?", next: 3 },
            { text: "Let me assist you.", next: 2 },
          ],
        },
        {
          text: "Too late for bandages, friend. The rot is inside. But you... you have the eyes of a survivor. Take my shield or my whetstone. You'll need every ounce of iron if you intend to climb the stairs.",
          speaker: "npc",
          choices: [
            {
              text: "Take his Worn Whetstone (+2 ATK)",
              next: 4,
              effect: () => ({
                item: { name: "Robert's Whetstone", type: "atk", amt: 2, icon: "🔪" },
                msg: "Robert nods weakly. 'Strike true. For Ashveil.'",
              }),
            },
            {
              text: "Take his Bastion Shield (+2 DEF)",
              next: 4,
              effect: () => ({
                item: { name: "Robert's Tower Shield", type: "def", amt: 2, icon: "🛡️" },
                msg: "He slides his heavy shield over. 'Let them break against you.'",
              }),
            },
          ],
        },
        {
          text: "You can't. Not with standard steel. He has forged his grief into the very bricks of this throne. But if you must go, seek the hidden blue portal. It leads to the Old Armory. He hid his relics there.",
          speaker: "npc",
          choices: [{ text: "I will find it. Thank you, Robert.", next: 2 }],
        },
        {
          text: "May the light find you, wanderer. I will close my eyes now. Do not let his ash cover my grave.",
          speaker: "npc",
          choices: [{ text: "[Leave Robert to rest]", next: -1 }],
        },
      ],
    },
    ghost: {
      name: "Sorrowful Lilly",
      title: "Specter of the Outer Wall",
      avatar: "👻",
      accent: "#8fc4b4",
      nodes: [
        {
          text: "The snow is so pretty... but it doesn't melt when it hits my hand anymore. Have you seen my papa? He was at the forge, making horseshoes for the King's riders.",
          speaker: "npc",
          choices: [
            { text: "Your papa is... no longer here, little one.", next: 1 },
            { text: "Aren't you cold out here?", next: 2 },
          ],
        },
        {
          text: "Oh. He always said he'd come back when the stars aligned. But the stars haven't moved since the beacons went out. Everything is so quiet. I think I'll just sleep here a little longer.",
          speaker: "npc",
          choices: [{ text: "Take this blessing of warmth with you.", next: 3 }],
        },
        {
          text: "Only if I stop moving! The King said if we all go to sleep, we won't feel the winter wind anymore. Papa went to sleep first. He looked so tired.",
          speaker: "npc",
          choices: [{ text: "You are safe now. Rest.", next: 3 }],
        },
        {
          text: "You have a warm heart, traveler. Like papa's forge. Let me give you some of my light. It's too heavy for me to carry anyway.",
          speaker: "npc",
          choices: [
            {
              text: "Accept Lilly's Warmth (+10 Max HP)",
              next: 4,
              effect: () => ({
                stats: { maxHp: 10, hp: 10 },
                msg: "Lilly's spirit dissipates into a gentle, warm light that wraps around your chest. Max HP +10.",
              }),
            },
          ],
        },
        {
          text: "Thank you... it doesn't hurt to breathe anymore. Go on. The King is waiting at the top... he's very lonely.",
          speaker: "npc",
          choices: [{ text: "[Bid Lilly farewell]", next: -1 }],
        },
      ],
    },
    prisoner: {
      name: "Scribe Vaelen",
      title: "Royal Cartographer of the Spires",
      avatar: "🔗",
      accent: C.gold,
      nodes: [
        {
          text: "Help! Ah, you're not one of those cinder-worshippers. Quick, the chains! The cultists locked me in this cellar because I refused to rewrite the lineage of the crown.",
          speaker: "npc",
          choices: [
            { text: "Break his iron cuffs.", next: 1 },
            { text: "Who put you in chains?", next: 2 },
          ],
        },
        {
          text: "Blessed steel! I can feel my wrists again. Thank you! I was King Aldric's Scribe. I watched him trade the blood of our entire court to the Outer Rift just to bargain for the Queen's cold corpse. It was a tragedy written in bone.",
          speaker: "npc",
          choices: [
            { text: "What did the bargain do?", next: 3 },
            { text: "Take this gold and flee.", next: 4 },
          ],
        },
        {
          text: "The High Priest of Cinders. They call themselves the 'Followers of the Void'. They believe the King's grief is a holy catalyst to dissolve our world into peaceful dust. Madness! Pure madness!",
          speaker: "npc",
          choices: [{ text: "Let's get you free first.", next: 1 }],
        },
        {
          text: "It brought *something* back, but it wasn't Queen Helen. It was a freezing phantom that wore her skin. The moment she kissed his cheek, the King's heart froze solid, and the beacon crumbled. Take this pouch of gold. I grabbed it from the vault before they bound me.",
          speaker: "npc",
          choices: [
            {
              text: "Accept his pouch (+30 Gold)",
              next: 5,
              effect: () => ({
                stats: { gold: 30 },
                msg: "Vaelen hands you a pouch of royal silver. +30 Gold.",
              }),
            },
          ],
        },
        {
          text: "You are far too kind. I know paths through the lower walls. Here, take this old key. It opens the treasure chests hidden in the Great Hall. May it buy your safety.",
          speaker: "npc",
          choices: [
            {
              text: "Accept the Brass Key (+1 Key)",
              next: 5,
              effect: () => ({
                item: { name: "Vaelen's Brass Key", type: "key", icon: "🗝️" },
                msg: "Vaelen smiles. 'Let it open your way.'",
              }),
            },
          ],
        },
        {
          text: "I will escape through the lower gatehouse. Climb carefully, hero. The King is no longer a man—he is a monument of sorrow.",
          speaker: "npc",
          choices: [{ text: "[Let Vaelen escape]", next: -1 }],
        },
      ],
    },
    bard: {
      name: "Mournful Alistair",
      title: "Blind Minstrel of the Sullen Choir",
      avatar: "🎻",
      accent: C.gold,
      nodes: [
        {
          text: "Ah, the rhythmic stride of a warrior. Heavy boots, steady heart. Come, sit by my brazier. I am composing the final ballad of Ashveil. It has many verses, but they all end in cinders.",
          speaker: "npc",
          choices: [
            { text: "Sing me a song of the old kingdom.", next: 1 },
            { text: "Sing me a song of the battle ahead.", next: 2 },
          ],
        },
        {
          text: "♪ 'The golden fields of northlands high, beneath the beacon's glowing eye... Now blackened fields and hollow bone, a lonely king upon his throne...' ♪ Your posture straightens, and your grip feels firmer.",
          speaker: "npc",
          choices: [
            {
              text: "Receive his Inspiring Verse (+1 ATK)",
              next: 3,
              effect: () => ({
                stats: { atk: 1 },
                msg: "Alistair's song inspires your steel. Permanent ATK +1.",
              }),
            },
          ],
        },
        {
          text: "♪ 'Let shield meet skull and arrow fly, let shadows weave and scholars die... For in the hall of broken glass, only the hollow soul shall pass...' ♪ Your focus deepens.",
          speaker: "npc",
          choices: [
            {
              text: "Receive his Battle Rhythm (+1 Focus Max)",
              next: 3,
              effect: () => ({
                stats: { focusMax: 1, focus: 1 },
                msg: "Alistair strikes a deep, harmonic chord. Permanent Max Focus +1.",
              }),
            },
          ],
        },
        {
          text: "Go forth, wanderer. Let your sword be the final punctuation mark in my song.",
          speaker: "npc",
          choices: [{ text: "[Leave Alistair to sing]", next: -1 }],
        },
      ],
    },
  };

  const script = SCRIPTS[npc.kind];
  if (!script) return null;

  const currentNode = script.nodes[step];

  const handleChoice = (choice: typeof currentNode.choices[0]) => {
    if (choice.next === -1) {
      onClose();
    } else {
      let rewardItem: any = undefined;
      let statBonus: any = undefined;

      if (choice.effect) {
        const res = choice.effect();
        rewardItem = res.item;
        statBonus = res.stats ? { ...res.stats, pushLogMsg: res.msg } : { pushLogMsg: res.msg };
      }

      if (choice.next >= script.nodes.length || choice.next < 0) {
        onClose(rewardItem, statBonus);
      } else {
        setStep(choice.next);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at center, rgba(5, 4, 3, 0.45) 0%, rgba(2, 1, 1, 0.94) 100%)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "24px 24px 40px 24px",
      }}
    >
      {/* Stylesheet for Slide and Float Animations */}
      <style>{`
        @keyframes portraitSlideLeft {
          from { opacity: 0; transform: translateX(-50px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes portraitSlideRight {
          from { opacity: 0; transform: translateX(50px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes dialogueUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(212,167,40,0.1); }
          50% { box-shadow: 0 0 20px rgba(212,167,40,0.35); }
        }
        .vn-player-portrait {
          animation: portraitSlideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .vn-npc-portrait {
          animation: portraitSlideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .vn-dialogue-box {
          animation: dialogueUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Main VN Layout Container */}
      <div
        className="w-full max-w-4xl"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%",
          position: "relative",
        }}
      >
        {/* ==================== PORTRAITS AREA ==================== */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            padding: "0 32px",
            marginBottom: "-12px", // overlap slightly with dialogue box for gorgeous depth
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {/* Left: Player Portrait */}
          <div
            className="vn-player-portrait"
            style={{
              width: "210px",
              height: "250px",
              display: "flex",
              alignItems: "flex-end",
              filter: `drop-shadow(0 12px 24px rgba(0,0,0,0.9))`,
              transformOrigin: "bottom left",
            }}
          >
            <Portrait
              kind="player"
              playerClass={playerClass}
              isSpeaking={currentNode.speaker === "player"}
            />
          </div>

          {/* Right: Speaking NPC Portrait */}
          <div
            className="vn-npc-portrait"
            style={{
              width: "210px",
              height: "250px",
              display: "flex",
              alignItems: "flex-end",
              filter: `drop-shadow(0 12px 24px rgba(0,0,0,0.9))`,
              transformOrigin: "bottom right",
            }}
          >
            <Portrait
              kind={npc.kind}
              isSpeaking={currentNode.speaker === "npc"}
            />
          </div>
        </div>

        {/* ==================== DIALOGUE BOX ==================== */}
        <div
          className="vn-dialogue-box"
          style={{
            background: "linear-gradient(180deg, #15110e 0%, #0d0a08 100%)",
            border: `2px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: "0 15px 45px rgba(0,0,0,0.95), inset 0 0 15px rgba(58,46,38,0.5)",
            padding: "24px 28px 24px 28px",
            position: "relative",
            zIndex: 20,
            animation: "glowPulse 4s infinite ease-in-out",
          }}
        >
          {/* Floating Speaker Badge Tag */}
          <div
            style={{
              position: "absolute",
              top: "-16px",
              left: "28px",
              background: "#181310",
              border: `1.5px solid ${script.accent}`,
              borderRadius: "4px",
              padding: "4px 18px",
              boxShadow: `0 4px 12px rgba(0,0,0,0.7), 0 0 10px ${script.accent}25`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: "14px",
                color: script.accent,
                fontWeight: "bold",
                letterSpacing: "0.06em",
              }}
            >
              {currentNode.speaker === "player" ? "You" : script.name}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "9px",
                color: C.boneDim,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "1px",
              }}
            >
              {currentNode.speaker === "player" ? "Voidwanderer" : script.title}
            </span>
          </div>

          {/* Dialogue Text Content */}
          <div style={{ marginTop: "8px", minHeight: "72px" }}>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "15px",
                lineHeight: "1.8",
                color: C.bone,
                marginBottom: "20px",
                fontStyle: "italic",
              }}
            >
              "{currentNode.text}"
            </p>
          </div>

          {/* Interactive Choices Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentNode.choices.map((c, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(c)}
                style={{
                  background: C.panel2,
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  color: C.bone,
                  padding: "11px 16px",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  fontFamily: MONO,
                  textAlign: "left",
                  transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = script.accent;
                  e.currentTarget.style.background = "#261d16";
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.5), 0 0 8px ${script.accent}30`;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = C.panel2;
                  e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>{c.text}</span>
                <span style={{ fontSize: "10px", color: script.accent, opacity: 0.8 }}>▶</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
