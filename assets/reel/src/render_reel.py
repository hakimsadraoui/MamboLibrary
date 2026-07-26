"""COLORA · Blue Edition — beat-synced vertical smash reel (fully local render)."""
import os, sys, math, random
from colora import *
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

FPS = 30
BPM = 125
random.seed(7); np.random.seed(7)

# ---- scene timeline (start frame, length) ----
SC = [
    ("logo",   0,   150),
    ("salsa",  150,  66),
    ("couple", 216, 150),
    ("blue",   366,  63),
    ("details",429, 186),
    ("dress",  615, 105),
    ("promo",  720, 120),
    ("outro",  840, 210),
]
TOTAL = SC[-1][1] + SC[-1][2]  # 1050
BOUNDS = [s for _, s, _ in SC][1:]  # cut frames

# ---------- cached bases ----------
def _vbase(v, strength):
    return vignette(base_canvas(v), strength)
BASE = {
    "paint":  _vbase("paint", 0.52),
    "paint2": _vbase("paint2", 0.66),
    "stitch": _vbase("stitch", 0.5),
}
# cobalt splatter additive layer for flash cuts
_spl = np.asarray(cover(L("bg_paint2")).convert("RGB"), np.float32)
_b = _spl[..., 2]; _mask = np.clip((_b - 60) / 160, 0, 1)
SPLAT = np.zeros_like(_spl); SPLAT[..., 2] = _mask * 255; SPLAT[..., 0] = _mask * 40

# ---------- layer cache ----------
LC = {}
def lay(name):
    if name not in LC:
        LC[name] = L(name)
    return LC[name]

def place(canvas, layer, cx, cy, scale=1.0, alpha=1.0, blur=0, rot=0.0, gl=None, glr=26, gls=1.0):
    ly = layer
    if scale != 1.0:
        ly = ly.resize((max(1, int(ly.width*scale)), max(1, int(ly.height*scale))), Image.LANCZOS)
    if rot:
        ly = ly.rotate(rot, expand=True, resample=Image.BICUBIC)
    if blur >= 2:
        ly = motion_blur(ly, blur, 90)
    if alpha < 1.0:
        a = ly.split()[3].point(lambda p: int(p*alpha)); ly.putalpha(a)
    if gl is not None:
        g = glow(ly, gl, glr, gls)
        canvas.alpha_composite(g, (int(cx-g.width/2), int(cy-g.height/2)))
    canvas.alpha_composite(ly, (int(cx-ly.width/2), int(cy-ly.height/2)))
    return canvas

def slam(canvas, layer, cx, cy, lf, start, base_scale, dur=8, fs=1.26, fdy=46, **kw):
    """Slam a layer in over `dur` frames starting at `start`."""
    if lf < start:
        return canvas
    t = min(1.0, (lf-start)/dur)
    e = ease_out(t)
    sc = base_scale * (fs + (1-fs)*e)
    dy = fdy*(1-e)
    al = min(1.0, t*1.6)
    bl = int(38*(1-e))
    return place(canvas, layer, cx, cy+dy, sc, al, bl, **kw)

# ================= SCENES =================
def sc_logo(lf, n):
    z = 1.14 - 0.14*ease_io(min(1, lf/n))          # slow push in
    c = push_crop(BASE["paint"], z).convert("RGBA")
    cx, cy = W/2, H*0.44
    # pulse draws in (reveal L->R) 0..26
    pulse = lay("logo_pulse")
    pw = fit_width_keep(pulse, 0.80)
    if lf < 30:
        rv = min(1.0, lf/26)
        pw = reveal_lr(pw, rv)
        place(c, pw, cx, cy, gl=CREAM, glr=22, gls=0.5*rv)
    else:
        place(c, pw, cx, cy, gl=CREAM, glr=22, gls=0.5+0.3*beat_pulse(lf,FPS,BPM))
    # wordmark slams at f30
    word = fit_width_keep(lay("logo_word"), 0.80)
    slam(c, word, cx, cy, lf, 30, 1.0, dur=9, gl=CREAM, glr=30, gls=0.45)
    # script rises at f52
    scr = fit_width_keep(lay("logo_script"), 0.80)
    if lf >= 52:
        t = min(1, (lf-52)/16); e = ease_out(t)
        place(c, scr, cx, cy+18*(1-e), 1.0, min(1, t*1.4))
    # light sweep across logo 80..120
    if 80 <= lf <= 122:
        p = (lf-80)/42
        c = screen_add(c, light_sweep((W, H), p*1.2-0.1, 0.16, 22, CREAM, 130)).convert("RGBA")
    return c

