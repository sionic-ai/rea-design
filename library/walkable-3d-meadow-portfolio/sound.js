// Meadow sound — as in the original, synthesized with WebAudio without files. Wind, rain, campfire, pond base, birds, crickets, owl, and generated music.
// Values were measured from the original main chunk’s sound engine and carried over (master .9 · high shelf 2400Hz −8dB · low cut 45Hz · compression −24dB 3:1,
// Reverb is a noise impulse that decays exponentially — meadow 3.6s/2.6, music 5.4s/3.4, night 2.2s/3.2).
// Music: 3 beats · 70~74bpm (±2.5 per passage, 66~78) · 2 bars per chord · 8-bar passages · C major pentatonic 60~88.
// Each paragraph composes a new theme (first paragraph and 30% after the 4th paragraph), answer melody and free melody (piano, flute, high counter-melody), and the left hand is one of three: sway, pulse or root,
// The pad plays from the 82% passage. At night it slows (tempo ×1/(1−.14·night)), the register drops and rests grow, and with rain flute and koto thin out.
// Subject and answer melodies are not the original melody but our own, newly composed over the same chords with the same lengths.
window.MeadowSound = (() => {
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const unit = (v) => clamp(v, 0, 1);
  const weighted = (list) => {
    let n = Math.random() * list.reduce((s, [, w]) => s + w, 0);
    for (const [v, w] of list) if ((n -= w) <= 0) return v;
    return list[list.length - 1][0];
  };
  const near = (d, inner, outer) => unit(1 - (d - inner) / Math.max(0.001, outer - inner));

  const PENTA = [0, 2, 4, 7, 9];
  const pc = (m) => ((m % 12) + 12) % 12;
  const SCALE = [];
  for (let m = 60; m <= 88; m++) if (PENTA.includes(pc(m))) SCALE.push(m);
  const scaleIndex = (m) => SCALE.reduce((best, v, i) => (Math.abs(v - m) < Math.abs(SCALE[best] - m) ? i : best), 0);
  // Moves d steps within the scale — turns back if it goes out of range
  const stepBy = (m, d, lo, hi) => {
    let i = scaleIndex(m) + d;
    if (i < 0 || i >= SCALE.length || SCALE[i] < lo || SCALE[i] > hi) i -= d * 2;
    return SCALE[clamp(i, 0, SCALE.length - 1)];
  };
  // Of the chord notes (pitch groups), the one closest to target — shaken slightly when the distance is equal
  const chordTone = (target, tones, lo, hi) => {
    let best = null, cost = Infinity;
    for (let m = lo; m <= hi; m++) {
      if (!tones.includes(pc(m))) continue;
      const c = Math.abs(m - target) + Math.random() * 0.5;
      if (c < cost) { best = m; cost = c; }
    }
    if (best !== null) return best;
    for (let d = 0; d <= 6; d++) for (const m of [target - d, target + d]) if (tones.includes(pc(m))) return m;
    return target;
  };

  const BEATS = 3, BARS_PER_CHORD = 2, AHEAD = 2;
  const CHORDS = {
    C: { hand: [48, 55, 64], tones: [0, 4, 7], home: 0 },
    Am: { hand: [45, 52, 60], tones: [9, 0, 4], home: 9 },
    F: { hand: [41, 48, 57], tones: [9, 0], home: 9 },
    G: { hand: [43, 50, 57], tones: [7, 2], home: 7 },
    Em: { hand: [40, 55, 62], tones: [4, 7], home: 4 },
    Dm: { hand: [38, 45, 60], tones: [2, 9], home: 2 },
  };
  const PROGRESSIONS = [
    [["C", "Am", "F", "G"], 3], [["C", "F", "Am", "G"], 2], [["F", "G", "C", "Am"], 1.6], [["Am", "F", "C", "G"], 1.4],
    [["C", "G", "Am", "F"], 1.4], [["F", "C", "Dm", "G"], 1.4], [["F", "G", "Em", "Am"], 1], [["C", "Em", "F", "C"], 1],
  ];
  const THEME = {
    chords: ["C", "C", "Am", "Am", "F", "F", "G", "G"],
    line: [[[72, 1], [76, 1], [79, 1]], [[81, 2], [79, 1]], [[76, 1.5], [72, 0.5], [69, 1]], [[72, 3]],
      [[69, 1], [72, 1], [74, 1]], [[76, 2], [74, 1]], [[74, 1.5], [72, 0.5], [74, 1]], [[null, 3]]],
  };
  const ANSWER = {
    chords: ["C", "C", "Am", "Am", "F", "G", "C", "C"],
    line: [[[79, 2], [76, 1]], [[74, 1], [72, 1], [74, 1]], [[76, 2], [72, 1]], [[69, 3]],
      [[72, 1.5], [74, 0.5], [76, 1]], [[74, 2], [79, 1]], [[76, 1], [74, 1], [72, 1]], [[72, 3]]],
  };
  // Length group of one measure (negatives are rests) and weight
  const PIANO_CELLS = [[[2, 1], 3], [[1.5, 0.5, 1], 3], [[1, 1, 1], 2], [[1, 2], 2], [[-1, 1, 1], 1.4], [[2, 0.5, 0.5], 1]];
  const FLUTE_CELLS = [[[3], 2], [[2, 1], 3], [[1, 2], 2], [[1.5, 1.5], 1.5]];
  const CADENCE = [[[3], 3], [[2, -1], 1.5], [[1, 2], 1.5]];
  const CONTOURS = [[[1, 1, -1, -1], 3], [[0, -1, -1, -1], 2], [[1, 1, 1, 0], 1.5], [[-1, -1, 1, 1], 1], [[1, -1, 1, -1], 1]];
  const PIANO_PARTIALS = [1, 0.36, 0.18, 0.09, 0.05, 0.03, 0.018];
  const KOTO_PARTIALS = [1, 0.5, 0.34, 0.2, 0.12, 0.07];
  const VOICE_MIX = { piano: [0.85, 0.22], flute: [0.64, 0.48], koto: [0.65, 0.42], pad: [0.6, 0.45] };

  // Per-note intensity of the melody: the middle is a bit stronger and the first beat is strongest
  const shapeVelocity = (notes, base) => notes.forEach((n, i) => {
    const pos = notes.length > 1 ? i / (notes.length - 1) : 0;
    n.velocity = clamp(base * (0.88 + 0.22 * Math.sin(Math.PI * pos)) * (n.at === 0 ? 1.06 : 0.96) * (n.final ? 0.88 : 1) + rand(-0.03, 0.03), 0.18, 0.85);
  });

  class Music {
    constructor(engine, { output, reverb, lean }) {
      this.engine = engine;
      this.ctx = engine.ctx;
      this.lean = lean;
      this.night = 0; this.rain = 0; this.golden = 0;
      const wet = this.ctx.createGain();
      reverb.connect(wet); wet.connect(output);
      this.inputs = {};
      for (const [name, [dry, send]] of Object.entries(VOICE_MIX)) {
        const input = this.ctx.createGain(), d = this.ctx.createGain(), w = this.ctx.createGain();
        d.gain.value = dry; w.gain.value = send;
        input.connect(d); input.connect(w); d.connect(output); w.connect(reverb);
        this.inputs[name] = input;
      }
      this.section = null; this.barIndex = 0; this.barAt = null;
      this.bpm = rand(70, 74); this.sections = 0; this.sinceTheme = 0; this.answerNext = false;
      this.lastPitch = 72; this.padChord = null; this.padVoices = []; this.handChord = null;
      this.kotoNextAt = 0; this.arcPeriod = rand(150, 240); this.arcPhase = rand(0, Math.PI * 2);
      this.waves = new Map();
    }
    start() {
      const now = this.ctx.currentTime;
      this.barAt = now + rand(2.6, 3.6);
      this.kotoNextAt = now + rand(20, 35);
      this.engine.later(this.barAt - now - AHEAD, () => this.tick());
    }
    setMood(m) { Object.assign(this, m); }
    // Liveliness that rises and falls every few minutes — sinks at night and in rain, rises slightly at sunset
    activity() {
      const wave = 0.5 + 0.5 * Math.sin((this.ctx.currentTime / this.arcPeriod) * Math.PI * 2 + this.arcPhase);
      return unit(wave * (1 - this.night * 0.45) * (1 - this.rain * 0.2) + this.golden * 0.1);
    }
    tick() {
      const now = this.ctx.currentTime;
      if (!this.engine.audible()) {
        this.barAt = null; this.releasePad(now);
        this.engine.later(1, () => this.tick());
        return;
      }
      if (this.barAt === null || this.barAt < now + 0.05) this.barAt = now + 0.3;
      if (!this.section || this.barIndex >= this.section.chords.length) { this.section = this.planSection(); this.barIndex = 0; }
      this.playBar(this.section, this.barIndex, this.barAt);
      this.barAt += this.section.beat * BEATS;
      this.barIndex += 1;
      this.engine.later(Math.max(0.05, this.barAt - now - AHEAD), () => this.tick());
    }
    planSection() {
      const act = this.activity();
      this.bpm = clamp(this.bpm + rand(-2.5, 2.5), 66, 78);
      const beat = 60 / (this.bpm * (1 - this.night * 0.14));
      const hand = act > 0.68 && this.night < 0.5 ? "rock" : act > 0.2 ? "pulse" : "root";
      const s = { beat, hand, pad: Math.random() < 0.82, lines: [], chords: null };
      const fluteOk = this.rain < 0.6 && Math.random() > this.night * 0.3;
      if (this.answerNext) {
        this.answerNext = false;
        const voice = fluteOk && Math.random() < 0.55 ? "flute" : "piano";
        s.chords = ANSWER.chords; s.lines.push(this.tuneLine(ANSWER, voice));
        s.hand = hand === "root" ? "pulse" : hand; s.pad = true;
      } else if (this.sections === 0 || (this.sinceTheme >= 4 && Math.random() < 0.3)) {
        const voice = this.sections > 0 && fluteOk && Math.random() < 0.3 ? "flute" : "piano";
        s.chords = THEME.chords; s.lines.push(this.tuneLine(THEME, voice));
        s.hand = this.sections === 0 || hand === "root" ? "pulse" : hand; s.pad = true;
        this.answerNext = true; this.sinceTheme = 0;
      } else {
        this.sinceTheme += 1;
        const choices = PROGRESSIONS.filter(([p]) => p !== this.lastProgression);
        this.lastProgression = weighted(choices);
        s.chords = this.lastProgression.flatMap((c) => Array(BARS_PER_CHORD).fill(c));
        this.writeFree(s, act, fluteOk);
      }
      const last = s.lines.flatMap((l) => l.notes).filter((n) => n.voice !== "descant").pop();
      if (last) this.lastPitch = last.midi;
      this.sections += 1;
      return s;
    }
    writeFree(s, act, fluteOk) {
      const plan = weighted([
        ["piano piano", 3], ["piano flute", fluteOk ? 2 : 0], ["flute piano", fluteOk ? 1 : 0], ["piano descant", fluteOk ? 1.2 : 0],
        ["piano rest", 1.4 + (1 - act) * 1.8 + this.night * 1.4], ["rest piano", 0.8 + (1 - act)], ["rest rest", (1 - act) * 0.5 + this.night * 0.4],
      ]);
      const [first, second] = plan.split(" ");
      const sparse = () => Math.random() < 0.2 + (1 - act) * 0.35 + this.night * 0.2;
      const pianoRange = { low: 67, high: Math.round(81 - this.night * 2), centre: 74 - this.night * 2 };
      const fluteRange = { low: 69, high: 84, centre: 78 };
      let a = null;
      if (first !== "rest") {
        const fl = first === "flute";
        a = this.writeLine(s.chords.slice(0, 4), { ...(fl ? fluteRange : pianoRange), from: fl ? this.lastPitch + pick([5, 7, 9]) : this.lastPitch + pick([-2, 0, 2, 3]), ending: "open", cells: fl ? FLUTE_CELLS : PIANO_CELLS, short: !fl && sparse() });
        s.lines.push({ voice: first, pan: this.linePan(first), notes: a.notes });
      }
      if (second === "piano" || second === "flute" || second === "descant") {
        const fl = second === "flute", from = a ? a.last : this.lastPitch;
        const b = this.writeLine(s.chords.slice(4), { ...(fl ? fluteRange : pianoRange), from: fl ? from + pick([3, 5, 7]) : from + pick([-2, 0, 2]), ending: "close", cells: fl ? FLUTE_CELLS : PIANO_CELLS, echo: a && first === (fl ? "flute" : "piano") ? a.cells : null, short: !fl && sparse() });
        b.notes.forEach((n) => { n.bar += 4; });
        s.lines.push({ voice: fl ? "flute" : "piano", pan: this.linePan(fl ? "flute" : "piano"), notes: b.notes });
      }
      if (second === "descant") s.lines.push({ voice: "flute", pan: this.linePan("flute"), notes: this.writeDescant(s.chords) });
    }
    linePan(voice) { return voice === "piano" ? null : pick([-1, 1]) * rand(0.2, 0.42); }
    tuneLine(tune, voice) {
      const notes = [];
      tune.line.forEach((bar, b) => {
        let at = 0;
        for (const [midi, beats] of bar) { if (midi !== null) notes.push({ bar: b, at, midi, beats }); at += beats; }
      });
      notes[notes.length - 1].final = true;
      shapeVelocity(notes, rand(0.46, 0.54) * (1 - this.night * 0.2));
      return { voice, pan: this.linePan(voice), notes };
    }
    // Four-bar melody: the second bar repeats the first bar’s group at 55% (following its pitch steps too), and the fourth bar uses a closing group that lands on a chord tone
    writeLine(chords, { low, high, centre, from, ending, cells, echo = null, short = false }) {
      const contour = weighted(CONTOURS), cadence = weighted(CADENCE);
      const c0 = echo?.[0] ?? weighted(cells);
      const c1 = echo?.[1] ?? (Math.random() < 0.55 ? c0 : weighted(cells));
      const bars = short ? [c0, cadence, null, null] : [c0, c1, Math.random() < 0.35 ? c0 : weighted(cells), cadence];
      const notes = [];
      let pitch = clamp(from, low, high), steps = null;
      bars.forEach((cell, bar) => {
        if (!cell) return;
        const chord = CHORDS[chords[bar]], dir = contour[bar];
        if (cell === cadence) {
          const others = chord.tones.filter((t) => t !== chord.home);
          const land = chordTone(pitch + dir * 2 + (centre - pitch) * 0.3, ending === "close" || !others.length ? [chord.home] : others, low, high);
          let at = 0;
          cell.forEach((beats, k) => {
            if (beats < 0) return;
            const lead = k === 0 && cell.length > 1 && cell[1] > 0;
            notes.push({ bar, at, midi: lead ? stepBy(land, pitch > land ? 1 : -1, low, high) : land, beats, final: !lead });
            at += beats;
          });
          pitch = land;
          return;
        }
        const repeat = bar === 1 && cell === bars[0] && steps;
        const taken = [];
        let at = 0, cur = null;
        cell.forEach((beats, k) => {
          if (beats < 0) { at -= beats; return; }
          if (cur === null) cur = chordTone(pitch + dir * rand(1.5, 4.5) + (centre - pitch) * 0.3, chord.tones, low, high);
          else {
            let d = repeat ? steps[taken.length] : undefined;
            if (d === undefined) {
              d = (dir || pick([-1, 1])) * (Math.random() < 0.75 ? 1 : 2);
              if (k === cell.length - 1 && taken.length && Math.random() < 0.22) d = -Math.sign(d);
            }
            taken.push(d);
            cur = stepBy(cur, d, low, high);
          }
          notes.push({ bar, at, midi: cur, beats });
          at += beats;
          pitch = cur;
        });
        if (bar === 0) steps = taken;
      });
      shapeVelocity(notes, rand(0.4, 0.53) * (1 - this.night * 0.2));
      return { notes, cells: [bars[0], bars[1]], last: pitch };
    }
    // High counter-melody: one long note per chord change (76~88), 40% start one chord late
    writeDescant(chords) {
      const notes = [];
      let pitch = clamp(this.lastPitch + 7, 76, 86);
      for (let b = Math.random() < 0.4 ? BARS_PER_CHORD : 0; b < chords.length; b += BARS_PER_CHORD) {
        const m = chordTone(pitch + rand(-2, 2), CHORDS[chords[b]].tones, 76, 86);
        notes.push({ bar: b, at: 1, midi: m, beats: BEATS * BARS_PER_CHORD - 1 + 0.4, voice: "descant", velocity: rand(0.36, 0.44) * (1 - this.night * 0.2) });
        pitch = m;
      }
      if (notes.length) notes[notes.length - 1].final = true;
      return notes;
    }
    playBar(s, bar, at) {
      const chord = s.chords[bar], beat = s.beat;
      if (s.pad && this.padChord !== chord) this.setPad(chord, at);
      else if (!s.pad && this.padChord) this.releasePad(at);
      this.leftHand(s, bar, at);
      let sounded = false;
      for (const line of s.lines) for (const n of line.notes) {
        if (n.bar !== bar) continue;
        sounded = true;
        const when = at + n.at * beat + rand(-0.012, 0.012) + (n.final ? rand(0, 0.06) : 0);
        if (line.voice === "flute") this.flute({ midi: n.midi, when, length: n.beats * beat + (n.final ? 0.9 : 0.14), velocity: n.velocity * 0.8, pan: line.pan, grace: n.voice !== "descant" && n.at > 0 && n.beats >= 1.5 && Math.random() < 0.25 });
        else this.piano(this.inputs.piano, { midi: n.midi, when, velocity: n.velocity, ring: n.final ? rand(4.5, 6.5) : Math.max(1.6, n.beats * beat * 1.5 + 0.6) });
      }
      // In the melody’s resting measures, the koto occasionally plucks a note or two (16~34s apart, rarer at night)
      if (!sounded && at >= this.kotoNextAt && Math.random() < 0.3 * (1 - this.rain * 0.5)) {
        this.kotoTouch(chord, at + beat * pick([0, 1, 1.5]));
        this.kotoNextAt = at + rand(16, 34) * (1 + this.night * 0.3);
      }
    }
    leftHand(s, bar, at) {
      const chord = s.chords[bar], [root, fifth, top] = CHORDS[chord].hand, beat = s.beat;
      const fresh = bar === 0 ? chord !== this.handChord : s.chords[bar - 1] !== chord;
      let span = 1;
      while (s.chords[bar + span] === chord) span += 1;
      const soft = 1 - this.night * 0.25;
      const hit = (m, b, v, ring) => this.piano(this.inputs.piano, { midi: m, when: at + b * beat + rand(0, 0.015), velocity: v * soft, ring, accompany: true });
      if (s.hand === "rock") { hit(root, 0, fresh ? 0.28 : 0.23, beat * BEATS * 1.4); hit(fifth, 1, 0.18, beat * 2.2); hit(top, 2, 0.2, beat * 2); }
      else if (s.hand === "pulse") {
        if (fresh) { hit(root, 0, 0.28, beat * BEATS * span + 0.6); hit(fifth, 1, 0.17, beat * BEATS * span - beat); }
        else hit(top, 0, 0.16, beat * BEATS);
      } else if (fresh) hit(root, 0, 0.27, beat * BEATS * span + 1);
      this.handChord = chord;
    }
    kotoTouch(chord, when) {
      const top = chordTone(pick([76, 79, 81, 84]), CHORDS[chord].tones, 74, 88), pan = rand(-0.4, 0.4);
      if (Math.random() < 0.45) {
        const n = Math.random() < 0.5 ? 2 : 3;
        for (let i = 0; i < n; i++) this.koto({ midi: stepBy(top, -(n - 1 - i), 60, 90), when: when + i * rand(0.11, 0.15), velocity: rand(0.3, 0.42) * (i === n - 1 ? 1.15 : 1), pan });
      } else this.koto({ midi: top, when, velocity: rand(0.34, 0.48), pan });
    }
    setPad(chord, at) {
      this.releasePad(at);
      this.padChord = chord;
      const notes = CHORDS[chord].hand.map((m) => (m < 48 ? m + 12 : m));
      this.padVoices = [this.pad(this.lean ? notes.slice(0, 2) : notes, at)];
    }
    releasePad(at) {
      this.padVoices.forEach((v) => v.release(at));
      this.padVoices = []; this.padChord = null;
    }
    overtones(from, to) {
      const key = `${from}-${to}`;
      if (!this.waves.has(key)) {
        const real = new Float32Array(to + 1), imag = new Float32Array(to + 1);
        for (let i = from; i <= to; i++) imag[i] = PIANO_PARTIALS[i - 1];
        this.waves.set(key, this.ctx.createPeriodicWave(real, imag, { disableNormalization: true }));
      }
      return this.waves.get(key);
    }
    // Piano: fundamental + overtone bundle + slightly detuned fundamental, 30ms hammer noise, brightness filter closes over 2.2 seconds
    piano(input, { midi, when, velocity = 0.6, ring = 4, pan = null, accompany = false }) {
      const c = this.ctx, f = hz(midi), out = c.createGain();
      out.gain.value = 0.3 * velocity;
      const tone = c.createBiquadFilter();
      tone.type = "lowpass"; tone.Q.value = 0.4;
      tone.frequency.setValueAtTime(Math.min(700 + 2600 * velocity * velocity + f * 1.5, 9000), when);
      tone.frequency.exponentialRampToValueAtTime(480 + f * 1.3, when + 2.2);
      tone.connect(out);
      this.engine.pan(out, input, pan ?? clamp((midi - 66) / 34, -0.35, 0.35));
      const attack = 0.005 + (1 - velocity) * 0.006, stretch = f < 220 ? 4e-4 : 1.8e-4, stopAt = when + ring + 0.4;
      const partial = (ratio, level, { detune = 0, wave = null, fade = ratio } = {}) => {
        const o = c.createOscillator(), g = c.createGain();
        if (wave) o.setPeriodicWave(wave); else o.type = "sine";
        o.frequency.value = f * ratio; o.detune.value = detune;
        g.gain.setValueAtTime(1e-4, when);
        g.gain.exponentialRampToValueAtTime(level, when + attack);
        g.gain.setTargetAtTime(level * 0.5, when + attack, 0.16 / Math.sqrt(fade));
        g.gain.setTargetAtTime(1e-4, when + 0.3, ring / (2 + fade * 1.1));
        o.connect(g); g.connect(tone); o.start(when); o.stop(stopAt);
      };
      const v = Math.sqrt(velocity);
      partial(1, PIANO_PARTIALS[0]);
      if (accompany) {
        partial(1, v, { wave: this.overtones(2, 3), fade: 2.4 });
        out.gain.setTargetAtTime(1e-4, when + ring, 0.12);
        return;
      }
      partial(2 * Math.sqrt(1 + stretch * 4), PIANO_PARTIALS[1] * v);
      partial(1, v, { wave: this.overtones(3, this.lean ? 4 : PIANO_PARTIALS.length), fade: 4 });
      if (!this.lean) partial(1, 0.45, { detune: rand(0.6, 1.2) });
      const hammer = this.engine.burst(0.03), band = c.createBiquadFilter(), hg = c.createGain();
      band.type = "bandpass"; band.frequency.value = clamp(f * 3, 900, 3200); band.Q.value = 0.9;
      hg.gain.setValueAtTime(1e-4, when);
      hg.gain.exponentialRampToValueAtTime(0.12 * velocity, when + 0.002);
      hg.gain.exponentialRampToValueAtTime(1e-4, when + 0.035);
      hammer.connect(band); band.connect(hg); hg.connect(tone);
      hammer.start(when); hammer.stop(when + 0.05);
      out.gain.setTargetAtTime(1e-4, when + ring, 0.12);
    }
    // Flute: breath intake (.3~.5s, grace notes .1~.16s) · vibrato 4.8~5.3Hz after .6s · two branches of breath noise
    flute({ midi, when, length, velocity = 0.6, pan = 0, grace = false }) {
      const c = this.ctx, f = hz(midi), rise = grace ? rand(0.1, 0.16) : rand(0.3, 0.5), tail = rand(1, 1.5);
      const end = when + length, stopAt = end + tail + 0.3, peak = 0.28 * velocity;
      const env = c.createGain();
      env.gain.setValueAtTime(1e-4, when);
      env.gain.exponentialRampToValueAtTime(peak, when + rise);
      env.gain.linearRampToValueAtTime(peak * 1.05, when + Math.max(rise + 0.05, length * 0.6));
      env.gain.setTargetAtTime(1e-4, end, tail / 3);
      const lp = c.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 3400;
      env.connect(lp);
      this.engine.pan(lp, this.inputs.flute, pan);
      const upper = SCALE[clamp(scaleIndex(midi) + 1, 0, SCALE.length - 1)], graceCents = Math.max(200, (upper - midi) * 100);
      const lfo = c.createOscillator(), depth = c.createGain();
      lfo.frequency.value = rand(4.8, 5.3);
      depth.gain.setValueAtTime(0, when);
      depth.gain.setValueAtTime(0, when + 0.6);
      depth.gain.linearRampToValueAtTime(rand(5, 9), when + Math.max(0.9, length * 0.8));
      lfo.connect(depth); lfo.start(when); lfo.stop(stopAt);
      const body = c.createGain();
      body.connect(env);
      for (const [ratio, level] of [[1, 1], [2, 0.2], [3, 0.06], [4, 0.02]]) {
        if (this.lean && ratio > 2) continue;
        const o = c.createOscillator(), g = c.createGain();
        o.type = "sine"; o.frequency.value = f * ratio;
        if (grace) { o.detune.setValueAtTime(graceCents, when); o.detune.setValueAtTime(graceCents, when + 0.09); o.detune.setTargetAtTime(0, when + 0.09, 0.025); }
        else { o.detune.setValueAtTime(-rand(10, 18), when); o.detune.setTargetAtTime(0, when + 0.03, 0.07); }
        depth.connect(o.detune);
        g.gain.value = level;
        o.connect(g); g.connect(body); o.start(when); o.stop(stopAt);
      }
      const air = this.engine.noise(3), ag = c.createGain();
      ag.gain.setValueAtTime(1e-4, when);
      ag.gain.exponentialRampToValueAtTime(1, when + 0.1);
      ag.gain.setTargetAtTime(0.4, when + 0.12, 0.16);
      const tonal = c.createBiquadFilter(), tg = c.createGain(), hiss = c.createBiquadFilter(), hg = c.createGain();
      tonal.type = "bandpass"; tonal.frequency.value = f; tonal.Q.value = 10; tg.gain.value = 0.24;
      hiss.type = "highpass"; hiss.frequency.value = 2600; hg.gain.value = 0.025;
      air.connect(ag); ag.connect(tonal); ag.connect(hiss); tonal.connect(tg); hiss.connect(hg); tg.connect(env); hg.connect(env);
      air.start(when); air.stop(stopAt);
    }
    // Koto: slightly stretched overtones (1 + 6e-4·n²) decay faster going up, with 20ms of pluck noise
    koto({ midi, when, velocity = 0.5, pan = 0 }) {
      const c = this.ctx, f = hz(midi), decay = rand(1.6, 2.4), stopAt = when + decay + 0.4, out = c.createGain();
      out.gain.value = 0.26 * velocity;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 3600;
      lp.connect(out);
      this.engine.pan(out, this.inputs.koto, pan);
      const count = this.lean ? 4 : KOTO_PARTIALS.length;
      for (let n = 1; n <= count; n++) {
        const o = c.createOscillator(), g = c.createGain(), level = KOTO_PARTIALS[n - 1];
        o.type = "sine"; o.frequency.value = f * n * (1 + 6e-4 * n * n);
        o.detune.setValueAtTime(8, when); o.detune.setTargetAtTime(0, when, 0.02);
        g.gain.setValueAtTime(1e-4, when);
        g.gain.exponentialRampToValueAtTime(level, when + 0.0015);
        g.gain.setTargetAtTime(1e-4, when + 0.002, decay / (3 * (1 + (n - 1) * 0.9)));
        o.connect(g); g.connect(lp); o.start(when); o.stop(stopAt);
      }
      const pluck = this.engine.burst(0.02), band = c.createBiquadFilter(), pg = c.createGain();
      band.type = "bandpass"; band.frequency.value = 2800;
      pg.gain.setValueAtTime(1e-4, when);
      pg.gain.exponentialRampToValueAtTime(0.15, when + 0.001);
      pg.gain.exponentialRampToValueAtTime(1e-4, when + 0.02);
      pluck.connect(band); band.connect(pg); pg.connect(lp);
      pluck.start(when); pluck.stop(when + 0.03);
    }
    // Pad: two layers of ±4 cents per chord note (the first note an octave up at .06), 950Hz low-pass, intensity .028 wobbling like breathing at .08~.14Hz
    pad(notes, at) {
      const c = this.ctx, level = 0.028, out = c.createGain();
      out.gain.setValueAtTime(1e-4, at);
      out.gain.setTargetAtTime(level, at, 0.9);
      const lp = c.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 950; lp.Q.value = 0.2;
      lp.connect(out); out.connect(this.inputs.pad);
      const oscs = [];
      notes.forEach((m, i) => {
        const g = c.createGain();
        g.gain.value = 1 / (1 + i * 0.25);
        g.connect(lp);
        const layers = [[1, -4, 1], [1, 4, 1]];
        if (i === 0 && !this.lean) layers.push([2, 0, 0.06]);
        for (const [ratio, cents, gain] of layers) {
          const o = c.createOscillator();
          o.frequency.value = hz(m) * ratio; o.detune.value = cents;
          if (gain === 1) o.connect(g);
          else { const s = c.createGain(); s.gain.value = gain; o.connect(s); s.connect(g); }
          o.start(at); oscs.push(o);
        }
      });
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = rand(0.08, 0.14); lg.gain.value = level * 0.15;
      lfo.connect(lg); lg.connect(out.gain); lfo.start(at); oscs.push(lfo);
      return {
        release: (when) => {
          const t = Math.max(when, at);
          out.gain.cancelScheduledValues(t);
          out.gain.setTargetAtTime(1e-4, t, 0.7);
          oscs.forEach((o) => o.stop(t + 3.5));
        },
      };
    }
  }

  // ---------- Engine: bus · reverb · ambient sound · birds ----------
  const MASTER = 0.9, MUSIC = 0.24, RAIN_BED = 0.26, RAIN_MEADOW = 0.68, NIGHT_LEVEL = 0.45;
  function create({ lean = false } = {}) {
    const S = {
      ctx: null, started: false, muted: false, timers: new Set(), parked: [], buffers: new Map(),
      env: { night: 0, golden: 0, rain: 0 }, fireNear: 0, pondNear: 0, firePan: 0, pondPan: -0.3, lastEnv: -1,
    };
    const audible = () => S.ctx?.state === "running" && !S.muted;
    const later = (sec, fn) => {
      const id = setTimeout(() => {
        S.timers.delete(id);
        if (!audible()) { S.parked.push(fn); return; }
        fn();
      }, sec * 1000);
      S.timers.add(id);
    };
    const engine = {
      audible, later,
      noise(sec = 4) {
        const len = Math.floor(S.ctx.sampleRate * sec);
        if (!S.buffers.has(len)) {
          const b = S.ctx.createBuffer(1, len, S.ctx.sampleRate), d = b.getChannelData(0);
          for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
          S.buffers.set(len, b);
        }
        const src = S.ctx.createBufferSource();
        src.buffer = S.buffers.get(len); src.loop = true; src.playbackRate.value = rand(0.965, 1.035);
        return src;
      },
      burst(sec = 0.12) {
        const key = `burst-${sec}`;
        if (!S.buffers.has(key)) {
          const len = Math.floor(S.ctx.sampleRate * sec), b = S.ctx.createBuffer(1, len, S.ctx.sampleRate), d = b.getChannelData(0);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
          S.buffers.set(key, b);
        }
        const src = S.ctx.createBufferSource();
        src.buffer = S.buffers.get(key); src.playbackRate.value = rand(0.82, 1.18);
        return src;
      },
      pan(node, dest, value = 0) {
        if (!S.ctx.createStereoPanner) { node.connect(dest); return null; }
        const p = S.ctx.createStereoPanner();
        p.pan.value = clamp(value, -0.82, 0.82);
        node.connect(p); p.connect(dest);
        return p;
      },
    };
    const reverb = (sec, curve) => {
      const len = Math.floor(S.ctx.sampleRate * sec), b = S.ctx.createBuffer(2, len, S.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, curve); }
      const conv = S.ctx.createConvolver();
      conv.buffer = b;
      return conv;
    };
    const gain = (v, to) => { const g = S.ctx.createGain(); g.gain.value = v; if (to) g.connect(to); return g; };
    const filter = (type, freq, q) => { const f = S.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q !== undefined) f.Q.value = q; return f; };

    // One bird chirp syllable: 64-point pitch curve (round, falling, rising, trembling) + 2nd harmonic .09
    function syllable(dest, at, len, base, shape) {
      const curve = new Float32Array(64);
      for (let i = 0; i < 64; i++) {
        const u = i / 63;
        curve[i] = shape === "arc" ? base * (0.88 + 0.24 * Math.sin(u * Math.PI)) : shape === "fall" ? base * (1.12 - 0.28 * u)
          : shape === "rise" ? base * (0.84 + 0.28 * u) : base * (1 + 0.042 * Math.sin(u * Math.PI * 4));
      }
      for (const [mult, level] of [[1, 1], [2, 0.09]]) {
        const o = S.ctx.createOscillator(), g = S.ctx.createGain();
        o.frequency.setValueCurveAtTime(mult === 1 ? curve : curve.map((v) => v * mult), at, len);
        g.gain.setValueAtTime(1e-4, at);
        g.gain.exponentialRampToValueAtTime(level, at + len * 0.34);
        g.gain.setValueAtTime(level, at + len * 0.7);
        g.gain.exponentialRampToValueAtTime(1e-4, at + len);
        o.connect(g); g.connect(dest); o.start(at); o.stop(at + len + 0.05);
      }
    }
    function start() {
      if (S.started) { S.ctx?.state === "suspended" && S.ctx.resume(); return; }
      // three.cjs declares a class AudioContext with the same global name, so using it plainly picks up three’s — use the one on window
      S.ctx = new (window.AudioContext || window.webkitAudioContext)();
      S.ctx.resume?.();
      S.ctx.addEventListener?.("statechange", () => { if (audible()) S.parked.splice(0).forEach((fn) => later(rand(0.6, 7), fn)); });
      engine.ctx = S.ctx;
      S.started = true;
      const c = S.ctx, now = c.currentTime;
      S.master = c.createGain();
      S.master.gain.setValueAtTime(1e-4, now);
      if (!S.muted) S.master.gain.exponentialRampToValueAtTime(MASTER, now + 6);
      const shelf = filter("highshelf", 2400); shelf.gain.value = -8;
      const hp = filter("highpass", 45, 0.5);
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -24; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = 0.015; comp.release.value = 0.65;
      S.master.connect(shelf); shelf.connect(hp); hp.connect(comp); comp.connect(c.destination);
      // A gate that ducks meadow sound and music during the opening (original setIntroDucking: 1 − amount × .94) and the opening sound-effect bus (.42)
      S.gate = gain(1, S.master);
      S.introBus = gain(0.42, S.master);
      // Spot where music and meadow are briefly ducked when the press sound plays (original duck: music .72, meadow .94, down in .08s, held .6s, back at 1.8s)
      S.ambDuck = gain(1, S.gate);
      S.musicDuck = gain(1, S.gate);
      S.meadow = gain(1, S.ambDuck);
      S.day = gain(1, S.meadow);
      S.nightBus = gain(1, null);
      S.nightGain = gain(1e-4, S.meadow);
      S.nightBus.connect(S.nightGain);
      S.spatial = gain(1, S.meadow);
      S.weather = gain(0.82, S.master);
      // Footstep bus: through a 7200Hz low-pass to master (bypasses the meadow gate so it is not suppressed by the opening)
      S.stepBus = gain(1, null);
      const stepLp = filter("lowpass", 7200, 0.5);
      S.stepBus.connect(stepLp); stepLp.connect(S.master);
      S.bus = gain(1, S.day);
      const room = reverb(3.6, 2.6), roomWet = gain(0.3, S.day);
      S.bus.connect(room); room.connect(roomWet);
      if (!lean) { const nightRoom = reverb(2.2, 3.2), nightWet = gain(0.22, S.nightGain); S.nightBus.connect(nightRoom); nightRoom.connect(nightWet); }
      startWind(); startRain(); startBeds();
      S.musicGain = gain(MUSIC * 0.78, S.musicDuck);
      S.music = new Music(engine, { output: S.musicGain, reverb: lean ? reverb(2.8, 3) : reverb(5.4, 3.4), lean });
      S.music.start();
      S.song = { pan: rand(-0.25, 0.25), base: rand(1080, 1320) };
      song(rand(1.5, 3));
      chirper({ pan: -0.7, base: rand(2150, 2650) }, rand(5, 9));
      if (!lean) chirper({ pan: 0.65, base: rand(1850, 2300) }, rand(8, 13));
      crickets(rand(2, 5)); owl(rand(24, 42)); crackle(rand(0.4, 0.9)); heavyDrop(rand(1, 2.5));
      cuckoo(rand(30, 60)); frog(rand(8, 15)); drops(rand(0.5, 1.2)); bubble(rand(2, 4)); microEvent(rand(14, 24));
      S.lastEnv = -1;
    }
    // Wind: a 220Hz (Q.7, 480 low-pass) hiss and a 1200Hz (Q.6, 2200 low-pass) rustle, with intensity re-rolled every 4 to 9 seconds
    function startWind() {
      const c = S.ctx, band = (freq, q, level, lp) => {
        const src = engine.noise(), f = filter("bandpass", freq, q), g = gain(1e-4, S.meadow);
        src.connect(f);
        const l = filter("lowpass", lp);
        f.connect(l); l.connect(g); src.start();
        return { f, g, level };
      };
      const whoosh = band(220, 0.7, 0.085, 480), rustle = band(1200, 0.6, 0.008, 2200);
      S.whoosh = whoosh;
      const gust = () => {
        const a = Math.random(), span = rand(2.5, 5), t = c.currentTime, lift = 1 + S.env.rain * 0.45, calm = 1 - S.env.night * 0.4;
        whoosh.g.gain.setTargetAtTime(whoosh.level * (0.08 + a * a) * lift * calm, t, span / 3);
        whoosh.f.frequency.setTargetAtTime(rand(170, 300) * (1 - S.env.night * 0.2), t, span / 3);
        if (a > 0.65) {
          rustle.g.gain.setTargetAtTime(rustle.level * a * lift * (1 - S.env.night * 0.5), t + 0.4, 0.9);
          later(rand(1.8, 3), () => rustle.g.gain.setTargetAtTime(1e-4, c.currentTime, 1.4));
        }
        later(rand(4, 9), gust);
      };
      gust();
    }
    // Rain: three noise strands (260~2200 .38 · 55~480 .13 · 1400 band .045) made to ripple with a slow sway (.075·.13Hz)
    function startRain() {
      const c = S.ctx;
      S.rainGain = gain(1e-4, null);
      const shelter = filter("lowpass", 16000, 0.4);
      S.rainGain.connect(shelter); shelter.connect(S.weather);
      const layer = ({ hpf, lpf, bpf, q = 0.7, level, pan }) => {
        let node = engine.noise(7);
        const src = node;
        if (hpf) { const f = filter("highpass", hpf); node.connect(f); node = f; }
        if (bpf) { const f = filter("bandpass", bpf, q); node.connect(f); node = f; }
        if (lpf) { const f = filter("lowpass", lpf); node.connect(f); node = f; }
        const g = gain(level, null);
        node.connect(g); engine.pan(g, S.rainGain, pan); src.start();
        return g;
      };
      const wobble = (g, freq, depth) => { const o = c.createOscillator(), d = gain(depth, g.gain); o.frequency.value = freq; o.connect(d); o.start(); };
      const wash = layer({ hpf: 260, lpf: 2200, level: 0.38, pan: -0.08 });
      layer({ hpf: 55, lpf: 480, level: 0.13, pan: 0.04 });
      wobble(wash, 0.075, 0.026);
      if (!lean) wobble(layer({ bpf: 1400, q: 0.55, lpf: 2800, level: 0.045, pan: 0.16 }), 0.13, 0.012);
    }
    // Bonfire (1050Hz band Q.58) and pond (720Hz band Q.48, .19Hz sway) ambience — louder when closer, and the sound position shifts left and right
    function startBeds() {
      const c = S.ctx;
      S.fireBed = gain(1e-4, null); S.firePanNode = engine.pan(S.fireBed, S.spatial, 0);
      S.pondBed = gain(1e-4, null); S.pondPanNode = engine.pan(S.pondBed, S.spatial, -0.3);
      const pond = engine.noise(6), pf = filter("bandpass", 720, 0.48), pl = filter("lowpass", 1800), pg = gain(0.085, S.pondBed);
      pond.connect(pf); pf.connect(pl); pl.connect(pg); pond.start();
      const swell = c.createOscillator(), sg = gain(0.085 * 0.18, pg.gain);
      swell.frequency.value = 0.19; swell.connect(sg); swell.start();
      const fire = engine.noise(5), ff = filter("bandpass", 1050, 0.58), fg = gain(0.07 * 0.12, S.fireBed);
      fire.connect(ff); ff.connect(fg); fire.start();
    }
    function song(wait) {
      later(wait, () => {
        const g = gain(0.022 * rand(0.8, 1), null);
        engine.pan(g, S.bus, S.song.pan + rand(-0.08, 0.08));
        let at = S.ctx.currentTime + 0.05;
        for (let i = 0, n = 2 + Math.floor(Math.random() * 3); i < n; i++) {
          const len = rand(0.19, 0.36);
          syllable(g, at, len, S.song.base * pick([1, 1.125, 1.25, 1.5, 1.667, 2]) * rand(0.99, 1.01), pick(["arc", "arc", "fall", "fall", "rise", "warble"]));
          at += len + rand(0.1, 0.3);
        }
        if (Math.random() < 0.2) S.song.base = rand(1080, 1320);
        song(rand(17, 28) / Math.max(0.55, 1 - S.env.rain * 0.35));
      });
    }
    function chirper(bird, wait) {
      later(wait, () => {
        const g = gain(0.009 * rand(0.6, 1), null);
        engine.pan(g, S.bus, bird.pan + rand(-0.1, 0.1));
        let at = S.ctx.currentTime + 0.02;
        for (let i = 0, n = 1 + Math.floor(Math.random() * 3); i < n; i++) { syllable(g, at, rand(0.07, 0.12), bird.base * rand(0.95, 1.05), pick(["rise", "arc"])); at += rand(0.15, 0.3); }
        chirper(bird, rand(18, 32));
      });
    }
    function crickets(wait) {
      later(wait, () => {
        if (S.env.night > 0.18 && S.env.rain < 0.7) {
          const g = gain(rand(0.004, 0.008), null), at = S.ctx.currentTime + 0.02, f = rand(2400, 3100);
          engine.pan(g, S.nightBus, rand(-0.86, 0.86));
          for (let i = 0, n = 1 + Math.floor(rand(0, 2)); i < n; i++) {
            const t = at + i * rand(0.09, 0.135), o = S.ctx.createOscillator(), e = S.ctx.createGain();
            o.type = "triangle"; o.frequency.setValueAtTime(f * rand(0.97, 1.03), t);
            e.gain.setValueAtTime(1e-4, t); e.gain.exponentialRampToValueAtTime(1, t + 0.008); e.gain.exponentialRampToValueAtTime(1e-4, t + 0.052);
            o.connect(e); e.connect(g); o.start(t); o.stop(t + 0.06);
          }
        }
        crickets(rand(4, 8) / Math.max(0.15, S.env.night));
      });
    }
    function owl(wait) {
      later(wait, () => {
        if (S.env.night > 0.58 && S.env.rain < 0.52) {
          const g = gain(0.032, null), lp = filter("lowpass", 980), base = rand(410, 510), at = S.ctx.currentTime + 0.02;
          g.connect(lp); engine.pan(lp, S.nightBus, rand(-0.58, 0.58));
          syllable(g, at, 0.42, base, "fall"); syllable(g, at + 0.58, 0.52, base * 0.86, "arc");
        }
        owl(rand(28, 58));
      });
    }
    function cuckoo(wait) {
      later(wait, () => {
        const g = gain(0.02, null), lp = filter("lowpass", 1200), base = rand(680, 760), at = S.ctx.currentTime + 0.02;
        g.connect(lp); engine.pan(lp, S.bus, rand(-0.5, 0.5));
        syllable(g, at, 0.24, base, "arc"); syllable(g, at + 0.38, 0.28, base * 0.8, "arc");
        cuckoo(rand(45, 90));
      });
    }
    // Pond: when near, a bubble every 2.8~7.2s (520~760 → 260~390Hz), at night or in rain, frogs (sawtooth 145~190 → 95~125Hz)
    function bubble(wait) {
      later(wait, () => {
        if (S.pondNear > 0.04 && S.env.rain < 0.78) {
          const t = S.ctx.currentTime + 0.02, o = S.ctx.createOscillator(), g = S.ctx.createGain();
          o.frequency.setValueAtTime(rand(520, 760), t); o.frequency.exponentialRampToValueAtTime(rand(260, 390), t + 0.13);
          g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(rand(0.018, 0.032), t + 0.016); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.17);
          o.connect(g); g.connect(S.pondBed); o.start(t); o.stop(t + 0.19);
        }
        bubble(rand(2.8, 7.2));
      });
    }
    function frog(wait) {
      later(wait, () => {
        if (S.pondNear > 0.08 && Math.max(S.env.night, S.env.rain * 0.72) > 0.24) {
          const t = S.ctx.currentTime + 0.02, o = S.ctx.createOscillator(), g = S.ctx.createGain(), lp = filter("lowpass", 520);
          o.type = "sawtooth"; o.frequency.setValueAtTime(rand(145, 190), t); o.frequency.exponentialRampToValueAtTime(rand(95, 125), t + 0.24);
          g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(0.026, t + 0.035); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.28);
          o.connect(lp); lp.connect(g); g.connect(S.pondBed); o.start(t); o.stop(t + 0.3);
        }
        frog(rand(5.5, 13));
      });
    }
    // Raindrops pitter-patter: 1–3 drops depending on rain intensity (1100–2100 above · 3600–5200 below), every .85–2.35 seconds
    function drops(wait) {
      later(wait, () => {
        if (S.env.rain > 0.08) {
          const t0 = S.ctx.currentTime + 0.01;
          for (let i = 0, n = 1 + Math.floor(S.env.rain * rand(0, 2.2)); i < n; i++) {
            const t = t0 + i * rand(0.025, 0.09), len = pick([0.06, 0.075, 0.09]), src = engine.burst(len), hp = filter("highpass", rand(1100, 2100)), lp = filter("lowpass", rand(3600, 5200)), g = S.ctx.createGain();
            g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(rand(0.016, 0.03) * (0.55 + S.env.rain * 0.45), t + 0.014); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.1);
            src.connect(hp); hp.connect(lp); lp.connect(g); engine.pan(g, S.rainGain, rand(-0.72, 0.72));
            src.start(t); src.stop(t + len + 0.03);
          }
        }
        const n = 2.35 - S.env.rain * 1.15;
        drops(rand(Math.max(0.85, n), Math.max(1.35, n + 0.7)));
      });
    }
    function crackle(wait) {
      later(wait, () => {
        if (S.fireNear > 0.03 && S.env.rain < 0.82) {
          const t = S.ctx.currentTime + 0.01, src = engine.burst(rand(0.045, 0.11)), f = filter("bandpass", rand(650, 1500), rand(0.7, 1.5)), g = S.ctx.createGain();
          g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(0.07 * rand(0.08, 0.2), t + 0.018); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.09);
          src.connect(f); f.connect(g); g.connect(S.fireBed); src.start(t); src.stop(t + 0.13);
        }
        const n = S.fireNear;
        crackle(rand(0.75 + (1 - n), 1.8 + (1 - n) * 2));
      });
    }
    function heavyDrop(wait) {
      later(wait, () => {
        if (S.env.rain > 0.25) {
          const t = S.ctx.currentTime + 0.01, g = gain(0.03 * rand(0.5, 1) * S.env.rain, null), src = engine.burst(0.06), f = filter("bandpass", rand(700, 1300), 2), e = S.ctx.createGain();
          engine.pan(g, S.rainGain, rand(-0.8, 0.8));
          e.gain.setValueAtTime(1e-4, t); e.gain.exponentialRampToValueAtTime(1, t + 0.004); e.gain.exponentialRampToValueAtTime(1e-4, t + 0.06);
          src.connect(f); f.connect(e); e.connect(g); src.start(t); src.stop(t + 0.08);
        }
        heavyDrop(rand(0.8, 2.8) / Math.max(0.2, S.env.rain));
      });
    }
    // When night, sunset or rain changes, bus intensity shifts slowly (once every .18s like the original)
    function update({ night = 0, golden = 0, rain = 0, fireDist = 99, fireDx = 0, pondDist = 99, pondDx = 0 }) {
      if (!S.started) return;
      const now = S.ctx.currentTime;
      S.fireNear = near(fireDist, 1.6, 10); S.pondNear = near(pondDist, 2.2, 13);
      if (now - S.lastEnv < 0.18) return;
      S.lastEnv = now;
      S.env = { night: unit(night), golden: unit(golden), rain: unit(rain) };
      const to = (p, v, span) => p.setTargetAtTime(Math.max(v, 1e-4), now, span / 3);
      const { night: n, golden: g, rain: r } = S.env;
      to(S.rainGain.gain, RAIN_BED * r, 3.5);
      to(S.meadow.gain, 1 - r * (1 - RAIN_MEADOW), 2.2);
      to(S.day.gain, Math.pow(1 - n, 1.35) * (1 - r * 0.72), 2.4);
      to(S.nightGain.gain, n * NIGHT_LEVEL * (1 - r * 0.56), 2.8);
      to(S.musicGain.gain, MUSIC * (0.78 + g * 0.14 + n * 0.08) * (1 - r * 0.2), 4.2);
      S.music.setMood({ night: n, rain: r, golden: g });
      const wet = 1 - r * 0.52;
      to(S.fireBed.gain, S.fireNear * (0.55 + n * 0.45) * wet, 1.2);
      to(S.pondBed.gain, S.pondNear * wet, 1.6);
      if (S.firePanNode) S.firePanNode.pan.setTargetAtTime(unit(0.5 + fireDx / 22) * 1.4 - 0.7, now, 0.3);
      if (S.pondPanNode) S.pondPanNode.pan.setTargetAtTime(unit(0.5 + pondDx / 28) * 1.5 - 0.75, now, 0.3);
    }
    function setMuted(m) {
      S.muted = m;
      if (!S.master) return;
      const now = S.ctx.currentTime;
      S.master.gain.cancelScheduledValues(now);
      S.master.gain.setValueAtTime(Math.max(S.master.gain.value, 1e-4), now);
      S.master.gain.exponentialRampToValueAtTime(m ? 1e-4 : MASTER, now + 1.2);
    }
    // Pressing something pressable: a 1500~2100Hz noise tick · a 360~410 → 300Hz thump · one high droplet (only once within 45ms)
    let nextClick = 0, duckUntil = 0;
    function duckFor({ music, ambience, attack, hold, release }) {
      const now = S.ctx.currentTime;
      duckUntil = Math.max(duckUntil, now + attack + hold);
      for (const [p, v] of [[S.musicDuck.gain, music], [S.ambDuck.gain, ambience]]) {
        const cur = p.value;
        if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(now); else { p.cancelScheduledValues(now); p.setValueAtTime(cur, now); }
        p.setTargetAtTime(Math.min(v, cur), now, attack / 3);
        p.setTargetAtTime(1, duckUntil, release / 3);
      }
    }
    function click() {
      if (!audible()) return;
      const c = S.ctx, t = c.currentTime + 0.004;
      if (t < nextClick) return;
      nextClick = t + 0.045;
      duckFor({ music: 0.72, ambience: 0.94, attack: 0.08, hold: 0.6, release: 1.8 });
      const tick = engine.burst(0.02), bp = filter("bandpass", rand(1500, 2100), 1.1), tg = c.createGain();
      env(tg, t, [[0.002, 0.025 * 0.7], [0.018, 1e-4]]);
      tick.connect(bp); bp.connect(tg); tg.connect(S.master); tick.start(t); tick.stop(t + 0.03);
      const knock = c.createOscillator(), kg = c.createGain();
      knock.frequency.setValueAtTime(rand(360, 410), t); knock.frequency.exponentialRampToValueAtTime(300, t + 0.04);
      env(kg, t, [[0.004, 0.025 * 0.8], [0.06, 1e-4]]);
      knock.connect(kg); kg.connect(S.master); knock.start(t); knock.stop(t + 0.07);
      const bell = c.createOscillator(), bg = c.createGain();
      bell.frequency.value = pick([1318.51, 1567.98, 1760, 2093]);
      env(bg, t, [[0.003, 0.025 * 0.22], [0.09, 1e-4]]);
      bell.connect(bg); bg.connect(S.master); bell.start(t); bell.stop(t + 0.1);
    }
    // Occasionally (60% chance every 10~24 seconds) one small meadow sound — twig snap · leaf rustle · bird passing · branch creak · gust (never the same one twice in a row, each with its own rest time)
    const MICRO = [
      { name: "twig", cooldown: 45, weight: 1, when: () => S.env.rain < 0.5 },
      { name: "leaves", cooldown: 28, weight: 1.2, when: () => S.env.rain < 0.4 && S.env.night < 0.6 },
      { name: "flyby", cooldown: 60, weight: 1, when: () => S.env.rain < 0.3 && S.env.night < 0.4 },
      { name: "branch", cooldown: 70, weight: 0.7, when: () => true },
      { name: "gust", cooldown: 50, weight: 0.8, when: () => true },
    ];
    const micro = { last: null, cool: new Map() };
    function microEvent(wait) {
      later(wait, () => {
        if (Math.random() < 0.6) {
          const now = S.ctx.currentTime, can = MICRO.filter((m) => m.name !== micro.last && (micro.cool.get(m.name) ?? -Infinity) <= now && m.when());
          if (can.length) {
            const m = weighted(can.map((x) => [x, x.weight]));
            micro.cool.set(m.name, now + m.cooldown * rand(1, 1.5));
            micro.last = m.name;
            playMicro(m.name);
          }
        }
        microEvent(rand(10, 24));
      });
    }
    function playMicro(name) {
      const c = S.ctx, t = c.currentTime + 0.03, side = Math.random() < 0.5 ? -1 : 1;
      if (name === "gust") {
        const w = S.whoosh;
        w.g.gain.setTargetAtTime(w.level * 1.15 * (1 - S.env.night * 0.4), c.currentTime, 0.6);
        later(rand(2, 3.2), () => w.g.gain.setTargetAtTime(w.level * 0.1, S.ctx.currentTime, 1.2));
        return;
      }
      const out = gain(1, null), lp = filter("lowpass", 3500);
      out.connect(lp);
      const pan = engine.pan(lp, S.spatial, side * rand(0.45, 0.8));
      if (name === "twig") {
        out.gain.value = 0.03 * 0.8;
        [0, rand(0.015, 0.03)].forEach((d, i) => {
          const src = engine.burst(0.03), bp = filter("bandpass", rand(2800, 4200), 2), g = c.createGain();
          env(g, t + d, [[0.002, i ? 0.5 : 1], [0.03, 1e-4]]);
          src.connect(bp); bp.connect(g); g.connect(out); src.start(t + d); src.stop(t + d + 0.05);
        });
      } else if (name === "leaves" || name === "flyby") {
        const fly = name === "flyby", len = fly ? rand(0.7, 1.1) : rand(0.8, 1.4), src = engine.noise(2), bp = filter("bandpass", fly ? rand(900, 1400) : rand(2200, 3200), fly ? 1.1 : 0.7), g = c.createGain();
        env(g, t, [[len * (fly ? 0.45 : 0.18), 1], [len, 1e-4]]);
        const flap = c.createOscillator(), fg = gain(fly ? 0.9 : 0.4, g.gain);
        flap.frequency.value = fly ? rand(16, 22) : rand(6, 9);
        flap.connect(fg);
        out.gain.value = 0.03 * (fly ? 0.9 : 0.6);
        src.connect(bp); bp.connect(g); g.connect(out);
        if (fly && pan) { pan.pan.setValueAtTime(-side * 0.7, t); pan.pan.linearRampToValueAtTime(side * 0.7, t + len); }
        src.start(t); flap.start(t); src.stop(t + len + 0.05); flap.stop(t + len + 0.05);
      } else if (name === "branch") {
        const len = rand(0.8, 1.4), o = c.createOscillator(), bp = filter("bandpass", 500, 12), g = c.createGain();
        o.type = "sawtooth"; o.frequency.value = rand(70, 95);
        bp.frequency.setValueAtTime(rand(380, 600), t); bp.frequency.linearRampToValueAtTime(rand(300, 520), t + len);
        env(g, t, [[len * 0.4, 1], [len, 1e-4]]);
        lp.frequency.value = 1500; out.gain.value = 0.03 * 0.5;
        o.connect(bp); bp.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
      }
    }
    // ---------- Footsteps: one step every 1.0 (running 1.3) m, and the strength and band of thud · body · rustle · brush differ per floor (grass · dirt · stone, wet panel when raining) ----------
    const FLOORS = {
      grass: { impact: 0.8, crunch: 0.75, brush: 0.9, band: [1700, 3200], brushBand: [2800, 4200], thump: [82, 104], body: [380, 600] },
      grassWet: { impact: 0.75, crunch: 0.4, brush: 0.7, band: [900, 1600], brushBand: [1800, 2800], thump: [70, 84], body: [260, 420] },
      dirt: { impact: 1.1, crunch: 0.55, brush: 0.25, band: [2800, 4400], brushBand: [3200, 4600], thump: [80, 96], body: [420, 700] },
      dirtWet: { impact: 1, crunch: 0.2, brush: 0.2, band: [800, 1300], brushBand: [2000, 3000], thump: [66, 78], body: [240, 380], squelch: 0.5 },
      stone: { impact: 1, crunch: 0.2, brush: 0.08, band: [2600, 3600], brushBand: [3000, 4000], thump: [150, 185], body: [900, 1300], firm: true },
      stoneWet: { impact: 0.95, crunch: 0.15, brush: 0.08, band: [2200, 3000], brushBand: [2600, 3600], thump: [135, 165], body: [760, 1100], firm: true, splash: true },
    };
    const STEP = 0.09, STRIDE = { walk: 0.95, run: 1.3 };
    const walk = { lastX: null, lastZ: 0, travel: 0, steps: 0, was: false, airSince: null, side: -1, drag: 0.5 };
    function grain(len) {
      const src = S.ctx.createBufferSource(), buf = engine.noise(4).buffer;
      src.buffer = buf; src.playbackRate.value = rand(0.9, 1.1);
      return { src, start: (t) => src.start(t, Math.random() * 3.6, len + 0.02) };
    }
    function footstep(level, { floor = "grass", grassy = 1, wet = false, landing = false, first = false, sprinting = false } = {}) {
      if (!audible()) return;
      const c = S.ctx, F = FLOORS[wet ? `${floor}Wet` : floor];
      walk.side = walk.side > 0 ? -1 : 1;
      walk.drag = unit(walk.drag + rand(-0.18, 0.18));
      const t = c.currentTime + 0.012, out = gain(1, null);
      engine.pan(out, S.stepBus, walk.side * rand(0.035, 0.065));
      const h = STEP * level * rand(0.88, 1.12), tune = rand(0.94, 1.06), hit = F.impact * (landing ? 1.6 : first ? 1.2 : 1);
      const soft = floor === "grass" ? 0.55 + grassy * 0.45 : 0.4 + grassy * 0.6;
      const crunch = F.crunch * soft * (sprinting ? 1.2 : 1) * (landing ? 1.3 : 1), brush = F.brush * soft * (0.75 + walk.drag * 0.5) * (sprinting ? 1.25 : 1);
      const thumpLen = (F.firm ? 0.06 : 0.11) * rand(0.85, 1.15) * (landing ? 1.4 : 1), o = c.createOscillator(), og = c.createGain();
      o.frequency.setValueAtTime(rand(...F.thump) * tune, t); o.frequency.exponentialRampToValueAtTime(F.thump[0] * 0.66, t + thumpLen);
      env(og, t, [[0.006, h * hit * 0.3], [thumpLen, 1e-4]]);
      o.connect(og); og.connect(out); o.start(t); o.stop(t + thumpLen + 0.02);
      const bodyLen = (F.firm ? 0.05 : 0.085) * rand(0.85, 1.2) * (landing ? 1.5 : 1), b = grain(bodyLen), bl = filter("lowpass", rand(...F.body) * tune, F.firm ? 1.1 : 0.6), bg = c.createGain();
      env(bg, t, [[rand(0.003, 0.006), h * hit * 0.55], [bodyLen, 1e-4]]);
      b.src.connect(bl); bl.connect(bg); bg.connect(out); b.start(t);
      if (crunch > 0.01) {
        const span = rand(0.03, 0.05), g2 = grain(span + 0.03), bp = filter("bandpass", rand(...F.band) * tune, rand(0.9, 1.6)), cg = c.createGain();
        cg.gain.setValueAtTime(1e-4, t);
        Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => Math.random() * span).sort((x, y) => x - y).forEach((d, i) => {
          const at = t + 0.004 + d;
          cg.gain.setValueAtTime(1e-4, at);
          cg.gain.exponentialRampToValueAtTime(h * crunch * rand(0.25, 0.5) * (i === 0 ? 1.2 : 1), at + 0.0015);
          cg.gain.exponentialRampToValueAtTime(1e-4, at + rand(0.006, 0.012));
        });
        g2.src.connect(bp); bp.connect(cg); cg.connect(out); g2.start(t);
      }
      if (F.squelch) {
        const len = rand(0.1, 0.14), g3 = grain(len), bp = filter("bandpass", 260, 1.2), sg = c.createGain();
        bp.frequency.setValueAtTime(rand(240, 300), t + 0.02); bp.frequency.exponentialRampToValueAtTime(rand(520, 640), t + 0.02 + len);
        env(sg, t + 0.02, [[0.01, h * F.squelch * 0.4], [len, 1e-4]]);
        g3.src.connect(bp); bp.connect(sg); sg.connect(out); g3.start(t + 0.02);
      }
      if (brush > 0.01) {
        const len = rand(0.12, 0.22) * (sprinting ? 0.85 : 1), at = t + rand(-0.01, 0.04), g4 = grain(len), hp = filter("highpass", rand(...F.brushBand)), lp = filter("lowpass", rand(6500, 9000)), wg = c.createGain();
        env(wg, Math.max(t, at), [[rand(0.025, 0.05), h * brush * 0.35], [len, 1e-4]]);
        g4.src.connect(hp); hp.connect(lp); lp.connect(wg); wg.connect(out); g4.start(Math.max(t, at));
      }
      if (F.splash) {
        const g5 = grain(0.09), hp = filter("highpass", rand(2400, 3400)), pg = c.createGain();
        env(pg, t + 0.012, [[0.008, h * 0.28], [0.088, 1e-4]]);
        g5.src.connect(hp); hp.connect(pg); pg.connect(out); g5.start(t + 0.012);
      }
    }
    // A single rustle as the grass settles back in place when it stops
    function settle(grassy, wet) {
      if (!audible() || grassy < 0.3) return;
      const c = S.ctx, t = c.currentTime + rand(0.08, 0.14), len = rand(0.18, 0.26), g = grain(len), bp = filter("bandpass", wet ? rand(1400, 2000) : rand(2200, 3200), 0.7), sg = c.createGain();
      env(sg, t, [[0.06, STEP * 0.14 * grassy], [len, 1e-4]]);
      g.src.connect(bp); bp.connect(sg); sg.connect(S.stepBus); g.start(t);
    }
    function step({ x = 0, z = 0, moving = false, sprinting = false, grounded = true, speed = 0, floor = "grass", grassy = 1 }) {
      const dx = walk.lastX === null ? 0 : x - walk.lastX, dz = z - walk.lastZ;
      walk.lastX = x; walk.lastZ = z;
      if (!S.started) return;
      const now = S.ctx.currentTime, wet = S.env.rain > 0.04;
      if (!grounded && walk.airSince === null) walk.airSince = now;
      const air = walk.airSince === null ? 0 : now - walk.airSince;
      if (grounded && walk.airSince !== null) {
        if (air > 0.25) { footstep(1, { floor, grassy, wet, landing: true }); walk.travel = 0; }
        walk.airSince = null;
      }
      const footed = grounded || air < 0.2, stride = sprinting ? STRIDE.run : STRIDE.walk, moved = Math.hypot(dx, dz);
      if (!(moving && footed && speed > 0.28 && moved < 1.5)) {
        if (walk.was && walk.steps >= 2 && footed && floor === "grass") settle(grassy, wet);
        walk.was = false; walk.steps = 0; walk.travel = stride * 0.66;
        return;
      }
      walk.was = true;
      walk.travel += moved;
      if (walk.travel < stride) return;
      walk.travel = Math.min(walk.travel - stride, stride * 0.5);
      footstep(0.55 + unit((speed - 0.5) / 3.5) * 0.3, { floor, grassy, wet, first: walk.steps === 0, sprinting });
      walk.steps += 1;
    }

    // ---------- Opening sound (same order·values as the original opening sound director) ----------
    const IMPACT = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];
    const letterPan = (i) => clamp((i / 9 - 0.5) * 1.34, -0.72, 0.72);
    const voices = {};
    function duck(amount, span) {
      if (!S.gate) return;
      const now = S.ctx.currentTime;
      S.gate.gain.cancelScheduledValues(now);
      S.gate.gain.setTargetAtTime(Math.max(1e-4, 1 - unit(amount) * 0.94), now, Math.max(0.018, span / 3));
    }
    // If the master is still rising over the first 6 seconds, raise it on the spot so the opening sound isn’t buried
    function lift(sec) {
      if (!S.master || S.muted) return;
      const now = S.ctx.currentTime;
      S.master.gain.cancelScheduledValues(now);
      S.master.gain.setValueAtTime(Math.max(1e-4, S.master.gain.value), now);
      S.master.gain.exponentialRampToValueAtTime(MASTER, now + Math.max(0.12, sec));
    }
    const env = (g, t, pts) => { g.gain.setValueAtTime(1e-4, t); for (const [dt, v] of pts) g.gain.exponentialRampToValueAtTime(v, t + dt); };
    function blowSound(dir = 1) {
      const c = S.ctx, t = c.currentTime + 0.1, out = gain(1, S.introBus);
      const breath = engine.noise(2), bp = filter("bandpass", 620, 0.8), lp = filter("lowpass", 2600), g = c.createGain();
      bp.frequency.setValueAtTime(620, t); bp.frequency.exponentialRampToValueAtTime(1500, t + 0.28); bp.frequency.exponentialRampToValueAtTime(760, t + 1.05);
      env(g, t, [[0.09, 0.42], [0.42, 0.2], [1.15, 1e-4]]);
      breath.connect(bp); bp.connect(lp); lp.connect(g);
      const p1 = engine.pan(g, out, -0.18 * dir);
      p1?.pan.setValueAtTime(-0.18 * dir, t); p1?.pan.linearRampToValueAtTime(0.12 * dir, t + 1);
      const air = engine.noise(3), hp = filter("highpass", 3800), ag = c.createGain();
      env(ag, t, [[0.22, 0.05], [2.2, 1e-4]]);
      air.connect(hp); hp.connect(ag);
      const p2 = engine.pan(ag, out, -0.35 * dir);
      p2?.pan.setValueAtTime(-0.35 * dir, t); p2?.pan.linearRampToValueAtTime(0.6 * dir, t + 2);
      const bell = filter("lowpass", 3200);
      bell.connect(out);
      [659.25, 880, 987.77, 1318.51].forEach((f, i) => {
        const at = t + 0.16 + i * 0.11 + Math.random() * 0.03, a = c.createOscillator(), b = c.createOscillator(), g2 = c.createGain(), hb = gain(0.12, g2);
        a.frequency.value = f; b.frequency.value = f * 3.01;
        env(g2, at, [[0.025, 0.034 - i * 0.004], [2.1, 1e-4]]);
        a.connect(g2); b.connect(hb);
        engine.pan(g2, bell, (i / 3 - 0.35) * 0.8 * dir);
        a.start(at); b.start(at); a.stop(at + 2.2); b.stop(at + 2.2);
      });
      breath.start(t); breath.stop(t + 1.2); air.start(t); air.stop(t + 2.3);
    }
    function releaseSound(index, strength) {
      const c = S.ctx, t = c.currentTime + 0.004, src = engine.burst(0.3), bp = filter("bandpass", 1900 + (index % 4) * 230, 1.1), g = c.createGain();
      bp.frequency.setValueAtTime(1900 + (index % 4) * 230, t); bp.frequency.exponentialRampToValueAtTime(3400, t + 0.22);
      env(g, t, [[0.05, 0.03 * clamp(strength, 0.3, 1.2)], [0.28, 1e-4]]);
      src.connect(bp); bp.connect(g); engine.pan(g, S.introBus, letterPan(index));
      src.start(t); src.stop(t + 0.31);
    }
    // Letter landing: thud (340Hz low-pass noise .28s) · tap (1600Hz band .07s) · 104→92Hz resonance, plus one pentatonic bell per arrival order
    function impactSound(index, order, strength) {
      const c = S.ctx, t = c.currentTime + 0.004, out = gain(0.98 * clamp(strength, 0.4, 1.35), null);
      engine.pan(out, S.introBus, letterPan(index));
      const vary = (v, k) => v * (1 + ((((index * 37) % 11) - 5) / 100) * k);
      const thud = engine.burst(0.2), lp = filter("lowpass", vary(340, 1), 0.72), tg = c.createGain();
      env(tg, t, [[0.006, 0.34], [vary(0.28, 0.8), 1e-4]]);
      thud.connect(lp); lp.connect(tg); tg.connect(out);
      const tick = engine.burst(0.12), bp = filter("bandpass", vary(1600, 2), 0.9), kg = c.createGain();
      env(kg, t, [[0.003, 0.045], [vary(0.07, 1.4), 1e-4]]);
      tick.connect(bp); bp.connect(kg); kg.connect(out);
      const body = c.createOscillator(), bg = c.createGain();
      body.frequency.setValueAtTime(vary(104, 1.5), t); body.frequency.exponentialRampToValueAtTime(vary(92, 1.5), t + 0.085);
      env(bg, t, [[0.008, 0.15], [0.2, 1e-4]]);
      body.connect(bg); bg.connect(out);
      const f = IMPACT[clamp(Math.round(order), 0, IMPACT.length - 1)], ring = c.createOscillator(), ping = c.createOscillator(), rg = c.createGain(), pg = c.createGain();
      ring.frequency.value = f; ping.frequency.value = f * 4.02;
      env(rg, t, [[0.006, 0.05], [1.3, 1e-4]]); env(pg, t, [[0.003, 0.012], [0.16, 1e-4]]);
      ring.connect(rg); ping.connect(pg); rg.connect(out); pg.connect(out);
      thud.start(t); thud.stop(t + 0.34); tick.start(t); tick.stop(t + 0.13); body.start(t); body.stop(t + 0.23);
      ring.start(t); ping.start(t); ring.stop(t + 1.35); ping.stop(t + 0.2);
    }
    // Descending wind sound (above 58Hz · low band 320→1850→620Hz, 4.05 seconds) and in-cloud ambience (52~680Hz, breathing at .14Hz)
    function windRush(strength) {
      if (voices.wind) return;
      const c = S.ctx, t = c.currentTime + 0.01, a = clamp(strength, 0.45, 1.35), src = engine.noise(5), hp = filter("highpass", 58), lp = filter("lowpass", 320, 0.48), g = c.createGain();
      lp.frequency.setValueAtTime(320, t); lp.frequency.exponentialRampToValueAtTime(1850, t + 2.25); lp.frequency.exponentialRampToValueAtTime(620, t + 3.75);
      env(g, t, [[0.75, 0.14 * a], [2.15, 0.28 * a], [3.25, 0.055 * a], [4.05, 1e-4]]);
      src.connect(hp); hp.connect(lp); lp.connect(g);
      const p = engine.pan(g, S.introBus, -0.12);
      p?.pan.setValueAtTime(-0.12, t); p?.pan.linearRampToValueAtTime(0.16, t + 2.7);
      src.start(t); src.stop(t + 4.15);
      voices.wind = { src, g };
      src.onended = () => { if (voices.wind?.src === src) voices.wind = null; };
    }
    function cloudBed(strength) {
      if (voices.cloud) return;
      const c = S.ctx, t = c.currentTime + 0.006, src = engine.noise(6), hp = filter("highpass", 52), lp = filter("lowpass", 680, 0.62), g = c.createGain();
      g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(0.135 * clamp(strength, 0.45, 1.3), t + 0.58);
      src.connect(hp); hp.connect(lp); lp.connect(g); engine.pan(g, S.introBus, 0);
      const breath = c.createOscillator(), depth = gain(115, lp.frequency);
      breath.frequency.value = 0.14; breath.connect(depth);
      src.start(t); breath.start(t);
      voices.cloud = { src, g, breath };
    }
    function stopVoice(v, span) {
      if (!v) return;
      const now = S.ctx.currentTime;
      v.g.gain.cancelScheduledValues(now);
      v.g.gain.setTargetAtTime(1e-4, now, span / 3);
      v.src.stop(now + span + 0.04); v.breath?.stop(now + span + 0.04);
    }
    // On reaching camp, a campfire breath (540Hz band for 1.28s) and five crackles
    function campfire() {
      const c = S.ctx, t = c.currentTime + 0.035, src = engine.noise(4), bp = filter("bandpass", 540, 0.55), g = c.createGain();
      env(g, t, [[0.12, 0.052], [0.62, 0.018], [1.28, 1e-4]]);
      src.connect(bp); bp.connect(g); engine.pan(g, S.introBus, 0.08);
      src.start(t); src.stop(t + 1.34);
      for (let i = 0; i < 5; i++) {
        const at = t + 0.16 + i * 0.115 + Math.random() * 0.055, b = engine.burst(0.06), f = filter("bandpass", 1450 + Math.random() * 1350, 1.1 + Math.random() * 0.8), k = c.createGain();
        env(k, at, [[0.006, 0.025], [0.065, 1e-4]]);
        b.connect(f); f.connect(k); engine.pan(k, S.introBus, 0.04 + Math.random() * 0.13);
        b.start(at); b.stop(at + 0.075);
      }
    }
    function intro(type, d = {}) {
      if (!S.started || S.muted) return;
      if (type === "dandelion-blow") { lift(0.12); duck(0.88, 0.2); blowSound(d.direction || 1); }
      else if (type === "seed-release") releaseSound(d.index || 0, d.strength ?? 1);
      else if (type === "letter-impact") { duck(0.88, 0.2); impactSound(d.index || 0, d.order ?? 0, d.strength ?? 1); }
      else if (type === "dive-start") { lift(0.7); duck(0.96, 0.36); windRush(d.strength ?? 1); }
      else if (type === "cloud-enter") { lift(0.48); duck(0.98, 0.24); cloudBed(d.strength ?? 1); }
      else if (type === "cloud-reveal") { duck(0, 1.15); stopVoice(voices.wind, 0.22); stopVoice(voices.cloud, 0.42); voices.wind = voices.cloud = null; campfire(); }
      else if (type === "complete") { duck(0, 0.32); stopVoice(voices.wind, 0.18); stopVoice(voices.cloud, 0.22); voices.wind = voices.cloud = null; }
    }
    return { start, update, setMuted, click, intro, step };
  }
  return { create };
})();
