import React from 'react';
import {Link} from 'react-router-dom';
import {
  categoryColor,
  formatDuration,
  type LibraryData,
  type Step,
} from '../lib/data';

export const StepCard: React.FC<{step: Step; data: LibraryData}> = ({
  step,
  data,
}) => {
  const color = categoryColor(data, step.category);
  return (
    <Link to={`/step/${step.slug}`} className="card">
      <div className="thumb">
        {step.thumbnailPath ? (
          <img src={step.thumbnailPath} alt={step.title} loading="lazy" />
        ) : (
          <div className="placeholder">{step.title}</div>
        )}
        {step.reviewRequired ? (
          <span className="review-flag">Review</span>
        ) : null}
        <span className="duration">{formatDuration(step.durationSeconds)}</span>
      </div>
      <div className="body">
        <h3>{step.title}</h3>
        <div className="badges">
          <span className="badge cat" style={{backgroundColor: color}}>
            {step.category}
          </span>
          <span className="badge">{step.level}</span>
          {step.timing ? <span className="badge">{step.timing}</span> : null}
          {step.hasSlowDemo ? (
            <span className="badge icon" title="Includes a slow demonstration">
              🐢 slow
            </span>
          ) : null}
          {step.hasMusicDemo ? (
            <span className="badge icon" title="Includes a demonstration with music">
              ♪ music
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
