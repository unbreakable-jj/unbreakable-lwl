import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, Timer, TimerOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlleywayScores } from "@/hooks/useAlleywayScores";
import { AlleywayLeaderboard } from "./AlleywayLeaderboard";

// --- Theme Palettes ---
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
  reinforcedBorder: string;
}

const THEME_PALETTES: ThemePalette[] = [
  {
    bg: "#0a0a0a", bgGradientEnd: "#111111",
    paddle: "#f97316", paddleGlow: "rgba(249,115,22,0.6)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.5)",
    brickFill: "#f97316", brickHighlight: "#fb923c", brickShadow: "#c2410c", brickGlow: "rgba(249,115,22,0.35)",
    grid: "#1a1a1a", border: "#f97316", text: "#f97316", accent: "#ffffff",
    reinforcedBorder: "#ffffff",
  },
  {
    bg: "#111827", bgGradientEnd: "#1f2937",
    paddle: "#fb923c", paddleGlow: "rgba(251,146,60,0.5)",
    ball: "#fbbf24", ballGlow: "rgba(251,191,36,0.5)",
    brickFill: "#ea580c", brickHighlight: "#f97316", brickShadow: "#9a3412", brickGlow: "rgba(234,88,12,0.3)",
    grid: "#1e293b", border: "#fb923c", text: "#fb923c", accent: "#fbbf24",
    reinforcedBorder: "#fbbf24",
  },
  {
    bg: "#0a0a0a", bgGradientEnd: "#0f0f0f",
    paddle: "#ffffff", paddleGlow: "rgba(255,255,255,0.5)",
    ball: "#f97316", ballGlow: "rgba(249,115,22,0.6)",
    brickFill: "#d4d4d4", brickHighlight: "#ffffff", brickShadow: "#737373", brickGlow: "rgba(255,255,255,0.25)",
    grid: "#1a1a1a", border: "#ffffff", text: "#ffffff", accent: "#f97316",
    reinforcedBorder: "#f97316",
  },
  {
    bg: "#1c1917", bgGradientEnd: "#292524",
    paddle: "#f97316", paddleGlow: "rgba(249,115,22,0.5)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.4)",
    brickFill: "#c2410c", brickHighlight: "#ea580c", brickShadow: "#7c2d12", brickGlow: "rgba(194,65,12,0.3)",
    grid: "#292524", border: "#ea580c", text: "#ea580c", accent: "#ffffff",
    reinforcedBorder: "#ffffff",
  },
  {
    bg: "#0c0a09", bgGradientEnd: "#1c1917",
    paddle: "#fb923c", paddleGlow: "rgba(251,146,60,0.6)",
    ball: "#fef3c7", ballGlow: "rgba(254,243,199,0.5)",
    brickFill: "#f59e0b", brickHighlight: "#fbbf24", brickShadow: "#b45309", brickGlow: "rgba(245,158,11,0.3)",
    grid: "#1c1917", border: "#f59e0b", text: "#fbbf24", accent: "#ffffff",
    reinforcedBorder: "#ffffff",
  },
  {
    bg: "#18181b", bgGradientEnd: "#27272a",
    paddle: "#f97316", paddleGlow: "rgba(249,115,22,0.5)",
    ball: "#ffffff", ballGlow: "rgba(255,255,255,0.5)",
    brickFill: "#dc2626", brickHighlight: "#ef4444", brickShadow: "#991b1b", brickGlow: "rgba(220,38,38,0.3)",
    grid: "#27272a", border: "#f97316", text: "#f97316", accent: "#ef4444",
    reinforcedBorder: "#ffffff",
  },
];

// --- Constants ---
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 550;
const PADDLE_WIDTH = 80;
const PADDLE_WIDTH_WIDE = 130;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 3;
const BRICK_TOP_OFFSET = 50;

const INITIAL_BALL_SPEED = 2.4;
const MAX_BALL_SPEED = 5.0;
const SPEED_INCREASE_PER_SHIFT = 0.18;

const ROW_REGEN_INTERVAL = 9000;
const BRICK_DESCENT_INTERVAL = 12000;
const BRICK_DESCENT_AMOUNT = BRICK_HEIGHT + BRICK_PADDING;

