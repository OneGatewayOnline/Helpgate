'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, Bell } from 'lucide-react';

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_TIMES: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroTimerComponent() {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIMES.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  // Synthesize pleasant bell chime via Web Audio API
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  useEffect(() => {
    let interval: any = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      playChime();
      setIsRunning(false);

      if (mode === 'focus') {
        setCompletedSessions((prev) => prev + 1);
        const nextMode = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        switchMode(nextMode);
      } else {
        switchMode('focus');
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedSessions]);

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(DEFAULT_TIMES[newMode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = DEFAULT_TIMES[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8 max-w-md mx-auto">
      {/* Mode Buttons */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-border bg-secondary/30">
        <button
          onClick={() => switchMode('focus')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'focus' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'shortBreak' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Short Break (5m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'longBreak' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Long Break (15m)
        </button>
      </div>

      {/* Big Countdown Timer */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-foreground my-2">
          {timeFormatted}
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {mode === 'focus' ? '🎯 Stay Focused' : '☕ Take a Break'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setTimeLeft(DEFAULT_TIMES[mode]);
            setIsRunning(false);
          }}
          className="p-3 rounded-full border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            playChime();
            switchMode(mode === 'focus' ? 'shortBreak' : 'focus');
          }}
          className="p-3 rounded-full border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Skip to next session"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      <div className="text-xs text-muted-foreground">
        Completed Focus Sessions: <strong className="text-foreground">{completedSessions}</strong>
      </div>
    </div>
  );
}
