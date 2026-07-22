import React from 'react';
import {Link, useParams} from 'react-router-dom';
import {
  categoryColor,
  formatDuration,
  type LibraryData,
} from '../lib/data';
import {Player} from '../components/Player';
import {StepCard} from '../components/StepCard';

export const StepDetail: React.FC<{data: LibraryData}> = ({data}) => {
  const {slug} = useParams();
  const step = data.steps.find((s) => s.slug === slug);
  if (!step) {
    return (
      <main className="container">
        <div className="empty-state" style={{marginTop: 40}}>
          <h2>Step not found</h2>
          <p>
            <Link to="/" style={{color: 'var(--accent)'}}>
              ← Back to the library
            </Link>
          </p>
        </div>
      </main>
    );
  }
  const color = categoryColor(data, step.category);
  const source = data.sources.find((s) => s.id === step.sourceVideo);
  const related = [...step.relatedSteps, ...step.alternateVersions]
    .map((idOrSlug) =>
      data.steps.find((s) => s.id === idOrSlug || s.slug === idOrSlug),
    )
    .filter((s): s is NonNullable<typeof s> => Boolean(s) && s!.id !== step.id);
  const prereqs = step.prerequisites
    .map((idOrSlug) =>
      data.steps.find((s) => s.id === idOrSlug || s.slug === idOrSlug),
    )
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const confColor =
    step.confidence >= 0.9
      ? 'var(--good)'
      : step.confidence >= 0.75
        ? 'var(--accent)'
        : 'var(--accent-hot)';
  const confLabel =
    step.confidence >= 0.9
      ? 'highly confident'
      : step.confidence >= 0.75
        ? 'probably correct'
        : step.confidence >= 0.5
          ? 'manual review recommended'
          : 'needs review before publishing';

  return (
    <main className="container">
      <div className="detail">
        <div>
          {step.reviewRequired ? (
            <div className="review-banner">
              <strong>Needs review:</strong>{' '}
              {step.reviewReason || 'flagged by the pipeline'}
            </div>
          ) : null}
          <Player step={step} />
          <h1>{step.title}</h1>
          {step.aliases.length > 0 ? (
            <div className="aliases">Also known as: {step.aliases.join(' · ')}</div>
          ) : null}
          <div className="badges" style={{marginBottom: 14}}>
            <span className="badge cat" style={{backgroundColor: color}}>
              {step.category}
            </span>
            {step.subcategory ? (
              <span className="badge">{step.subcategory}</span>
            ) : null}
            <span className="badge">{step.level}</span>
            {step.timing ? <span className="badge">{step.timing}</span> : null}
            <span className="badge">{step.type}</span>
            {step.versionLabel ? (
              <span className="badge">{step.versionLabel}</span>
            ) : null}
            {step.hasSlowDemo ? <span className="badge">🐢 slow demo</span> : null}
            {step.hasMusicDemo ? (
              <span className="badge">♪ music demo</span>
            ) : (
              <span className="badge" title="No usable music section was found in the source">
                music demo unavailable
              </span>
            )}
          </div>
          {step.summary ? (
            <p style={{fontSize: 16, maxWidth: 720}}>{step.summary}</p>
          ) : null}
          <div className="confidence">
            <span>
              Identification confidence: {step.confidence.toFixed(2)} ({confLabel})
            </span>
            <span className="bar">
              <div
                style={{
                  width: `${step.confidence * 100}%`,
                  backgroundColor: confColor,
                }}
              />
            </span>
          </div>

          {related.length > 0 ? (
            <>
              <div className="section-title">Related steps & other versions</div>
              <div className="grid">
                {related.map((s) => (
                  <StepCard key={s.id} step={s} data={data} />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <aside className="meta-panel">
          {step.keyTechniquePoints.length > 0 ? (
            <div>
              <h2>Key technique points</h2>
              <ul>
                {step.keyTechniquePoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {step.commonMistakes.length > 0 ? (
            <div>
              <h2>Common mistakes</h2>
              <ul>
                {step.commonMistakes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {step.practiceTips.length > 0 ? (
            <div>
              <h2>Practice tips</h2>
              <ul>
                {step.practiceTips.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {prereqs.length > 0 ? (
            <div>
              <h2>Prerequisites</h2>
              <ul>
                {prereqs.map((s) => (
                  <li key={s.id}>
                    <Link to={`/step/${s.slug}`} style={{color: 'var(--accent)'}}>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h2>Details</h2>
            <dl className="kv">
              <dt>Duration</dt>
              <dd>{formatDuration(step.durationSeconds)}</dd>
              {step.counts ? (
                <>
                  <dt>Counts</dt>
                  <dd>{step.counts}</dd>
                </>
              ) : null}
              {step.startingFoot ? (
                <>
                  <dt>Starting foot</dt>
                  <dd>{step.startingFoot}</dd>
                </>
              ) : null}
              {step.direction ? (
                <>
                  <dt>Direction</dt>
                  <dd>{step.direction}</dd>
                </>
              ) : null}
              {step.instructor ? (
                <>
                  <dt>Instructor</dt>
                  <dd>{step.instructor}</dd>
                </>
              ) : null}
              {step.musicBpm ? (
                <>
                  <dt>Music BPM</dt>
                  <dd>{step.musicBpm}</dd>
                </>
              ) : null}
            </dl>
          </div>
          <div>
            <h2>Original source</h2>
            <div className="source-box">
              Source: <strong>{source?.filename ?? step.sourceVideo}</strong>
              <br />
              Original segment: {step.sourceStartTime}–{step.sourceEndTime}
              {source?.preppedPath ? (
                <>
                  <br />
                  <a
                    href={source.preppedPath}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source video ↗
                  </a>{' '}
                  <span style={{opacity: 0.7}}>
                    (seek to {step.sourceStartTime})
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
