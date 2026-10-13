import math, subprocess, sys, random, wave
from functools import lru_cache
from pathlib import Path
import numpy as np
from scipy.signal import lfilter, butter
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, DUR = 1080, 1920, 30, 60
OUT = sys.argv[1] if len(sys.argv) > 1 else "out.mp4"
PREVIEW = [float(x) for x in sys.argv[2:]]

BG = (14, 17, 34); WHITE = (245, 246, 250); MUTED = (150, 156, 180)
RAHUL = (61, 220, 151); AMIT = (255, 159, 67); GOLD = (255, 209, 102); RED = (255, 90, 95)
GF = str(Path(__file__).resolve().parent.parent / "assets" / "fonts") + "/"

@lru_cache(maxsize=None)
def font(size, w="Bold"):
    return ImageFont.truetype(f"{GF}Poppins-{w}.ttf", max(4, int(size)))

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(t): t = clamp(t); return 4*t*t*t if t < .5 else 1-(-2*t+2)**3/2
def back(t):
    t = clamp(t); c1 = 1.70158; c3 = c1+1
    return 1 + c3*(t-1)**3 + c1*(t-1)**2
def mix(c, a, base=BG): return tuple(int(base[i] + (c[i]-base[i])*clamp(a)) for i in range(3))
def ramp(t, start, dur=0.3): return clamp((t-start)/dur)
def inr(x):
    if x >= 1e7: return f"₹{x/1e7:.2f} Cr"
    if x >= 1e5: return f"₹{x/1e5:.1f} L"
    return f"₹{int(round(x)):,}"

# ---------------- finance ----------------
P, R = 5000, 0.12/12
RS, AS = [], []
vr = va = 0.0
for m in range(0, 35*12+1):
    age = 25 + m/12
    RS.append(vr); AS.append(va)
    vr = (vr + P)*(1+R) if age < 35 else vr*(1+R)
    if age >= 35: va = (va + P)*(1+R)
R60, A60 = RS[-1], AS[-1]

# ---------------- timeline ----------------
S_HOOK, S_RAHUL, S_AMIT, S_Q, S_CHART, S_RES, S_END = 0, 5, 14, 23, 31, 44, 53
IMPACTS = [0.0, S_RES + 2.3, S_END + 1.2]          # zoom punch + shake + boom
PUNCHES = [S_Q + 5, S_Q + 6, S_Q + 7]               # countdown small punches
FLASH = S_RES + 2.3

# ---------------- visuals ----------------
bg = Image.new("RGB", (W, H), BG)
bd = ImageDraw.Draw(bg)
for y in range(H):
    k = y/H
    bd.line([(0, y), (W, y)], fill=(int(14+10*k), int(17+6*k), int(34+22*k)))
random.seed(3)
STARS = [(random.randint(0, W), random.randint(0, H), random.random()) for _ in range(60)]
CONF = [(random.uniform(0, W), random.uniform(-300, -20), random.uniform(-160, 160), random.uniform(250, 650),
         random.choice([RAHUL, GOLD, AMIT, WHITE, (120, 160, 255)]), random.uniform(0, 6), random.uniform(10, 22))
        for _ in range(140)]

def text(d, s, cx, cy, size, color, a=1.0, w="Bold", anchor="mm", stroke=0):
    if a <= 0.01: return
    d.text((cx, cy), s, font=font(size, w), fill=mix(color, a), anchor=anchor,
           stroke_width=stroke, stroke_fill=mix((0, 0, 0), a, BG) if stroke else None)

def pill(d, cx, cy, s, size, fg, bgc, a=1.0, pad=28):
    if a <= 0.01: return
    f = font(size); l, t, r, b = d.textbbox((0, 0), s, font=f)
    w, h = r-l + pad*2, b-t + pad
    d.rounded_rectangle([cx-w/2, cy-h/2, cx+w/2, cy+h/2], radius=h/2, fill=mix(bgc, a))
    d.text((cx, cy), s, font=f, fill=mix(fg, a), anchor="mm")

