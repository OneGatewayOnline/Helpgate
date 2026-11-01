'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Copy, Check } from 'lucide-react';

interface Lap {
  index: number;
  time: number;
  split: number;
}

export default function StopwatchComponent() {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsed;
      const update = () => {
        setElapsed(performance.now() - startTimeRef.current);
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;
    const prevTotal = laps.length > 0 ? laps[0].time : 0;
    const split = elapsed - prevTotal;
    const newLap: Lap = {
      index: laps.length + 1,
      time: elapsed,
      split,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  const copyLaps = () => {
    if (laps.length === 0) return;
    const text = laps
      .map((l) => `Lap ${l.index}: Split ${formatTime(l.split)} | Total: ${formatTime(l.time)}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-8 max-w-lg mx-auto">
      {/* Big Display */}
      <div className="font-mono text-6xl sm:text-7xl font-black text-foreground tracking-tight select-all">
        {formatTime(elapsed)}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          disabled={elapsed === 0}
          className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleStartStop}
          className={`px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-lg flex items-center gap-2 ${
            isRunning
              ? 'bg-destructive text-destructive-foreground shadow-destructive/20 hover:opacity-90'
              : 'bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={handleLap}
          disabled={!isRunning}
          className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Record Lap"
        >
          <Flag className="w-5 h-5" />
        </button>
      </div>

      {/* Laps Table */}
      {laps.length > 0 && (
        <div className="w-full space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
            <span>Recorded Laps ({laps.length})</span>
            <button
              onClick={copyLaps}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {laps.map((lap) => (
              <div
                key={lap.index}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 text-xs font-mono"
              >
                <span className="font-bold text-foreground">Lap {lap.index}</span>
                <span className="text-muted-foreground">+{formatTime(lap.split)}</span>
                <span className="font-bold text-primary">{formatTime(lap.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
