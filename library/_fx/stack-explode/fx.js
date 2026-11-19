(() => {
  // Stacks standing side by side on the same panel open and close together by the progress of the most-lowered cell — if only one opens while its neighbor stays closed, ‹Three side by side› breaks
  const groups = new Map();
  let refreshQueued = false;
  const queueRefresh = () => {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => { refreshQueued = false; ScrollTrigger.refresh(); });
  };

  kfFx.register("stack-explode", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const stack = el.querySelector('[data-fx-part="stack"]');
    if (!frame || !stack || !window.gsap || !window.ScrollTrigger) return;

    const num = (k, d) => +(options[k] ?? d);
    const HOLD = num("hold", 1.15);
    const EACH = num("each", 0.06);
    const RUN = num("run", 0.82);
    const LAG = num("lag", 0.35);
    const RATE = num("rate", 1) || 1;
    const MAGNET = num("magnet", 0.3);
    const CLOSE = num("close", 0.6);
    const OPEN = num("open", 0.714);
    const TRAVEL = num("travel", 1.54);
    const CLEAR = num("clear", 40);
    const MIN_GAP = num("min-gap", 16);
    const T = 1 + HOLD;
    const EXPAND_END = 1 / T;
    // The point where the cover values are fully lifted — if it stops past here, the pieces are apart but the value hasn’t shown yet, an empty spot, so if it was heading down, open all the way
    const OFFER_GONE = 0.35;
    const STACKED_BELOW = 0.77 / T;
    const scrollEl = scroller;

    const pieces = () => [...el.querySelectorAll('[data-fx-part="piece"]')];
    const sides = () => [...el.querySelectorAll('[data-fx-part="side"]')];
    const offer = () => el.querySelector('[data-fx-part="offer"]');

    const setState = (open) => {
      const want = open ? "open" : "closed";
      if (el.dataset.state === want) return;
      el.dataset.state = want;
      el.dispatchEvent(new CustomEvent("fx:state", { bubbles: true, detail: { open } }));
    };

    const measure = () => {
      const fcs = getComputedStyle(frame);
      const padT = parseFloat(fcs.paddingTop) || 0;
      const padB = parseFloat(fcs.paddingBottom) || 0;
      const list = pieces();
      const inner = frame.clientHeight - padT - padB;
      const gap = Math.max(MIN_GAP, (inner - CLEAR - stack.offsetHeight) / Math.max(1, list.length));
      return { list, padT, padB, offsets: list.map((_, i) => (i + 1) * gap) };
    };

    if (reduce) {
      const { list, offsets } = measure();
      list.forEach((p, i) => gsap.set(p, { y: offsets[i] }));
      const s = sides();
      if (s.length) gsap.set(s, { opacity: 1 });
      if (offer()) gsap.set(offer(), { opacity: 0 });
      setState(true);
      return () => gsap.set([...list, ...s, offer()].filter(Boolean), { clearProps: "transform,opacity" });
    }

    const groupName = options.group || null;
    const me = { el, proxy: { p: 0 }, target: undefined, tl: null, st: null, closed: undefined };
    let members = [me];
    if (groupName) {
      if (!groups.has(groupName)) groups.set(groupName, new Set());
      groups.get(groupName).add(me);
      members = null;
    }
    const team = () => (groupName ? [...groups.get(groupName)] : members);

    function apply(x) {
      if (!x.tl) return;
      x.tl.progress(x.proxy.p);
      const closed = x.proxy.p < STACKED_BELOW;
      if (closed !== x.closed) {
        x.closed = closed;
        x.setState(!closed);
      }
    }
    me.setState = setState;

    function drive() {
      const all = team().filter((x) => x.st);
      if (!all.length) return;
      const shared = groupName ? all.reduce((m, x) => Math.max(m, x.st.progress), 0) : null;
      all.forEach((x) => {
        const p = shared === null ? x.st.progress : shared;
        const last = x.target === undefined ? x.proxy.p : x.target;
        // Opening follows softly, closing acts like a magnet — once nearly closed it pulls the rest shut by itself
        const closing = p < last || (p === last && x.st.direction < 0);
        let target = p;
        if (closing && p < MAGNET * EXPAND_END) target = 0;
        x.target = p;
        const openDur = Math.max(LAG, Math.abs(target - x.proxy.p) / RATE);
        gsap.to(x.proxy, {
          p: target,
          duration: closing ? CLOSE : openDur,
          ease: closing ? "expo.out" : "power2.out",
          overwrite: true,
          onUpdate: () => apply(x),
          onComplete: () => apply(x),
        });
      });
    }

    function build() {
      const keep = me.proxy.p;
      if (me.st) me.st.kill();
      gsap.killTweensOf(me.proxy);
      // Discard after rewinding — so the last values written by the killed timeline do not remain on the element and the next run does not start on top of them
      if (me.tl) me.tl.progress(0).kill();
      frame.style.height = "";
      el.style.height = "";
      el.style.marginBottom = "";

      const { list, padT, padB, offsets } = measure();
      if (!list.length) return;
      let travel = 0;
      let screenH = 0;
      if (scrollEl) {
        // wall: if css, the wall height is set by a board-height variable in the CSS that uses it — the wall follows on the very frame the variable changes
        if (options.wall !== "css") el.style.height = (1 + OPEN * T) * scrollEl.clientHeight + "px";
      } else {
        // On window scroll, if the panel is short the unfolded pile spills outside it, so the panel and wall are enlarged — read by scroll position rather than a fixed position, so the panel can be bigger than the screen
        screenH = frame.clientHeight;
        const need = stack.offsetHeight + offsets[offsets.length - 1] + CLEAR + padT + padB;
        const frameH = Math.max(need, screenH);
        travel = TRAVEL * screenH * T;
        frame.style.height = frameH + "px";
        el.style.height = frameH + travel + "px";
      }

      const tl = gsap.timeline({ paused: true });
      gsap.set(list, { y: 0 });
      const s = sides();
      if (s.length) gsap.set(s, { opacity: 0 });
      // From the lower piece first — if the upper piece leaves first it overlaps more with the lower piece that hasn’t left yet, then spreads apart
      tl.to(list, { y: (i) => offsets[i], stagger: { each: EACH, from: "end" }, ease: "power3.inOut", duration: RUN }, 0);
      const o = offer();
      if (o) {
        gsap.set(o, { opacity: 1 });
        tl.to(o, { opacity: 0, ease: "power1.out", duration: 0.3 }, 0.05);
      }
      if (s.length) tl.to(s, { opacity: 1, ease: "power2.out", duration: 0.4 }, 0.6);
      tl.to({}, { duration: HOLD }, 1);

      if (!scrollEl && travel > 0) {
        // When a pinned panel lands all at once, it sits still and then suddenly moves at scroll speed — at the tail the panel is pulled up with power2.in so its speed matches the scroll at the moment it lands
        const tailPx = (travel * HOLD) / T;
        const releasePx = Math.min(tailPx, 0.6 * screenH);
        const releaseRun = HOLD * (releasePx / tailPx);
        gsap.set(frame, { y: 0 });
        tl.to(frame, { y: -releasePx / 2, ease: "power2.in", duration: releaseRun }, 1 + HOLD - releaseRun);
        el.style.marginBottom = -releasePx / 2 + "px";
      }
      me.tl = tl;

      const stickTop = parseFloat(getComputedStyle(frame).top) || 0;
      const snapper = !!scrollEl && options.snap === "on" && (!groupName || team().find((x) => x.snaps) === undefined || me.snaps);
      me.snaps = snapper;
      me.st = ScrollTrigger.create({
        trigger: el,
        scroller: scrollEl,
        start: scrollEl ? "top top" : "top " + stickTop,
        endTrigger: el,
        end: scrollEl ? "bottom bottom" : "+=" + Math.max(1, el.offsetHeight - frame.offsetHeight),
        snap: snapper
          ? {
              // Only finish in the scroll direction — pulling against the wheel reads as the page fighting the hand
              snapTo: (p, self) => {
                if (self.direction < 0 && p < EXPAND_END * MAGNET) return 0;
                if (self.direction > 0 && p > EXPAND_END * OFFER_GONE && p < EXPAND_END) return EXPAND_END;
                return p;
              },
              duration: { min: 0.2, max: 0.45 },
              delay: 0.2,
              ease: "power1.inOut",
            }
          : undefined,
        onUpdate: drive,
        onRefresh: drive,
      });
      me.proxy.p = keep;
      me.target = keep;
      me.closed = undefined;
      apply(me);
      queueRefresh();
    }

    build();

    let lastW = innerWidth;
    let lastH = stack.offsetHeight;
    let lastView = scrollEl ? scrollEl.clientHeight : innerHeight;
    let pending = 0;
    const rebuildIfChanged = () => {
      const view = scrollEl ? scrollEl.clientHeight : innerHeight;
      if (innerWidth === lastW && stack.offsetHeight === lastH && view === lastView) return;
      lastW = innerWidth;
      lastH = stack.offsetHeight;
      lastView = view;
      build();
    };
    const rebuildSoon = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(rebuildIfChanged);
    };
    // If fonts · images arrive late, the stack height changes and the spread width goes off. The wall changes on the very frame the panel size changes —
    // Deferring by one frame pushes the content below the wall late, so meanwhile the hover under the cursor releases at a different tempo (off from the original, which kept wall height in a CSS variable)
    const ro = new ResizeObserver(rebuildIfChanged);
    ro.observe(stack);
    if (scrollEl) ro.observe(scrollEl);
    addEventListener("resize", rebuildSoon);

    return () => {
      cancelAnimationFrame(pending);
      ro.disconnect();
      removeEventListener("resize", rebuildSoon);
      if (groupName) {
        const g = groups.get(groupName);
        g.delete(me);
        if (!g.size) groups.delete(groupName);
      }
      if (me.st) me.st.kill();
      gsap.killTweensOf(me.proxy);
      if (me.tl) me.tl.progress(0).kill();
      gsap.set([...pieces(), ...sides(), offer(), frame].filter(Boolean), { clearProps: "transform,opacity" });
      frame.style.height = "";
      el.style.height = "";
      el.style.marginBottom = "";
      delete el.dataset.state;
    };
  });
})();
