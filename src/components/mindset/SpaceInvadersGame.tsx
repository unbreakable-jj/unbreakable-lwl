import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Trophy, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpaceInvadersScores } from "@/hooks/useSpaceInvadersScores";
import { SpaceInvadersLeaderboard } from "./SpaceInvadersLeaderboard";

// --- Types ---
interface Invader { x: number; y: number; alive: boolean; type: number; }
interface Bullet { x: number; y: number; }
interface EnemyBullet { x: number; y: number; }
interface Particle { x: number; y: number; dx: number; dy: number; life: number; maxLife: number; color: string; size: number; }
interface BarrierBlock { x: number; y: number; hp: number; }
interface PowerUp { x: number; y: number; type: "shield" | "multishot"; life: number; }

interface ThemePalette {
  bg: string; ship: string; shipGlow: string; bullet: string;
  invader1: string; invader2: string; invader3: string;
  enemyBullet: string; grid: string; border: string; text: string; accent: string;
}

// --- Themes cycling every wave ---
const THEME_PALETTES: ThemePalette[] = [
  { bg: "#0a0a0a", ship: "#f97316", shipGlow: "rgba(249,115,22,0.6)", bullet: "#ffffff", invader1: "#f97316", invader2: "#fb923c", invader3: "#ea580c", enemyBullet: "#ff4500", grid: "#1a1a1a", border: "#f97316", text: "#f97316", accent: "#ffffff" },
  { bg: "#f0f0f0", ship: "#f97316", shipGlow: "rgba(249,115,22,0.4)", bullet: "#0a0a0a", invader1: "#0a0a0a", invader2: "#1a1a1a", invader3: "#333333", enemyBullet: "#f97316", grid: "#d8d8d8", border: "#f97316", text: "#0a0a0a", accent: "#f97316" },
  { bg: "#0c0a09", ship: "#fb923c", shipGlow: "rgba(251,146,60,0.6)", bullet: "#ffffff", invader1: "#ea580c", invader2: "#f97316", invader3: "#fb923c", enemyBullet: "#ff6a00", grid: "#1c1917", border: "#ea580c", text: "#fb923c", accent: "#ffffff" },
  { bg: "#f5f0eb", ship: "#0a0a0a", shipGlow: "rgba(0,0,0,0.3)", bullet: "#f97316", invader1: "#f97316", invader2: "#ea580c", invader3: "#c2410c", enemyBullet: "#0a0a0a", grid: "#e0dbd5", border: "#0a0a0a", text: "#0a0a0a", accent: "#f97316" },
  { bg: "#0a0a0a", ship: "#ffffff", shipGlow: "rgba(255,255,255,0.4)", bullet: "#f97316", invader1: "#ffffff", invader2: "#e5e5e5", invader3: "#d4d4d4", enemyBullet: "#f97316", grid: "#1a1a1a", border: "#ffffff", text: "#ffffff", accent: "#f97316" },
  { bg: "#f8f8f8", ship: "#ff6a00", shipGlow: "rgba(255,106,0,0.5)", bullet: "#0a0a0a", invader1: "#ff6a00", invader2: "#cc5500", invader3: "#993d00", enemyBullet: "#0a0a0a", grid: "#e0e0e0", border: "#ff6a00", text: "#ff6a00", accent: "#0a0a0a" },
];

// --- Constants ---
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const SHIP_WIDTH = 36;
const SHIP_HEIGHT = 20;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 12;
const BULLET_SPEED = 6;
const ENEMY_BULLET_SPEED = 3;
const INVADER_SIZE = 24;
const INVADER_COLS = 8;
const INVADER_ROWS = 5;
const INVADER_PADDING = 8;
const INVADER_TOP_OFFSET = 40;
const SHIP_Y = CANVAS_HEIGHT - 40;
const FIRE_COOLDOWN = 250;

// Barrier constants
const BARRIER_BLOCK_SIZE = 6;
const BARRIER_COLS = 6;
const BARRIER_ROWS = 4;
const BARRIER_Y = SHIP_Y - 60;
const NUM_BARRIERS = 3;
const BARRIER_MAX_HP = 3;

