// When the title changes, identical letters at the front and back slide to their new spots, and only the rest flip over along the x axis
(() => {
  const split = (box, text) => {
    box.textContent = "";
    return [...text].map((ch) => {
      const c = document.createElement("span");
      c.className = "fx-retitle__c";
      const i = document.createElement("span");
      i.textContent = ch;
      c.append(i);
      box.append(c);
      return c;
    });
  };
  kfFx.register("shared-letter-retitle", (el, { options, reduce }) => {
    const first = (el.dataset.title || el.textContent).trim();
    // Attaches even with an empty title — when leaving the untitled first page, all the letters are set up fresh
    el.setAttribute("aria-label", first);
    const cur = document.createElement("span");
    cur.className = "fx-retitle__line";
    cur.setAttribute("aria-hidden", "true");
    let chars = split(cur, first);
    el.textContent = "";
    el.append(cur);
    const move = +(options.move ?? 0.65), moveDelay = +(options.delay ?? 0.15);
    const outDur = +(options.out ?? 0.68), inDur = +(options.in ?? 0.75), inDelay = +(options.wait ?? 0.3);
    const eachOut = +(options["each-out"] ?? 0), eachIn = +(options["each-in"] ?? 0);
    const ease = kfFx.ease(options.ease || "0.56,0.15,0,0.99", "expo.inOut");
    let tl = null, nextLine = null;

    const finish = (line, list, text) => {
      cur.replaceChildren(...line.childNodes);
      line.remove();
      chars = list;
      gsap.set(chars, { clearProps: "transform,opacity" });
      gsap.set(chars.map((c) => c.firstChild), { clearProps: "transform,opacity" });
      el.setAttribute("aria-label", text);
      nextLine = null;
      el.dispatchEvent(new CustomEvent("fx:retitled", { bubbles: true, detail: { text } }));
    };

    const retitle = (e) => {
      const text = String(e.detail?.text ?? "").trim();
      if (e.detail?.text == null || text === el.getAttribute("aria-label")) return;
      tl?.progress(1);
      const line = document.createElement("span");
      line.className = "fx-retitle__line fx-retitle__next";
      line.setAttribute("aria-hidden", "true");
      el.append(line);
      nextLine = line;
      const nexts = split(line, text);
      if (reduce) return finish(line, nexts, text);
      const pool = chars.map((c) => c.textContent);
      const remain = [];
      let k = 0;
      const fresh = [];
      nexts.forEach((n) => {
        const ch = n.textContent;
        if (!ch.trim()) return;
        const at = pool.indexOf(ch);
        if (at >= 0) {
          pool[at] = "";
          remain.push({ from: chars[at], to: n });
          chars[at].classList.add("is-remain");
          n.classList.add("is-remain");
        } else fresh.push({ el: n, i: k++ });
      });
      const remainFrom = new Set(remain.map((r) => r.from));
      tl = gsap.timeline({ onComplete: () => finish(line, nexts, text) });
      remain.forEach(({ from, to }, i) => {
        const dx = to.getBoundingClientRect().left - from.getBoundingClientRect().left;
        tl.to(from, { x: dx, duration: move, delay: moveDelay + i * (+(options["each-move"] ?? 0)), ease }, 0);
        gsap.set(to, { opacity: 0 });
      });
      chars.filter((c) => !remainFrom.has(c)).forEach((c, i) => {
        tl.to(c.firstChild, { yPercent: -101, rotationX: -90, duration: outDur, ease }, i * eachOut);
      });
      fresh.forEach(({ el: n, i }) => {
        tl.fromTo(n.firstChild, { yPercent: 40, rotationX: -40, opacity: 0, transformOrigin: "50% 40%" }, { yPercent: 0, rotationX: 0, opacity: 1, duration: inDur, ease }, inDelay + i * eachIn);
      });
      if (!remain.length && !fresh.length) tl.to({}, { duration: inDur });
    };
    el.addEventListener("fx:retitle", retitle);
    return () => {
      el.removeEventListener("fx:retitle", retitle);
      tl?.kill();
      nextLine?.remove();
      el.textContent = el.getAttribute("aria-label") || first;
      el.removeAttribute("aria-label");
    };
  });
})();
