# 우리 아이소메트릭 블록 Lottie — 원본과 같은 캔버스 크기·길이·반복(자동 재생 loop)으로, 그림은 새로 짠다
import json, math, os, sys, random
OUT = os.path.dirname(os.path.abspath(__file__))
BLUE = [0.118, 0.431, 0.953, 1]   # 표식 색 — 사이트 js 가 그릴 때 --kf-accent 로 바꿔 칠한다
WHITE = [1, 1, 1, 1]
INK = [0, 0, 0, 1]
GREY = [0.416, 0.463, 0.506, 1]
C30, S30 = math.cos(math.pi / 6), math.sin(math.pi / 6)

def iso(cx, cy, s, x, y, z):
    return [round(cx + (x - y) * C30 * s, 2), round(cy + (x + y) * S30 * s - z * s, 2)]

def shape(pts):
    n = len(pts)
    return {"ty": "sh", "ks": {"a": 0, "k": {"i": [[0, 0]] * n, "o": [[0, 0]] * n, "v": pts, "c": True}}}

def group(pts, fill, stroke=INK, sw=2):
    it = [shape(pts), {"ty": "fl", "c": {"a": 0, "k": fill}, "o": {"a": 0, "k": 100}, "r": 1}]
    if stroke:
        it.append({"ty": "st", "c": {"a": 0, "k": stroke}, "o": {"a": 0, "k": 100}, "w": {"a": 0, "k": sw}, "lc": 2, "lj": 2})
    it.append({"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}})
    return {"ty": "gr", "it": it}

def box(cx, cy, s, x, y, z, a, b, h, top, side_l, side_r):
    P = lambda X, Y, Z: iso(cx, cy, s, X, Y, Z)
    return [
        group([P(x, y, z + h), P(x + a, y, z + h), P(x + a, y + b, z + h), P(x, y + b, z + h)], top),
        group([P(x, y + b, z + h), P(x + a, y + b, z + h), P(x + a, y + b, z), P(x, y + b, z)], side_l),
        group([P(x + a, y, z + h), P(x + a, y + b, z + h), P(x + a, y + b, z), P(x + a, y, z)], side_r),
    ]

EASE = {"i": {"x": 0.65, "y": 1}, "o": {"x": 0.35, "y": 0}}

def layer(ind, name, shapes, op, pos_keys=None):
    p = {"a": 0, "k": [0, 0, 0]}
    if pos_keys:
        p = {"a": 1, "k": [dict({"t": t, "s": [0, v, 0]}, **(EASE if k < len(pos_keys) - 1 else {})) for k, (t, v) in enumerate(pos_keys)]}
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1,
            "ks": {"o": {"a": 0, "k": 100}, "r": {"a": 0, "k": 0}, "p": p, "a": {"a": 0, "k": [0, 0, 0]}, "s": {"a": 0, "k": [100, 100, 100]}},
            "ao": 0, "shapes": shapes, "ip": 0, "op": op, "st": 0, "bm": 0}

def make(name, w, h, fr, frames, cubes=1, seed=1, slab=True, dots=0):
    rnd = random.Random(seed)
    s = min(w, h) / 9.5
    cx, cy = w / 2, h * 0.38
    layers = []
    ind = 1
    # 블록 — 판 위에서 차례로 떠올랐다 내려앉는다(곡선 0.65,0,0.35,1)
    spots = [(1.2, 1.2), (3.0, 0.6), (0.6, 3.0), (2.6, 2.6)][:cubes]
    for k, (x, y) in enumerate(spots):
        a = 1.3 if cubes > 1 else 1.8
        lift = s * (0.9 + 0.3 * rnd.random())
        t0 = int(frames * 0.12 * k)
        keys = [(0, 0), (min(frames - 1, t0 + frames * 0.25), -lift), (min(frames - 1, t0 + frames * 0.55), 0), (frames, 0)]
        keys = sorted({int(t): v for t, v in keys}.items())
        col = BLUE if k % 2 == 0 else WHITE
        layers.append(layer(ind, f"cube-{k}", box(cx, cy, s, x, y, 0.6, a, a, a, col, BLUE if col == WHITE else WHITE, INK if col == BLUE else GREY), frames, keys))
        ind += 1
    for d in range(dots):
        gx, gy = 0.5 + (d % 4) * 1.0, 0.5 + (d // 4) * 1.0
        c = iso(cx, cy, s, gx, gy, 0.6)
        layers.append(layer(ind, f"dot-{d}", [group([[c[0] - 4, c[1]], [c[0], c[1] - 2.3], [c[0] + 4, c[1]], [c[0], c[1] + 2.3]], INK, None)], frames))
        ind += 1
    if slab:
        layers.append(layer(ind, "slab", box(cx, cy, s, 0, 0, 0, 4.4, 4.4, 0.6, WHITE, WHITE, GREY), frames))
    data = {"v": "5.12.1", "fr": fr, "ip": 0, "op": frames, "w": w, "h": h, "nm": name, "ddd": 0, "assets": [], "layers": layers}
    ALL[name] = data
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        json.dump(data, f, separators=(",", ":"))

ALL = {}
SPECS = [
    ("builders", 920, 1350, 60, 200, 2, 1, True, 8), ("traders", 500, 600, 60, 240, 3, 2, True, 0),
    ("security", 1922, 1726, 60, 180, 1, 3, True, 12), ("margin", 870, 900, 30, 120, 2, 4, True, 0),
    ("spot", 500, 460, 60, 240, 1, 5, True, 4), ("predict", 870, 905, 60, 240, 3, 6, True, 0),
    ("speed", 340, 250, 60, 155, 1, 7, True, 0), ("liquidity", 300, 220, 60, 208, 2, 8, True, 0),
    ("compose", 250, 250, 60, 144, 3, 9, True, 0), ("settle", 340, 250, 60, 228, 1, 10, True, 4),
    ("leverage", 1432, 1314, 60, 144, 2, 11, True, 8), ("predictions", 1022, 733, 60, 181, 1, 12, True, 12),
    ("structured", 1091, 643, 60, 127, 3, 13, True, 0), ("fullstack", 1664, 1078, 60, 220, 4, 14, True, 0),
    ("choose", 1750, 850, 60, 282, 2, 15, True, 8), ("deeper", 340, 250, 60, 170, 2, 16, True, 0),
    ("transparent", 340, 250, 60, 142, 1, 17, True, 4), ("keys", 340, 250, 60, 153, 1, 18, True, 0),
]
for spec in SPECS:
    make(*spec)
# file:// 로 열어도 읽히게 JSON 을 스크립트 하나에 담는다(Lottie path 는 XHR 이라 file:// 에서 막힌다)
with open(os.path.join(OUT, "lotties.js"), "w") as f:
    f.write("// 우리 아이소메트릭 블록 Lottie 열여덟 — 원본과 같은 크기·길이, 그림은 새로 짰다. lottie_gen 으로 굽는다\n")
    f.write("window.DB_LOTTIE = " + json.dumps(ALL, separators=(",", ":")) + ";\n")
print(len(SPECS), "files")
