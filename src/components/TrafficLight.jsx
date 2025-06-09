import React, { useState, useEffect } from 'react';

export default function TrafficLight() {
  const [current, setCurrent] = useState('red');
  const [secondsLeft, setSecondsLeft] = useState(5);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <div style={{ width: 60, margin: '0 auto' }}>
        {['red', 'green', 'yellow'].map(color => (
          <div
            key={color}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              marginBottom: 10,
              backgroundColor: current === color ? color : '#ddd',
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: 24, marginTop: 10 }}>
        {secondsLeft}s left
      </div>

      <div style={{ marginTop: 20 }}>
        <button>Start / Pause</button>
        <button style={{ marginLeft: 10 }}>Reset</button>
      </div>
    </div>
  );
}
