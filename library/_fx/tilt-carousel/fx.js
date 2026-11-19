// Five-slot card carousel — one center card (1x), two on each side (.8x, 55% card width), and two further out (.6x, 104%) stand in place,
// Pressing prev/next moves the four sections one place each in .8s power3.inOut, and the card tilts 8° toward the direction of travel (.5s) then straightens (.3s). The last section wraps to the opposite end, looping endlessly
(() => {
  kfFx.register("tilt-carousel", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const first = track ? [...track.querySelectorAll(':scope > [data-fx-part="item"]')] : [];
    if (!track || !first.length) return;
    const step = +(options.step ?? 55), far = +(options.far ?? 104.1667), out = +(options.out ?? 110);
    const dur = +(options.dur ?? 0.8), tilt = +(options.tilt ?? 8);
    const ease = kfFx.ease(options.ease || "power3.inOut", "power3.inOut");
    // To fill five slots, append one more set like the original
    const clones = first.map((li) => { const c = li.cloneNode(true); c.dataset.copy = ""; c.setAttribute("aria-hidden", "true"); return c; });
    track.append(...clones);
    const count = first.length;
    const slots = [[-far, 0.6], [-step, 0.8], [0, 1], [step, 0.8], [far, 0.6]];
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    let busy = false;
    const items = () => [...track.querySelectorAll(':scope > [data-fx-part="item"]')];
    const place = () => {
      busy = false;
      const list = items();
      list.forEach((li) => { gsap.set(li, { clearProps: "marginLeft,scale,display" }); li.dataset.slot = ""; li.style.display = "none"; });
      slots.forEach(([m, s], i) => {
        const li = list[count - 2 + i];
        if (!li) return;
        li.style.display = "";
        li.dataset.slot = String(i - 2);
        gsap.set(li, { marginLeft: m + "%", scale: s });
      });
      const centre = list[count];
      const n = first.indexOf(centre) >= 0 ? first.indexOf(centre) : clones.indexOf(centre);
      dots.forEach((d, i) => d.classList.toggle("is-current", i === n));
    };
    place();
    const lean = (li, deg) => {
      const card = li?.firstElementChild;
      if (!card || reduce) return;
      gsap.to(card, { rotate: deg, duration: 0.5, ease: "power2.inOut" });
      gsap.to(card, { rotate: 0, duration: 0.3, delay: 0.5, ease: "power2.out" });
    };
    const go = (dir) => {
      if (busy) return;
      busy = true;
      const list = items(), at = (k) => list[count + k];
      const done = () => { dir > 0 ? track.append(list[0]) : track.prepend(list[list.length - 1]); place(); el.dispatchEvent(new CustomEvent("fx:change")); };
      if (reduce) return done();
      const moves = dir > 0
        ? [[at(-1), -out, 0.6], [at(0), -step, 0.8], [at(1), 0, 1], [at(2), step, 0.8]]
        : [[at(1), out, 0.6], [at(0), step, 0.8], [at(-1), 0, 1], [at(-2), -step, 0.8]];
      moves.forEach(([li, m, s], i) => {
        lean(li, -dir * tilt);
        gsap.to(li, { marginLeft: m + "%", scale: s, duration: dur, ease, onComplete: i === moves.length - 1 ? done : undefined });
      });
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    el.querySelectorAll('[data-fx-part="prev"]').forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); go(-1); }, on));
    el.querySelectorAll('[data-fx-part="next"]').forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); go(1); }, on));
    return () => {
      ac.abort();
      items().forEach((li) => { gsap.killTweensOf([li, li.firstElementChild].filter(Boolean)); gsap.set(li, { clearProps: "all" }); li.removeAttribute("data-slot"); if (li.firstElementChild) gsap.set(li.firstElementChild, { clearProps: "transform" }); });
      track.querySelectorAll("[data-copy]").forEach((c) => c.remove());
      first.forEach((li) => track.append(li));
    };
  });
})();
