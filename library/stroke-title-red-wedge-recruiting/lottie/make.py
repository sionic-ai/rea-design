# 첫 화면 Lottie(hero.js)를 굽는다 — 원본 kokuyo_logo.json 을 잰 판(1280×800·60fps·145틀), 획이 날아드는 곡선·틀 자리,
# 빨간 쐐기가 자라며 도는 열쇠 틀을 그대로 두고, 글자는 우리 자리표시(무료 서체 Noto Sans KR Black 의 획)로 새로 짓는다.
#   PYTHONPATH=<fonttools 설치 폴더> python3 make.py <NotoSansKR-Black.ttf>  →  hero.js
# 서체: Noto Sans KR 가변판을 fontTools.varLib.instancer 로 wght 900 에 고정한 것(OFL).
import json, sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

FR, OP, W, H = 60, 145, 1280, 800

# 획 하나가 날아드는 값 — 원본 획 레이어의 매 틀 값이 0.7473 배씩 줄다 24틀째 0 이 된다
DECAY = [0.7473 ** k for k in range(20)] + [0.004, 0.0024, 0.0012, 0.0004, 0]


class Contours(BasePen):
    def __init__(self, gs):
        super().__init__(gs)
        self.cs, self.cur = [], None

    def _moveTo(self, p):
        self.cur = [[p, None, None]]

    def _lineTo(self, p):
        self.cur.append([p, None, None])

    def _curveToOne(self, a, b, p):
        self.cur[-1][2] = a
        self.cur.append([p, b, None])

    def _qCurveToOne(self, q, p):
        s = self.cur[-1][0]
        a = (s[0] + 2 / 3 * (q[0] - s[0]), s[1] + 2 / 3 * (q[1] - s[1]))
        b = (p[0] + 2 / 3 * (q[0] - p[0]), p[1] + 2 / 3 * (q[1] - p[1]))
        self._curveToOne(a, b, p)

    def _closePath(self):
        c = self.cur
        if len(c) > 1 and c[0][0] == c[-1][0]:
            c[0][1] = c[-1][1]
            c.pop()
        self.cs.append(c)
        self.cur = None

    _endPath = _closePath


def glyph_contours(font, ch, x, base, size):
    gs = font.getGlyphSet()
    name = font.getBestCmap()[ord(ch)]
    pen = Contours(gs)
    gs[name].draw(pen)
    k = size / 1000
    tf = lambda p: (round(x + p[0] * k, 2), round(base - p[1] * k, 2))
    out = []
    for c in pen.cs:
        v, i, o = [], [], []
        for p, cin, cout in c:
            P = tf(p)
            v.append(list(P))
            I = tf(cin) if cin else P
            O = tf(cout) if cout else P
            i.append([round(I[0] - P[0], 2), round(I[1] - P[1], 2)])
            o.append([round(O[0] - P[0], 2), round(O[1] - P[1], 2)])
        xs, ys = [q[0] for q in v], [q[1] for q in v]
        area = sum(v[n][0] * v[(n + 1) % len(v)][1] - v[(n + 1) % len(v)][0] * v[n][1] for n in range(len(v))) / 2
        out.append({"v": v, "i": i, "o": o, "box": (min(xs), min(ys), max(xs), max(ys)), "area": area})
    return out