const POWERUP_DROP_CHANCE = 0.18;
const POWERUP_SPEED = 1.5;
const POWERUP_SIZE = 16;
const POWERUP_DURATION = 8000; // ms

const SESSION_TIMER_SECONDS = 15 * 60;

type PowerUpType = "multiball" | "wide" | "fireball";

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  row: number;
  hp: number;
  isIndestructible: boolean;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  isFireball: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const getTheme = (score: number): ThemePalette => {
  const themeIndex = Math.floor(score / 8) % THEME_PALETTES.length;
  return THEME_PALETTES[themeIndex];
};

const getBallSpeed = (score: number): number => {
  const shifts = Math.floor(score / 8);
  return Math.min(MAX_BALL_SPEED, INITIAL_BALL_SPEED + shifts * SPEED_INCREASE_PER_SHIFT);
};

const POWERUP_COLORS: Record<PowerUpType, { bg: string; icon: string }> = {
  multiball: { bg: "#3b82f6", icon: "⚡" },
  wide: { bg: "#22c55e", icon: "↔" },
  fireball: { bg: "#ef4444", icon: "🔥" },
};

const AlleywayGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const paddleXRef = useRef(0);
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const scoreRef = useRef(0);
  const lastRegenRef = useRef<number>(0);
  const lastDescentRef = useRef<number>(0);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const activePowerUpsRef = useRef<Map<PowerUpType, number>>(new Map());
  const screenShakeRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [themeShifts, setThemeShifts] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false);
  const [activePowerUpDisplay, setActivePowerUpDisplay] = useState<PowerUpType[]>([]);

  const { saveScore, topScores, userBest, refetch } = useAlleywayScores();

  // Responsive scaling
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const maxWidth = Math.min(window.innerWidth - 32, CANVAS_WIDTH);
      setScale(maxWidth / CANVAS_WIDTH);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;

  // Session timer
  useEffect(() => {
    if (gameState !== "playing" || !timerActive) return;
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, timerActive]);

  const getCurrentPaddleWidth = useCallback(() => {
    const now = performance.now();
    const wideExpiry = activePowerUpsRef.current.get("wide");
    return wideExpiry && now < wideExpiry ? PADDLE_WIDTH_WIDE : PADDLE_WIDTH;
  }, []);

  const isFireballActive = useCallback(() => {
    const now = performance.now();
    const fireExpiry = activePowerUpsRef.current.get("fireball");
    return !!(fireExpiry && now < fireExpiry);
  }, []);

  const generateBricks = useCallback((): Brick[] => {
    const bricks: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const isIndestructible = row === 0 && (col === 0 || col === BRICK_COLS - 1);
        bricks.push({
          x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
          y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: brickWidth,
          height: BRICK_HEIGHT,
          alive: true,
          row,
          hp: isIndestructible ? 999 : row < 2 ? 2 : 1,
          isIndestructible,
        });
      }
    }
    return bricks;
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1 + Math.random() * 3;
      newParticles.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 2 + Math.random() * 3,
      });
    }
    particlesRef.current.push(...newParticles);
  }, []);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > POWERUP_DROP_CHANCE) return;
    const types: PowerUpType[] = ["multiball", "wide", "fireball"];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUpsRef.current.push({ x, y, type, alive: true });
  }, []);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    const now = performance.now();
    activePowerUpsRef.current.set(type, now + POWERUP_DURATION);
    screenShakeRef.current = 6;

    if (type === "multiball") {
      // Spawn 2 extra balls from the first ball's position
      const firstBall = ballsRef.current[0];
      if (firstBall) {
        const speed = getBallSpeed(scoreRef.current);
        ballsRef.current.push(
          { x: firstBall.x, y: firstBall.y, dx: -speed * 0.7, dy: -speed * 0.7, isFireball: false },
          { x: firstBall.x, y: firstBall.y, dx: speed * 0.7, dy: -speed * 0.7, isFireball: false }
        );
      }
    }

    if (type === "fireball") {
      ballsRef.current.forEach(b => b.isFireball = true);
    }

    // Update display state
    const activeTypes: PowerUpType[] = [];
    activePowerUpsRef.current.forEach((expiry, t) => {
      if (now < expiry) activeTypes.push(t);
    });
    setActivePowerUpDisplay(activeTypes);
  }, []);

  const spawnNewRow = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    const newBricks: Brick[] = [];
    const currentScore = scoreRef.current;
    const reinforceChance = Math.min(0.5, 0.15 + Math.floor(currentScore / 20) * 0.08);
    const steelChance = Math.min(0.15, Math.floor(currentScore / 40) * 0.05);

    for (let col = 0; col < BRICK_COLS; col++) {
      const isSteel = Math.random() < steelChance;
      newBricks.push({
        x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
        y: BRICK_TOP_OFFSET,
        width: brickWidth,
        height: BRICK_HEIGHT,
        alive: true,
        row: 0,
        hp: isSteel ? 999 : Math.random() < reinforceChance ? 2 : 1,
        isIndestructible: isSteel,
      });
    }

    // Push existing bricks down
    bricksRef.current = [
      ...newBricks,
      ...bricksRef.current.filter(b => b.alive).map(b => ({
        ...b,
        y: b.y + BRICK_DESCENT_AMOUNT,
        row: b.row + 1,
      })),
    ];
  }, []);

  // --- Drawing ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentScore = scoreRef.current;
    const theme = getTheme(currentScore);
    const paddle = paddleXRef.current;
    const balls = ballsRef.current;
    const bricks = bricksRef.current;
    const powerUps = powerUpsRef.current;
    const particles = particlesRef.current;
    const paddleW = getCurrentPaddleWidth();
    const shake = screenShakeRef.current;

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      screenShakeRef.current = Math.max(0, shake - 0.5);
    }

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, theme.bg);
    bgGrad.addColorStop(0.5, theme.bgGradientEnd);
    bgGrad.addColorStop(1, theme.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.3;
    for (let x = 0; x < CANVAS_WIDTH; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // Danger zone line (where bricks = game over)
    const dangerY = CANVAS_HEIGHT - PADDLE_HEIGHT - 30;
    ctx.strokeStyle = `${theme.accent}22`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, dangerY); ctx.lineTo(CANVAS_WIDTH, dangerY); ctx.stroke();
    ctx.setLineDash([]);

    // Bricks
    bricks.forEach((brick) => {
      if (!brick.alive) return;

      if (brick.isIndestructible) {
        // Steel brick
        ctx.shadowColor = "rgba(120,120,120,0.3)";
        ctx.shadowBlur = 4;
        const steelGrad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        steelGrad.addColorStop(0, "#6b7280");
        steelGrad.addColorStop(0.5, "#4b5563");
        steelGrad.addColorStop(1, "#374151");
        ctx.fillStyle = steelGrad;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
        ctx.fill();

        // Steel cross pattern
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#9ca3af44";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(brick.x + 3, brick.y + 3);
        ctx.lineTo(brick.x + brick.width - 3, brick.y + brick.height - 3);
        ctx.moveTo(brick.x + brick.width - 3, brick.y + 3);
        ctx.lineTo(brick.x + 3, brick.y + brick.height - 3);
        ctx.stroke();
      } else {
        ctx.shadowColor = theme.brickGlow;
        ctx.shadowBlur = 8;

        const brickGrad = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        brickGrad.addColorStop(0, theme.brickHighlight);
        brickGrad.addColorStop(0.5, theme.brickFill);
        brickGrad.addColorStop(1, theme.brickShadow);
        ctx.fillStyle = brickGrad;

        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();

        // Top highlight
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `${theme.brickHighlight}66`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(brick.x + 4, brick.y + 1.5);
        ctx.lineTo(brick.x + brick.width - 4, brick.y + 1.5);
        ctx.stroke();

        // Reinforced border
        if (brick.hp > 1) {
          ctx.strokeStyle = theme.reinforcedBorder;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(brick.x + 1, brick.y + 1, brick.width - 2, brick.height - 2, 3);
          ctx.stroke();
        }
      }
    });
    ctx.shadowBlur = 0;

    // Power-ups
    powerUps.forEach((pu) => {
      if (!pu.alive) return;
      const colors = POWERUP_COLORS[pu.type];
      
      // Glow
      ctx.shadowColor = colors.bg;
      ctx.shadowBlur = 10;
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      ctx.roundRect(pu.x - POWERUP_SIZE / 2, pu.y - POWERUP_SIZE / 2, POWERUP_SIZE, POWERUP_SIZE, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Icon
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(colors.icon, pu.x, pu.y);
    });

    // Particles
    particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Paddle
    const paddleY = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 14;

    const paddleGrad = ctx.createLinearGradient(paddle, paddleY, paddle, paddleY + PADDLE_HEIGHT);
    paddleGrad.addColorStop(0, theme.paddle);
    paddleGrad.addColorStop(1, theme.paddle + "BB");
    ctx.fillStyle = paddleGrad;

    ctx.beginPath();
    ctx.roundRect(paddle, paddleY, paddleW, PADDLE_HEIGHT, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Paddle highlight
    ctx.strokeStyle = `${theme.paddle}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddle + 6, paddleY + 2);
    ctx.lineTo(paddle + paddleW - 6, paddleY + 2);
    ctx.stroke();

    // Balls
    balls.forEach((ball) => {
      // Trail
      for (let i = 3; i >= 1; i--) {
        const trailX = ball.x - ball.dx * i * 0.4;
        const trailY = ball.y - ball.dy * i * 0.4;
        const alpha = 0.15 - i * 0.04;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = ball.isFireball ? "#ef4444" : theme.ball;
        ctx.beginPath();
        ctx.arc(trailX, trailY, BALL_RADIUS - i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Main ball
      ctx.shadowColor = ball.isFireball ? "rgba(239,68,68,0.8)" : theme.ballGlow;
      ctx.shadowBlur = ball.isFireball ? 20 : 16;
      ctx.fillStyle = ball.isFireball ? "#ef4444" : theme.ball;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.shadowBlur = 0;
      const ballHighlight = ctx.createRadialGradient(ball.x - 1.5, ball.y - 1.5, 0, ball.x, ball.y, BALL_RADIUS);
      ballHighlight.addColorStop(0, "rgba(255,255,255,0.7)");
      ballHighlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = ballHighlight;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    // Border
    ctx.shadowColor = theme.paddleGlow;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.shadowBlur = 0;

    // Score on canvas (top area)
    ctx.fillStyle = theme.text;
    ctx.font = "bold 14px 'Bebas Neue', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${currentScore}`, 10, 20);

    ctx.textAlign = "right";
    ctx.fillStyle = theme.accent;
    ctx.fillText(`BALLS: ${balls.length}`, CANVAS_WIDTH - 10, 20);

    // Active powerup indicators
    const now = performance.now();
    let puX = 10;
    activePowerUpsRef.current.forEach((expiry, type) => {
      if (now < expiry) {
        const remaining = Math.ceil((expiry - now) / 1000);
        const colors = POWERUP_COLORS[type];
        ctx.fillStyle = colors.bg;
        ctx.beginPath();
        ctx.roundRect(puX, 30, 50, 14, 3);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${colors.icon} ${remaining}s`, puX + 4, 40);
        puX += 56;
      }
    });

    ctx.restore();
  }, [getCurrentPaddleWidth]);

  const handleGameOver = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setGameState("gameover");

    const finalScore = scoreRef.current;
    const shifts = Math.floor(finalScore / 8);

    if (finalScore > highScore) setHighScore(finalScore);
    if (finalScore > 0) saveScore(finalScore, shifts);
  }, [highScore, saveScore]);

  // Main game loop
  const gameLoop = useCallback(() => {
    const balls = ballsRef.current;
    const speed = getBallSpeed(scoreRef.current);
    const paddleW = getCurrentPaddleWidth();
    const fireActive = isFireballActive();
    const now = performance.now();

    // Update fireball state on balls
    balls.forEach(b => b.isFireball = fireActive);

    // Clean expired power-ups from display
    const activeTypes: PowerUpType[] = [];
    activePowerUpsRef.current.forEach((expiry, type) => {
      if (now < expiry) activeTypes.push(type);
    });
    setActivePowerUpDisplay(activeTypes);

    // Move balls
    const ballsToRemove: number[] = [];
    balls.forEach((ball, idx) => {
      // Normalize speed
      const mag = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      if (mag > 0) {
        ball.dx = (ball.dx / mag) * speed;
        ball.dy = (ball.dy / mag) * speed;
      }

      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collision
      if (ball.x - BALL_RADIUS <= 0) { ball.x = BALL_RADIUS; ball.dx = Math.abs(ball.dx); }
      else if (ball.x + BALL_RADIUS >= CANVAS_WIDTH) { ball.x = CANVAS_WIDTH - BALL_RADIUS; ball.dx = -Math.abs(ball.dx); }
      if (ball.y - BALL_RADIUS <= 0) { ball.y = BALL_RADIUS; ball.dy = Math.abs(ball.dy); }

      // Bottom
      if (ball.y + BALL_RADIUS >= CANVAS_HEIGHT) {
        ballsToRemove.push(idx);
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
        ball.x <= paddleX + paddleW
      ) {
        ball.y = paddleTop - BALL_RADIUS;
        const hitPos = (ball.x - paddleX) / paddleW;
        const angle = (hitPos - 0.5) * Math.PI * 0.7;
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.cos(angle) * speed;
      }

      // Brick collision
      bricksRef.current.forEach((brick) => {
        if (!brick.alive) return;
        if (
          ball.x + BALL_RADIUS > brick.x &&
          ball.x - BALL_RADIUS < brick.x + brick.width &&
          ball.y + BALL_RADIUS > brick.y &&
          ball.y - BALL_RADIUS < brick.y + brick.height
        ) {
          if (brick.isIndestructible) {
            // Just bounce, fireball ignores indestructible too
            if (!ball.isFireball) {
              const overlapLeft = (ball.x + BALL_RADIUS) - brick.x;
              const overlapRight = (brick.x + brick.width) - (ball.x - BALL_RADIUS);
              const overlapTop = (ball.y + BALL_RADIUS) - brick.y;
              const overlapBottom = (brick.y + brick.height) - (ball.y - BALL_RADIUS);
              const minOverlapX = Math.min(overlapLeft, overlapRight);
              const minOverlapY = Math.min(overlapTop, overlapBottom);
              if (minOverlapX < minOverlapY) ball.dx = -ball.dx;
              else ball.dy = -ball.dy;
            }
            return;
          }

          brick.hp -= ball.isFireball ? 3 : 1;
          if (brick.hp <= 0) {
            brick.alive = false;
            scoreRef.current++;
            setScore(scoreRef.current);
            spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, getTheme(scoreRef.current).brickFill, 10);
            spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);

            const oldShifts = Math.floor((scoreRef.current - 1) / 8);
            const newShifts = Math.floor(scoreRef.current / 8);
            if (newShifts > oldShifts) setThemeShifts(newShifts);
          }

          // Bounce (fireball goes through)
          if (!ball.isFireball) {
            const overlapLeft = (ball.x + BALL_RADIUS) - brick.x;
            const overlapRight = (brick.x + brick.width) - (ball.x - BALL_RADIUS);
            const overlapTop = (ball.y + BALL_RADIUS) - brick.y;
            const overlapBottom = (brick.y + brick.height) - (ball.y - BALL_RADIUS);
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
            if (minOverlapX < minOverlapY) ball.dx = -ball.dx;
            else ball.dy = -ball.dy;
          }
        }
      });
    });

    // Remove fallen balls
    ballsToRemove.sort((a, b) => b - a).forEach(i => balls.splice(i, 1));
    if (balls.length === 0) {
      handleGameOver();
      return;
    }

    // Power-up falling & collection
    const paddleTop = CANVAS_HEIGHT - PADDLE_HEIGHT - 10;
    const paddleX = paddleXRef.current;
    powerUpsRef.current.forEach((pu) => {
      if (!pu.alive) return;
      pu.y += POWERUP_SPEED;

      // Collect
      if (
        pu.y + POWERUP_SIZE / 2 >= paddleTop &&
        pu.y - POWERUP_SIZE / 2 <= paddleTop + PADDLE_HEIGHT &&
        pu.x >= paddleX &&
        pu.x <= paddleX + paddleW
      ) {
        pu.alive = false;
        activatePowerUp(pu.type);
        spawnParticles(pu.x, pu.y, POWERUP_COLORS[pu.type].bg, 12);
      }

      // Off screen
      if (pu.y > CANVAS_HEIGHT + POWERUP_SIZE) pu.alive = false;
    });
    powerUpsRef.current = powerUpsRef.current.filter(p => p.alive);

    // Particles update
    particlesRef.current.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.05; // gravity
      p.life--;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Brick descent (gradual push down over time)
    if (now - lastDescentRef.current >= BRICK_DESCENT_INTERVAL) {
      lastDescentRef.current = now;
      bricksRef.current.forEach(b => {
        if (b.alive) b.y += BRICK_DESCENT_AMOUNT * 0.5;
      });

      // Check if any brick reached danger zone
      const dangerY = CANVAS_HEIGHT - PADDLE_HEIGHT - 30;
      const brickInDanger = bricksRef.current.some(b => b.alive && b.y + b.height >= dangerY);
      if (brickInDanger) {
        handleGameOver();
        return;
      }
    }

    // Row regen
    if (now - lastRegenRef.current >= ROW_REGEN_INTERVAL) {
      lastRegenRef.current = now;
      const aliveBricks = bricksRef.current.filter(b => b.alive);
      if (aliveBricks.length < BRICK_ROWS * BRICK_COLS) {
        spawnNewRow();
      }
    }

    // All bricks cleared
    const aliveBricks = bricksRef.current.filter(b => b.alive);
    if (aliveBricks.length === 0) {
      spawnNewRow();
      spawnNewRow();
      spawnNewRow();
      lastRegenRef.current = now;
    }

    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [draw, handleGameOver, spawnNewRow, getCurrentPaddleWidth, isFireballActive, spawnParticles, spawnPowerUp, activatePowerUp]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setThemeShifts(0);
    setSessionTimeLeft(SESSION_TIMER_SECONDS);
    setTimerExpired(false);
    setTimerActive(true);
    setActivePowerUpDisplay([]);
    activePowerUpsRef.current.clear();
    powerUpsRef.current = [];
    particlesRef.current = [];
    screenShakeRef.current = 0;

    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballsRef.current = [{
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS - 5,
      dx: (Math.random() > 0.5 ? 1 : -1) * 1.5,
      dy: -INITIAL_BALL_SPEED,
      isFireball: false,
    }];
    bricksRef.current = generateBricks();
    lastRegenRef.current = performance.now();
    lastDescentRef.current = performance.now();

    setGameState("playing");
    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [generateBricks, draw, gameLoop]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      cancelAnimationFrame(animFrameRef.current);
      setGameState("paused");
    } else if (gameState === "paused") {
      lastRegenRef.current = performance.now();
      lastDescentRef.current = performance.now();
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
    const pw = getCurrentPaddleWidth();
    paddleXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - pw, relativeX - pw / 2));
  }, [scale, getCurrentPaddleWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMouseMove = (e: MouseEvent) => { if (gameState === "playing") movePaddle(e.clientX); };
    const handleTouchMove = (e: TouchEvent) => { if (gameState === "playing") { e.preventDefault(); movePaddle(e.touches[0].clientX); } };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => { canvas.removeEventListener("mousemove", handleMouseMove); canvas.removeEventListener("touchmove", handleTouchMove); };
  }, [gameState, movePaddle]);

  // Keyboard
  const keysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keysRef.current.add("left"); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keysRef.current.add("right"); e.preventDefault(); }
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
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [gameState, startGame, togglePause]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const moveSpeed = 6;
    const interval = setInterval(() => {
      const pw = getCurrentPaddleWidth();
      if (keysRef.current.has("left")) paddleXRef.current = Math.max(0, paddleXRef.current - moveSpeed);
      if (keysRef.current.has("right")) paddleXRef.current = Math.min(CANVAS_WIDTH - pw, paddleXRef.current + moveSpeed);
    }, 16);
    return () => clearInterval(interval);
  }, [gameState, getCurrentPaddleWidth]);

  // Initial draw
  useEffect(() => {
    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    ballsRef.current = [{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS - 5, dx: 0, dy: 0, isFireball: false }];
    bricksRef.current = generateBricks();
    draw();
  }, [draw, generateBricks]);

  useEffect(() => { return () => cancelAnimationFrame(animFrameRef.current); }, []);

  const theme = getTheme(score);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

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
    <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
      {/* Session Timer */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border w-full justify-between ${
        timerExpired ? "border-destructive bg-destructive/10" : "border-border bg-card"
      }`}>
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${timerExpired ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className={`font-display text-lg tracking-wide ${timerExpired ? "text-destructive" : "text-foreground"}`}>
            {timerExpired ? "TIME'S UP!" : formatTime(sessionTimeLeft)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (timerExpired) {
              setSessionTimeLeft(SESSION_TIMER_SECONDS);
              setTimerExpired(false);
              setTimerActive(true);
            } else {
              setTimerActive(!timerActive);
            }
          }}
          className="font-display text-xs tracking-wide"
        >
          {timerExpired ? (
            <><RotateCcw className="w-3 h-3 mr-1" /> RESET</>
          ) : timerActive ? (
            <><Pause className="w-3 h-3 mr-1" /> PAUSE</>
          ) : (
            <><Play className="w-3 h-3 mr-1" /> RESUME</>
          )}
        </Button>
      </div>

      {/* Score Header */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="text-left">
          <p className="font-display text-xs tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-3xl tracking-wide" style={{ color: theme.text }}>{score}</p>
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
                LEVEL {themeShifts + 1}
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

      {/* Active Power-ups (React UI) */}
      {activePowerUpDisplay.length > 0 && (
        <div className="flex gap-2 w-full px-2">
          {activePowerUpDisplay.map((type) => (
            <motion.div
              key={type}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 rounded text-xs font-display tracking-wide text-white"
              style={{ backgroundColor: POWERUP_COLORS[type].bg }}
            >
              {POWERUP_COLORS[type].icon} {type.toUpperCase()}
            </motion.div>
          ))}
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative rounded-lg" style={{ width: scaledWidth, height: scaledHeight }}>
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

        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg backdrop-blur-sm"
            >
              <p className="font-display text-4xl text-primary tracking-wide mb-1 neon-glow">ALLEYWAY</p>
              <p className="text-xs text-primary/80 font-display tracking-widest mb-4">UNBREAKABLE EDITION</p>
              <div className="space-y-1 text-center mb-6">
                <p className="text-xs text-muted-foreground">🎮 Move paddle with mouse/finger/arrows</p>
                <p className="text-xs text-muted-foreground">⚡ Catch power-ups for abilities</p>
                <p className="text-xs text-muted-foreground">⚠️ Don't let bricks reach the bottom!</p>
              </div>
              <Button onClick={startGame} className="font-display tracking-wide gap-2 btn-primary">
                <Play className="w-4 h-4" /> START GAME
              </Button>
            </motion.div>
          )}

          {gameState === "paused" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg backdrop-blur-sm"
            >
              <p className="font-display text-3xl text-primary tracking-wide mb-6 neon-glow">PAUSED</p>
              <Button onClick={togglePause} className="font-display tracking-wide gap-2 btn-primary">
                <Play className="w-4 h-4" /> RESUME
              </Button>
            </motion.div>
          )}

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-lg backdrop-blur-sm"
            >
              <p className="font-display text-2xl text-primary tracking-wide mb-1 neon-glow">GAME OVER</p>
              <p className="font-display text-5xl tracking-wide mb-1" style={{ color: theme.text }}>{score}</p>
              <p className="text-xs text-muted-foreground mb-1">
                Level {themeShifts + 1} reached
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {SESSION_TIMER_SECONDS - sessionTimeLeft > 0
                  ? `Played for ${formatTime(SESSION_TIMER_SECONDS - sessionTimeLeft)}`
                  : ""}
              </p>
              <div className="flex gap-2">
                <Button onClick={startGame} className="font-display tracking-wide gap-2 btn-primary">
                  <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                </Button>
                <Button onClick={() => setShowLeaderboard(true)} variant="outline" className="font-display tracking-wide gap-2 border-primary/50">
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
        <Button onClick={() => setShowLeaderboard(true)} variant="ghost" size="sm" className="font-display text-xs tracking-wide gap-1">
          <Trophy className="w-3 h-3" /> LEADERBOARD
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center font-display tracking-wider">
        SLIDE FINGER ON CANVAS TO MOVE PADDLE • CATCH POWER-UPS FOR ABILITIES
      </p>
    </div>
  );
};

export default AlleywayGame;
