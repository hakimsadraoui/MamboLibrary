import React from 'react';
import {Composition, Still} from 'remotion';
import {StepClip} from './compositions/StepClip';
import {StepThumbnail} from './compositions/StepThumbnail';
import type {ClipProps, ThumbnailProps} from './lib/types';
import {FPS} from './lib/timing';
import {allSteps, clipDurationInFrames, resolveClipProps} from './lib/stepToProps';

// The render pipeline only ever passes {stepId}; calculateMetadata resolves
// the full ClipProps from data/steps.json so all editing decisions stay in data.
type StepCompProps = {stepId: string} & Partial<ClipProps>;

const StepClipLoader: React.FC<StepCompProps> = (props) => {
  const resolved =
    props.sections && props.title !== undefined
      ? (props as unknown as ClipProps)
      : resolveClipProps(props.stepId);
  return <StepClip {...resolved} />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {allSteps.map((step) => (
        <Composition
          key={step.id}
          id={`step-${step.slug}`}
          component={StepClipLoader as React.FC<StepCompProps>}
          fps={FPS}
          width={1920}
          height={1080}
          durationInFrames={clipDurationInFrames(step.id, FPS)}
          defaultProps={{stepId: step.id}}
          calculateMetadata={({props}) => {
            return {
              durationInFrames: clipDurationInFrames(props.stepId, FPS),
              props: {...resolveClipProps(props.stepId), stepId: props.stepId},
            };
          }}
        />
      ))}
      <Still
        id="StepThumbnail"
        component={StepThumbnail as unknown as React.FC<Record<string, unknown>>}
        width={1280}
        height={720}
        defaultProps={{
          frameImage: 'thumbnails/.frames/placeholder.png',
          title: 'Step name',
          category: 'Mambo Footwork',
          categoryColor: '#E4574C',
          level: 'Intermediate',
          viewLabel: '',
        }}
      />
    </>
  );
};
