(() => {
  // Swapping within groups of the same width keeps line breaks from wobbling during the mix (Name’s trick) — Korean syllables with Korean syllables
  const WIDTH_GROUPS = ["ijlI", "ftr", "sz", "acekvxy", "hnou", "bdgpq", "mw", "FJLTZ", "EXY", "KPS", "ABRV", "CDGHU", "NOQ", "0123456789"];
  const HANGUL = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후기니디리미비시이지치키티피히";
  const pickOne = (s) => s[Math.floor(Math.random() * s.length)];
  kfFx.register("text-scramble", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    // chars: the set of characters to scramble (differs per original) · on: load starts right after delay without waiting for scroll · hold: share of time held fully scrambled (0~1, ScrambleText revealDelay)
    // speed: if given, text resolves by passing from the left edge at speed px per second instead of letter order (same x in each line goes together) · mix: if width, mixes with same-width letters
    // flicker: interval (seconds) for reshuffling shuffled letters, default 0 (every frame) · look: if dim, the shuffled side is lighter
    const full = el.textContent, SYM = options.chars || "!=*+/?<>%#&@0123456789", mm = gsap.matchMedia();
    const dur = +(options.duration ?? 1.4), hold = Math.min(Math.max(+(options.hold ?? 0), 0), 0.95);
    const speed = +(options.speed ?? 0), flicker = +(options.flicker ?? 0), dim = /\bdim\b/.test(options.look || ""), random = options.order === "random";
    // life: time each letter is mixed (seconds) — if given, letters are mixed for only life in turn at (total − life)/(n−1) intervals, then resolve (Brand .06)
    // lead: if blank, letters are empty before their turn · hover: if on, it scrambles again and resolves each time the pointer hovers (without blanks)
    const life = +(options.life ?? 0), blankLead = options.lead === "blank";
    // steps: N means chunks of N characters from the front — each chunk scrambles its N characters for duration / chunk count, the rest stay blank (Name site: banner 2 chars .6s · intro text 3 chars .7s)
    const steps = Math.max(0, Math.floor(+(options.steps ?? 0)));
    // each: letter-by-letter interval in seconds for the life type — if given, the total length is set by the text length as life + each×(n−1) (original shuffleLetters 20fps: life .1 · each .05)
    const each = +(options.each ?? 0);
    // jitter: in the life type, adds a random 0 to jitter seconds to each letter’s turn (an agency’s ScrambleText: 36ms turn + 0~28ms)
    const jitter = +(options.jitter ?? 0);
    let jit = [];
    let again = false;
    // mix: with case, uppercase mixes with uppercase·digits, lowercase with lowercase·digits, any other character with letters (the character classes of shuffleLetters)
    const UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", LOW = "abcdefghijklmnopqrstuvwxyz";
    const mixOne = options.mix === "width"
      ? (c) => /[가-힣]/.test(c) ? pickOne(HANGUL) : pickOne(WIDTH_GROUPS.find((g) => g.includes(c)) ?? c)
      : options.mix === "case"
        ? (c) => pickOne(/[A-Z]/.test(c) ? UP + "0123456789" : /[a-z]/.test(c) ? LOW + "0123456789" : LOW + UP)
        : () => pickOne(SYM);
    const mix = (s) => s.replace(/\S/g, mixOne);
    // Receive text as [is it its own character, text] chunks and lightly wrap only the mixed chunks
    const show = (runs) => {
      if (!dim) { el.textContent = runs.map(([ok, t]) => (ok ? t : ok === null ? t.replace(/\S/g, "") : mix(t))).join(""); return; }
      el.replaceChildren(...runs.map(([ok, t]) => {
        if (ok) return t;
        if (ok === null) return t.replace(/\S/g, "");
        const span = document.createElement("span");
        span.dataset.fxPart = "mixed";
        span.textContent = mix(t);
        return span;
      }));
    };
    const chars = [...full];
    // space: skip — blanks don’t take a turn (shuffleLetters counts only letters). ord is each letter’s turn index
    const skipSpace = options.space === "skip";
    let k = 0;
    const ord = chars.map((c) => (skipSpace && /\s/.test(c) ? k : k++));
    const turns = skipSpace ? Math.max(1, k) : chars.length;
    // speed type: measure each letter’s right-edge x, then release letters starting from the one past that x — with multiple lines, each line releases together at the same x
    const measure = () => {
      const node = el.firstChild, range = document.createRange(), left = el.getBoundingClientRect().left;
      if (node?.nodeType !== Node.TEXT_NODE) return null;
      let at = 0;
      return chars.map((c) => { range.setStart(node, at); range.setEnd(node, (at += c.length)); return range.getBoundingClientRect().right - left; });
    };
    const runsOf = (done) => {
      const runs = [];
      chars.forEach((c, i) => (runs.length && runs.at(-1)[0] === done[i] ? (runs.at(-1)[1] += c) : runs.push([done[i], c])));
      return runs;
    };
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const rights = speed > 0 ? measure() : null;
      const total = rights ? Math.max(0.01, ...rights) / speed : each > 0 && life > 0 ? life + each * Math.max(0, turns - 1) + jitter : dur;
      // idle: full — before typing, keeps its own text in full but transparent (position and height kept), then clears and turns on at the start (Brand .typewrite-menu)
      const idleFull = options.idle === "full";
      const blank = () => show([[(life > 0 && blankLead) || steps > 0 ? null : false, full]]);
      if (idleFull) { show([[true, full]]); el.style.opacity = "0"; } else blank();
      const o = { p: 0 };
      let tw, st, last = -1, lastKey = "";
      const paint = () => {
        const t = o.p * total;
        const n = Math.floor(Math.max(0, (o.p - hold) / (1 - hold)) * chars.length);
        // order: random — not from the front, but each frame each character turns into its real character with a probability equal to the current progress (runShuffle of Brand)
        const stg = turns > 1 ? (jitter && each > 0 ? each : Math.max(0, total - life) / (turns - 1)) : 0;
        const seg = steps > 0 ? Math.min(Math.ceil(chars.length / steps) - 1, Math.floor(o.p * Math.ceil(chars.length / steps))) : 0;
        const done = steps > 0 ? chars.map((c, i) => (i < seg * steps ? true : i < (seg + 1) * steps ? false : null)) : life > 0 ? chars.map((c, i) => (t >= ord[i] * stg + (jit[i] || 0) + life ? true : t >= ord[i] * stg + (jit[i] || 0) || !blankLead || again ? false : null))
          : rights ? rights.map((r) => t >= r / speed) : random ? chars.map(() => Math.random() < o.p) : chars.map((c, i) => i < n);
        const key = done.join();
        if (flicker && key === lastKey && t - last < flicker) return;
        lastKey = key; last = t;
        show(runsOf(done));
      };
      // fade: on — while mixing, the whole text rises together 0 → 1 (Brand scroll-scramble)
      const fade = options.fade === "on";
      if (fade) gsap.set(el, { opacity: 0 });
      // repeat: after fully unscrambled, it rests that many seconds with its own letters and then scrambles and unscrambles again (Brand corner text 2s) — 0 means once
      const repeat = +(options.repeat ?? 0);
      let rest;
      const run = (first = true, wait) => {
        const delay = wait ?? (first ? +(options.delay ?? 0) : 0);
        tw?.kill(); rest?.kill();
        o.p = 0;
        jit = jitter ? chars.map(() => Math.random() * jitter) : [];
        tw = gsap.to(o, { p: 1, duration: total, delay, ease: "none", onUpdate: paint, onComplete: () => { show([[true, full]]); if (repeat > 0) rest = gsap.delayedCall(repeat, () => run(false)); } });
        if (fade && first) gsap.to(el, { opacity: 1, duration: total, delay, ease: "none" });
      };
      const enter = () => { if (tw?.isActive()) return; again = true; run(false); };
      // fx:play — rewrite from the first form (empty). Callers invoke it like a menu drawer that rewrites on every open (with on: manual it starts only through this)
      let pend;
      const replay = () => {
        again = false;
        tw?.kill(); pend?.kill();
        if (!idleFull) { blank(); run(true); return; }
        // The clearing moment is one step (each) ahead of the first letter shuffling — in the original the first letter appears 50ms after clearing
        const d = +(options.delay ?? 0), lead = Math.min(d, each || 0);
        pend = gsap.delayedCall(d - lead, () => { el.style.opacity = ""; blank(); run(true, lead); });
      };
      // fx:rest — idle: if full, rests again as its own text and transparent (when closing the menu)
      const rest0 = () => { if (!idleFull) return; tw?.kill(); pend?.kill(); show([[true, full]]); el.style.opacity = "0"; };
      el.addEventListener("fx:play", replay);
      el.addEventListener("fx:rest", rest0);
      if ((options.hover === "on" || options.on === "hover") && matchMedia("(hover: hover) and (pointer: fine)").matches) el.addEventListener("pointerenter", enter);
      if (options.on === "load") run();
      else if (options.on === "hover") show([[true, full]]);
      else if (options.on !== "manual") st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 75%", once: true, onEnter: () => (idleFull ? replay() : run()) });
      return () => { el.removeEventListener("pointerenter", enter); el.removeEventListener("fx:play", replay); el.removeEventListener("fx:rest", rest0); pend?.kill(); el.style.removeProperty("opacity"); st?.kill(); tw?.kill(); rest?.kill(); gsap.killTweensOf(el); fade && gsap.set(el, { clearProps: "opacity" }); el.textContent = full; };
    });
    return () => mm.revert();
  });
})();