def caption(d, s, t0, t, y, size, color, A):
    a = ramp(t, t0, 0.2)*A
    k = back(ramp(t, t0, 0.35))
    text(d, s, W/2, y, size*(0.6+0.4*k), color, a)

def person(d, cx, cy, s, color, a=1.0, t=0.0, mood="happy", tag=None, jump=0.0):
    if a <= 0.01: return
    bob = math.sin(t*4)*6*s - jump
    body_h, body_w, head_r = 230*s, 170*s, 78*s
    top = cy - body_h + bob
    c = mix(color, a); dark = mix(tuple(int(v*0.55) for v in color), a)
    d.rounded_rectangle([cx-body_w/2, top, cx+body_w/2, cy+bob], radius=60*s, fill=c)
    hy = top - head_r*0.85
    d.ellipse([cx-head_r, hy-head_r, cx+head_r, hy+head_r], fill=mix((255, 214, 186), a))
    d.chord([cx-head_r, hy-head_r, cx+head_r, hy+head_r*0.6], 180, 360, fill=dark)
    blink = (t*1.3) % 3 < 0.12
    ink = mix((30, 30, 40), a)
    for ex in (-26*s, 26*s):
        if blink: d.line([cx+ex-9*s, hy+12*s, cx+ex+9*s, hy+12*s], fill=ink, width=max(2, int(5*s)))
        elif mood == "wow": d.ellipse([cx+ex-12*s, hy, cx+ex+12*s, hy+24*s], fill=ink)
        else: d.ellipse([cx+ex-9*s, hy+3*s, cx+ex+9*s, hy+21*s], fill=ink)
    m = mix((120, 50, 50), a); lw = max(2, int(6*s))
    if mood == "happy": d.arc([cx-26*s, hy+18*s, cx+26*s, hy+52*s], 20, 160, fill=m, width=lw)
    elif mood == "sad":
        d.arc([cx-24*s, hy+38*s, cx+24*s, hy+66*s], 200, 340, fill=m, width=lw)
        d.ellipse([cx+30*s, hy+20*s, cx+42*s, hy+38*s], fill=mix((120, 190, 255), a))  # tear
    elif mood == "wow": d.ellipse([cx-14*s, hy+32*s, cx+14*s, hy+60*s], fill=m)
    else: d.line([cx-20*s, hy+42*s, cx+20*s, hy+42*s], fill=m, width=lw)
    if tag: pill(d, cx, cy + 60*s, tag, 44*s, BG, color, a, pad=24*s)

def coin(d, cx, cy, r, a=1.0):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=mix((214, 160, 40), a))
    d.ellipse([cx-r*0.8, cy-r*0.8, cx+r*0.8, cy+r*0.8], fill=mix(GOLD, a))
    text(d, "₹", cx, cy+1, r*1.1, (176, 120, 20), a)

def jar(d, cx, bottom, w, h, frac, color, a=1.0):
    top = bottom - h; fh = h*clamp(frac)
    if fh > 60:
        d.rounded_rectangle([cx-w/2+10, bottom-fh, cx+w/2-10, bottom-8], radius=24, fill=mix(color, a*0.85))
    d.rounded_rectangle([cx-w/2, top, cx+w/2, bottom], radius=34, outline=mix(WHITE, a*0.8), width=7)
    d.rounded_rectangle([cx-w/2-14, top-26, cx+w/2+14, top+6], radius=12, fill=mix(MUTED, a))

COIN_SPEED = 1.4
def coin_landings(scene_start, t0, dur):
    out = []
    for i in range(3):
        k = math.ceil(t0*COIN_SPEED + i/3)
        while True:
            tt = (k - i/3)/COIN_SPEED
            if tt > t0 + dur: break
            if tt > t0 + 0.2: out.append(scene_start + tt)
            k += 1
    return sorted(out)

