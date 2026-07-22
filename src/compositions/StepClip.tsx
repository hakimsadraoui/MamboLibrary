import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Video} from '@remotion/media';
import type {ClipProps} from '../lib/types';
import {layoutClip, secondsToFrames} from '../lib/timing';
import {theme} from '../styles/theme';
import {ensureFonts} from '../lib/fonts';
import {TitleCard} from '../components/TitleCard';
import {SectionBadge} from '../components/SectionBadge';
import {CueOverlays} from '../components/CueOverlay';
import {CountOverlay} from '../components/CountOverlay';
import {Captions} from '../components/Captions';
import {RecapCard} from '../components/RecapCard';

const EDGE_FADE_S = 0.18;

export const StepClip: React.FC<ClipProps> = (props) => {
  ensureFonts();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const layout = layoutClip(props.sections, fps);

  // Whole-clip fade in/out so nothing ever starts or ends abruptly.
  const globalFade = Math.min(
    interpolate(frame, [0, 8], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(frame, [durationInFrames - 10, durationInFrames - 1], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <AbsoluteFill style={{backgroundColor: theme.color.bg}}>
      <AbsoluteFill style={{opacity: globalFade}}>
        <Sequence durationInFrames={layout.titleFrames} name="Title card">
          <TitleCard
            title={props.title}
            category={props.category}
            categoryColor={props.categoryColor}
            level={props.level}
            timing={props.timing}
            instructor={props.instructor}
            versionLabel={props.versionLabel}
            durationInFrames={layout.titleFrames}
          />
        </Sequence>

        {layout.placements.map((placement, i) => {
          const {section} = placement;
          const trimBefore = secondsToFrames(section.sourceStart, fps);
          const trimAfter = secondsToFrames(section.sourceEnd, fps);
          const baseVolume = section.volume ?? 1;
          const fadeF = Math.max(1, Math.round(EDGE_FADE_S * fps));
          return (
            <Sequence
              key={`${section.kind}-${i}`}
              from={placement.from}
              durationInFrames={placement.duration}
              name={section.label}
            >
              <AbsoluteFill>
                {/* Subtle backdrop so non-16:9 sources sit elegantly */}
                <AbsoluteFill
                  style={{
                    background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${props.categoryColor}14 0%, ${theme.color.bg} 78%)`,
                  }}
                />
                <Video
                  src={staticFile(props.sourceVideo)}
                  trimBefore={trimBefore}
                  trimAfter={trimAfter}
                  objectFit="contain"
                  volume={(f) =>
                    baseVolume *
                    Math.min(
                      interpolate(f, [0, fadeF], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                      interpolate(
                        f,
                        [placement.duration - fadeF, placement.duration],
                        [1, 0],
                        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
                      ),
                    )
                  }
                  style={{width: '100%', height: '100%'}}
                />
                <SectionFade duration={placement.duration} />
                <SectionBadge
                  label={section.label}
                  color={props.categoryColor}
                  sectionDuration={placement.duration}
                />
                {section.overlays?.length ? (
                  <CueOverlays cues={section.overlays} />
                ) : null}
                {section.countOverlay ? (
                  <CountOverlay spec={section.countOverlay} />
                ) : null}
              </AbsoluteFill>
            </Sequence>
          );
        })}

        <Sequence
          from={layout.totalFrames - layout.recapFrames}
          durationInFrames={layout.recapFrames}
          name="Recap"
        >
          <RecapCard
            title={props.title}
            categoryColor={props.categoryColor}
            keyPoints={props.keyPoints}
            practiceTip={props.practiceTip}
            sourceRef={props.sourceRef}
            musicDemoAvailable={props.musicDemoAvailable}
          />
        </Sequence>

        {props.burnCaptions && props.captions.length > 0 ? (
          <Captions cues={props.captions} />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Short video crossfade at each section boundary (Remotion-driven, no CSS animation). */
const SectionFade: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fadeF = Math.max(1, Math.round(theme.crossfadeSeconds * fps * 0.5));
  const dark = Math.max(
    interpolate(frame, [0, fadeF], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    interpolate(frame, [duration - fadeF, duration - 1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  if (dark <= 0.001) {
    return null;
  }
  return (
    <AbsoluteFill
      style={{backgroundColor: theme.color.bg, opacity: dark, pointerEvents: 'none'}}
    />
  );
};
