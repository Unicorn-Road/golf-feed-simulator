'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
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

  const startSimulation = (durationMinutes: number) => {
    // Stop any existing simulation
    stopSimulation();

    // Reset state
    setProgress(0);
    setElapsedTime(0);
    setIsRunning(true);
    startTimeRef.current = Date.now();

    const durationMs = durationMinutes * 60 * 1000;
    const updateInterval = 30000; // 30 seconds
    const totalUpdates = durationMs / updateInterval;
    const progressIncrement = 100 / totalUpdates;

    let currentProgress = 0;

    // Initial fetch
    fetchXML(0);

    // Set up interval for updates
    intervalRef.current = setInterval(() => {
      currentProgress += progressIncrement;
      const elapsed = Date.now() - startTimeRef.current;

      if (currentProgress >= 100 || elapsed >= durationMs) {
        // Simulation complete
        setProgress(100);
        setElapsedTime(durationMs / 1000);
        fetchXML(100);
        stopSimulation();
      } else {
        setProgress(currentProgress);
        setElapsedTime(elapsed / 1000);
        fetchXML(currentProgress);
      }
    }, updateInterval);
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
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
              <strong>How it works:</strong> The simulation updates every 30
              seconds, progressively revealing:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>0%: Tournament scheduled, tee times only</li>
              <li>0-25%: Round 1 in progress (hole-by-hole scores)</li>
              <li>25-50%: Round 1 complete, Round 2 in progress</li>
              <li>50-75%: Round 2 complete, Round 3 in progress</li>
              <li>75-100%: Round 3 complete, Round 4 in progress/complete</li>
            </ul>
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
