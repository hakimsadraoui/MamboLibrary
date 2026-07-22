import {continueRender, delayRender, staticFile} from 'remotion';

// Self-hosted OFL fonts (public/fonts) — no network dependency at render time.
const faces: Array<[string, string, Record<string, string>]> = [
  ['Bebas Neue', 'fonts/BebasNeue.ttf', {weight: '400'}],
  ['Inter', 'fonts/Inter.ttf', {weight: '100 900'}],
];

let loaded = false;

export const ensureFonts = () => {
  if (loaded || typeof document === 'undefined') {
    return;
  }
  loaded = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map(([family, file, descriptors]) => {
      const face = new FontFace(
        family,
        `url(${staticFile(file)})`,
        descriptors as FontFaceDescriptors,
      );
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      // Fall back to system fonts rather than blocking the render.
      // eslint-disable-next-line no-console
      console.error('Font loading failed, using fallbacks', err);
      continueRender(handle);
    });
};