def coins_scene(d, t, A, who, color, age0, age1, invested, cap1, cap2):
    caption(d, cap1, 0.15, t, 300, 76, WHITE, A)
    caption(d, cap2, 0.7, t, 410, 96, color, A)
    dur = 6.0
    p = ease(ramp(t, 1.2, dur))
    age = age0 + (age1-age0)*p
    person(d, 300, 1450, 1.15, color, A, t, "happy", None, jump=abs(math.sin(t*6))*14*(0 < p < 1))
    text(d, who, 300, 1530, 54, color, A)
    jx, jb = 720, 1500
    jar(d, jx, jb, 300, 420, p*0.9, color, A)
    if 1.2 < t < 1.2 + dur:
        for i in range(3):
            ph = (t*COIN_SPEED + i/3) % 1.0
            y = 700 + (ph**1.6)*700
            if y < jb - 40: coin(d, jx + (i-1)*55, y, 36, A)
    pill(d, W/2, 1700, f"Age {int(age)}", 64, BG, WHITE, A)
    text(d, "Invested: " + inr(invested*p), W/2, 560, 66, WHITE, A*ramp(t, 1.2))

def scene_hook(d, t, A):
    k = back(ramp(t, 0.0, 0.35))
    text(d, "₹6 Lakh vs ₹15 Lakh", W/2, 330, 92*(0.6+0.4*k), WHITE, A)
    caption(d, "LESS money wins?!", 0.8, t, 455, 110, GOLD, A)
    sl = 1 - ease(ramp(t, 1.4, 0.5))
    ap = ramp(t, 1.4, 0.3)*A
    person(d, W/2-220 - sl*600, 1300, 1.3, RAHUL, ap, t, "happy", "RAHUL")
    person(d, W/2+220 + sl*600, 1300, 1.3, AMIT, ap, t+1, "happy", "AMIT")
    va = ramp(t, 2.1, 0.2)*A
    if va > 0:
        r = 90*back(ramp(t, 2.1, 0.35))
        d.ellipse([W/2-r, 1050-r, W/2+r, 1050+r], fill=mix(RED, va))
        text(d, "VS", W/2, 1050, 70*back(ramp(t, 2.1, 0.35)), WHITE, va)
    text(d, "The answer will shock you", W/2, 1620, 50, MUTED, ramp(t, 2.8)*A, "Medium")

def scene_rahul(d, t, A):
    coins_scene(d, t, A, "RAHUL", RAHUL, 25, 35, 5000*120, "Rahul starts at 25", "₹5,000 / month")
    a = ramp(t, 7.4, 0.2)*A
    if a > 0:
        k = back(ramp(t, 7.4, 0.35))
        pill(d, W/2, 1830, "…then STOPS at 35", 56*(0.7+0.3*k), WHITE, RED, a)

def scene_amit(d, t, A):
    coins_scene(d, t, A, "AMIT", AMIT, 35, 60, 5000*300, "Amit starts late, at 35", "₹5,000 / month")
    a = ramp(t, 7.4, 0.2)*A
    if a > 0:
        k = back(ramp(t, 7.4, 0.35))
        pill(d, W/2, 1830, "…and never stops till 60", 52*(0.7+0.3*k), BG, RAHUL, a)

