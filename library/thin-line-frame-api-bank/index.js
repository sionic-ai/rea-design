// First page — payment rail loop (original ProductsSection values), developer rows floating up (revealOnScroll .25), account graph line drawing
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Payment rail: 12s per rail. Code is typed from 600ms to 5000ms, and at about 41% (original revealAfterCharacters) the transfer card appears, and
  // From 400ms events fire one by one, and the editor shuts off at 11.5s ----------
  const CYCLE = 12000, TICK = 80, TYPE_AT = 600, TYPE_END = 5000, AFTER = 400, HIDE = 11500, STILL = 10600;
  const REVEAL = TYPE_AT + Math.ceil((TYPE_END - TYPE_AT) * 0.405);
  const bento = document.querySelector("[data-products-bento]");
  const rails = [...document.querySelectorAll(".i-rail")];
  const code = bento?.querySelector("[data-code]");
  const editor = bento?.querySelector("[data-editor]");
  const xfer = bento?.querySelector("[data-xfer]");
  const amt = bento?.querySelector("[data-amt]");
  const type = bento?.querySelector("[data-type]");
  const events = bento?.querySelector("[data-events]");
  if (bento && rails.length && code && editor && xfer) {
    const DATA = rails.map((r, k) => ({
      method: `rail${k + 1}`,
      amount: `$${String(k + 1).repeat(3)}.00`,
      type: `Your remittance type $ here{k + 1}`,
      every: [900, 1900, 2200, 500, 900, 1200, 900, 1500][k % 8],
      steps: ["Your step name here", "Your step name two here", "Your step name three here", "Your step name four here"],
    }));
    const seg = (d) => [
      ["k", "await "], ["", "client."], ["f", d.method], ["", "."], ["f", "create"], ["p", "({\n"],
      ["", "  amount: "], ["n", "-00000"], ["p", ",\n"],
      ["", "  account_id: "], ["s", '"account_id_0000"'], ["p", ",\n"],
      ["", "  routing_number: "], ["s", '"000000000"'], ["p", ",\n"],
      ["", "  account_number: "], ["s", '"000000000"'], ["p", ",\n"],
      ["", "  statement_descriptor: "], ["s", '"Descriptor"'], ["p", ",\n"],
      ["", "  individual_name: "], ["s", '"Person Name"'], ["p", ",\n"],
      ["", "  company_name: "], ["s", '"Company Name"'], ["p", ",\n"],
      ["p", "});"],
    ];
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const html = (d, n, typing) => {
      let out = "", left = n;
      for (const [c, t] of seg(d)) {
        if (left <= 0) break;
        const part = t.slice(0, left);
        left -= part.length;
        out += c ? `<span class="${c}">${esc(part)}</span>` : esc(part);
      }
      return out + (typing ? '<span class="i-caret"></span>' : "");
    };
    const total = (d) => seg(d).reduce((a, [, t]) => a + t.length, 0);
    const memo = new Map();
    const once = (key, val, fn) => { if (memo.get(key) !== val) { memo.set(key, val); fn(); } };

    const draw = (t) => {
      const k = Math.floor(t / CYCLE) % DATA.length, d = DATA[k], at = t % CYCLE;
      once("rail", k, () => {
        rails.forEach((r, i) => r.classList.toggle("is-on", i === k));
        amt.textContent = d.amount;
        type.textContent = d.type;
      });
      const all = total(d);
      const typing = at >= TYPE_AT && at < TYPE_END;
      const n = at < TYPE_AT ? 0 : at >= TYPE_END ? all : Math.floor((all * (at - TYPE_AT)) / (TYPE_END - TYPE_AT));
      once("code", `${k}:${n}:${typing}`, () => { code.innerHTML = html(d, n, typing); });
      once("editor", at >= HIDE, () => { editor.style.opacity = at >= HIDE ? "0" : "1"; });
      const shown = at >= REVEAL && at < HIDE;
      once("card", shown, () => {
        xfer.style.opacity = shown ? "1" : "0";
        xfer.style.transform = shown ? "none" : "translateY(16px)";
      });
      const from = REVEAL + AFTER;
      const count = at < from ? 0 : Math.min(d.steps.length + 1, 1 + Math.floor((at - from) / d.every));
      once("events", `${k}:${count}`, () => {
        events.innerHTML = d.steps.slice(0, count).map((s, i) => `<div class="i-ev"><i></i>${s}<time>00:00:0${i} AM</time></div>`).join("")
          + (count > d.steps.length ? '<div class="i-ev is-hold"><i></i>Your one-line hold notice here</div>' : "");
      });
    };

    // ---------- Platform loop: the same 12s runs apart from the rail (regardless of presses) — every 1s the balance changes and only the changed digits roll up in .42s (16ms later per slot),
    // The rules pill goes 3.1s Review needed → 5.4s attachment pops out → 7.4s Recheck → 9.1s Passed, and the console turns off at 11.5s ----------
    const bal = bento.querySelector("[data-balance]");
    const pill = bento.querySelector(".i-ok");
    const file = bento.querySelector(".i-file");
    const consoleRows = bento.querySelector(".i-console__rows");
    const BASE = 12000000, DELTAS = [1520.4, -830.1, 2410.55, 640, -120.35, 3075.2, 910.8, -455.6, 1288.15, 702.4, -310.9];
    const money = (v) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const digits = (now, before) => {
      const a = now.split(""), b = before ? before.split("") : null, shift = b ? a.length - b.length : 0;
      const up = !before || +now.replace(/[^0-9.]/g, "") >= +before.replace(/[^0-9.]/g, "");
      return a.map((c, i) => {
        const was = b ? b[i - shift] ?? " " : c;
        if (!b || was === c) return `<span class="i-digit">${c}</span>`;
        const pair = up ? `<span>${was}</span><span>${c}</span>` : `<span>${c}</span><span>${was}</span>`;
        return `<span class="i-digit"><span class="i-roll i-roll--${up ? "up" : "down"}" style="animation-delay:${i * 16}ms">${pair}</span></span>`;
      }).join("");
    };
    const PHASE = [[11500, "exit", "Pass through"], [9100, "pass", "Pass through"], [7400, "check", "Recheck"], [5400, "issue", "Check Attachment"], [3100, "issue", "Review needed"], [0, "check", "Checking"]];
    let shownBal = null;
    const platform = (t) => {
      const at = t % CYCLE;
      const n = Math.max(0, Math.min(11, Math.floor(at / 1000)));
      let v = BASE;
      for (let i = 0; i < n; i++) v += DELTAS[i];
      const s = money(v);
      once("bal", s, () => { if (bal) bal.innerHTML = digits(s, shownBal); shownBal = s; });
      const [, state, label] = PHASE.find(([from]) => at >= from);
      once("pill", state + label, () => { if (pill) { pill.dataset.state = state; pill.textContent = label; } });
      const attached = at >= 5400 && at < 11500;
      once("file", attached, () => { if (file) file.hidden = !attached; });
      once("console", at >= HIDE, () => { if (consoleRows) consoleRows.style.opacity = at >= HIDE ? "0" : "1"; });
    };

    if (reduce) { draw(STILL); platform(STILL); }
    else {
      // Time runs only while visible — the original also stops off-screen and resumes from the same spot
      let banked = 0, since = null, timer = null, offset = 0;
      const now = () => banked + (since === null ? 0 : performance.now() - since);
      // When leaving this page via swap, clear the timer
      const tick = () => {
        if (!bento.isConnected) { clearInterval(timer); timer = null; return; }
        draw(now() + offset);
        platform(now());
      };
      new IntersectionObserver((list) => {
        const vis = list[list.length - 1]?.isIntersecting ?? false;
        if (vis && timer === null) { since = performance.now(); timer = setInterval(tick, TICK); tick(); }
        else if (!vis && timer !== null) { banked += performance.now() - since; since = null; clearInterval(timer); timer = null; }
      }).observe(bento);
      rails.forEach((r, i) => r.addEventListener("click", () => { offset = i * CYCLE - now(); tick(); }));
      draw(0);
      platform(0);
    }
  }

  // ---------- Developer row: is-visible when 25% visible ----------
  const rows = document.querySelectorAll(".developer-row");
  if (reduce) rows.forEach((r) => r.classList.add("is-visible"));
  else {
    const io = new IntersectionObserver((list) => {
      for (const e of list) if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }, { threshold: 0.25 });
    rows.forEach((r) => io.observe(r));
  }

  // ---------- Account graph ----------
  const acct = document.querySelector(".i-card--acct");
  if (acct) {
    const io = new IntersectionObserver((list) => {
      if (list.some((e) => e.isIntersecting)) { acct.classList.add("is-drawn"); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(acct);
  }
})();
