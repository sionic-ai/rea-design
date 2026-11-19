// Subpages — About and Network use only the shared motion, while service detail shows a barcode-mask shader header.
(() => {
  const { ES } = window;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Photo slot to be revealed under the mask — a panel with diagonal wires and a label instead of the original photo
  function photoPlaceholder() {
    const cv = document.createElement("canvas");
    cv.width = 1600; cv.height = 900;
    const c = cv.getContext("2d");
    const g = c.createLinearGradient(0, 0, cv.width, cv.height);
    g.addColorStop(0, css("--kf-surface")); g.addColorStop(1, css("--kf-raised"));
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    c.strokeStyle = css("--kf-ink"); c.globalAlpha = 0.25; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(cv.width, cv.height); c.moveTo(cv.width, 0); c.lineTo(0, cv.height); c.stroke();
    c.globalAlpha = 1;
    c.fillStyle = css("--kf-ink");
    c.beginPath(); c.ellipse(cv.width * 0.62, cv.height * 0.45, 210, 260, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(cv.width * 0.62 - 330, cv.height * 0.7, 660, 400);
    return cv;
  }

  ES.page("service", (c) => {
    const host = c.querySelector("[data-mask-hero]");
    if (!host || !ES.barcodeMask) return null;
    const fx = ES.barcodeMask({ host, canvas: host.querySelector("[data-mask-gl]"), source: photoPlaceholder(), minWidth: 5, maxWidth: 100, lifetime: 2000, throttle: 25 });
    return () => fx?.destroy();
  });
})();
