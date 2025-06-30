import { useState, useEffect, useCallback, useRef } from "react";
import "./TrafficLightStyle.css"; // Import CSS to style the traffic light

// Define the traffic light stages
const TRAFFIC_STAGES = ["red", "green", "yellow"];

// Define the duration for each stage in seconds
const STAGES_DURATION = {
  red: 5,
  green: 4,
  yellow: 2,
};

// Define the transitions between stages
const TRANSITIONS = {
  red: "green",
  green: "yellow",
  yellow: "red",
};

export default function TrafficLight() {
  const [current, setCurrent] = useState(TRAFFIC_STAGES[0]);
  const [secondsLeft, setSecondsLeft] = useState(STAGES_DURATION[current]);
  const [isRunning, setIsRunning] = useState(false); // Track if the timer is running
  const [isPaused, setIsPaused] = useState(false); // Track if the timer is paused

  // Refs to manage the last timer timestamp and requestAnimationFrame ID
  // Using refs to avoid unnecessary re-renders
  const lastTimerRef = useRef(null);
  const rafIdRef = useRef(null);

  // Function to transition to the next stage based on the current stage
  // and set the seconds left for that stage
  const transitionToNextStage = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev === 0) {
        const nextStage = TRANSITIONS[current] || TRAFFIC_STAGES[0]; // Default to Red if no transition is defined
        setCurrent(nextStage);
        const newDuration = STAGES_DURATION[nextStage];
        if (newDuration === undefined) {
          // Check if the duration is defined
          // If duration is not defined, reset to Red stage
          console.error(
            `Error: Duration not defined for stage "${nextStage}". Resetting to Red.`
          );
          setCurrent(TRAFFIC_STAGES[0]);
          return STAGES_DURATION[TRAFFIC_STAGES[0]];
        }
        return newDuration;
      }
      return prev - 1;
    });
  }, [current]);

  // Effect to handle the countdown logic
  const handleStartPause = () => {
    setIsRunning((prev) => {
      if (prev) {
        setIsPaused(true);
        return false;
      } else {
        setIsPaused(false);
        lastTimerRef.current = performance.now(); // Reset the last timer reference to current time
        return true;
      }
    });
  };

  // Function to reset the traffic light to the initial state
  const handleReset = () => {
    setCurrent(TRAFFIC_STAGES[0]);
    setSecondsLeft(STAGES_DURATION[TRAFFIC_STAGES[0]]);
    setIsRunning(false);
    setIsPaused(false);
    lastTimerRef.current = null;
    if (rafIdRef.current) {
      // Cancel any ongoing animation frame
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // Effect to handle the requestAnimationFrame logic
  useEffect(() => {
    if (!isRunning || isPaused) {
      // If not running or paused, clear the animation frame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = (timestamp) => {
      // Function to handle the tick logic for the countdown
      if (lastTimerRef.current === null) {
        // If last timer is null, set it to the current timestamp
        lastTimerRef.current = timestamp;
      }

      const elapsed = Math.floor((timestamp - lastTimerRef.current) / 1000); // Calculate the elapsed time in seconds
      if (elapsed >= 1) {
        transitionToNextStage();
        lastTimerRef.current = timestamp;
      }

      if (isRunning && !isPaused) {
        // If still running and not paused, request the next animation frame
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick); // Start the animation frame loop

    return () => { // Cleanup function to cancel the animation frame
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning, isPaused, transitionToNextStage]);

  return (
    <div className="traffic-light-container">
      <div className="traffic-light-body">
        {["red", "yellow", "green"].map((color) => (
          <div
            key={color}
            className={`light-bulb ${color} ${
              current === color ? "active" : ""
            }`}
          />
        ))}
      </div>

      <div className="timer-display">
        {isRunning && !isPaused ? `${secondsLeft} seconds left` : "Paused"}
      </div>

      <div className="controls">
        <div className="main-buttons">
          <button
            className={`button ${!isPaused ? "pause" : "start"}`}
            onClick={handleStartPause}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button className="button reset" onClick={handleReset}>
            Reset
          </button>
        </div>

        // Debug buttons for rapid start/pause and simulate lag
        <div className="debug-buttons">
          <button // Button to rapidly start/pause the traffic light
            className="button debug-blue"
            onClick={() => {
              for (let i = 0; i < 10; i++) {
                setTimeout(handleStartPause, i * 50);
              }
            }}
          >
            Rapid Start/Pause
          </button>
          <button // Button to simulate lag by blocking the main thread for 3 seconds
            className="button debug-purple"
            onClick={() => {
              const start = performance.now();
              while (performance.now() - start < 3000) {}
            }}
          >
            Simulate Lag
          </button>
        </div>
      </div>
    </div>
  );
}