def scene_question(d, t, A):
    caption(d, "Both earn 12% a year.", 0.15, t, 380, 80, WHITE, A)
    for i, (nm, c, yrs, inv) in enumerate([("RAHUL", RAHUL, "10 years", 600000), ("AMIT", AMIT, "25 years", 1500000)]):
        a = ramp(t, 0.8 + i*0.5, 0.2)*A
        x = W/2 + (-230 if i == 0 else 230)
        y = 860 + (1-back(ramp(t, 0.8+i*0.5, 0.4)))*120
        d.rounded_rectangle([x-200, y-210, x+200, y+210], radius=40, fill=mix((32, 37, 68), a))
        d.rounded_rectangle([x-200, y-210, x+200, y-130], radius=40, fill=mix(c, a))
        d.rectangle([x-200, y-160, x+200, y-130], fill=mix(c, a))
        text(d, nm, x, y-170, 52, BG, a)
        text(d, "invests for", x, y-60, 40, MUTED, a, "Medium")
        text(d, yrs, x, y, 62, WHITE, a)
        text(d, "Total put in", x, y+80, 40, MUTED, a, "Medium")
        text(d, inr(inv), x, y+140, 62, c, a)
    caption(d, "Who has MORE at 60?", 2.4, t, 1260, 92, GOLD, A)
    pill(d, W/2, 1430, "Pause & comment your guess", 46, BG, WHITE, ramp(t, 3.4)*A)
    for i, n in enumerate(("3", "2", "1")):
        t0 = 5 + i
        if t0 <= t < t0 + 1:
            lt = t - t0
            k = back(ramp(lt, 0, 0.25))
            text(d, n, W/2, 1660, 230*(0.5+0.5*k), RED if n == "1" else WHITE, A*(1 - ramp(lt, 0.75, 0.25)))

def scene_chart(d, t, A):
    caption(d, "Watch the money grow", 0.15, t, 290, 80, WHITE, A)
    L, Rr, T, B = 150, 980, 520, 1500
    a = ramp(t, 0.2)*A; ymax = 2.5e7
    for v, lab in [(0, "0"), (5e6, "50L"), (1e7, "1 Cr"), (1.5e7, "1.5Cr"), (2e7, "2 Cr"), (2.5e7, "2.5Cr")]:
        y = B - (B-T)*v/ymax
        d.line([L, y, Rr, y], fill=mix((50, 56, 92), a), width=2)
        text(d, lab, L-16, y, 30, MUTED, a, "Medium", "rm")
    for ag in (25, 35, 45, 60):
        text(d, str(ag), L + (Rr-L)*(ag-25)/35, B+44, 34, MUTED, a, "Medium")
    text(d, "AGE", (L+Rr)/2, B+100, 32, MUTED, a, "Medium")
    p = ease(ramp(t, 0.8, 10.0)); n = int(p*(len(RS)-1))
    def pts(S):
        out = [(L + (Rr-L)*m/420, B - (B-T)*S[m]/ymax) for m in range(0, n+1, 3)]
        out.append((L + (Rr-L)*n/420, B - (B-T)*S[n]/ymax)); return out
    for S, c in ((AS, AMIT), (RS, RAHUL)):
        pp = pts(S)
        if len(pp) > 1:
            d.line(pp, fill=mix(c, A*0.25), width=30, joint="curve")   # glow
            d.line(pp, fill=mix(c, A), width=12, joint="curve")
        x, y = pp[-1]; r = 16 + 4*math.sin(t*10)
        d.ellipse([x-r, y-r, x+r, y+r], fill=mix(c, A))
    age = 25 + n/12
    if age >= 35:
        x = L + (Rr-L)*10/35
        sa = ramp(t, CHART_STOP_T - S_CHART)*A
        d.line([x, T, x, B], fill=mix(MUTED, sa*0.6), width=3)
        text(d, "Rahul stops", x+10, T+30, 32, RED, sa, "Medium", "lm")
        caption(d, "…but his money keeps growing!", CHART_STOP_T - S_CHART + 0.8, t, 400, 54, RAHUL, A*(1-ramp(t, 7.5)))
    pill(d, W/2, 1680, f"Age {int(age)}", 56, BG, WHITE, a)
    text(d, "Rahul " + inr(RS[n]), W/2-250, 1800, 50, RAHUL, a)
    text(d, "Amit " + inr(AS[n]), W/2+250, 1800, 50, AMIT, a)

