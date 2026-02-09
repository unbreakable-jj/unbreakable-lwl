import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlleywayScores } from "@/hooks/useAlleywayScores";
import { AlleywayLeaderboard } from "./AlleywayLeaderboard";

// --- Theme Palettes (Unbreakable brand: orange, black, white) ---
interface ThemePalette {
  bg: string;
  bgGradientEnd: string;
  paddle: string;
  paddleGlow: string;
  ball: string;
  ballGlow: string;
  brickFill: string;
  brickHighlight: string;
  brickShadow: string;
  brickGlow: string;
  grid: string;
  border: string;
  text: string;
  accent: string;
}

const THEME_PALETTES: ThemePalette[] = [
  // Theme 0: Orange on Black (default Unbreakable)
  {
    bg: "#0a0a0a", bgGradientEnd: "#111111",
    paddle: "#f97316", paddleGlow: "rgba(249,115,22,0.6)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.5)",
    brickFill: "#f97316", brickHighlight: "#fb923c", brickShadow: "#c2410c", brickGlow: "rgba(249,115,22,0.35)",
    grid: "#1a1a1a", border: "#f97316", text: "#f97316", accent: "#ffffff",
  },
  // Theme 1: Black on Orange
  {
    bg: "#f97316", bgGradientEnd: "#ea580c",
    paddle: "#0a0a0a", paddleGlow: "rgba(10,10,10,0.5)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.5)",
    brickFill: "#0a0a0a", brickHighlight: "#262626", brickShadow: "#000000", brickGlow: "rgba(0,0,0,0.3)",
    grid: "#ea580c", border: "#0a0a0a", text: "#0a0a0a", accent: "#ffffff",
  },
  // Theme 2: White on Black
  {
    bg: "#0a0a0a", bgGradientEnd: "#0f0f0f",
    paddle: "#ffffff", paddleGlow: "rgba(255,255,255,0.5)",
    ball: "#f97316", ballGlow: "rgba(249,115,22,0.6)",
    brickFill: "#e5e5e5", brickHighlight: "#ffffff", brickShadow: "#a3a3a3", brickGlow: "rgba(255,255,255,0.25)",
    grid: "#1a1a1a", border: "#ffffff", text: "#ffffff", accent: "#f97316",
  },
  // Theme 3: Orange on White
  {
    bg: "#fafafa", bgGradientEnd: "#f0f0f0",
    paddle: "#f97316", paddleGlow: "rgba(249,115,22,0.5)",
    ball: "#0a0a0a", ballGlow: "rgba(10,10,10,0.4)",
    brickFill: "#f97316", brickHighlight: "#fb923c", brickShadow: "#c2410c", brickGlow: "rgba(249,115,22,0.3)",
    grid: "#f0f0f0", border: "#f97316", text: "#f97316", accent: "#0a0a0a",
  },
  // Theme 4: Black on White
  {
    bg: "#fafafa", bgGradientEnd: "#f5f5f5",
    paddle: "#0a0a0a", paddleGlow: "rgba(10,10,10,0.4)",
    ball: "#f97316", ballGlow: "rgba(249,115,22,0.5)",
    brickFill: "#171717", brickHighlight: "#262626", brickShadow: "#000000", brickGlow: "rgba(0,0,0,0.2)",
    grid: "#f0f0f0", border: "#0a0a0a", text: "#0a0a0a", accent: "#f97316",
  },
  // Theme 5: White on Orange
  {
    bg: "#ea580c", bgGradientEnd: "#dc2626",
    paddle: "#ffffff", paddleGlow: "rgba(255,255,255,0.5)",
    ball: "#0a0a0a", ballGlow: "rgba(10,10,10,0.5)",
    brickFill: "#ffffff", brickHighlight: "#fafafa", brickShadow: "#d4d4d4", brickGlow: "rgba(255,255,255,0.3)",
    grid: "#d4540a", border: "#ffffff", text: "#ffffff", accent: "#0a0a0a",
  },
];

