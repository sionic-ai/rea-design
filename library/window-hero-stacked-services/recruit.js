(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Six member cards + bar below: when the list is pushed sideways the handle (25%) moves to (pushed ratio × 75%) in .15s
  const list = document.querySelector("[data-member-list]");
  if (list) {
    const cards = [
      ["Stories rooted in the land,<br>We want to reach more people", "Overseas guest outreach", "Member Name"],
      ["Creating services to be proud of worldwide,<br>Wanting to raise earnings in the industry", "Accounting & admin / Management planning office", "Member Name"],
      ["Reached beyond the boundaries<br>”Work that carries culture on”", "Overseas guest guide / Leader", "Member Name"],
      ["Undiscovered charm,<br>I want them to truly love it", "Domestic sales", "Member Name"],
      ["Delivering better value<br>I want to pursue development", "Domestic product development / Tech lead", "Member Name"],
      ["Not stopping at ”connecting” culture,<br>To the future through ”business”", "Overseas client sales drive", "Member Name"],
    ];
    list.innerHTML = cards.map(([h, role, name], i) => `
      <li class="rc-mem"><a href="#"><div class="wf-img" data-label="Member ${i + 1} Upper body · smiling in front of a gray background · portrait 7:9"></div><span class="rc-mem__no">${String(i + 1).padStart(2, "0")}</span><h3>${h}</h3><p>${role}<b>${name}</b></p></a></li>`).join("");
    const bar = document.createElement("div");
    bar.className = "rc-bar";
    bar.innerHTML = "<i></i>";
    list.after(bar);
    const thumb = bar.firstChild;
    list.addEventListener("scroll", () => {
      const max = list.scrollWidth - list.clientWidth;
      thumb.style.left = (max > 0 ? list.scrollLeft / max : 0) * 75 + "%";
    }, { passive: true });
  }

  // Numbers: once when the section is 30% visible — each cell delayed by .15s, rising over 2s with 1-(1-t)^4
  const root = document.querySelector("[data-count-root]");
  if (root) {
    const nums = [...root.querySelectorAll("[data-count]")];
    if (reduce) nums.forEach((n) => { n.textContent = n.dataset.count; });
    else {
      const ease = (t) => 1 - Math.pow(1 - t, 4);
      const run = (el, target) => {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(Math.max(0, now - start) / 2000, 1);
          el.textContent = p < 1 ? Math.floor(ease(p) * target) : target;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        nums.forEach((el, i) => setTimeout(() => run(el, +el.dataset.count), i * 150));
      }, { threshold: 0.3 });
      io.observe(root.closest("section") || root);
    }
  }

  // Two photo columns: flow endlessly up and down (attach one more track and loop through half)
  document.querySelectorAll("[data-loop]").forEach((loop) => {
    const track = loop.querySelector(".rc-loop__track");
    if (!track) return;
    [...track.children].forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); track.append(d); });
    if (!reduce) loop.classList.add("is-run");
  });

  // Big text that clears from blur and photos that rise late (Studio appear, threshold 0)
  const pre = document.querySelectorAll("[data-blur], [data-rc-ap]");
  if (!reduce) {
    pre.forEach((el) => el.classList.add("is-pre"));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      requestAnimationFrame(() => e.target.classList.remove("is-pre"));
    }));
    pre.forEach((el) => io.observe(el));
  }

  // Parallax: the photo panel shifts by (screen center − panel top edge) × .02, but each frame follows only .02 of the remaining distance
  if (!reduce) {
    const wrap = document.querySelector("[data-px-wrap]"), wrap2 = document.querySelector("[data-px-wrap2]");
    const big = wrap?.querySelector(".rc-intro__big"), smalls = wrap2 ? [...wrap2.querySelectorAll("[data-px-img]")] : [];
    const SPEED = 0.02, LERP = 0.02;
    const cur = [0, 0, 0];
    const tick = () => {
      if (wrap && big) {
        const t = (innerHeight / 2 - wrap.getBoundingClientRect().top) * SPEED;
        cur[0] += (t - cur[0]) * LERP;
        big.style.transform = `translateY(${cur[0].toFixed(2)}px)`;
      }
      if (wrap2) {
        const t = (innerHeight / 2 - wrap2.getBoundingClientRect().top) * SPEED;
        smalls.forEach((el, i) => { cur[i + 1] += (t - cur[i + 1]) * LERP; el.style.transform = `translateY(${cur[i + 1].toFixed(2)}px)`; });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Two thin lines crossing the hero (Lottie): 1920×880 · 30fps · 176 frames, drawn in frames 1–60 then held for the remaining time and repeated — loops at 1.5x speed
  const holder = document.querySelector("[data-rc-line]");
  if (holder && window.lottie) {
    const hex = css("--kf-line");
    const toUnit = (h) => { const m = h.replace("#", "").match(/../g) || ["cc", "cc", "cc"]; return m.slice(0, 3).map((x) => parseInt(x, 16) / 255); };
    const c = toUnit(hex);
    const path = (pts) => ({ i: pts.map((p) => p[2] || [0, 0]), o: pts.map((p) => p[3] || [0, 0]), v: pts.map((p) => [p[0], p[1]]), c: false });
    const trim = { ty: "tm", nm: "Trim Paths 1", s: { a: 1, k: [{ o: { x: 0.249, y: 0.002 }, i: { x: 0.043, y: 0.992 }, s: [0], t: 1 }, { s: [100], t: 60 }] }, e: { a: 0, k: 0 }, o: { a: 0, k: 0 }, m: 1 };
    const tr = { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } };
    const line = (nm, pts) => ({
      ddd: 0, ind: 1, ty: 4, nm, sr: 1, ip: 0, op: 176, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "gr", nm: "Shape 1", it: [{ ty: "sh", nm: "Path 1", ks: { a: 0, k: path(pts) } }, { ty: "st", nm: "Stroke 1", c: { a: 0, k: [...c, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 1, lj: 1 }, trim, tr] }],
    });
    const data = {
      v: "5.9.0", fr: 30, ip: 0, op: 176, w: 1920, h: 880, nm: "rc-line", ddd: 0, assets: [],
      layers: [
        line("line_a", [[-40, 640, [0, 0], [420, -60]], [880, 380, [-300, 120], [320, -130]], [1960, 180, [-380, 40], [0, 0]]]),
        line("line_b", [[-40, 760, [0, 0], [520, -10]], [1020, 520, [-360, 150], [300, -120]], [1960, 300, [-420, 80], [0, 0]]]),
      ],
    };
    const anim = lottie.loadAnimation({ container: holder, renderer: "svg", loop: true, autoplay: !reduce, animationData: data, rendererSettings: { preserveAspectRatio: "xMidYMid slice" } });
    anim.setSpeed(1.5);
    if (reduce) anim.goToAndStop(175, true);
  }
})();
