import React, {useEffect, useState} from 'react';
import {HashRouter, NavLink, Route, Routes} from 'react-router-dom';
import {loadLibrary, type LibraryData} from './lib/data';
import {Home} from './pages/Home';
import {StepDetail} from './pages/StepDetail';
import {Review} from './pages/Review';

export const App: React.FC = () => {
  const [data, setData] = useState<LibraryData | null>(null);
  useEffect(() => {
    loadLibrary().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="container" style={{padding: '80px 20px', color: 'var(--text-dim)'}}>
        Loading library…
      </div>
    );
  }
  const reviewCount = data.steps.filter((s) => s.reviewRequired).length;

  return (
    <HashRouter>
      <header className="site-header">
        <div className="inner">
          <NavLink to="/" className="brand">
            MAMBO <em>LIBRARY</em>
          </NavLink>
          <nav className="header-nav">
            <NavLink to="/" end className={({isActive}) => (isActive ? 'active' : '')}>
              Browse
            </NavLink>
            <NavLink
              to="/review"
              className={({isActive}) => (isActive ? 'active' : '')}
            >
              {reviewCount > 0 ? (
                <span className="review-pill">Review · {reviewCount}</span>
              ) : (
                'Review'
              )}
            </NavLink>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home data={data} />} />
        <Route path="/step/:slug" element={<StepDetail data={data} />} />
        <Route path="/review" element={<Review data={data} />} />
      </Routes>
      <footer className="footer">
        Mambo Video Library · every clip links back to its original source
        video and timestamp · library data generated{' '}
        {data.meta.generatedAt
          ? new Date(data.meta.generatedAt).toLocaleString()
          : '—'}
      </footer>
    </HashRouter>
  );
};