def sc_salsa(lf, n):
    z = 1.10 - 0.10*ease_out(min(1, lf/n))
    c = push_crop(BASE["stitch"], z).convert("RGBA")
    sb = fit_width_keep(lay("salsa_bachata"), 0.86)
    slam(c, sb, W/2, H*0.47, lf, 0, 1.0, dur=8, gl=BLUE, glr=16, gls=0.3)
    if 20 <= lf <= 50:
        c = screen_add(c, light_sweep((W, H), (lf-20)/30, 0.14, 18, (120,170,255), 90)).convert("RGBA")
    return c

def sc_couple(lf, n):
    t = lf/n
    z = 1.02 + 0.20*ease_io(t)                       # push in
    wob = math.sin(lf*0.5)*0.012                     # dance sway
    beat = beat_pulse(lf, FPS, BPM)
    z += beat*0.02
    couple = lay("couple").convert("RGB")
    cbig = fit_width_keep(couple.convert("RGBA"), 1.30).convert("RGB")
    photo = push_crop(cbig, z, dx=wob*6, dy=-0.05).convert("RGB")
    # feather into navy
    c = BASE["paint2"].copy().convert("RGBA")
    mask = Image.new("L", photo.size, 0)
    d = ImageDraw.Draw(mask); fe=110
    d.rectangle([fe, fe, photo.width-fe, photo.height-fe], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(fe*0.7))
    ph = photo.convert("RGBA"); ph.putalpha(mask)
    c.alpha_composite(ph, (int(W/2-ph.width/2), int(H*0.52-ph.height/2)))
    # blue shimmer on skirt
    c = screen_add(c, isolate_blue(photo, 0.5+0.9*beat)).convert("RGBA")
    # sweeping cobalt ray
    p = (lf % 60)/60
    c = screen_add(c, light_sweep((W, H), p, 0.10, 24, (90,150,255), 70)).convert("RGBA")
    return c

def sc_blue(lf, n):
    c = BASE["paint"].copy().convert("RGBA")
    be = fit_width_keep(lay("blue_edition"), 0.62)
    # stamp bounce
    t = min(1, lf/10)
    over = 1.0 + 0.18*math.exp(-t*6)*math.cos(t*10)  # settle bounce
    sc = over if lf < 16 else 1.0
    al = min(1, (lf+1.5)/4)
    place(c, be, W/2, H*0.46, sc, al, gl=BLUE, glr=26, gls=0.8+0.5*beat_pulse(lf,FPS,BPM))
    # arc sweep
    if 6 <= lf <= 40:
        c = screen_add(c, light_sweep((W, H), (lf-6)/34, 0.12, 20, (140,180,255), 110)).convert("RGBA")
    dc = fit_width_keep(lay("touch_blue"), 0.80)
    slam(c, dc, W/2, H*0.60, lf, 14, 1.0, dur=8)
    return c

