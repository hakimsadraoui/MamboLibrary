"""Shared helpers for the COLORA Blue Edition smash reel."""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
import numpy as np

W, H = 1080, 1920
NAVY   = (10, 14, 26)      # #0A0E1A base
BLUE   = (0, 104, 248)     # #0068F8 electric cobalt
CREAM  = (240, 232, 216)   # #F0E8D8
HERE = os.path.dirname(os.path.abspath(__file__))
LAY = os.path.join(HERE, "layers")

def L(name):
    """Load a rendered layer as RGBA."""
    return Image.open(os.path.join(LAY, name + ".png")).convert("RGBA")

def cover(img, w=W, h=H):
    """Scale to cover w×h, center-crop."""
    img = img.convert("RGB")
    s = max(w / img.width, h / img.height)
    nw, nh = int(round(img.width * s)), int(round(img.height * s))
    img = img.resize((nw, nh), Image.LANCZOS)
    x, y = (nw - w) // 2, (nh - h) // 2
    return img.crop((x, y, x + w, y + h))

def base_canvas(variant="paint"):
    """Full-bleed navy + cobalt-paint background at 1080x1920."""
    src = {"paint": "bg_paint", "paint2": "bg_paint2", "stitch": "bg_stitch"}[variant]
    bg = L(src)
    navy = Image.new("RGB", (W, H), NAVY)
    cov = cover(bg)
    # multiply-ish darken toward navy edges for depth
    return cov

def vignette(img, strength=0.55):
    v = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(v)
    d.ellipse([-W*0.35, -H*0.18, W*1.35, H*1.18], fill=255)
    v = v.filter(ImageFilter.GaussianBlur(240))
    dark = Image.new("RGB", (W, H), (2, 4, 10))
    return Image.composite(img, dark, v.point(lambda p: int(255 - (255-p)*strength)))

def paste_c(canvas, layer, cx, cy, scale=1.0, alpha=1.0, rot=0.0):
    """Paste RGBA layer centered at (cx,cy) with scale/alpha/rotation."""
    ly = layer
    if scale != 1.0:
        ly = ly.resize((max(1,int(ly.width*scale)), max(1,int(ly.height*scale))), Image.LANCZOS)
    if rot:
        ly = ly.rotate(rot, expand=True, resample=Image.BICUBIC)
    if alpha < 1.0:
        a = ly.split()[3].point(lambda p: int(p*alpha))
        ly.putalpha(a)
    x, y = int(cx - ly.width/2), int(cy - ly.height/2)
    canvas.alpha_composite(ly, (x, y))
    return canvas

def fit_width(layer, target_w):
    s = target_w / layer.width
    return layer.resize((int(layer.width*s), int(layer.height*s)), Image.LANCZOS)

def glow(layer, color=BLUE, radius=28, strength=1.4):
    """Return a colored glow image (RGBA) from a layer's alpha."""
    a = layer.split()[3]
    g = Image.new("RGBA", layer.size, color + (0,))
    ga = a.filter(ImageFilter.GaussianBlur(radius)).point(lambda p: int(min(255, p*strength)))
    g.putalpha(ga)
    return g

def add_grain(img, amount=6):
    arr = np.asarray(img.convert("RGB")).astype(np.int16)
    n = np.random.normal(0, amount, arr.shape[:2])[..., None]
    arr = np.clip(arr + n, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def grade(img):
    """Consistent cobalt/contrast grade."""
    img = img.convert("RGB")
    # lift contrast
    img = ImageEnhance.Contrast(img).enhance(1.12)
    img = ImageEnhance.Color(img).enhance(1.14)
    arr = np.asarray(img).astype(np.float32)
    # cobalt push in shadows, warm-cream in highlights
    lum = arr.mean(2, keepdims=True) / 255.0
    shadow = (1 - lum)
    arr[..., 2] += shadow[..., 0] * 22      # blue up in shadows
    arr[..., 0] += (lum[..., 0]) * 6        # slight warm highs
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def ease_out(t):  # cubic
    return 1 - (1 - t) ** 3
def ease_in(t):
    return t ** 3
def ease_io(t):
    return 3*t*t - 2*t*t*t
def smooth(t):
    return t*t*(3-2*t)

def key_black(layer, thr=34):
    """Make near-black opaque pixels transparent (removes baked black boxes)."""
    import numpy as np
    arr = np.asarray(layer.convert("RGBA")).copy()
    dark = arr[..., :3].max(2) < thr
    arr[..., 3] = np.where(dark, 0, arr[..., 3])
    return Image.fromarray(arr)

def feather_into(canvas, photo, cx, cy, feather=90):
    """Composite a rectangular photo with feathered edges onto canvas (RGBA)."""
    import numpy as np
    p = photo.convert("RGB")
    mask = Image.new("L", p.size, 0)
    d = ImageDraw.Draw(mask)
    d.rectangle([feather, feather, p.width-feather, p.height-feather], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather*0.7))
    rgba = p.convert("RGBA"); rgba.putalpha(mask)
    paste_c(canvas, rgba, cx, cy)
    return canvas

