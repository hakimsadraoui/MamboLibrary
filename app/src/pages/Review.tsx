import React from 'react';
import {Link} from 'react-router-dom';
import type {LibraryData} from '../lib/data';

export const Review: React.FC<{data: LibraryData}> = ({data}) => {
  const flagged = data.steps.filter(
    (s) => s.reviewRequired || s.confidence < 0.75,
  );
  return (
    <main className="container">
      <section className="hero">
        <h1>
          Review <span>queue</span>
        </h1>
        <div className="stats">
          <span>
            <strong>{flagged.length}</strong> item(s) need a human decision
          </span>
          <span>
            Fix with <code>npm run revise -- --id &lt;stepId&gt; --set …</code>{' '}
            — only the affected clip re-renders
          </span>
        </div>
      </section>
      {flagged.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing to review 🎉</h2>
          <p>Every published step is confidently identified.</p>
        </div>
      ) : (
        <table className="review-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Proposed name</th>
              <th>Confidence</th>
              <th>Reason</th>
              <th>Suggested alternatives</th>
              <th>Source & timestamp</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((s) => {
              const source = data.sources.find((x) => x.id === s.sourceVideo);
              return (
                <tr key={s.id}>
                  <td style={{width: 150}}>
                    <Link to={`/step/${s.slug}`}>
                      {s.thumbnailPath ? (
                        <img
                          src={s.thumbnailPath}
                          alt={s.title}
                          style={{width: 140, borderRadius: 8, display: 'block'}}
                          loading="lazy"
                        />
                      ) : (
                        <span style={{color: 'var(--accent)'}}>open ↗</span>
                      )}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/step/${s.slug}`} style={{fontWeight: 600}}>
                      {s.title}
                    </Link>
                    <div style={{color: 'var(--text-dim)', fontSize: 12}}>
                      {s.id}
                    </div>
                  </td>
                  <td
                    style={{
                      color:
                        s.confidence >= 0.75
                          ? 'var(--accent)'
                          : 'var(--accent-hot)',
                      fontWeight: 700,
                    }}
                  >
                    {s.confidence.toFixed(2)}
                  </td>
                  <td style={{maxWidth: 320}}>{s.reviewReason || '—'}</td>
                  <td>{s.aliases.join(', ') || '—'}</td>
                  <td>
                    {source?.filename ?? s.sourceVideo}
                    <br />
                    <span style={{color: 'var(--text-dim)'}}>
                      {s.sourceStartTime}–{s.sourceEndTime}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
};