def scene_result(d, t, A):
    # confetti
    ct = t - 2.3
    if ct > 0:
        for (x, y0, vx, vy, c, sp, sz) in CONF:
            x2 = x + vx*ct; y2 = y0 + vy*ct + 220*ct*ct
            if y2 > H + 40: continue
            ang = sp + ct*6; dx, dy = math.cos(ang)*sz, math.sin(ang)*sz*0.4
            d.polygon([(x2-dx, y2-dy), (x2+dy, y2-dx*0.5), (x2+dx, y2+dy), (x2-dy, y2+dx*0.5)], fill=mix(c, A))
    caption(d, "At 60…", 0.1, t, 300, 90, WHITE, A)
    for i, (nm, c, val, mood, x) in enumerate([("RAHUL", RAHUL, R60, "wow", W/2-240), ("AMIT", AMIT, A60, "sad", W/2+240)]):
        a = ramp(t, 0.3)*A
        cnt = ease(ramp(t, 0.6, 1.6))
        jump = abs(math.sin((t-2.3)*7))*40*(i == 0)*(t > 2.3)
        person(d, x, 1080, 1.0, c, a, t+i, mood if t > 2.3 else "neutral", jump=jump)
        text(d, nm, x, 1150, 50, c, a)
        sz = 76 if t < 2.3 or i else 76*(1 + 0.25*math.exp(-(t-2.3)*4))
        text(d, inr(val*cnt), x, 1260, sz, WHITE, a)
        hh = 380*(val/R60)*cnt
        d.rounded_rectangle([x-90, 1720-hh, x+90, 1720], radius=20, fill=mix(c, a))
    caption(d, "Rahul put in 2.5× LESS", 2.6, t, 460, 78, GOLD, A)
    caption(d, "but has 2.4× MORE", 3.3, t, 560, 84, RAHUL, A)

def scene_end(d, t, A):
    caption(d, "The secret isn't", 0.1, t, 560, 80, WHITE, A)
    caption(d, "how much you invest", 0.5, t, 660, 80, WHITE, A)
    a = ramp(t, 1.2, 0.2)*A; k = back(ramp(t, 1.2, 0.4))
    text(d, "It's WHEN.", W/2, 860, 160*(0.5+0.5*k), GOLD, a)
    ca = ramp(t, 1.6)*A
    cx, cy, r = W/2, 1170, 140
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=mix(WHITE, ca), width=10)
    for h in range(12):
        an = h*math.pi/6
        d.line([cx+math.sin(an)*112, cy-math.cos(an)*112, cx+math.sin(an)*126, cy-math.cos(an)*126], fill=mix(MUTED, ca), width=5)
    ang = math.floor(t*2)/2*math.pi*2/6*2
    d.line([cx, cy, cx+math.sin(ang)*105, cy-math.cos(ang)*105], fill=mix(GOLD, ca), width=10)
    d.line([cx, cy, cx+math.sin(ang/12)*65, cy-math.cos(ang/12)*65], fill=mix(WHITE, ca), width=12)
    pill(d, W/2, 1430, "Start today. Even small.", 62, BG, RAHUL, ramp(t, 2.4)*A)
    caption(d, "Comment \"START\" if you're in", 3.2, t, 1580, 56, GOLD, A)
    text(d, "Follow for more money stories", W/2, 1700, 46, WHITE, ramp(t, 4.0)*A, "Medium")
    text(d, "Illustrative: assumes 12% p.a., monthly compounding. Not financial advice.",
         W/2, 1860, 26, MUTED, ramp(t, 0.5)*A, "Regular")

CHART_STOP_T = S_CHART + 0.8 + 10*0.29  # when line passes age 35 (ease-in-out ~0.29)
# find exact time the chart reaches age 35
for f in range(0, 13*FPS):
    tt = f/FPS
    if 25 + int(ease(ramp(tt, 0.8, 10.0))*420)/12 >= 35:
        CHART_STOP_T = S_CHART + tt; break

