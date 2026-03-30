'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startDay, setStartDay] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const fetchXML = async (progressValue: number) => {
    try {
      const response = await fetch(`/api/feed?progress=${progressValue}`);
      const xml = await response.text();
      setXmlContent(xml);
    } catch (error) {
      console.error('Error fetching XML:', error);
    }
  };

  const startSimulation = async (durationMinutes: number) => {
    // Stop any existing simulation
    stopSimulation();

    try {
      // Start server-side simulation
      const durationSeconds = durationMinutes * 60;
      const response = await fetch(`/api/simulation/start?duration=${durationSeconds}&startDay=${startDay}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.error('Failed to start simulation');
        return;
      }

      // Reset state
      setProgress(0);
      setElapsedTime(0);
      setIsRunning(true);
      startTimeRef.current = Date.now();

      // Poll for updates every 5 seconds
      intervalRef.current = setInterval(async () => {
        try {
          // Fetch current status from server
          const statusResponse = await fetch('/api/simulation/status');
          const status = await statusResponse.json();
          
          if (status.isActive) {
            setProgress(status.progress);
            setElapsedTime(status.elapsed);
            // Fetch XML without progress param to use server state
            fetchXML(status.progress);
          } else {
            // Simulation complete
            setProgress(100);
            setElapsedTime(status.duration);
            fetchXML(100);
            stopSimulation();
          }
        } catch (error) {
          console.error('Error polling simulation status:', error);
        }
      }, 5000); // Poll every 5 seconds
      
      // Initial fetch
      fetchXML(0);
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const stopSimulation = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    
    // Stop server-side simulation
    try {
      await fetch('/api/simulation/stop', { method: 'POST' });
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  useEffect(() => {
    // Initial load
    fetchXML(0);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Golf Tournament Feed Simulator
        </h1>
        <p className="text-gray-600 mb-8">
          Simulate a golf tournament scoring feed progression over time
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Simulation Controls
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start from Day/Round:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStartDay(1)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  startDay === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Day 1
              </button>
              <button
                onClick={() => setStartDay(2)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  startDay === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Day 2
              </button>
              <button
                onClick={() => setStartDay(3)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  startDay === 3
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Day 3
              </button>
              <button
                onClick={() => setStartDay(4)}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  startDay === 4
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Day 4
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Simulation will start from the beginning of the selected day's round
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => startSimulation(1)}
              disabled={isRunning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              1 Minute Simulation
            </button>
            <button
              onClick={() => startSimulation(2)}
              disabled={isRunning}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              2 Minute Simulation
            </button>
            <button
              onClick={() => startSimulation(5)}
              disabled={isRunning}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              5 Minute Simulation
            </button>
            <button
              onClick={stopSimulation}
              disabled={!isRunning}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Stop
            </button>
          </div>

          {isRunning && (
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {progress.toFixed(1)}%
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Time: {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>How it works:</strong> Select a starting day and duration. 
              The simulation will progress through that day's round in the selected time:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Day 1:</strong> Tournament start → Round 1 completion (0-25%)</li>
              <li><strong>Day 2:</strong> Round 1 complete → Round 2 completion (25-50%)</li>
              <li><strong>Day 3:</strong> Round 2 complete → Round 3 completion (50-75%)</li>
              <li><strong>Day 4:</strong> Round 3 complete → Tournament complete (75-100%)</li>
            </ul>
            <p className="mt-2">
              Updates occur every 5 seconds during simulation.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">XML Feed</h2>
            <a
              href={`/api/feed?progress=${progress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open in new tab
            </a>
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[600px] overflow-y-auto">
              {xmlContent || 'Loading...'}
            </pre>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            API Endpoint: <code className="bg-gray-200 px-2 py-1 rounded">
              /api/feed?progress=[0-100]
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
