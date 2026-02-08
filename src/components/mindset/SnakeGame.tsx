import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSnakeScores } from "@/hooks/useSnakeScores";
import { SnakeLeaderboard } from "./SnakeLeaderboard";

// --- Types ---
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

interface ThemePalette {
  bg: string;
  snake: string;
  snakeHead: string;
  food: string;
  grid: string;
  border: string;
  text: string;
  accent: string;
}

// --- Theme Palettes cycling every 5 points ---
const THEME_PALETTES: ThemePalette[] = [
  // Theme 0: Orange on Black (default Unbreakable)
  {
    bg: "#0a0a0a",
    snake: "#f97316",
    snakeHead: "#fb923c",
    food: "#ffffff",
    grid: "#1a1a1a",
    border: "#f97316",
    text: "#f97316",
    accent: "#ffffff",
  },
  // Theme 1: Black on Orange
  {
    bg: "#f97316",
    snake: "#0a0a0a",
    snakeHead: "#1a1a1a",
    food: "#ffffff",
    grid: "#ea580c",
    border: "#0a0a0a",
    text: "#0a0a0a",
    accent: "#ffffff",
  },
  // Theme 2: White on Black
  {
    bg: "#0a0a0a",
    snake: "#ffffff",
    snakeHead: "#e5e5e5",
    food: "#f97316",
    grid: "#1a1a1a",
    border: "#ffffff",
    text: "#ffffff",
    accent: "#f97316",
  },
  // Theme 3: Orange on White
  {
    bg: "#fafafa",
    snake: "#f97316",
    snakeHead: "#ea580c",
    food: "#0a0a0a",
    grid: "#f0f0f0",
    border: "#f97316",
    text: "#f97316",
    accent: "#0a0a0a",
  },
  // Theme 4: Black on White
  {
    bg: "#fafafa",
    snake: "#0a0a0a",
    snakeHead: "#1a1a1a",
    food: "#f97316",
    grid: "#f0f0f0",
    border: "#0a0a0a",
    text: "#0a0a0a",
    accent: "#f97316",
  },
  // Theme 5: White on Orange
  {
    bg: "#ea580c",
    snake: "#ffffff",
    snakeHead: "#f5f5f5",
    food: "#0a0a0a",
    grid: "#dc2626",
    border: "#ffffff",
    text: "#ffffff",
    accent: "#0a0a0a",
  },
];

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SPEED = 200;
const MIN_SPEED = 80;
const SPEED_DECREASE_PER_POINT = 1.5;

const getTheme = (score: number): ThemePalette => {
  const themeIndex = Math.floor(score / 5) % THEME_PALETTES.length;
  return THEME_PALETTES[themeIndex];
};