def sc_details(lf, n):
    z = 1.08 - 0.08*ease_out(min(1, lf/n*1.4))
    c = push_crop(BASE["stitch"], z).convert("RGBA")
    day = fit_width_keep(lay("day"), 0.60)
    cls = fit_width_keep(lay("class_pm"), 0.40)
    soc = fit_width_keep(lay("social_pm"), 0.40)
    ven = fit_width_keep(lay("venue"), 0.72)
    slam(c, day, W/2, H*0.28, lf, 0, 1.0, dur=8)
    # class / social slam in, side by side
    slam(c, cls, W*0.30, H*0.46, lf, 22, 1.0, dur=8, gl=BLUE, glr=12, gls=0.25)
    slam(c, soc, W*0.70, H*0.46, lf, 34, 1.0, dur=8, gl=BLUE, glr=12, gls=0.25)
    # divider draws between them
    if lf >= 30:
        dv = min(1, (lf-30)/16)
        dd = ImageDraw.Draw(c)
        x=W*0.5; y0=H*0.42; y1=y0+(H*0.09)*ease_out(dv)
        dd.line([(x,y0),(x,y1)], fill=BLUE+(255,), width=5)
    slam(c, ven, W/2, H*0.66, lf, 52, 1.0, dur=9)
    if 70 <= lf <= 110:
        c = screen_add(c, light_sweep((W, H), (lf-70)/40, 0.13, 18, (120,160,255), 80)).convert("RGBA")
    return c

def sc_dress(lf, n):
    c = BASE["paint"].copy().convert("RGBA")
    dr = fit_width_keep(lay("dress_code"), 0.62)
    t = min(1, lf/10); over = 1.0 + 0.16*math.exp(-t*6)*math.cos(t*10)
    sc = over if lf < 16 else 1.0
    place(c, dr, W/2, H*0.44, sc, min(1, (lf+1.5)/4), gl=BLUE, glr=24, gls=0.7+0.4*beat_pulse(lf,FPS,BPM))
    tb = fit_width_keep(lay("touch_blue"), 0.82)
    slam(c, tb, W/2, H*0.58, lf, 16, 1.0, dur=8)
    if 8 <= lf <= 40:
        c = screen_add(c, light_sweep((W, H), (lf-8)/32, 0.12, 20, (140,180,255), 100)).convert("RGBA")
    return c

def sc_promo(lf, n):
    z = 1.08 - 0.08*ease_out(min(1, lf/n*1.5))
    c = push_crop(BASE["paint2"], z).convert("RGBA")
    pr = fit_width_keep(lay("promo"), 0.86)
    slam(c, pr, W/2, H*0.40, lf, 0, 1.0, dur=8)
    cb = fit_width_keep(lay("code_badge"), 0.70)
    # rubber-stamp: slam + dust glow flash
    slam(c, cb, W/2, H*0.60, lf, 30, 1.0, dur=7, gl=BLUE, glr=28, gls=0.6+0.6*beat_pulse(lf,FPS,BPM))
    if 30 <= lf <= 44:
        c = screen_add(c, light_sweep((W, H), (lf-30)/14, 0.10, 22, (150,190,255), 120)).convert("RGBA")
    return c

def sc_outro(lf, n):
    z = 1.10 - 0.10*ease_out(min(1, lf/70))
    c = push_crop(BASE["paint"], z).convert("RGBA")
    cx = W/2
    # logo reforms: pulse+word+script fade/scale from paint
    logo = fit_width_keep(lay("logo_clean"), 0.76)
    t = min(1, lf/26); e = ease_out(t)
    place(c, logo, cx, H*0.32, 1.0+0.06*(1-e), min(1, (lf+2)/16), int(30*(1-e)),
          gl=CREAM, glr=30, gls=0.4+0.25*beat_pulse(lf,FPS,BPM))
    be = fit_width_keep(lay("blue_edition"), 0.5)
    slam(c, be, cx, H*0.485, lf, 30, 1.0, dur=8, gl=BLUE, glr=22, gls=0.8)
    bar = fit_width_keep(lay("bar_dcs"), 0.88)
    slam(c, bar, cx, H*0.60, lf, 44, 1.0, dur=9)
    ven = fit_width_keep(lay("venue"), 0.72)
    slam(c, ven, cx, H*0.685, lf, 58, 1.0, dur=9)
    tb = fit_width_keep(lay("touch_blue"), 0.78)
    if lf >= 74:
        place(c, tb, cx, H*0.82, 1.0, min(1,(lf-74)/12))
    # final light sweep + hold glow
    if 90 <= lf <= 140:
        c = screen_add(c, light_sweep((W, H), (lf-90)/50, 0.15, 22, CREAM, 120)).convert("RGBA")
    return c

