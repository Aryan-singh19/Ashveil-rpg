import { useRef, useCallback } from "react";
import * as Tone from "tone";

export function useSoundEngine() {
  const ref = useRef<any>({
    ready: false,
    muted: false,
    synths: null,
    notesRef: { current: ["C3", "Eb3", "G3"] },
    loop: null,
  });

  const ensureInit = useCallback(async () => {
    if (ref.current.ready) return;
    try {
      await Tone.start();
      
      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 1.5, decay: 0.8, sustain: 0.6, release: 3 },
      }).toDestination();
      pad.volume.value = -24;

      const bass = new Tone.MonoSynth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.5, decay: 0.4, sustain: 0.5, release: 2 },
      }).toDestination();
      bass.volume.value = -20;

      const sfx = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.005, decay: 0.18, sustain: 0, release: 0.12 },
      }).toDestination();
      sfx.volume.value = -12;

      const noise = new Tone.NoiseSynth({
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      }).toDestination();
      noise.volume.value = -18;

      const pluck = new Tone.PluckSynth().toDestination();
      pluck.volume.value = -12;

      Tone.Transport.bpm.value = 64;
      const loop = new Tone.Loop((time) => {
        pad.triggerAttackRelease(ref.current.notesRef.current, "2n", time);
        bass.triggerAttackRelease(ref.current.notesRef.current[0], "1n", time);
      }, "2n").start(0);

      Tone.Transport.start();
      ref.current.synths = { pad, bass, sfx, noise, pluck };
      ref.current.loop = loop;
      ref.current.ready = true;
    } catch (e) {
      console.error("Audio failed to initialize", e);
    }
  }, []);

  const setMuted = useCallback((m: boolean) => {
    ref.current.muted = m;
    Tone.Destination.mute = m;
  }, []);

  const setMood = useCallback((notes: string[], bpm: number) => {
    ref.current.notesRef.current = notes;
    if (ref.current.ready) {
      Tone.Transport.bpm.rampTo(bpm, 2);
    }
  }, []);

  const sfx = {
    step: () => {
      if (ref.current.ready && !ref.current.muted) ref.current.synths.noise.triggerAttackRelease("32n");
    },
    attack: () => {
      if (ref.current.ready && !ref.current.muted) ref.current.synths.sfx.triggerAttackRelease("C5", "16n");
    },
    hit: () => {
      if (ref.current.ready && !ref.current.muted) ref.current.synths.sfx.triggerAttackRelease("G2", "8n");
    },
    heal: () => {
      if (ref.current.ready && !ref.current.muted) {
        const s = ref.current.synths.pluck;
        ["C4", "E4", "G4"].forEach((n, i) => {
          setTimeout(() => {
            try { s.triggerAttackRelease(n, "8n"); } catch {}
          }, i * 90);
        });
      }
    },
    pickup: () => {
      if (ref.current.ready && !ref.current.muted) ref.current.synths.pluck.triggerAttackRelease("G5", "16n");
    },
    levelup: () => {
      if (ref.current.ready && !ref.current.muted) {
        const s = ref.current.synths.pluck;
        ["C4", "E4", "G4", "C5"].forEach((n, i) => {
          setTimeout(() => {
            try { s.triggerAttackRelease(n, "8n"); } catch {}
          }, i * 100);
        });
      }
    },
    portal: () => {
      if (ref.current.ready && !ref.current.muted) {
        const s = ref.current.synths.sfx;
        ["A5", "F5", "D5", "A4"].forEach((n, i) => {
          setTimeout(() => {
            try { s.triggerAttackRelease(n, "16n"); } catch {}
          }, i * 60);
        });
      }
    },
    victory: () => {
      if (ref.current.ready && !ref.current.muted) {
        const s = ref.current.synths.pad;
        ["C4", "E4", "G4", "C5"].forEach((n, i) => {
          setTimeout(() => {
            try { s.triggerAttackRelease(n, "4n"); } catch {}
          }, i * 180);
        });
      }
    },
    gameover: () => {
      if (ref.current.ready && !ref.current.muted) {
        const s = ref.current.synths.pad;
        ["C3", "Bb2", "Ab2"].forEach((n, i) => {
          setTimeout(() => {
            try { s.triggerAttackRelease(n, "2n"); } catch {}
          }, i * 300);
        });
      }
    },
  };

  return { ensureInit, setMuted, setMood, sfx };
}
