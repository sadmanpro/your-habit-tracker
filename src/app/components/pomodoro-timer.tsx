'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(POMODORO_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const workEndSfxRef = useRef<HTMLAudioElement | null>(null);
  const breakEndSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Audio objects on the client side only.
    if (typeof Audio !== 'undefined') {
      workEndSfxRef.current = new Audio(
        'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
      );
      breakEndSfxRef.current = new Audio(
        'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
      );
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((seconds) => seconds - 1);
        } else if (minutes > 0) {
          setMinutes((minutes) => minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          if (isBreak) {
            breakEndSfxRef.current?.play();
            // End of break, switch to work
            setIsBreak(false);
            setMinutes(POMODORO_MINUTES);
            setSeconds(0);
          } else {
            workEndSfxRef.current?.play();
            // End of work, switch to break
            setIsBreak(true);
            setMinutes(BREAK_MINUTES);
            setSeconds(0);
          }
           // Keep timer running for the next session
        }
      }, 1000);
    }
    return () => {
      if(interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(POMODORO_MINUTES);
    setSeconds(0);
  };

  const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;

  const { chartData, remainingColor } = useMemo(() => {
    const totalDuration = (isBreak ? BREAK_MINUTES : POMODORO_MINUTES) * 60;
    const remainingSeconds = minutes * 60 + seconds;
    
    const chartData = [
      { name: 'Remaining', value: remainingSeconds },
      { name: 'Elapsed', value: totalDuration - remainingSeconds },
    ];

    let remainingColor = 'hsl(var(--chart-8))'; // Default: light blue

    if (!isBreak) {
        if (minutes < 5) {
            remainingColor = 'hsl(var(--destructive))'; // red
        } else if (minutes < 10) {
            remainingColor = 'hsl(var(--chart-4))'; // yellow
        } else if (minutes < 15) {
            remainingColor = 'hsl(var(--accent))'; // green
        }
    } else {
      // For break time, use a consistent color
      remainingColor = 'hsl(var(--accent))';
    }

    return { chartData, remainingColor };
  }, [minutes, seconds, isBreak]);

  return (
    <Card className="animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <div className="relative h-64 w-64">
           <ChartContainer
            config={{}}
            className="h-full w-full"
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={100}
                startAngle={90}
                endAngle={-270}
                stroke="none"
                cy="50%"
                cx="50%"
              >
                <Cell
                  key="remaining"
                  fill={remainingColor}
                  className="transition-colors duration-500"
                />
                <Cell
                  key="elapsed"
                  fill="hsl(var(--muted))"
                  className="opacity-20"
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl font-bold font-mono text-primary tabular-nums">
            {time}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={toggleTimer} size="lg">
            {isActive ? <Pause /> : <Play />}
            <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw />
            <span className="ml-2">Reset</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
