import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/notfound.css';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <p>Page Not Found</p>
        <button onClick={() => navigate('/')} className="home-btn">
          Go Back Home
        </button>
      </div>
    </div>
  );
};