SCENES = [(S_HOOK, S_RAHUL, scene_hook), (S_RAHUL, S_AMIT, scene_rahul), (S_AMIT, S_Q, scene_amit),
          (S_Q, S_CHART, scene_question), (S_CHART, S_RES, scene_chart), (S_RES, S_END, scene_result),
          (S_END, DUR, scene_end)]

def env_since(T, times, k):
    return sum(math.exp(-(T-ti)*k) for ti in times if T >= ti)

def render(T):
    im = bg.copy(); d = ImageDraw.Draw(im)
    for x, y, b in STARS:
        tw = 0.35 + 0.35*math.sin(T*2 + b*10); r = 2 + b*2
        d.ellipse([x-r, y-r, x+r, y+r], fill=mix(WHITE, tw*0.5, (20, 22, 45)))
    for s, e, fn in SCENES:
        if s <= T < e:
            lt = T - s
            A = min(1.0 if s == 0 else ramp(lt, 0, 0.25), clamp((e - T)/0.25))
            fn(d, lt, A)
    # camera: slow push-in per scene + impact punch + shake
    sc_start = max(s for s, e, fn in SCENES if s <= T)
    zoom = 1 + 0.025*clamp((T - sc_start)/9) + 0.07*env_since(T, IMPACTS, 9) + 0.035*env_since(T, PUNCHES, 12)
    sh = 22*env_since(T, IMPACTS, 10)
    ox, oy = math.sin(T*90)*sh, math.cos(T*77)*sh
    if zoom > 1.0005 or sh > 0.5:
        w2, h2 = W/zoom, H/zoom
        x0, y0 = (W-w2)/2 + ox, (H-h2)/2 + oy
        im = im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0+w2, y0+h2))
    fl = 0.7*math.exp(-(T-FLASH)*6) if T >= FLASH else 0
    if fl > 0.01: im = Image.blend(im, Image.new("RGB", (W, H), (255, 255, 255)), fl)
    ImageDraw.Draw(im).rectangle([0, H-10, W*T/DUR, H], fill=GOLD)
    return im

# ---------------- audio ----------------
SR = 44100
N = SR*DUR
mixL = np.zeros(N); mixR = np.zeros(N)
rng = np.random.default_rng(7)

def tarr(sec): return np.arange(int(sec*SR))/SR
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i+len(sig))
    if i >= N or j <= i: return
    s = sig[:j-i]*gain
    mixL[i:j] += s*(1-max(0, pan)); mixR[i:j] += s*(1+min(0, pan))
def lp(x, fc, order=2): b, a = butter(order, fc/(SR/2), "low"); return lfilter(b, a, x)
def hp(x, fc, order=2): b, a = butter(order, fc/(SR/2), "high"); return lfilter(b, a, x)

def sfx_pop(pitch=1.0):
    t = tarr(0.12); f = 900*pitch*np.exp(-t*25) + 250*pitch
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*30)
def sfx_whoosh(dur=0.45):
    t = tarr(dur); n = rng.standard_normal(len(t))
    env = np.sin(np.pi*t/dur)**2
    out = np.zeros_like(n); seg = len(n)//8
    for k in range(8):  # sweep filter upward
        fc = 300 + 3500*(k/7)**2
        out[k*seg:(k+1)*seg] = lp(n, fc)[k*seg:(k+1)*seg]
    return out*env*0.9
def sfx_clink(pitch=1.0):
    t = tarr(0.35)
    s = sum(a*np.sin(2*np.pi*f*pitch*t) for f, a in ((2350, 1), (3720, .6), (5310, .35)))
    return s*np.exp(-t*18)*0.35
def sfx_ding(f0=1318.5, dur=1.4):
    t = tarr(dur)
    return (np.sin(2*np.pi*f0*t) + .4*np.sin(2*np.pi*f0*2*t) + .2*np.sin(2*np.pi*f0*3.01*t))*np.exp(-t*3.2)*0.45