const getSpeed = (score: number): number => {
  return Math.max(MIN_SPEED, INITIAL_SPEED - score * SPEED_DECREASE_PER_POINT);
};

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const foodRef = useRef<Position>({ x: 15, y: 10 });

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [themeShifts, setThemeShifts] = useState(0);

  const { saveScore, topScores, userBest, refetch } = useSnakeScores();

  // Calculate canvas size based on container
  const [cellSize, setCellSize] = useState(16);

  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 48, 400);
      const newCellSize = Math.floor(maxWidth / GRID_SIZE);
      setCellSize(newCellSize);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const canvasSize = cellSize * GRID_SIZE;

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    foodRef.current = pos;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme = getTheme(score);
    const snake = snakeRef.current;
    const food = foodRef.current;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Grid lines
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Food with glow
    ctx.shadowColor = theme.food;
    ctx.shadowBlur = 8;
    ctx.fillStyle = theme.food;
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake body
    snake.forEach((segment, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? theme.snakeHead : theme.snake;

      if (isHead) {
        ctx.shadowColor = theme.snake;
        ctx.shadowBlur = 10;
      }

      const padding = isHead ? 0 : 1;
      const radius = isHead ? cellSize / 3 : cellSize / 4;

      ctx.beginPath();
      ctx.roundRect(
        segment.x * cellSize + padding,
        segment.y * cellSize + padding,
        cellSize - padding * 2,
        cellSize - padding * 2,
        radius
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasSize, canvasSize);
  }, [canvasSize, cellSize, score]);

  const gameOver = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setGameState("gameover");

    const finalScore = score;
    const shifts = Math.floor(finalScore / 5);

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    // Save to DB
    if (finalScore > 0) {
      saveScore(finalScore, shifts);
    }
  }, [score, highScore, saveScore]);

  const tick = useCallback(() => {
    const snake = [...snakeRef.current];
    directionRef.current = nextDirectionRef.current;
    const dir = directionRef.current;
    const head = { ...snake[0] };

    switch (dir) {
      case "UP": head.y -= 1; break;
      case "DOWN": head.y += 1; break;
      case "LEFT": head.x -= 1; break;
      case "RIGHT": head.x += 1; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((prev) => {
        const newScore = prev + 1;
        const oldShifts = Math.floor(prev / 5);
        const newShifts = Math.floor(newScore / 5);
        if (newShifts > oldShifts) {
          setThemeShifts(newShifts);
        }

        // Adjust speed
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(tick, getSpeed(newScore));

        return newScore;
      });
      spawnFood();
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    draw();
  }, [draw, gameOver, spawnFood]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    setScore(0);
    setThemeShifts(0);
    spawnFood();
    setGameState("playing");
    draw();

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(tick, INITIAL_SPEED);
  }, [spawnFood, draw, tick]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      setGameState("paused");
    } else if (gameState === "paused") {
      gameLoopRef.current = setInterval(tick, getSpeed(score));
      setGameState("playing");
    }
  }, [gameState, tick, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== "playing") {
        if (e.key === " " || e.key === "Enter") {
          if (gameState === "idle" || gameState === "gameover") startGame();
          else if (gameState === "paused") togglePause();
          e.preventDefault();
        }
        return;
      }

      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (dir !== "DOWN") nextDirectionRef.current = "UP";
          e.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (dir !== "UP") nextDirectionRef.current = "DOWN";
          e.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (dir !== "RIGHT") nextDirectionRef.current = "LEFT";
          e.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (dir !== "LEFT") nextDirectionRef.current = "RIGHT";
          e.preventDefault();
          break;
        case " ":
          togglePause();
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, startGame, togglePause]);

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || gameState !== "playing") return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 20) return; // Too small

      const dir = directionRef.current;
      if (absDx > absDy) {
        if (dx > 0 && dir !== "LEFT") nextDirectionRef.current = "RIGHT";
        else if (dx < 0 && dir !== "RIGHT") nextDirectionRef.current = "LEFT";
      } else {
        if (dy > 0 && dir !== "UP") nextDirectionRef.current = "DOWN";
        else if (dy < 0 && dir !== "DOWN") nextDirectionRef.current = "UP";
      }
      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameState]);

  // D-pad controls for mobile
  const handleDPad = (newDir: Direction) => {
    if (gameState !== "playing") return;
    const dir = directionRef.current;
    if (
      (newDir === "UP" && dir !== "DOWN") ||
      (newDir === "DOWN" && dir !== "UP") ||
      (newDir === "LEFT" && dir !== "RIGHT") ||
      (newDir === "RIGHT" && dir !== "LEFT")
    ) {
      nextDirectionRef.current = newDir;
    }
  };

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw, cellSize]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  const theme = getTheme(score);

  if (showLeaderboard) {
    return (
      <SnakeLeaderboard
        scores={topScores}
        userBest={userBest}
        onClose={() => setShowLeaderboard(false)}
        onRefetch={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* Score Header */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="text-left">
          <p className="font-display text-xs tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-3xl tracking-wide" style={{ color: theme.text }}>
            {score}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {themeShifts > 0 && (
              <motion.div
                key={themeShifts}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="px-2 py-1 rounded font-display text-xs tracking-wide"
                style={{ background: theme.border, color: theme.bg }}
              >
                SHIFT ×{themeShifts}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-right">
          <p className="font-display text-xs tracking-wider text-muted-foreground">BEST</p>
          <p className="font-display text-xl tracking-wide text-primary">
            {Math.max(highScore, userBest || 0)}
          </p>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-lg"
          style={{ touchAction: "none" }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-4xl text-primary tracking-wide mb-2 neon-glow-subtle">
                SNAKE
              </p>
              <p className="font-display text-sm text-muted-foreground tracking-wider mb-6">
                UNBREAKABLE EDITION
              </p>
              <Button onClick={startGame} className="font-display tracking-wide gap-2">
                <Play className="w-4 h-4" /> START
              </Button>
            </motion.div>
          )}

          {gameState === "paused" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-4">PAUSED</p>
              <Button onClick={togglePause} variant="outline" className="font-display tracking-wide gap-2">
                <Play className="w-4 h-4" /> RESUME
              </Button>
            </motion.div>
          )}

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
            >
              <p className="font-display text-2xl text-destructive tracking-wide mb-1">
                GAME OVER
              </p>
              <p className="font-display text-5xl text-primary tracking-wide mb-1 neon-glow-subtle">
                {score}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {themeShifts > 0 ? `${themeShifts} theme shift${themeShifts > 1 ? "s" : ""}` : "No theme shifts"}
              </p>
              <div className="flex gap-2">
                <Button onClick={startGame} className="font-display tracking-wide gap-2">
                  <RotateCcw className="w-4 h-4" /> AGAIN
                </Button>
                <Button
                  onClick={() => { refetch(); setShowLeaderboard(true); }}
                  variant="outline"
                  className="font-display tracking-wide gap-2"
                >
                  <Trophy className="w-4 h-4" /> BOARD
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile D-Pad */}
      <div className="grid grid-cols-3 gap-2 w-48 md:hidden">
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-full border-primary/40 text-lg"
          onTouchStart={(e) => { e.preventDefault(); handleDPad("UP"); }}
          onMouseDown={() => handleDPad("UP")}
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-full border-primary/40 text-lg"
          onTouchStart={(e) => { e.preventDefault(); handleDPad("LEFT"); }}
          onMouseDown={() => handleDPad("LEFT")}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-full border-primary/40 text-lg"
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === "idle" || gameState === "gameover") startGame();
            else togglePause();
          }}
          onMouseDown={() => {
            if (gameState === "idle" || gameState === "gameover") startGame();
            else togglePause();
          }}
        >
          {gameState === "playing" ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-full border-primary/40 text-lg"
          onTouchStart={(e) => { e.preventDefault(); handleDPad("RIGHT"); }}
          onMouseDown={() => handleDPad("RIGHT")}
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-full border-primary/40 text-lg"
          onTouchStart={(e) => { e.preventDefault(); handleDPad("DOWN"); }}
          onMouseDown={() => handleDPad("DOWN")}
        >
          <ArrowDown className="w-6 h-6" />
        </Button>
        <div />
      </div>

      {/* Controls info */}
      <div className="flex items-center gap-4">
        {gameState === "playing" && (
          <Button onClick={togglePause} variant="ghost" size="sm" className="font-display text-xs tracking-wide gap-1">
            <Pause className="w-3 h-3" /> PAUSE
          </Button>
        )}
        <Button
          onClick={() => { refetch(); setShowLeaderboard(true); }}
          variant="ghost"
          size="sm"
          className="font-display text-xs tracking-wide gap-1"
        >
          <Trophy className="w-3 h-3" /> LEADERBOARD
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {window.innerWidth >= 768
          ? "Arrow keys or WASD to move · Space to pause"
          : "Swipe or use D-pad to control"}
      </p>
    </div>
  );
};

export default SnakeGame;