// --- Constants ---
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 3;
const BRICK_TOP_OFFSET = 40;

// Gentler speed curve: starts slow, ramps at theme shifts
const INITIAL_BALL_SPEED = 2.5;
const MAX_BALL_SPEED = 5.5;
const SPEED_INCREASE_PER_SHIFT = 0.35; // only increases at each theme shift (every 5 pts)

// Row-by-row regen interval (ms)
const ROW_REGEN_INTERVAL = 8000;

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  row: number;
  hp: number; // 1 = normal, 2 = reinforced (takes 2 hits)
}

const getTheme = (score: number): ThemePalette => {
  const themeIndex = Math.floor(score / 5) % THEME_PALETTES.length;
  return THEME_PALETTES[themeIndex];
};

const getBallSpeed = (score: number): number => {
  const shifts = Math.floor(score / 5);
  return Math.min(MAX_BALL_SPEED, INITIAL_BALL_SPEED + shifts * SPEED_INCREASE_PER_SHIFT);
};

const AlleywayGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Game state refs
  const paddleXRef = useRef(0);
  const ballRef = useRef({ x: 0, y: 0, dx: 0, dy: 0 });
  const bricksRef = useRef<Brick[]>([]);
  const scoreRef = useRef(0);
  const regenTimerRef = useRef<number>(0);
  const lastRegenRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [themeShifts, setThemeShifts] = useState(0);

  const { saveScore, topScores, userBest, refetch } = useAlleywayScores();

  // Responsive scaling
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const maxWidth = Math.min(window.innerWidth - 48, CANVAS_WIDTH);
      setScale(maxWidth / CANVAS_WIDTH);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;

  // Generate initial brick grid
  const generateBricks = useCallback((): Brick[] => {
    const bricks: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
          y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: brickWidth,
          height: BRICK_HEIGHT,
          alive: true,
          row,
          hp: row === 0 ? 2 : 1, // top row is reinforced
        });
      }
    }
    return bricks;
  }, []);

  // --- PREMIUM DRAW ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentScore = scoreRef.current;
    const theme = getTheme(currentScore);
    const paddle = paddleXRef.current;
    const ball = ballRef.current;
    const bricks = bricksRef.current;

    // --- Background gradient ---
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, theme.bg);
    bgGrad.addColorStop(0.5, theme.bgGradientEnd);
    bgGrad.addColorStop(1, theme.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Subtle grid pattern ---
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.3;
    for (let x = 0; x < CANVAS_WIDTH; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // --- Bricks with gradient, highlight, glow ---
    bricks.forEach((brick) => {
      if (!brick.alive) return;

      // Neon glow behind brick
      ctx.shadowColor = theme.brickGlow;
      ctx.shadowBlur = 8;

      // Brick gradient fill
      const brickGrad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
      if (brick.hp > 1) {
        // Reinforced brick: brighter, more pronounced
        brickGrad.addColorStop(0, theme.brickHighlight);
        brickGrad.addColorStop(0.4, theme.brickFill);
        brickGrad.addColorStop(1, theme.brickShadow);
      } else {
        brickGrad.addColorStop(0, theme.brickHighlight);
        brickGrad.addColorStop(0.5, theme.brickFill);
        brickGrad.addColorStop(1, theme.brickShadow);
      }
      ctx.fillStyle = brickGrad;

      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fill();

      // Inner highlight line (top edge shine)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = brick.hp > 1
        ? `${theme.brickHighlight}CC`
        : `${theme.brickHighlight}66`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(brick.x + 4, brick.y + 1.5);
      ctx.lineTo(brick.x + brick.width - 4, brick.y + 1.5);
      ctx.stroke();

      // Reinforced indicator: second inner line
      if (brick.hp > 1) {
        ctx.strokeStyle = `${theme.accent}88`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height - 4, 3);
        ctx.stroke();
      }
    });

    // --- Paddle with gradient + neon glow ---
    const paddleY = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 14;

    const paddleGrad = ctx.createLinearGradient(paddle, paddleY, paddle, paddleY + PADDLE_HEIGHT);
    paddleGrad.addColorStop(0, theme.paddle);
    paddleGrad.addColorStop(1, theme.paddle + "BB");
    ctx.fillStyle = paddleGrad;

    ctx.beginPath();
    ctx.roundRect(paddle, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();

    // Paddle highlight
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `${theme.paddle}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddle + 6, paddleY + 2);
    ctx.lineTo(paddle + PADDLE_WIDTH - 6, paddleY + 2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // --- Ball with neon glow + trail ---
    // Trail (3 fading circles behind)
    for (let i = 3; i >= 1; i--) {
      const trailX = ball.x - ball.dx * i * 0.4;
      const trailY = ball.y - ball.dy * i * 0.4;
      const alpha = 0.15 - i * 0.04;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = theme.ball;
      ctx.beginPath();
      ctx.arc(trailX, trailY, BALL_RADIUS - i * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Main ball
    ctx.shadowColor = theme.ballGlow;
    ctx.shadowBlur = 16;
    ctx.fillStyle = theme.ball;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Ball inner highlight
    ctx.shadowBlur = 0;
    const ballHighlight = ctx.createRadialGradient(
      ball.x - 1.5, ball.y - 1.5, 0,
      ball.x, ball.y, BALL_RADIUS
    );
    ballHighlight.addColorStop(0, "rgba(255,255,255,0.7)");
    ballHighlight.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = ballHighlight;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // --- Border with neon glow ---
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.shadowBlur = 0;
  }, []);

  // Spawn a single new row at top, pushing existing bricks down
  const spawnNewRow = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    const newBricks: Brick[] = [];
    const currentScore = scoreRef.current;
    const reinforceChance = Math.min(0.4, 0.1 + Math.floor(currentScore / 15) * 0.1);

    for (let col = 0; col < BRICK_COLS; col++) {
      newBricks.push({
        x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
        y: BRICK_TOP_OFFSET,
        width: brickWidth,
        height: BRICK_HEIGHT,
        alive: true,
        row: 0,
        hp: Math.random() < reinforceChance ? 2 : 1,
      });
    }

    // Push existing bricks down
    const existing = bricksRef.current
      .filter((b) => b.alive)
      .map((b) => ({
        ...b,
        y: b.y + BRICK_HEIGHT + BRICK_PADDING,
        row: b.row + 1,
      }));

    bricksRef.current = [...newBricks, ...existing];
  }, []);

  // Game over handler
  const handleGameOver = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setGameState("gameover");

    const finalScore = scoreRef.current;
    const shifts = Math.floor(finalScore / 5);

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    if (finalScore > 0) {
      saveScore(finalScore, shifts);
    }
  }, [highScore, saveScore]);

  // Main game loop
  const gameLoop = useCallback(() => {
    const ball = ballRef.current;
    const speed = getBallSpeed(scoreRef.current);

    // Normalize direction to current speed
    const mag = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    if (mag > 0) {
      ball.dx = (ball.dx / mag) * speed;
      ball.dy = (ball.dy / mag) * speed;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left/right)
    if (ball.x - BALL_RADIUS <= 0) {
      ball.x = BALL_RADIUS;
      ball.dx = Math.abs(ball.dx);
    } else if (ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
      ball.x = CANVAS_WIDTH - BALL_RADIUS;
      ball.dx = -Math.abs(ball.dx);
    }

    // Top wall
    if (ball.y - BALL_RADIUS <= 0) {
      ball.y = BALL_RADIUS;
      ball.dy = Math.abs(ball.dy);
    }

    // Bottom — game over
    if (ball.y + BALL_RADIUS >= CANVAS_HEIGHT) {
      handleGameOver();
      return;
    }

    // Paddle collision
    const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    const paddleX = paddleXRef.current;
    if (
      ball.dy > 0 &&
      ball.y + BALL_RADIUS >= paddleTop &&
      ball.y + BALL_RADIUS <= paddleTop + PADDLE_HEIGHT + 4 &&
      ball.x >= paddleX &&
      ball.x <= paddleX + PADDLE_WIDTH
    ) {
      ball.y = paddleTop - BALL_RADIUS;
      const hitPos = (ball.x - paddleX) / PADDLE_WIDTH;
      const angle = (hitPos - 0.5) * Math.PI * 0.7;
      ball.dx = Math.sin(angle) * speed;
      ball.dy = -Math.cos(angle) * speed;
    }

    // Brick collision
    let bricksDestroyed = 0;
    bricksRef.current.forEach((brick) => {
      if (!brick.alive) return;
      if (
        ball.x + BALL_RADIUS > brick.x &&
        ball.x - BALL_RADIUS < brick.x + brick.width &&
        ball.y + BALL_RADIUS > brick.y &&
        ball.y - BALL_RADIUS < brick.y + brick.height
      ) {
        brick.hp -= 1;
        if (brick.hp <= 0) {
          brick.alive = false;
          bricksDestroyed++;
        }

        // Bounce direction
        const overlapLeft = (ball.x + BALL_RADIUS) - brick.x;
        const overlapRight = (brick.x + brick.width) - (ball.x - BALL_RADIUS);
        const overlapTop = (ball.y + BALL_RADIUS) - brick.y;
        const overlapBottom = (brick.y + brick.height) - (ball.y - BALL_RADIUS);

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
          ball.dx = -ball.dx;
        } else {
          ball.dy = -ball.dy;
        }
      }
    });

    if (bricksDestroyed > 0) {
      const newScore = scoreRef.current + bricksDestroyed;
      scoreRef.current = newScore;
      setScore(newScore);

      const oldShifts = Math.floor((newScore - bricksDestroyed) / 5);
      const newShifts = Math.floor(newScore / 5);
      if (newShifts > oldShifts) {
        setThemeShifts(newShifts);
      }
    }

    // Row-by-row regeneration (time-based)
    const now = performance.now();
    if (now - lastRegenRef.current >= ROW_REGEN_INTERVAL) {
      lastRegenRef.current = now;
      // Only regen if there are fewer than max bricks alive
      const aliveBricks = bricksRef.current.filter((b) => b.alive);
      if (aliveBricks.length < BRICK_ROWS * BRICK_COLS) {
        spawnNewRow();
      }
    }

    // Also spawn if ALL bricks are cleared
    const aliveBricks = bricksRef.current.filter((b) => b.alive);
    if (aliveBricks.length === 0) {
      spawnNewRow();
      spawnNewRow();
      spawnNewRow();
      lastRegenRef.current = now; // reset regen timer
    }

    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [draw, handleGameOver, spawnNewRow]);

  // Start game
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setThemeShifts(0);

    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS - 5,
      dx: (Math.random() > 0.5 ? 1 : -1) * 1.5,
      dy: -INITIAL_BALL_SPEED,
    };
    bricksRef.current = generateBricks();
    lastRegenRef.current = performance.now();

    setGameState("playing");
    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [generateBricks, draw, gameLoop]);

  // Pause/resume
  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      cancelAnimationFrame(animFrameRef.current);
      setGameState("paused");
    } else if (gameState === "paused") {
      lastRegenRef.current = performance.now(); // don't punish for pause time
      setGameState("playing");
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, gameLoop]);

  // Mouse/touch paddle control
  const movePaddle = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / scale;
    paddleXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, relativeX - PADDLE_WIDTH / 2));
  }, [scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (gameState === "playing") movePaddle(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (gameState === "playing") {
        e.preventDefault();
        movePaddle(e.touches[0].clientX);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameState, movePaddle]);

  // Keyboard paddle control
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.add("left");
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.add("right");
        e.preventDefault();
      }
      if (e.key === " " || e.key === "Enter") {
        if (gameState === "idle" || gameState === "gameover") startGame();
        else if (gameState === "playing" || gameState === "paused") togglePause();
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysRef.current.delete("left");
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysRef.current.delete("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, startGame, togglePause]);

  // Keyboard movement tick
  useEffect(() => {
    if (gameState !== "playing") return;
    const moveSpeed = 6;
    const interval = setInterval(() => {
      if (keysRef.current.has("left")) {
        paddleXRef.current = Math.max(0, paddleXRef.current - moveSpeed);
      }
      if (keysRef.current.has("right")) {
        paddleXRef.current = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleXRef.current + moveSpeed);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [gameState]);

  // Initial draw
  useEffect(() => {
    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS - 5,
      dx: 0, dy: 0,
    };
    bricksRef.current = generateBricks();
    draw();
  }, [draw, generateBricks]);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const theme = getTheme(score);

  if (showLeaderboard) {
    return (
      <AlleywayLeaderboard
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
      <div className="relative neon-border-subtle rounded-lg" style={{ width: scaledWidth, height: scaledHeight }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg"
          style={{
            width: scaledWidth,
            height: scaledHeight,
            touchAction: "none",
            cursor: gameState === "playing" ? "none" : "default",
          }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-lg backdrop-blur-sm"
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-2 neon-glow">
                ALLEYWAY
              </p>
              <p className="text-xs text-primary/80 font-display tracking-widest mb-1">
                UNBREAKABLE EDITION
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Move mouse/finger or arrow keys
              </p>
              <Button
                onClick={startGame}
                className="font-display tracking-wide gap-2 btn-primary"
              >
                <Play className="w-4 h-4" /> START
              </Button>
            </motion.div>
          )}

          {gameState === "paused" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-lg backdrop-blur-sm"
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-6 neon-glow">
                PAUSED
              </p>
              <Button
                onClick={togglePause}
                className="font-display tracking-wide gap-2 btn-primary"
              >
                <Play className="w-4 h-4" /> RESUME
              </Button>
            </motion.div>
          )}

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg backdrop-blur-sm"
            >
              <p className="font-display text-2xl text-primary tracking-wide mb-1 neon-glow">
                GAME OVER
              </p>
              <p className="font-display text-5xl tracking-wide mb-1" style={{ color: theme.text }}>
                {score}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {themeShifts > 0 ? `${themeShifts} theme shift${themeShifts > 1 ? "s" : ""}` : "No shifts"}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={startGame}
                  className="font-display tracking-wide gap-2 btn-primary"
                >
                  <RotateCcw className="w-4 h-4" /> AGAIN
                </Button>
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="outline"
                  className="font-display tracking-wide gap-2 border-primary/50"
                >
                  <Trophy className="w-4 h-4" /> BOARD
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {gameState === "playing" && (
          <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-xs tracking-wide gap-1 border-primary/30">
            <Pause className="w-3 h-3" /> PAUSE
          </Button>
        )}
        {(gameState === "playing" || gameState === "paused") && (
          <Button onClick={startGame} variant="ghost" size="sm" className="font-display text-xs tracking-wide gap-1">
            <RotateCcw className="w-3 h-3" /> RESTART
          </Button>
        )}
        <Button
          onClick={() => setShowLeaderboard(true)}
          variant="ghost"
          size="sm"
          className="font-display text-xs tracking-wide gap-1"
        >
          <Trophy className="w-3 h-3" /> LEADERBOARD
        </Button>
      </div>

      {/* Mobile hint */}
      <p className="text-[10px] text-muted-foreground text-center font-display tracking-wider">
        SLIDE FINGER ON CANVAS TO MOVE PADDLE
      </p>
    </div>
  );
};

export default AlleywayGame;
