import React, { useState, useEffect } from 'react';
import { healthCheck } from '../services/api';
import InfluencerOnboard from '../components/InfluencerOnboard';

function HomePage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    healthCheck()
      .then(res => setMessage(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Influencer Platform</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{message || 'Loading...'}</p>
      </div>
      
      <InfluencerOnboard />
    </div>
  );
}

export default HomePage;