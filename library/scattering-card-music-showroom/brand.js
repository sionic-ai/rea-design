// Placeholder track card — number, title, date, tag, Lissajous curve ratio (a:b), color (skin variable name). Card art is drawn by stage.js from these values.
// Song titles, genre names and intro lines use the Latin-only title font (Gloock) slot, so keep them as English placeholder text — Korean would fall back to Hahmlet and lose the original feel.
(() => {
  const KT = window.KT;
  const base = [
    { title: "Track Name 01", date: "0000, month 00", tags: ["Tag", "Tag two", "Tag"], curve: [1, 2, 0.0], color: "--site-card-1" },
    { title: "Track 02", date: "Summer 0000", tags: ["Tag", "Tag", "Tag three"], curve: [3, 2, 0.5], color: "--site-card-2" },
    { title: "Longer Track Name 03", date: "0000, month 00", tags: ["Tag", "Tag", "Tag", "Tag four"], curve: [3, 4, 1.2], color: "--site-card-3" },
    { title: "Track Name 04", date: "0000/00 · Group name", tags: ["Tag", "Tag", "Tag"], curve: [1, 2, 1.57], color: "--site-card-4", corner: true },
    { title: "Track 05", date: "0000, month 00", tags: ["Tag", "Tag", "Tag"], curve: [3, 2, 2.2], color: "--site-card-3" },
    { title: "Track Name 06", date: "0000, month 00", tags: ["Tag", "Tag two", "Tag", "Tag"], curve: [1, 3, 0.3], color: "--site-card-5" },
    { title: "Track Name 07", date: "0000, month 00", tags: ["Tag", "Tag"], curve: [5, 4, 0.7], color: "--site-card-6" },
    { title: "Track Name 08", date: "0000, month 00", tags: ["Tag", "Tag two", "Tag"], curve: [1, 2, 0.8], color: "--site-card-1" },
    { title: "Track Name 09", date: "0000, month 00", tags: ["Tag", "Tag"], curve: [3, 4, 0.1], color: "--site-card-2" },
    { title: "Track 10", date: "0000, month 00", tags: ["Tag", "Tag", "Tag"], curve: [1, 2, 2.6], color: "--site-card-3" },
    { title: "Track Name 11", date: "0000, month 00", tags: ["Tag", "Tag two"], curve: [3, 2, 1.0], color: "--site-card-4" },
  ];
  KT.brand = base.map((t, i) => ({ ...t, no: `TX.${String(i * 7 + 3).padStart(3, "0")}`, name: "♪ Creator", seed: (i * 0.137) % 1 + 0.1 }));
  // Four genres — the original’s hip-hop · pop · electronic · experimental slots. Four items stand on the display shelf per genre
  KT.worlds = [
    { title: "Genre 1.", line: "A one-line intro goes here.", color: "--site-world-1", count: 64, cards: [0, 3, 7, 10] },
    { title: "Genre 2.", line: "A short line.", color: "--site-world-2", count: 41, cards: [1, 8, 4, 2] },
    { title: "Genre 3.", line: "A slightly longer one-line intro goes here.", color: "--site-world-3", count: 37, cards: [2, 6, 9, 5] },
    { title: "Genre 4.", line: "One line here, and one more thing.", color: "--site-world-4", count: 24, cards: [5, 9, 1, 6] },
  ];
})();