def strokes(contours):
    # 구멍(ㅇ·ㅁ 속)은 감싼 바깥 획에 붙인다 — 따로 날아들면 구멍이 먹으로 찬다
    big = max(contours, key=lambda c: abs(c["area"]))
    sign = 1 if big["area"] > 0 else -1
    outer = [c for c in contours if c["area"] * sign > 0]
    groups = [[c] for c in outer]
    inside = lambda a, b: a[0] >= b[0] - 1 and a[1] >= b[1] - 1 and a[2] <= b[2] + 1 and a[3] <= b[3] + 1
    for c in contours:
        if c["area"] * sign > 0:
            continue
        hosts = [g for g in groups if inside(c["box"], g[0]["box"])]
        (min(hosts, key=lambda g: abs(g[0]["area"])) if hosts else groups[0]).append(c)
    groups.sort(key=lambda g: (g[0]["box"][1] // 40, g[0]["box"][0]))
    return groups


def kf(t, s, o=(0, 0), i=(1, 1)):
    return {"t": t, "s": s if isinstance(s, list) else [s], "o": {"x": [o[0]], "y": [o[1]]}, "i": {"x": [i[0]], "y": [i[1]]}}


def stroke_layer(ind, g, start, mode, n):
    x0 = min(c["box"][0] for c in g); y0 = min(c["box"][1] for c in g)
    x1 = max(c["box"][2] for c in g); y1 = max(c["box"][3] for c in g)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    shapes = [{"ty": "sh", "ks": {"a": 0, "k": {"c": True, "v": c["v"], "i": c["i"], "o": c["o"]}}} for c in g]
    shapes += [
        {"ty": "fl", "c": {"a": 0, "k": [0, 0, 0, 1]}, "o": {"a": 0, "k": 100}, "r": 2},
        {"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}},
    ]
    ks = {"o": {"a": 1, "k": [kf(start, 0, (0.652, 0), (0.449, 1)), {"t": start + 4, "s": [100]}]}}
    if mode == "wipe":
        # 곧은 획은 원본의 「…-t-shape」 레이어처럼 한쪽 끝에서 17틀에 걸쳐 펴진다
        wide = (x1 - x0) >= (y1 - y0)
        ax, ay = (x0, cy) if wide else (cx, y0)
        s0 = [0, 100, 100] if wide else [100, 0, 100]
        ks.update({
            "a": {"a": 0, "k": [ax, ay, 0]}, "p": {"a": 0, "k": [ax, ay, 0]}, "r": {"a": 0, "k": 0},
            "s": {"a": 1, "k": [{"t": start, "s": s0, "o": {"x": [0.601] * 3, "y": [0.437, -0.437, -0.437]}, "i": {"x": [0.635] * 3, "y": [1, 1, 1]}}, {"t": start + 17, "s": [100, 100, 100]}]},
        })
    else:
        # 나머지 획은 40° 기울어 대각선 밖에서 날아와 제자리에 앉는다(방향은 획마다 번갈아)
        d = [(-150, -150), (100, 200), (-120, 160), (160, -110)][n % 4]
        rot = 40 if n % 2 == 0 else -40
        ks.update({
            "a": {"a": 0, "k": [cx, cy, 0]}, "s": {"a": 0, "k": [100, 100, 100]},
            "r": {"a": 1, "k": [kf(start + k, round(rot * f, 3)) for k, f in enumerate(DECAY)]},
            "p": {"a": 1, "k": [kf(start + k, [round(cx + d[0] * f, 2), round(cy + d[1] * f, 2), 0]) for k, f in enumerate(DECAY)]},
        })
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": f"stroke-{ind}", "sr": 1, "ks": ks, "ao": 0, "shapes": [{"ty": "gr", "it": shapes, "nm": "s"}],
            "ip": start, "op": OP + 200, "st": 0, "bm": 0}


def triangle_layer(ind):
    # 원본 쐐기를 잰 값: 밑변 두 점(508.8,397.5)·(619,478.4), 끝 (1086,264.8). 99틀부터 16틀 동안 끝이 밑변 가운데서 뻗고,
    # 밑변 가운데(565,439)를 축으로 107틀 -88° → 119틀 10° → 127틀 -1° → 132틀 4° → 143틀 2°.
    b1, b2, tip = (508.8, 397.5), (619.0, 478.4), (1086.0, 264.8)
    mid = ((b1[0] + b2[0]) / 2, (b1[1] + b2[1]) / 2)
    grow = [0, .004, .018, .041, .074, .118, .172, .238, .315, .403, .5, .604, .712, .816, .907, .972, 1]
    def path(f):
        tx, ty = mid[0] + (tip[0] - mid[0]) * f, mid[1] + (tip[1] - mid[1]) * f
        return [{"c": True, "v": [list(b1), list(b2), [tx + 1.4, ty + 1], [tx - 1.4, ty - 1]], "i": [[0, 0]] * 4, "o": [[0, 0]] * 4}]
    sh = {"ty": "sh", "ks": {"a": 1, "k": [{"t": 99 + n, "s": path(f), "o": {"x": 0, "y": 0}, "i": {"x": 1, "y": 1}} for n, f in enumerate(grow)]}}
    rot = [
        {"t": 107, "s": [-88], "o": {"x": [0.167], "y": [0.167]}, "i": {"x": [0.667], "y": [1]}},
        {"t": 119, "s": [10], "o": {"x": [0.467], "y": [0]}, "i": {"x": [0.666], "y": [1]}},
        {"t": 127, "s": [-1], "o": {"x": [0.456], "y": [0]}, "i": {"x": [0.667], "y": [1]}},
        {"t": 132, "s": [4], "o": {"x": [0.333], "y": [0]}, "i": {"x": [0.19], "y": [1]}},
        {"t": 143, "s": [2]},
    ]
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": "wedge", "cl": "kk-wedge", "sr": 1, "ao": 0, "ip": 99, "op": OP + 200, "st": 0, "bm": 0,
            "ks": {"o": {"a": 1, "k": [kf(99, 0, (0.544, 0), (0.4, 1)), {"t": 103, "s": [100]}]}, "r": {"a": 1, "k": [{"t": 99, "s": [-88], "o": {"x": [0], "y": [0]}, "i": {"x": [1], "y": [1]}}] + rot},
                   "p": {"a": 0, "k": [mid[0], mid[1], 0]}, "a": {"a": 0, "k": [mid[0], mid[1], 0]}, "s": {"a": 0, "k": [100, 100, 100]}},
            "shapes": [{"ty": "gr", "nm": "w", "it": [sh, {"ty": "fl", "c": {"a": 0, "k": [0.9, 0, 0.07, 1]}, "o": {"a": 0, "k": 100}, "r": 1},
                                                   {"ty": "tr", "p": {"a": 0, "k": [0, 0]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}}]}]}


# 원본 두 줄 큰 제목의 자리: 1줄 큰 글자 위 182·아래 385, 2줄 450·640(1280×800 판), 작은 가나는 큰 글자의 0.45 배.
# 글자마다 첫 획이 들어오는 틀도 원본의 글자 차례(6·17·20·28·42 … 110)를 그대로 쓴다.
LINES = [
    # (글자, x, 밑줄, 크기, 시작 틀, 방식)
    ("제", 168, 372, 214, 6, "fly"), ("목", 384, 372, 214, 17, "wipe"), ("은", 600, 372, 98, 20, "fly"),
    ("크", 702, 372, 214, 28, "wipe"), ("게", 918, 372, 214, 42, "fly"), (",", 1128, 372, 98, 46, "fly"),
    ("토", 168, 640, 214, 65, "wipe"), ("씨", 384, 640, 214, 74, "fly"), ("는", 600, 640, 98, 85, "fly"),
    ("작", 702, 640, 214, 95, "fly"), ("게", 918, 640, 214, 98, "wipe"), (".", 1128, 640, 98, 110, "fly"),
]


def main():
    font = TTFont(sys.argv[1])
    layers, ind, n = [], 1, 0
    layers.append(triangle_layer(ind)); ind += 1
    for ch, x, base, size, start, mode in LINES:
        for k, g in enumerate(strokes(glyph_contours(font, ch, x, base, size))):
            m = mode if mode == "fly" or k % 2 == 0 else "fly"
            layers.append(stroke_layer(ind, g, start + k, m, n)); ind += 1; n += 1
    data = {"v": "5.12.2", "fr": FR, "ip": 0, "op": OP, "w": W, "h": H, "nm": "hero", "ddd": 0, "assets": [], "layers": layers}
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hero.js")
    with open(out, "w") as f:
        f.write("// make.py 가 굽는 파일 — 고치지 말고 make.py 를 고쳐 다시 굽는다\n")
        f.write("(() => { window.kkLottie = { hero: " + json.dumps(data, separators=(",", ":")) + " }; })();\n")
    print(out, len(layers), "layers", os.path.getsize(out), "bytes")


main()