# ============================================================
#  MOTION-GRAPHICS EFFECTS
# ============================================================
import math, random

def push_crop(img, zoom, dx=0.0, dy=0.0, out=(W, H)):
    """Ken-Burns: sample a zoomed window of img (already out-sized) with pan.
    zoom>=1. dx,dy in fraction of extra margin (-1..1)."""
    ow, oh = out
    zw, zh = int(ow * zoom), int(oh * zoom)
    big = img.resize((zw, zh), Image.LANCZOS)
    maxx, maxy = zw - ow, zh - oh
    x = int(maxx * (0.5 + dx * 0.5))
    y = int(maxy * (0.5 + dy * 0.5))
    x = max(0, min(maxx, x)); y = max(0, min(maxy, y))
    return big.crop((x, y, x + ow, y + oh))

def motion_blur(img, px, angle=90):
    """Approximate directional motion blur by stacking shifted copies."""
    px = int(px)
    if px < 2:
        return img
    rgba = img.convert("RGBA")
    acc = np.zeros((rgba.height, rgba.width, 4), np.float32)
    n = max(3, px // 2)
    rad = math.radians(angle)
    for i in range(n):
        t = (i / (n - 1) - 0.5) * px
        ox, oy = int(math.cos(rad) * t), int(math.sin(rad) * t)
        sh = ImageChops.offset(rgba, ox, oy)
        acc += np.asarray(sh, np.float32)
    acc /= n
    return Image.fromarray(acc.astype(np.uint8), "RGBA")

def light_sweep(size, pos, width=0.22, angle=20, color=(255, 250, 235), strength=140):
    """Diagonal bright band as an additive RGB layer. pos in 0..1 sweeps across."""
    w, h = size
    xs = np.linspace(0, 1, w)[None, :]
    ys = np.linspace(0, 1, h)[:, None]
    ang = math.radians(angle)
    coord = (xs - 0.5) * math.cos(ang) + (ys - 0.5) * math.sin(ang) + 0.5
    band = np.exp(-((coord - pos) ** 2) / (2 * (width / 2.5) ** 2))
    layer = np.zeros((h, w, 3), np.float32)
    for c in range(3):
        layer[..., c] = band * (color[c] / 255.0) * strength
    return layer  # add to an RGB float array

def screen_add(base_rgb, add_float):
    """Add an additive float layer (0..255-ish) to an RGB image, clipped."""
    arr = np.asarray(base_rgb.convert("RGB"), np.float32) + add_float
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def shake(f, impacts, decay=7.0, amp=26):
    """Return (dx,dy) camera shake that spikes at impact frames and decays."""
    dx = dy = 0.0
    for imf in impacts:
        if f >= imf:
            e = math.exp(-(f - imf) / decay)
            ph = (f - imf)
            dx += math.sin(ph * 2.3) * amp * e
            dy += math.cos(ph * 1.9) * amp * e
    return dx, dy

def paint_wipe_frame(prog, feather=0.16, angle=18, invert=False):
    """Luminance wipe mask (L image) sweeping left->right for transitions."""
    xs = np.linspace(0, 1, W)[None, :]
    ys = np.linspace(0, 1, H)[:, None]
    ang = math.radians(angle)
    coord = xs * math.cos(ang) + ys * math.sin(ang)
    coord = (coord - coord.min()) / (coord.max() - coord.min())
    edge = prog * (1 + feather) - feather
    m = np.clip((coord - edge) / feather, 0, 1)
    if invert:
        m = 1 - m
    # add paint-texture jitter to the wipe edge
    return Image.fromarray(((1 - m) * 255).astype(np.uint8), "L")

def beat_pulse(f, fps, bpm, phase=0.0, depth=1.0):
    """0..1 pulse that peaks on each beat."""
    beat = 60.0 / bpm * fps
    x = ((f - phase) % beat) / beat
    return (math.cos(x * 2 * math.pi) * 0.5 + 0.5) ** 2 * depth

def isolate_blue(img, boost=1.0):
    """Return an additive glow float layer emphasizing cobalt-blue regions."""
    arr = np.asarray(img.convert("RGB"), np.float32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mask = np.clip((b - (r + g) * 0.5) / 120.0, 0, 1) * np.clip(b / 255.0, 0, 1)
    out = np.zeros_like(arr)
    out[..., 2] = mask * 120 * boost
    out[..., 0] = mask * 10 * boost
    return out
