"""Synth a ~125 BPM Latin smash-reel bed: clave + kick + sub-bass + shaker + risers/impacts."""
import numpy as np, wave, struct

SR = 44100
BPM = 125
DUR = 35.0
beat = 60.0 / BPM          # 0.48s
N = int(SR * DUR)
t = np.arange(N) / SR
mix = np.zeros(N)

def env(a, d, s, length, sus=0.0):
    e = np.zeros(int(length*SR))
    ai, di = int(a*SR), int(d*SR)
    if ai: e[:ai] = np.linspace(0,1,ai)
    if di: e[ai:ai+di] = np.linspace(1,sus,di)
    e[ai+di:] = sus
    return e

def add(sig, at):
    i = int(at*SR)
    j = min(N, i+len(sig))
    mix[i:j] += sig[:j-i]

def kick(length=0.32, f0=125, f1=45):
    n=int(length*SR); x=np.arange(n)/SR
    f=f1+(f0-f1)*np.exp(-x*22)
    ph=2*np.pi*np.cumsum(f)/SR
    e=np.exp(-x*7.5)
    return 0.9*np.sin(ph)*e

def sub(length, f=55):
    n=int(length*SR); x=np.arange(n)/SR
    e=np.minimum(1,np.exp(-x*1.2))*np.minimum(1,x*40)
    return 0.5*np.sin(2*np.pi*f*x)*e

def clave(length=0.09, f=2300):
    n=int(length*SR); x=np.arange(n)/SR
    e=np.exp(-x*55)
    return 0.5*(np.sin(2*np.pi*f*x)+0.5*np.sin(2*np.pi*f*1.5*x))*e

def shaker(length=0.06, seed=0):
    rng=np.random.default_rng(seed)
    n=int(length*SR); x=np.arange(n)/SR
    noise=rng.normal(0,1,n)
    # highpass-ish by differencing
    noise=np.diff(noise,prepend=noise[0])
    e=np.exp(-x*45)*np.minimum(1,x*400)
    return 0.22*noise*e

def riser(length, seed=1):
    rng=np.random.default_rng(seed)
    n=int(length*SR); x=np.arange(n)/SR
    noise=rng.normal(0,1,n)
    f=200+1800*(x/length)**2
    ph=2*np.pi*np.cumsum(f)/SR
    tone=np.sin(ph)
    e=(x/length)**2
    sw=noise*np.diff(noise,prepend=noise[0])
    return 0.28*(0.6*tone+0.4*sw)*e

def impact(length=0.6):
    n=int(length*SR); x=np.arange(n)/SR
    rng=np.random.default_rng(9)
    noise=rng.normal(0,1,n)*np.exp(-x*8)
    boom=np.sin(2*np.pi*(70*np.exp(-x*6))*x)*np.exp(-x*4)
    return 0.7*(0.5*noise+boom)

# ---- groove: 35s ----
nbeats = int(DUR/beat)+2
for b in range(nbeats):
    tb = b*beat
    if tb>DUR: break
    # kick on beats 1 and 3 of each bar (4/4)
    if b%2==0: add(kick(), tb); add(sub(0.5), tb)
    # shaker every eighth
    add(shaker(seed=b), tb)
    add(shaker(0.05,seed=b*7+3), tb+beat/2)
    # son clave 3-2 pattern across 2 bars (positions in eighths): 0,3,6,10,12
    pass

# son clave (3-2) over a 2-bar (8-beat) cycle, eighth positions:
clave_eighths=[0,3,6,10,12]  # within 16 eighths (2 bars)
eighth=beat/2
cycle=16*eighth
tstart=0.0
while tstart<DUR:
    for e8 in clave_eighths:
        add(clave(), tstart+e8*eighth)
    tstart+=cycle

# scene-cut impacts + risers (times in seconds matching render cuts)
cuts=[5.0,7.2,12.2,14.3,20.5,24.0,28.0]
for ct in cuts:
    add(impact(0.5), ct)
    add(riser(0.9, seed=int(ct*10)), max(0,ct-0.9))
# opening downbeat impact + final
add(impact(0.7), 0.02)
add(riser(1.2,seed=99), 33.6); add(impact(0.8), 34.6-0.0)

# ---- master: soft clip + fades ----
mix *= 0.9
mix = np.tanh(mix*1.1)
# 30ms fade in/out
fi=int(0.03*SR); fo=int(0.25*SR)
mix[:fi]*=np.linspace(0,1,fi); mix[-fo:]*=np.linspace(1,0,fo)
mix/=max(1e-6,np.max(np.abs(mix))); mix*=0.94

# stereo
st=np.stack([mix,mix],1)
pcm=(st*32767).astype(np.int16)
with wave.open("beat.wav","w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("beat.wav written", DUR,"s")
