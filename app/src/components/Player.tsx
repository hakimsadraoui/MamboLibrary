import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {Step} from '../lib/data';
import {getPrefs, getResume, setPref, setResume} from '../lib/store';

const SPEEDS = [0.5, 0.75, 1, 1.25];

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const Player: React.FC<{step: Step}> = ({step}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefs = useRef(getPrefs());
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(step.durationSeconds || 0);
  const [speed, setSpeed] = useState(prefs.current.speed);
  const [mirror, setMirror] = useState(prefs.current.mirror);
  const [captionsOn, setCaptionsOn] = useState(prefs.current.captions);
  const [showCounts, setShowCounts] = useState(prefs.current.showCounts);
  const [loopClip, setLoopClip] = useState(false);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);

  const video = () => videoRef.current;

  // Resume position
  useEffect(() => {
    const v = video();
    if (!v) return;
    const resume = getResume(step.id);
    if (resume > 2 && resume < (step.durationSeconds || Infinity) - 3) {
      v.currentTime = resume;
    }
  }, [step.id, step.durationSeconds]);

  // Persist position every few seconds
  useEffect(() => {
    const t = setInterval(() => {
      const v = video();
      if (v && !v.paused) setResume(step.id, v.currentTime);
    }, 3000);
    return () => clearInterval(t);
  }, [step.id]);

  // Playback rate + captions track state
  useEffect(() => {
    const v = video();
    if (v) v.playbackRate = speed;
  }, [speed]);
  useEffect(() => {
    const v = video();
    if (!v) return;
    for (const track of Array.from(v.textTracks)) {
      track.mode = captionsOn ? 'showing' : 'hidden';
    }
  }, [captionsOn, step.captionsPath]);

  // A/B loop + whole-clip loop
  useEffect(() => {
    const v = video();
    if (!v) return;
    const onTime = () => {
      setTime(v.currentTime);
      if (loopA !== null && loopB !== null && v.currentTime >= loopB) {
        v.currentTime = loopA;
      }
    };
    const onEnded = () => {
      if (loopClip) {
        v.currentTime = loopA ?? 0;
        void v.play();
      } else {
        setPlaying(false);
      }
    };
    const onMeta = () => setDuration(v.duration || step.durationSeconds || 0);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    v.addEventListener('loadedmetadata', onMeta);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('loadedmetadata', onMeta);
    };
  }, [loopA, loopB, loopClip, step.durationSeconds]);

  const togglePlay = useCallback(() => {
    const v = video();
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = video();
    if (v) v.currentTime = Math.max(0, Math.min(v.duration || 1e9, v.currentTime + delta));
  }, []);

  const cycleSpeed = useCallback(
    (dir: 1 | -1) => {
      setSpeed((current) => {
        const i = SPEEDS.indexOf(current);
        const next =
          SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, i + dir))] ?? 1;
        setPref('speed', next);
        return next;
      });
    },
    [],
  );

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          seekBy(-5);
          break;
        case 'ArrowRight':
          seekBy(5);
          break;
        case 'j':
          seekBy(-10);
          break;
        case 'l':
          seekBy(10);
          break;
        case '[':
          cycleSpeed(-1);
          break;
        case ']':
          cycleSpeed(1);
          break;
        case 'm':
          setMirror((v) => {
            setPref('mirror', !v);
            return !v;
          });
          break;
        case 'c':
          setCaptionsOn((v) => {
            setPref('captions', !v);
            return !v;
          });
          break;
        case 'a': {
          const v = video();
          if (v) setLoopA(v.currentTime);
          break;
        }
        case 'b': {
          const v = video();
          if (v) setLoopB(v.currentTime);
          break;
        }
        case 'x':
          setLoopA(null);
          setLoopB(null);
          break;
        case 'f': {
          const el = videoRef.current?.closest('.player');
          if (el && document.fullscreenElement) void document.exitFullscreen();
          else if (el) void el.requestFullscreen();
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, seekBy, cycleSpeed]);

  if (!step.clipPath) {
    return (
      <div className="player">
        <div className="video-wrap">
          <div className="no-clip">
            <strong>Clip not rendered yet</strong>
            <span>
              Run <code>npm run render</code> to generate this clip from{' '}
              {step.sourceStartTime}–{step.sourceEndTime} of the source video.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player">
      <div className="video-wrap">
        <video
          ref={videoRef}
          className={mirror ? 'mirrored' : ''}
          src={step.clipPath}
          poster={step.thumbnailPath || undefined}
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
        >
          {step.captionsPath ? (
            <track
              kind="captions"
              srcLang="auto"
              label="Captions"
              src={step.captionsPath}
              default={captionsOn}
            />
          ) : null}
        </video>
        {mirror ? <div className="mirror-note">Mirrored view — left ⇄ right</div> : null}
        {showCounts && step.counts ? (
          <div className="counts-note">{step.counts}</div>
        ) : null}
      </div>

      <div className="seekbar">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={time}
          onChange={(e) => {
            const v = video();
            if (v) v.currentTime = Number(e.target.value);
          }}
        />
      </div>

      <div className="controls">
        <button className="ctrl" onClick={togglePlay}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="ctrl" onClick={() => seekBy(-10)}>
          ↺ 10s
        </button>
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={`ctrl ${speed === s ? 'on' : ''}`}
            onClick={() => {
              setSpeed(s);
              setPref('speed', s);
            }}
          >
            {s}×
          </button>
        ))}
        <span className="time-label">
          {fmt(time)} / {fmt(duration)}
        </span>
        <span className="spacer" />
        <button
          className={`ctrl ${loopClip ? 'on' : ''}`}
          onClick={() => setLoopClip((v) => !v)}
          title="Loop the entire clip"
        >
          ⟲ Loop
        </button>
        <button
          className={`ctrl ${loopA !== null ? 'on' : ''}`}
          onClick={() => setLoopA(video()?.currentTime ?? null)}
          title="Set loop start (A)"
        >
          A{loopA !== null ? ` ${fmt(loopA)}` : ''}
        </button>
        <button
          className={`ctrl ${loopB !== null ? 'on' : ''}`}
          onClick={() => setLoopB(video()?.currentTime ?? null)}
          title="Set loop end (B)"
        >
          B{loopB !== null ? ` ${fmt(loopB)}` : ''}
        </button>
        {loopA !== null || loopB !== null ? (
          <button
            className="ctrl"
            onClick={() => {
              setLoopA(null);
              setLoopB(null);
            }}
          >
            ✕ A/B
          </button>
        ) : null}
        <button
          className={`ctrl ${captionsOn ? 'on' : ''}`}
          onClick={() => {
            setCaptionsOn((v) => {
              setPref('captions', !v);
              return !v;
            });
          }}
          disabled={!step.captionsPath}
          title="Toggle captions"
        >
          CC
        </button>
        {step.counts ? (
          <button
            className={`ctrl ${showCounts ? 'on' : ''}`}
            onClick={() => {
              setShowCounts((v) => {
                setPref('showCounts', !v);
                return !v;
              });
            }}
            title="Show the count pattern"
          >
            1·2·3
          </button>
        ) : null}
        <button
          className={`ctrl hot ${mirror ? 'on' : ''}`}
          onClick={() => {
            setMirror((v) => {
              setPref('mirror', !v);
              return !v;
            });
          }}
          title="Mirror the video (for following along)"
        >
          ⇄ Mirror
        </button>
        <button
          className="ctrl"
          onClick={() => {
            const el = videoRef.current?.closest('.player');
            if (el) void el.requestFullscreen();
          }}
        >
          ⛶
        </button>
      </div>
      <div className="kbd-hint">
        <kbd>space</kbd> play · <kbd>←</kbd>/<kbd>→</kbd> 5s · <kbd>j</kbd>/
        <kbd>l</kbd> 10s · <kbd>[</kbd>/<kbd>]</kbd> speed · <kbd>a</kbd>/
        <kbd>b</kbd> loop section · <kbd>x</kbd> clear loop · <kbd>m</kbd>{' '}
        mirror · <kbd>c</kbd> captions · <kbd>f</kbd> fullscreen
      </div>
    </div>
  );
};