SCENES = dict(logo=sc_logo, salsa=sc_salsa, couple=sc_couple, blue=sc_blue,
              details=sc_details, dress=sc_dress, promo=sc_promo, outro=sc_outro)

# ---------- helpers used above ----------
def fit_width_keep(layer, frac):
    tw = int(W*frac); s = tw/layer.width
    return layer.resize((tw, int(layer.height*s)), Image.LANCZOS)

def reveal_lr(layer, prog):
    a = np.asarray(layer).copy()
    w = a.shape[1]; cut = int(w*prog)
    a[:, cut:, 3] = 0
    return Image.fromarray(a, "RGBA")

# ---------- impact frames for shake ----------
IMPACTS = [30, 150, 180, 216, 366, 429, 451, 481, 615, 720, 750, 840, 884]

def flash_overlay(f):
    """Cobalt paint flash at scene boundaries."""
    for b in BOUNDS:
        d = f - b
        if -2 <= d <= 6:
            inten = math.exp(-max(0, d)/2.5) * (0.6 if d < 0 else 1.0)
            return SPLAT * inten * 0.9
    return None

def render_frame(f):
    name, start, n = next(s for s in reversed(SC) if f >= s[1])
    lf = f - start
    img = SCENES[name](lf, n)
    # camera shake
    dx, dy = shake(f, IMPACTS, decay=6, amp=22)
    if abs(dx) > 0.5 or abs(dy) > 0.5:
        img = ImageChops.offset(img.convert("RGBA"), int(dx), int(dy))
    img = img.convert("RGB")
    # boundary flash (cobalt splatter) + full-frame cut wash
    fo = flash_overlay(f)
    if fo is not None:
        img = screen_add(img, fo)
    for b in BOUNDS:
        d = f - b
        if -1 <= d <= 3:
            inten = math.exp(-max(0, d)/1.4) * (0.5 if d < 0 else 1.0)
            wash = np.zeros((H, W, 3), np.float32)
            wash[..., 2] = 150*inten; wash[..., 0] = 60*inten; wash[..., 1] = 70*inten
            img = screen_add(img, wash)
            break
    # grade + grain
    img = grade(img)
    img = add_grain(img, 4)
    return img

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    os.makedirs("frames", exist_ok=True)
    if mode == "test":
        picks = [12, 40, 100, 175, 290, 400, 500, 660, 780, 900, 1000, 1040]
        tiles = []
        for f in picks:
            im = render_frame(f); im.thumbnail((300, 540)); tiles.append((f, im))
        cols = 6; tw, th = 300, 560
        grid = Image.new("RGB", (cols*tw, ((len(tiles)+cols-1)//cols)*th), (18,18,24))
        dd = ImageDraw.Draw(grid)
        for i,(f,im) in enumerate(tiles):
            gx=(i%cols)*tw+(tw-im.width)//2; gy=(i//cols)*th
            grid.paste(im,(gx,gy)); dd.text(((i%cols)*tw+6,(i//cols)*th+th-18),f"f{f}",fill=(255,220,120))
        grid.save("frames/_contact.png"); print("contact sheet saved")
    elif mode == "range":
        a, b = int(sys.argv[2]), int(sys.argv[3])
        for f in range(max(0, a), min(TOTAL, b)):
            render_frame(f).save(f"frames/f{f:04d}.png")
        print("re-rendered", a, "to", b)
    else:
        import time
        t0=time.time()
        for f in range(TOTAL):
            render_frame(f).save(f"frames/f{f:04d}.png")
            if f % 60 == 0:
                print(f"  frame {f}/{TOTAL}  {time.time()-t0:.0f}s", flush=True)
        print("done", TOTAL, "frames", f"{time.time()-t0:.0f}s")