def sfx_boom():
    t = tarr(1.2); f = 40 + 110*np.exp(-t*7)
    body = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*3.5)
    nz = lp(rng.standard_normal(len(t)), 900)*np.exp(-t*9)*0.8
    return np.tanh((body + nz)*1.6)*0.9
def sfx_fail():
    out = []
    for f, d_ in ((392, .16), (370, .16), (349, .16), (330, .45)):
        t = tarr(d_); sq = np.sign(np.sin(2*np.pi*f*t*(1 - 0.02*t/d_)))
        out.append(lp(sq, 1800)*np.minimum(1, (d_-t)*30)*0.28)
    return np.concatenate(out)
def sfx_tick():
    t = tarr(0.03); return hp(rng.standard_normal(len(t)), 3000)*np.exp(-t*250)*0.5
def sfx_beep(f):
    t = tarr(0.22); return np.sin(2*np.pi*f*t)*np.minimum(1, (0.22-t)*40)*np.minimum(1, t*400)*0.4
def sfx_riser(dur):
    t = tarr(dur); f = 200 + 900*(t/dur)**2
    tone = np.sin(2*np.pi*np.cumsum(f)/SR)*0.25
    nz = hp(rng.standard_normal(len(t)), 2000)*0.15
    return (tone + nz)*(t/dur)**1.5
def sfx_kaching():
    return np.concatenate([sfx_clink(1.0)[:3000]*1.5, sfx_ding(1760, 1.2)])

# --- music bed: 96 bpm lo-fi ---
BPM = 96; beat = 60/BPM
def note(m): return 440*2**((m-69)/12)
CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]  # Am7 Fmaj7 Cmaj7 G7
music = np.zeros(N)
bar = beat*4
t_all = np.arange(N)/SR
for ci in range(int(DUR/(bar*2))+1):
    ch = CHORDS[ci % 4]; st = ci*bar*2; ln = bar*2
    i0 = int(st*SR); i1 = min(N, int((st+ln)*SR))
    if i0 >= N: break
    tt = t_all[i0:i1] - st
    envp = np.minimum(1, tt/0.4)*np.minimum(1, (ln-tt)/0.3)
    pad = sum(np.sin(2*np.pi*note(m)*tt) + 0.5*np.sin(2*np.pi*note(m)*1.003*tt) for m in ch)
    music[i0:i1] += pad*envp*0.05
    # bass on each beat
    for b in range(8):
        bs = st + b*beat; j0 = int(bs*SR); j1 = min(N, int((bs+beat)*SR))
        if j0 >= N: break
        tb = t_all[j0:j1] - bs
        music[j0:j1] += np.sin(2*np.pi*note(ch[0]-12)*tb)*np.exp(-tb*3)*0.22
kick_t = tarr(0.35); kick = np.sin(2*np.pi*np.cumsum(50 + 100*np.exp(-kick_t*30))/SR)*np.exp(-kick_t*9)
hat_t = tarr(0.06); hat = hp(rng.standard_normal(len(hat_t)), 7000)*np.exp(-hat_t*70)
nb = int(DUR/beat)+1
for b in range(nb):
    bs = b*beat
    def addm(sig, at, g):
        i = int(at*SR); j = min(N, i+len(sig))
        if i < N: music[i:j] += sig[:j-i]*g
    if b % 2 == 0: addm(kick, bs, 0.55)
    if b % 4 == 2: addm(lp(rng.standard_normal(4000), 2500)*np.exp(-np.arange(4000)/SR*30), bs, 0.25)  # soft snare
    addm(hat, bs + beat/2, 0.12)
music = lp(music, 4200)
# music dynamics: duck at drops/suspense
gain = np.ones(N)*0.55
def seg(a, b, g):
    gain[int(a*SR):int(b*SR)] = g
seg(S_Q+4.9, S_Q+8.0, 0.18)          # countdown suspense
seg(S_RES+1.9, S_RES+2.3, 0.0)        # drop before result
seg(S_RES+2.3, S_RES+3.0, 0.8)
gain = np.convolve(gain, np.ones(2000)/2000, mode="same")
mixL += music*gain; mixR += music*gain