// Power-up constants
const POWERUP_SIZE = 14;
const POWERUP_SPEED = 1.5;
const POWERUP_DROP_CHANCE = 0.20;
const SHIELD_DURATION = 180; // frames (~3s)
const MULTISHOT_DURATION = 300; // frames (~5s)

const LEVEL_MESSAGES = [
  "STAY HUNGRY", "NO LIMITS", "LOCKED IN", "RELENTLESS", "ZERO QUIT",
  "UNSTOPPABLE", "ELITE FOCUS", "BORN FOR THIS", "NO DAYS OFF", "KEEP RISING",
  "PURE GRIT", "UNBREAKABLE", "ON FIRE", "NEXT LEVEL", "ALL IN",
  "NEVER SETTLE", "BEAST MODE", "OWN IT", "DIG DEEPER", "PROVE THEM WRONG",
];

const getLevelMessage = (wave: number): string =>
  wave > 0 ? LEVEL_MESSAGES[(wave - 1) % LEVEL_MESSAGES.length] : "";

const getTheme = (wave: number): ThemePalette =>
  THEME_PALETTES[wave % THEME_PALETTES.length];

const SpaceInvadersGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const shipXRef = useRef(CANVAS_WIDTH / 2 - SHIP_WIDTH / 2);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const invadersRef = useRef<Invader[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const barriersRef = useRef<BarrierBlock[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const scoreRef = useRef(0);
  const waveRef = useRef(0);
  const invaderDirRef = useRef(1);
  const invaderSpeedRef = useRef(0.4);
  const invaderDropRef = useRef(false);
  const lastFireRef = useRef(0);
  const livesRef = useRef(3);
  const keysRef = useRef<Set<string>>(new Set());
  const screenShakeRef = useRef(0);
  const shieldActiveRef = useRef(0);
  const multishotActiveRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "gameover">("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);

  const { saveScore, topScores, userBest, refetch } = useSpaceInvadersScores();

  // Responsive scaling
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => setScale(Math.min((window.innerWidth - 32) / CANVAS_WIDTH, 1.2));
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 1.5 + Math.random() * 3;
      particlesRef.current.push({
        x, y, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 20, maxLife: 40, color, size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const createBarriers = useCallback(() => {
    const blocks: BarrierBlock[] = [];
    const totalBarrierWidth = BARRIER_COLS * BARRIER_BLOCK_SIZE;
    const spacing = CANVAS_WIDTH / (NUM_BARRIERS + 1);
    for (let b = 0; b < NUM_BARRIERS; b++) {
      const bx = spacing * (b + 1) - totalBarrierWidth / 2;
      for (let row = 0; row < BARRIER_ROWS; row++) {
        for (let col = 0; col < BARRIER_COLS; col++) {
          blocks.push({
            x: bx + col * BARRIER_BLOCK_SIZE,
            y: BARRIER_Y + row * BARRIER_BLOCK_SIZE,
            hp: BARRIER_MAX_HP,
          });
        }
      }
    }
    return blocks;
  }, []);

  const createWave = useCallback((waveNum: number) => {
    const invaders: Invader[] = [];
    const totalWidth = INVADER_COLS * (INVADER_SIZE + INVADER_PADDING) - INVADER_PADDING;
    const startX = (CANVAS_WIDTH - totalWidth) / 2;
    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLS; col++) {
        invaders.push({
          x: startX + col * (INVADER_SIZE + INVADER_PADDING),
          y: INVADER_TOP_OFFSET + row * (INVADER_SIZE + INVADER_PADDING),
          alive: true,
          type: row < 1 ? 2 : row < 3 ? 1 : 0,
        });
      }
    }
    invadersRef.current = invaders;
    invaderDirRef.current = 1;
    invaderSpeedRef.current = 0.4 + waveNum * 0.12;
    invaderDropRef.current = false;
    enemyBulletsRef.current = [];
    powerUpsRef.current = [];
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = waveRef.current;
    const theme = getTheme(w);
    const shake = screenShakeRef.current;

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      screenShakeRef.current = Math.max(0, shake - 0.4);
    }

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.3;
    for (let x = 0; x < CANVAS_WIDTH; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // Invaders
    invadersRef.current.forEach((inv) => {
      if (!inv.alive) return;
      const colors = [theme.invader1, theme.invader2, theme.invader3];
      const color = colors[inv.type];
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;

      const cx = inv.x + INVADER_SIZE / 2;
      const cy = inv.y + INVADER_SIZE / 2;
      const s = INVADER_SIZE / 2;

      if (inv.type === 2) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
        ctx.closePath(); ctx.fill();
      } else if (inv.type === 1) {
        ctx.beginPath();
        ctx.roundRect(inv.x + 2, inv.y + 2, INVADER_SIZE - 4, INVADER_SIZE - 4, 4);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, s - 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Eyes
      ctx.fillStyle = theme.bg;
      ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
    });

    // Barriers
    barriersRef.current.forEach((block) => {
      const hpRatio = block.hp / BARRIER_MAX_HP;
      const alpha = 0.3 + hpRatio * 0.7;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = theme.accent;
      ctx.fillRect(block.x, block.y, BARRIER_BLOCK_SIZE, BARRIER_BLOCK_SIZE);
      if (hpRatio < 1) {
        // Damage cracks
        ctx.fillStyle = theme.bg;
        if (block.hp <= 1) {
          ctx.fillRect(block.x + 1, block.y + 1, 2, 2);
          ctx.fillRect(block.x + 3, block.y + 3, 2, 2);
        } else if (block.hp <= 2) {
          ctx.fillRect(block.x + 2, block.y + 2, 2, 2);
        }
      }
    });
    ctx.globalAlpha = 1;

    // Power-ups
    powerUpsRef.current.forEach((pu) => {
      const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      if (pu.type === "shield") {
        ctx.fillStyle = "#3b82f6";
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pu.x + POWERUP_SIZE / 2, pu.y + POWERUP_SIZE / 2, POWERUP_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        // S letter
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("S", pu.x + POWERUP_SIZE / 2, pu.y + POWERUP_SIZE / 2 + 3);
      } else {
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pu.x + POWERUP_SIZE / 2, pu.y + POWERUP_SIZE / 2, POWERUP_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        // M letter
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("M", pu.x + POWERUP_SIZE / 2, pu.y + POWERUP_SIZE / 2 + 3);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // Player ship
    const sx = shipXRef.current;
    ctx.shadowColor = theme.shipGlow;
    ctx.shadowBlur = 15;
    ctx.fillStyle = theme.ship;

    // Shield glow
    if (shieldActiveRef.current > 0) {
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 25;
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx + SHIP_WIDTH / 2, SHIP_Y + SHIP_HEIGHT / 2, SHIP_WIDTH / 2 + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(sx + SHIP_WIDTH / 2, SHIP_Y);
    ctx.lineTo(sx + SHIP_WIDTH, SHIP_Y + SHIP_HEIGHT);
    ctx.lineTo(sx, SHIP_Y + SHIP_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ship highlight
    ctx.fillStyle = theme.accent + "33";
    ctx.beginPath();
    ctx.moveTo(sx + SHIP_WIDTH / 2, SHIP_Y + 4);
    ctx.lineTo(sx + SHIP_WIDTH / 2 + 6, SHIP_Y + SHIP_HEIGHT - 2);
    ctx.lineTo(sx + SHIP_WIDTH / 2 - 6, SHIP_Y + SHIP_HEIGHT - 2);
    ctx.closePath();
    ctx.fill();

    // Multishot indicator
    if (multishotActiveRef.current > 0) {
      ctx.fillStyle = "#ef444466";
      ctx.beginPath();
      ctx.arc(sx + SHIP_WIDTH / 2, SHIP_Y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player bullets
    ctx.shadowColor = theme.bullet;
    ctx.shadowBlur = 8;
    ctx.fillStyle = theme.bullet;
    bulletsRef.current.forEach((b) => {
      ctx.beginPath();
      ctx.roundRect(b.x - BULLET_WIDTH / 2, b.y, BULLET_WIDTH, BULLET_HEIGHT, 2);
      ctx.fill();
    });

    // Enemy bullets
    ctx.shadowColor = theme.enemyBullet;
    ctx.shadowBlur = 6;
    ctx.fillStyle = theme.enemyBullet;
    enemyBulletsRef.current.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Particles
    particlesRef.current.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Lives
    for (let i = 0; i < livesRef.current; i++) {
      ctx.fillStyle = theme.ship;
      ctx.beginPath();
      const lx = 12 + i * 22;
      ctx.moveTo(lx + 8, CANVAS_HEIGHT - 14);
      ctx.lineTo(lx + 16, CANVAS_HEIGHT - 4);
      ctx.lineTo(lx, CANVAS_HEIGHT - 4);
      ctx.closePath();
      ctx.fill();
    }

    // Border
    ctx.shadowColor = theme.border + "88";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }, []);

  const gameOver = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setGameState("gameover");
    const finalScore = scoreRef.current;
    const finalWave = waveRef.current;
    if (finalScore > highScore) setHighScore(finalScore);
    if (finalScore > 0) saveScore(finalScore, finalWave);
  }, [highScore, saveScore]);

  const fireBullets = useCallback(() => {
    const sx = shipXRef.current;
    const cx = sx + SHIP_WIDTH / 2;
    if (multishotActiveRef.current > 0) {
      bulletsRef.current.push({ x: cx, y: SHIP_Y - 2 });
      bulletsRef.current.push({ x: cx - 12, y: SHIP_Y + 2 });
      bulletsRef.current.push({ x: cx + 12, y: SHIP_Y + 2 });
    } else {
      bulletsRef.current.push({ x: cx, y: SHIP_Y - 2 });
    }
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return;

    const theme = getTheme(waveRef.current);

    // Move ship
    if (keysRef.current.has("left")) shipXRef.current = Math.max(0, shipXRef.current - 5);
    if (keysRef.current.has("right")) shipXRef.current = Math.min(CANVAS_WIDTH - SHIP_WIDTH, shipXRef.current + 5);

    // Auto-fire check
    const now = performance.now();
    if (keysRef.current.has("fire") && now - lastFireRef.current > FIRE_COOLDOWN) {
      lastFireRef.current = now;
      fireBullets();
    }

    // Move player bullets
    bulletsRef.current.forEach(b => b.y -= BULLET_SPEED);
    bulletsRef.current = bulletsRef.current.filter(b => b.y > -BULLET_HEIGHT);

    // Move invaders
    let hitEdge = false;
    const speed = invaderSpeedRef.current;
    invadersRef.current.forEach((inv) => {
      if (!inv.alive) return;
      inv.x += speed * invaderDirRef.current;
      if (inv.x <= 0 || inv.x + INVADER_SIZE >= CANVAS_WIDTH) hitEdge = true;
    });

    if (hitEdge) {
      invaderDirRef.current *= -1;
      invadersRef.current.forEach((inv) => {
        if (inv.alive) inv.y += 12;
      });
    }

    // Check if invaders reached barriers/bottom
    if (invadersRef.current.some(inv => inv.alive && inv.y + INVADER_SIZE >= SHIP_Y)) {
      gameOver();
      return;
    }

    // Enemy fire — 2x base, scales with waves
    const aliveInvaders = invadersRef.current.filter(inv => inv.alive);
    const fireChance = 0.016 + waveRef.current * 0.004;
    if (aliveInvaders.length > 0 && Math.random() < fireChance) {
      const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
      enemyBulletsRef.current.push({ x: shooter.x + INVADER_SIZE / 2, y: shooter.y + INVADER_SIZE });
    }

    // Move enemy bullets
    enemyBulletsRef.current.forEach(b => b.y += ENEMY_BULLET_SPEED + waveRef.current * 0.2);
    enemyBulletsRef.current = enemyBulletsRef.current.filter(b => b.y < CANVAS_HEIGHT + 10);

    // Move power-ups
    powerUpsRef.current.forEach(pu => { pu.y += POWERUP_SPEED; pu.life--; });
    powerUpsRef.current = powerUpsRef.current.filter(pu => pu.y < CANVAS_HEIGHT + 20 && pu.life > 0);

    // Decrement power-up timers
    if (shieldActiveRef.current > 0) {
      shieldActiveRef.current--;
      if (shieldActiveRef.current <= 0) setActivePowerUp(null);
    }
    if (multishotActiveRef.current > 0) {
      multishotActiveRef.current--;
      if (multishotActiveRef.current <= 0) setActivePowerUp(null);
    }

    // Player bullet → invader collision
    bulletsRef.current.forEach((bullet) => {
      invadersRef.current.forEach((inv) => {
        if (!inv.alive) return;
        if (
          bullet.x > inv.x && bullet.x < inv.x + INVADER_SIZE &&
          bullet.y > inv.y && bullet.y < inv.y + INVADER_SIZE
        ) {
          inv.alive = false;
          bullet.y = -100;
          const points = (inv.type + 1) * 10;
          scoreRef.current += points;
          setScore(scoreRef.current);
          const colors = [theme.invader1, theme.invader2, theme.invader3];
          spawnParticles(inv.x + INVADER_SIZE / 2, inv.y + INVADER_SIZE / 2, colors[inv.type], 10);
          screenShakeRef.current = 4;

          // Speed up remaining invaders
          const remaining = invadersRef.current.filter(i => i.alive).length;
          if (remaining > 0) {
            invaderSpeedRef.current = (0.4 + waveRef.current * 0.12) * (1 + (INVADER_COLS * INVADER_ROWS - remaining) * 0.02);
          }

          // Power-up drop chance
          if (Math.random() < POWERUP_DROP_CHANCE) {
            const type = Math.random() < 0.5 ? "shield" : "multishot";
            powerUpsRef.current.push({
              x: inv.x + INVADER_SIZE / 2 - POWERUP_SIZE / 2,
              y: inv.y + INVADER_SIZE / 2,
              type,
              life: 600,
            });
          }
        }
      });
    });
    bulletsRef.current = bulletsRef.current.filter(b => b.y > -BULLET_HEIGHT);

    // Player bullet → barrier collision
    bulletsRef.current.forEach((bullet) => {
      for (let i = barriersRef.current.length - 1; i >= 0; i--) {
        const block = barriersRef.current[i];
        if (
          bullet.x >= block.x && bullet.x <= block.x + BARRIER_BLOCK_SIZE &&
          bullet.y >= block.y && bullet.y <= block.y + BARRIER_BLOCK_SIZE
        ) {
          block.hp--;
          bullet.y = -100;
          if (block.hp <= 0) {
            spawnParticles(block.x + BARRIER_BLOCK_SIZE / 2, block.y + BARRIER_BLOCK_SIZE / 2, "#888888", 4);
            barriersRef.current.splice(i, 1);
          }
          break;
        }
      }
    });
    bulletsRef.current = bulletsRef.current.filter(b => b.y > -BULLET_HEIGHT);

    // Enemy bullet → barrier collision
    enemyBulletsRef.current = enemyBulletsRef.current.filter((bullet) => {
      for (let i = barriersRef.current.length - 1; i >= 0; i--) {
        const block = barriersRef.current[i];
        if (
          bullet.x >= block.x && bullet.x <= block.x + BARRIER_BLOCK_SIZE &&
          bullet.y >= block.y && bullet.y <= block.y + BARRIER_BLOCK_SIZE
        ) {
          block.hp--;
          if (block.hp <= 0) {
            spawnParticles(block.x + BARRIER_BLOCK_SIZE / 2, block.y + BARRIER_BLOCK_SIZE / 2, "#888888", 4);
            barriersRef.current.splice(i, 1);
          }
          return false;
        }
      }
      return true;
    });

    // Enemy bullet → player collision
    const sx = shipXRef.current;
    enemyBulletsRef.current = enemyBulletsRef.current.filter((b) => {
      if (b.x >= sx && b.x <= sx + SHIP_WIDTH && b.y >= SHIP_Y && b.y <= SHIP_Y + SHIP_HEIGHT) {
        if (shieldActiveRef.current > 0) {
          // Shield absorbs the hit
          spawnParticles(sx + SHIP_WIDTH / 2, SHIP_Y + SHIP_HEIGHT / 2, "#3b82f6", 8);
          screenShakeRef.current = 3;
          return false;
        }
        livesRef.current--;
        setLives(livesRef.current);
        spawnParticles(sx + SHIP_WIDTH / 2, SHIP_Y + SHIP_HEIGHT / 2, theme.ship, 12);
        screenShakeRef.current = 10;
        if (livesRef.current <= 0) {
          gameOver();
          return false;
        }
        return false;
      }
      return true;
    });

    // Power-up → player collision
    powerUpsRef.current = powerUpsRef.current.filter((pu) => {
      const px = pu.x + POWERUP_SIZE / 2;
      const py = pu.y + POWERUP_SIZE / 2;
      if (px >= sx && px <= sx + SHIP_WIDTH && py >= SHIP_Y && py <= SHIP_Y + SHIP_HEIGHT + 10) {
        if (pu.type === "shield") {
          shieldActiveRef.current = SHIELD_DURATION;
          setActivePowerUp("SHIELD");
        } else {
          multishotActiveRef.current = MULTISHOT_DURATION;
          setActivePowerUp("MULTI-SHOT");
        }
        spawnParticles(px, py, pu.type === "shield" ? "#3b82f6" : "#ef4444", 12);
        return false;
      }
      return true;
    });

    // Invader → barrier collision (invaders destroy barrier blocks)
    invadersRef.current.forEach((inv) => {
      if (!inv.alive) return;
      for (let i = barriersRef.current.length - 1; i >= 0; i--) {
        const block = barriersRef.current[i];
        if (
          inv.x + INVADER_SIZE > block.x && inv.x < block.x + BARRIER_BLOCK_SIZE &&
          inv.y + INVADER_SIZE > block.y && inv.y < block.y + BARRIER_BLOCK_SIZE
        ) {
          barriersRef.current.splice(i, 1);
        }
      }
    });

    // Check wave cleared
    if (invadersRef.current.every(inv => !inv.alive)) {
      waveRef.current++;
      setWave(waveRef.current);
      createWave(waveRef.current);
      // Rebuild barriers each wave
      barriersRef.current = createBarriers();
    }

    // Particles
    particlesRef.current.forEach(p => { p.x += p.dx; p.y += p.dy; p.dy += 0.06; p.life--; });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    draw();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw, gameOver, spawnParticles, createWave, createBarriers, fireBullets]);

  useEffect(() => {
    if (gameState === "playing") {
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, gameLoop]);

  const startGame = useCallback(() => {
    scoreRef.current = 0; waveRef.current = 0; livesRef.current = 3;
    setScore(0); setWave(0); setLives(3);
    shipXRef.current = CANVAS_WIDTH / 2 - SHIP_WIDTH / 2;
    bulletsRef.current = []; enemyBulletsRef.current = [];
    particlesRef.current = []; screenShakeRef.current = 0;
    shieldActiveRef.current = 0; multishotActiveRef.current = 0;
    setActivePowerUp(null);
    barriersRef.current = createBarriers();
    powerUpsRef.current = [];
    createWave(0);
    setGameState("playing");
  }, [createWave, createBarriers]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      cancelAnimationFrame(animFrameRef.current);
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  }, [gameState]);

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (gameState !== "playing") {
        if ((e.key === " " || e.key === "Enter") && (gameState === "idle" || gameState === "gameover")) {
          startGame(); e.preventDefault();
        } else if (e.key === " " && gameState === "paused") {
          togglePause(); e.preventDefault();
        }
        return;
      }
      switch (e.key) {
        case "ArrowLeft": case "a": case "A": keysRef.current.add("left"); e.preventDefault(); break;
        case "ArrowRight": case "d": case "D": keysRef.current.add("right"); e.preventDefault(); break;
        case " ": case "ArrowUp": case "w": case "W": keysRef.current.add("fire"); e.preventDefault(); break;
        case "p": case "P": case "Escape": togglePause(); e.preventDefault(); break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft": case "a": case "A": keysRef.current.delete("left"); break;
        case "ArrowRight": case "d": case "D": keysRef.current.delete("right"); break;
        case " ": case "ArrowUp": case "w": case "W": keysRef.current.delete("fire"); break;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [gameState, startGame, togglePause]);

  // Touch controls for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e: TouchEvent) => {
      if (gameState !== "playing") return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const relX = (e.touches[0].clientX - rect.left) / scale;
      shipXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - SHIP_WIDTH, relX - SHIP_WIDTH / 2));
      const now = performance.now();
      if (now - lastFireRef.current > FIRE_COOLDOWN) {
        lastFireRef.current = now;
        fireBullets();
      }
    };
    const onStart = (e: TouchEvent) => {
      if (gameState !== "playing") return;
      const rect = canvas.getBoundingClientRect();
      const relX = (e.touches[0].clientX - rect.left) / scale;
      shipXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - SHIP_WIDTH, relX - SHIP_WIDTH / 2));
      const now = performance.now();
      if (now - lastFireRef.current > FIRE_COOLDOWN) {
        lastFireRef.current = now;
        fireBullets();
      }
    };
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchstart", onStart, { passive: true });
    return () => { canvas.removeEventListener("touchmove", onMove); canvas.removeEventListener("touchstart", onStart); };
  }, [gameState, scale, fireBullets]);

  // Initial draw
  useEffect(() => {
    invadersRef.current = [];
    draw();
  }, [draw]);

  useEffect(() => { return () => cancelAnimationFrame(animFrameRef.current); }, []);

  const theme = getTheme(wave);

  if (showLeaderboard) {
    return <SpaceInvadersLeaderboard scores={topScores} userBest={userBest} onClose={() => setShowLeaderboard(false)} onRefetch={refetch} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* ─── Inline HUD ─── */}
      <div className="flex items-center justify-between w-full px-2 mb-3 gap-1">
        {/* Pause / Leaderboard */}
        <div className="flex flex-col gap-1 shrink-0">
          {gameState === "playing" ? (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-[10px] tracking-wide gap-1 h-8 px-3 border-border">
              <Pause className="w-3.5 h-3.5" /> PAUSE
            </Button>
          ) : gameState === "paused" ? (
            <Button onClick={togglePause} variant="outline" size="sm" className="font-display text-[10px] tracking-wide gap-1 h-8 px-3 border-primary text-primary">
              <Play className="w-3.5 h-3.5" /> RESUME
            </Button>
          ) : (
            <div className="h-8 w-16" />
          )}
          <Button onClick={() => { refetch(); setShowLeaderboard(true); }} variant="ghost" size="sm" className="font-display text-[9px] tracking-wide gap-1 h-6 text-muted-foreground px-2">
            <Trophy className="w-3 h-3" /> BOARD
          </Button>
        </div>

        {/* Score */}
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">SCORE</p>
          <p className="font-display text-xl sm:text-2xl tracking-wide text-primary leading-none">{score}</p>
        </div>

        {/* Level badge */}
        <div className="flex flex-col items-center shrink-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground mb-1">WAVE</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={wave}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="px-3 py-1.5 rounded font-display text-xs tracking-wide text-center min-w-[80px]"
              style={{ background: theme.border, color: theme.bg }}
            >
              {wave > 0 ? getLevelMessage(wave) : `${wave + 1}`}
            </motion.div>
          </AnimatePresence>
          {/* Active power-up indicator */}
          <AnimatePresence>
            {activePowerUp && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-display text-[9px] tracking-wider mt-1"
                style={{ color: activePowerUp === "SHIELD" ? "#3b82f6" : "#ef4444" }}
              >
                {activePowerUp}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Lives */}
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">LIVES</p>
          <p className="font-display text-lg sm:text-xl tracking-wide leading-none" style={{ color: theme.text }}>
            {"▲".repeat(lives)}
          </p>
        </div>

        {/* Best */}
        <div className="text-right shrink-0">
          <p className="font-display text-[10px] tracking-wider text-muted-foreground">BEST</p>
          <p className="font-display text-base sm:text-lg tracking-wide text-primary leading-none">{Math.max(highScore, userBest || 0)}</p>
        </div>
      </div>

      {/* ─── Game Board ─── */}
      <div className="relative w-full flex justify-center" style={{ maxWidth: CANVAS_WIDTH * scale }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg w-full"
          style={{ touchAction: "none", maxWidth: CANVAS_WIDTH, height: "auto", aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />

        {/* Overlays */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-3xl sm:text-4xl text-primary tracking-wide neon-glow-subtle mb-1">SPACE</p>
              <p className="font-display text-3xl sm:text-4xl text-primary tracking-wide neon-glow-subtle mb-2">INVADERS</p>
              <p className="font-display text-lg text-foreground tracking-wide mb-1">UNBREAKABLE</p>
              <p className="font-display text-xs text-muted-foreground tracking-wide mb-6">EDITION</p>
              <Button onClick={startGame} size="lg" className="font-display text-lg tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
                <Play className="w-5 h-5" /> START GAME
              </Button>
              <p className="text-xs text-muted-foreground mt-4 font-display tracking-wide">
                ARROWS / WASD · SPACE = FIRE
              </p>
            </motion.div>
          )}

          {gameState === "paused" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.85)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide neon-glow-subtle mb-6">PAUSED</p>
              <Button onClick={togglePause} size="lg" className="font-display text-lg tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
                <Play className="w-5 h-5" /> RESUME
              </Button>
            </motion.div>
          )}

          {gameState === "gameover" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(0,0,0,0.9)" }}
            >
              <p className="font-display text-3xl text-primary tracking-wide neon-glow-subtle mb-2">GAME OVER</p>
              <p className="font-display text-5xl text-foreground tracking-wide mb-1">{score}</p>
              <p className="font-display text-sm text-muted-foreground tracking-wide mb-1">
                WAVE {wave + 1}{wave > 0 ? ` · ${getLevelMessage(wave)}` : ""}
              </p>
              <p className="font-display text-xs text-primary tracking-wide mb-6">
                BEST: {Math.max(highScore, userBest || 0)}
              </p>
              <div className="flex gap-3">
                <Button onClick={startGame} size="lg" className="font-display tracking-wide gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-5">
                  <RotateCcw className="w-5 h-5" /> PLAY AGAIN
                </Button>
                <Button onClick={() => { refetch(); setShowLeaderboard(true); }} variant="outline" size="lg" className="font-display tracking-wide gap-2 px-6 py-5">
                  <Trophy className="w-5 h-5" /> BOARD
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Controls: Left / Fire / Right ─── */}
      <div className="w-full mt-4 px-1">
        <div className="flex items-center justify-center gap-3">
          <Button
            className="h-16 w-20 sm:h-14 sm:w-20 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
            onPointerDown={() => keysRef.current.add("left")}
            onPointerUp={() => keysRef.current.delete("left")}
            onPointerLeave={() => keysRef.current.delete("left")}
            aria-label="Move left"
          >
            <ArrowLeft className="w-7 h-7" />
          </Button>
          <Button
            className="h-20 w-28 sm:h-16 sm:w-28 bg-primary text-primary-foreground font-display text-lg tracking-wide gap-2 hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-lg"
            onPointerDown={() => {
              keysRef.current.add("fire");
              const now = performance.now();
              if (now - lastFireRef.current > FIRE_COOLDOWN && gameState === "playing") {
                lastFireRef.current = now;
                fireBullets();
              }
            }}
            onPointerUp={() => keysRef.current.delete("fire")}
            onPointerLeave={() => keysRef.current.delete("fire")}
            aria-label="Fire"
          >
            FIRE
          </Button>
          <Button
            className="h-16 w-20 sm:h-14 sm:w-20 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all rounded-xl shadow-md"
            onPointerDown={() => keysRef.current.add("right")}
            onPointerUp={() => keysRef.current.delete("right")}
            onPointerLeave={() => keysRef.current.delete("right")}
            aria-label="Move right"
          >
            <ArrowRight className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Keyboard hints (desktop) */}
      <div className="hidden sm:flex items-center gap-4 mt-3 text-[10px] text-muted-foreground font-display tracking-wider">
        <span>← → MOVE</span>
        <span>SPACE / ↑ FIRE</span>
        <span>P PAUSE</span>
      </div>
    </div>
  );
};

export default SpaceInvadersGame;
