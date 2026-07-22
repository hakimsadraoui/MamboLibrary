// Maps a StepRecord (data/steps.json) to fully-resolved ClipProps.
// This is the ONLY place that mapping lives — the render script passes just
// {stepId} and Root's calculateMetadata resolves everything here, so data
// and rendering can never drift apart.

import stepsData from '../../data/steps.json';
import sourcesData from '../../data/source-videos.json';
import categoriesData from '../../data/categories.json';
import captionsBundle from '../../data/captions-bundle.json';
import type {
  CaptionCue,
  ClipProps,
  SourceVideoRecord,
  StepRecord,
} from './types';
import {layoutClip} from './timing';

export const allSteps = stepsData as unknown as StepRecord[];
export const allSources = (sourcesData as unknown as {sources: SourceVideoRecord[]})
  .sources;
const captionsMap = captionsBundle as unknown as Record<string, CaptionCue[]>;

export const categoryColor = (categoryName: string): string => {
  const cat = categoriesData.categories.find((c) => c.name === categoryName);
  return cat?.color ?? '#E8B44F';
};

export const resolveClipProps = (stepId: string): ClipProps => {
  const step = allSteps.find((s) => s.id === stepId);
  if (!step) {
    throw new Error(`Unknown step id: ${stepId}`);
  }
  const source = allSources.find((s) => s.id === step.sourceVideo);
  if (!source) {
    throw new Error(`Step ${stepId} references unknown source ${step.sourceVideo}`);
  }
  return {
    sourceVideo: source.preppedPath,
    title: step.title,
    category: step.category,
    categoryColor: categoryColor(step.category),
    level: step.level,
    timing: step.timing,
    counts: step.counts,
    instructor: step.instructor,
    versionLabel: step.versionLabel,
    sections: step.sections,
    captions: captionsMap[step.id] ?? [],
    burnCaptions: step.burnCaptions,
    keyPoints: step.keyTechniquePoints,
    practiceTip: step.practiceTips[0] ?? '',
    sourceRef: {
      filename: source.filename,
      start: step.sourceStartTime,
      end: step.sourceEndTime,
    },
    musicDemoAvailable: step.hasMusicDemo,
  };
};

export const clipDurationInFrames = (stepId: string, fps: number): number => {
  const step = allSteps.find((s) => s.id === stepId);
  if (!step) {
    throw new Error(`Unknown step id: ${stepId}`);
  }
  return layoutClip(step.sections, fps).totalFrames;
};