# --- SFX timeline ---
place(sfx_boom(), 0.0, 0.9)
place(sfx_whoosh(0.35), 0.0, 0.6)
place(sfx_pop(1.2), 0.8, 0.7)
place(sfx_whoosh(0.5), 1.35, 0.6, -0.5); place(sfx_whoosh(0.5), 1.4, 0.6, 0.5)
place(sfx_pop(0.8), 2.1, 0.9)
for s in (S_RAHUL, S_AMIT, S_Q, S_CHART, S_RES, S_END):
    place(sfx_whoosh(0.4), s - 0.15, 0.7)
for s in (S_RAHUL, S_AMIT):
    place(sfx_pop(1.0), s + 0.15, 0.6); place(sfx_pop(1.3), s + 0.7, 0.7)
    for i, lt in enumerate(coin_landings(s, 1.2, 6.0)):
        place(sfx_clink(0.9 + 0.25*((i*7) % 5)/5), lt, 0.55, ((i % 3)-1)*0.3)
place(sfx_fail(), S_RAHUL + 7.4, 0.9)
place(sfx_ding(), S_AMIT + 7.4, 0.8)
place(sfx_pop(1.0), S_Q + 0.15, 0.6)
place(sfx_pop(1.1), S_Q + 0.8, 0.7, -0.4); place(sfx_pop(1.25), S_Q + 1.3, 0.7, 0.4)
place(sfx_pop(1.4), S_Q + 2.4, 0.8)
place(sfx_pop(1.0), S_Q + 3.4, 0.5)
place(sfx_beep(880), S_Q + 5, 0.8); place(sfx_beep(880), S_Q + 6, 0.8); place(sfx_beep(1320), S_Q + 7, 0.9)
place(sfx_pop(1.0), S_CHART + 0.15, 0.6)
place(sfx_riser(10.0), S_CHART + 0.8, 0.55)
for k in range(40):
    place(sfx_tick(), S_CHART + 0.8 + k*0.25, 0.35)
place(sfx_fail()[:int(0.35*SR)], CHART_STOP_T, 0.6)
place(sfx_ding(1568), CHART_STOP_T + 0.8, 0.6)
place(sfx_pop(1.0), S_RES + 0.1, 0.6)
for k in range(16):  # counting ticks
    place(sfx_tick(), S_RES + 0.6 + k*0.1, 0.5)
place(sfx_boom(), FLASH, 1.0)
place(sfx_kaching(), FLASH + 0.05, 0.9)
place(sfx_pop(1.3), S_RES + 2.6, 0.7); place(sfx_ding(1760, 1.0), S_RES + 3.3, 0.7)
place(sfx_pop(1.0), S_END + 0.1, 0.5); place(sfx_pop(1.1), S_END + 0.5, 0.5)
place(sfx_boom(), S_END + 1.2, 0.8)
for k in range(int((DUR - S_END - 1.6)*2)):
    place(sfx_tick(), S_END + 1.6 + k*0.5, 0.45)
place(sfx_pop(1.2), S_END + 2.4, 0.7)
place(sfx_ding(), S_END + 3.2, 0.6)

st = np.stack([mixL, mixR], 1)
st[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]
st = np.tanh(st*1.1); st = st/np.max(np.abs(st))*0.89
with wave.open("audio.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st*32767).astype(np.int16).tobytes())

if PREVIEW:
    for tt in PREVIEW: render(tt).save(f"p2_{tt:05.2f}.png")
    sys.exit()

ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                       "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", "audio.wav",
                       "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                       "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT],
                      stdin=subprocess.PIPE)
for f in range(DUR*FPS):
    ff.stdin.write(render(f/FPS).tobytes())
ff.stdin.close(); ff.wait()
print("done", CHART_STOP_T)
