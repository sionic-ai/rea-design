// First page only: card column (flow · pause · flip), pinned service title, popping-out image, highlighted 0 won cell in the price table — original CC module. Returns attach and detach as the box enters
NP.pages.home = (root) => {
  const { SP, reduce } = NP;
  const $ = (q) => root.querySelector(q);

  // ── 18 cards: front is a line drawing, back is a number ─────────────
  const FRONT = ["pie", "plans", "people", "team", "map", "bubble", "monitor", "box", "shops", "invoice", "cost", "chevrons", "review", "start", "mail", "reviewer", "pair", "wizlist"];
  const BACK = [
    ["Satisfaction", "00%!", "Your survey note, one line, here"], ["Plan", "0 kinds", "Pick to match your deal size"], ["User", "1 in 0 people", "Your source note here"],
    ["Adopting stores", "00.00k places", "Your reference date here"], ["Nationwide", "0,0000k people", "Your scope note here"], ["Settlement", "0 times/mo", "Your condition line here"],
    ["Application", "00 min", "Your guide line here"], ["Dispatch", "Same day", "Your condition line here"], ["Franchise store", "000k+", "Your reference date here"],
    ["Inquiry", "-00%", "Your comparison criteria here"], ["Cost", "-00k", "Your calculation example here"], ["Review", "0 sec", "Your condition line here"],
    ["Pass rate", "00%", "Your scope note here"], ["Until start", "00 days", "Your condition line here"], ["Sync", "000 items", "Your reference date here"],
    ["Review experience", "00 years", "Your note line here"], ["In charge", "1:1", "Your guide line here"], ["Invoice", "Enclosed", "Your guide line here"],
  ];
  const wrap = $("[data-cards]");
  wrap.innerHTML = FRONT.map((ill, i) => `<div class="mv-cards__item"><div class="board" role="button" tabindex="0" aria-label="Card ${i + 1} Flip">
      <div class="board__front"><div data-ill="${ill}"></div></div>
      <div class="board__back"><p>${BACK[i][0]}</p><b>${BACK[i][1]}</b><small>${BACK[i][2]}</small></div>
    </div></div>`).join("");
  NP.drawIll(wrap);

  const items = [...wrap.querySelectorAll(".mv-cards__item")];
  const boards = [...wrap.querySelectorAll(".board")];
  const per = Math.ceil(items.length / 3);
  const groups = [0, 1, 2].map((g) => items.slice(g * per, g * per + per));
  const DUR = 1.4, EASE = "power2.out", GAP = 2;
  let anims = [], paused = true, killedAt = 0, started = false;
  gsap.set(wrap, { autoAlpha: 1 });

  const kill = () => {
    gsap.set(items, { clearProps: "x,y,bottom,top,right" });
    killedAt = anims[0]?.progress() ?? 0;
    anims.forEach((a) => a.kill());
    anims = [];
  };
  // Original: three columns — even columns go bottom to top (-=), odd columns go top to bottom (+=), the last column is offset by half a cell. One cell takes 1.4s, then a 2s pause
  const pc = () => {
    const { width: w, height: h } = items[0].getBoundingClientRect();
    anims = groups.map((g, a) => {
      const up = a % 2 === 0, off = a === groups.length - 1 ? h / 2 : 0;
      gsap.set(g, { x: w * a, y: (p) => (up ? -1 : 1) * h * p + off, [up ? "bottom" : "top"]: -h });
      const tl = gsap.timeline({ paused, repeat: -1, repeatDelay: GAP });
      for (let p = 0; p < per; p++) {
        tl.add(gsap.to(g, { y: `${up ? "-" : "+"}=${h}`, duration: DUR, ease: EASE, modifiers: { y: gsap.utils.unitize((v) => parseInt(v) % (h * per)) } }), p ? `+=${GAP}` : 0);
      }
      return tl.progress(killedAt);
    });
  };
  // Phone: lined up in a row, shifting left one slot at a time
  const sp = () => {
    const t = Math.round(items[0].getBoundingClientRect().width);
    const r = innerWidth / 2 - t;
    gsap.set(items, { x: (l) => -t * l - r, right: -t });
    const tl = gsap.timeline({ paused, repeat: -1, repeatDelay: GAP });
    items.forEach((_, c) => tl.add(gsap.to(items, { x: `-=${t}`, duration: DUR, ease: EASE, modifiers: { x: gsap.utils.unitize((v) => parseInt(v) % (t * items.length)) } }), c ? `+=${GAP}` : 0));
    anims = [tl.progress(killedAt)];
  };
  const build = () => { kill(); SP.matches ? sp() : pc(); if (!paused) anims.forEach((a) => a.play()); };
  build();
  const onResize = () => { clearTimeout(build.t); build.t = setTimeout(build, 200); };
  addEventListener("resize", onResize);
  const io = new IntersectionObserver(([e]) => { if (!started) return; paused = !e.isIntersecting || reduce; anims.forEach((a) => a[paused ? "pause" : "play"]()); });
  io.observe(wrap);

  boards.forEach((b) => {
    const flip = () => {
      const on = !b.classList.contains("is-flipped");
      b.classList.toggle("is-flipped", on);
      gsap.to(b, { rotateY: on ? 180 : 0, transformOrigin: "50% 50%", duration: 1, ease: "power3.out" });
    };
    b.addEventListener("click", flip);
    b.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip()));
    const faces = b.querySelectorAll(":scope > div");
    b.addEventListener("pointerenter", () => {
      if (!SP.matches) { anims.forEach((a) => a.pause()); paused = true; }
      gsap.timeline({ defaults: { duration: 0.25, ease: "none" } }).to(b, { scale: 0.96 }).to(faces, { boxShadow: "0 0 2rem 0 rgba(0, 0, 0, 0.04)" }, "<");
    });
    b.addEventListener("pointerleave", () => {
      if (!reduce) { anims.forEach((a) => a.play()); paused = false; }
      gsap.timeline({ defaults: { duration: 0.25, ease: "none" } }).to(b, { scale: 1 }).to(faces, { boxShadow: "0 0 1rem 0 rgba(0, 0, 0, 0.08)" }, "<");
    });
  });

  // ── What the service is: pin the left title until the middle of the third item (PC) ─────
  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    const box = $(".home-about .np-lbox__wrap");
    const head = box.querySelector(".np-sh");
    ScrollTrigger.create({
      trigger: box, pin: head, pinSpacing: false, start: "top top",
      endTrigger: box.querySelector(".observe-target"),
      end: () => {
        const r = head.getBoundingClientRect();
        return `center ${r.height / 2 + (r.top - box.getBoundingClientRect().top)}`;
      },
    });
  });

  // ── Feature drawing: at 70% of the screen the text rises at .1s intervals, and when done the drawing pops out ──
  root.querySelectorAll(".features [data-animate]").forEach((li) => {
    const texts = li.querySelectorAll(".features__sentence > *");
    if (reduce) { li.dataset.animate = "start"; return; }
    gsap.set(texts, { autoAlpha: 0 });
    li.querySelectorAll("[data-pop] svg").forEach((svg) => [...svg.children].forEach((el, i) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "pop");
      g.style.transitionDelay = `${i * 0.06}s`;
      el.replaceWith(g);
      g.append(el);
    }));
    ScrollTrigger.create({
      trigger: li, start: "top 70%", once: true,
      onEnter: () => gsap.fromTo(texts, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.in", stagger: 0.1, onComplete: () => (li.dataset.animate = "start") }),
    });
  });
  const desc = $(".features__desc");
  ScrollTrigger.create({ trigger: desc, start: "top 75%", once: true, onEnter: () => desc.classList.add("is-in") });

  // ── Pricing table: 1s from 3rem below, then pink background on the 0 won cell from 5rem to the side in .7s ──
  const table = $(".price-table");
  const free = table.querySelector(".month--free");
  if (reduce) gsap.set(free, { "--imp-a": 1 });
  else {
    gsap.set(table, { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: table, start: "top 75%", once: true,
      onEnter: () => gsap.timeline({ defaults: { ease: "power2.out" } })
        .fromTo(table, { autoAlpha: 0, y: "3rem" }, { autoAlpha: 1, y: 0, duration: 1 })
        .fromTo(free, { "--imp-a": 0, "--imp-x": "5rem" }, { "--imp-a": 1, "--imp-x": "0rem", duration: 0.7 }, ">"),
    });
  }

  // Cards start flowing only after the loader ends (original opening.play → mv.start)
  let gone = false;
  NP.opening(root).then(() => {
    if (reduce || gone) return;
    started = true;
    paused = false;
    anims.forEach((a) => a.play());
    ScrollTrigger.refresh();
  });
  return () => {
    gone = true;
    clearTimeout(build.t);
    removeEventListener("resize", onResize);
    io.disconnect();
    anims.forEach((a) => a.kill());
    mm.revert();
  };
};
