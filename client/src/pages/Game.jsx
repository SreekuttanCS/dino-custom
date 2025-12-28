import { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import API from "../api/axios";

// Import character images
import kasiImg from "../assets/chars/kasi.png";
import pranavImg from "../assets/chars/pranav.png";
import akhilImg from "../assets/chars/akhil.png";
import vishalImg from "../assets/chars/vishal.png";
import alexImg from "../assets/chars/alex.jpg";

// Import character sounds (you'll need to add these files)
import kasiRun from "../assets/sounds/kasi_run3.mp3";
import kasiHit from "../assets/sounds/kasi_hit2.mp3";
import akhilRun from "../assets/sounds/akhil_run2.mp3";
import akhilHit from "../assets/sounds/akhil_hit.mp3";
import vishalRun from "../assets/sounds/vishal_run2.mp3";
import vishalHit from "../assets/sounds/vishal_hit.mp3";
// import pranavRun from "../assets/sounds/pranav_run.mp3";
// import pranavHit from "../assets/sounds/pranav_hit.mp3";

// Character data with images and sounds
const CHARACTER_DATA = [
  {
    id: 0,
    name: "Kasi",
    img: kasiImg,
    runSound: kasiRun,
    hitSound: kasiHit,
  },
  {
    id: 1,
    name: "Pranav",
    img: pranavImg,
    // runSound: pranavRun,
    // hitSound: pranavHit,
  },
  {
    id: 2,
    name: "Akhil",
    img: akhilImg,
    runSound: akhilRun,
    hitSound: akhilHit,
  },
  {
    id: 3,
    name: "Vishal",
    img: vishalImg,
    runSound: vishalRun,
    hitSound: vishalHit,
  },
  {
    id: 4,
    name: "Alex",
    img: alexImg,
    // runSound: alexRun, // Add sound if available
    // hitSound: alexHit, // Add sound if available
  },
];

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -11; // Tuned for better feel
const GROUND_HEIGHT = 50;
const SPAWN_RATE_INITIAL = 60; // Faster start
const SPEED_INCREMENT = 0.5;

export default function Game() {
  const canvasRef = useRef(null);
  const { state } = useLocation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Game State (React for UI)
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [highScore, setHighScore] = useState(user?.highScore || 0);

  // Game Refs (Mutable state for loop)
  const gameState = useRef({
    isPlaying: false,
    waitingToStart: true,
    isCrashed: false,
    speed: 6,
    score: 0,
    player: {
      x: 50,
      y: 0,
      dy: 0,
      width: 34,
      height: 47,
      originalHeight: 47,
      grounded: true,
      ducking: false,
    },
    obstacles: [],
    frames: 0,
  });

  const characterId = state?.characterId || 0;

  // Load Assets
  const faceImg = useRef(new Image());
  const audioCtxRef = useRef(null);
  const runSoundRef = useRef(null);
  const hitSoundRef = useRef(null);

  // Sync high score with user context
  useEffect(() => {
    if (user?.highScore) {
      setHighScore(user.highScore);
    }
  }, [user]);

  useEffect(() => {
    // Init Audio Context
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Load character assets
    if (characterId === 4 && user?.customCharacter) {
      // Custom character
      if (user.customCharacter.face) {
        const facePath = user.customCharacter.face.replace(/\\/g, "/");
        faceImg.current.src = `http://localhost:5000/${facePath}?t=${Date.now()}`;
      }
      if (user.customCharacter.runSound) {
        const soundPath = user.customCharacter.runSound.replace(/\\/g, "/");
        runSoundRef.current = new Audio(`http://localhost:5000/${soundPath}`);
      }
      if (user.customCharacter.hitSound) {
        const hitPath = user.customCharacter.hitSound.replace(/\\/g, "/");
        hitSoundRef.current = new Audio(`http://localhost:5000/${hitPath}`);
      }
    } else if (characterId >= 0 && characterId < CHARACTER_DATA.length) {
      // Built-in character
      const charData = CHARACTER_DATA[characterId];
      faceImg.current.src = charData.img;

      // Load sounds if they exist
      if (charData.runSound) {
        runSoundRef.current = new Audio(charData.runSound);
      }
      if (charData.hitSound) {
        hitSoundRef.current = new Audio(charData.hitSound);
      }
    } else {
      // Fallback
      faceImg.current.src = CHARACTER_DATA[0].img;
    }

    const handleKeyDown = (e) => {
      // Start game on first input if waiting
      if (gameState.current.waitingToStart) {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown") {
          gameState.current.waitingToStart = false;
          gameState.current.isPlaying = true;
          loop();
          if (e.code !== "ArrowDown") jump();
          // If down arrow, just start loop (and duck if logic passes below, though duck is usually separate)
          // Actually, standard behavior: if jump key pressed, start AND jump. If just start, maybe just start?
          // The prompt says "start only when the player presses the jump key or touches the screen".
          // Let's stick to jump keys triggering start.
        }
      }

      if (e.code === "Space" || e.code === "ArrowUp") {
        jump();
      } else if (e.code === "ArrowDown") {
        duck(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "ArrowDown") {
        duck(false);
      }
    };

    const handleTouchStart = () => {
      if (gameState.current.waitingToStart) {
        gameState.current.waitingToStart = false;
        gameState.current.isPlaying = true;
        loop();
        jump();
      } else {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("touchstart", handleTouchStart);


    // Start Loop
    // gameState.current.isPlaying = true; // REMOVED: Don't start immediately
    // Initial draw to show character
    // We need to ensure assets are loaded or at least draw the placeholder
    // Since faceImg load is async, we might not see it immediately if we just call draw() here without checking.
    // However, the `draw` function handles `faceImg.current.complete` check.
    // Let's wait for the image to load before initial draw or just try drawing.
    if (faceImg.current.complete) {
      draw();
    } else {
      faceImg.current.onload = () => draw();
    }

    let animationFrameId;

    const loop = () => {
      if (gameState.current.isPlaying) {
        update(audioCtxRef.current);
        draw();
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    loop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(animationFrameId);

      // Stop all sounds on cleanup
      if (runSoundRef.current) {
        runSoundRef.current.pause();
        runSoundRef.current.currentTime = 0;
      }
      if (hitSoundRef.current) {
        hitSoundRef.current.pause();
        hitSoundRef.current.currentTime = 0;
      }

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch((e) => console.log(e));
      }
    };
  }, [characterId, user]);

  const playSound = (ctx, type) => {
    if (type === "jump") {
      // Try playing custom or character-specific run sound
      if (runSoundRef.current) {
        runSoundRef.current.currentTime = 0;
        runSoundRef.current
          .play()
          .catch((e) => console.log("Audio play error", e));
        return;
      }
    } else if (type === "hit") {
      // Stop run sound if playing
      if (runSoundRef.current) {
        runSoundRef.current.pause();
        runSoundRef.current.currentTime = 0;
      }

      // Play hit sound
      if (hitSoundRef.current) {
        hitSoundRef.current.currentTime = 0;
        hitSoundRef.current
          .play()
          .catch((e) => console.log("Audio play error", e));
        return;
      }
    }

    // Fallback to synth sounds if no audio file is available
    if (!ctx || ctx.state === "closed") return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "jump") {
        osc.type = "square";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "hit") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const jump = () => {
    const { player, isCrashed } = gameState.current;
    if (player.grounded && !player.ducking && !isCrashed) {
      player.dy = JUMP_FORCE;
      player.grounded = false;
      playSound(audioCtxRef.current, "jump");
    }
  };

  const duck = (isDucking) => {
    const { player } = gameState.current;
    if (player.grounded) {
      player.ducking = isDucking;
      if (isDucking) {
        player.height = player.originalHeight / 2;
        player.y += player.originalHeight / 2;
      } else {
        player.y -= player.originalHeight / 2;
        player.height = player.originalHeight;
      }
    } else if (!isDucking && player.ducking) {
      player.ducking = false;
      player.height = player.originalHeight;
    }
  };

  const update = (audioCtx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = gameState.current;
    const { player, obstacles } = state;

    // Player Physics
    if (!player.grounded) {
      player.dy += GRAVITY;
      player.y += player.dy;
    } else {
      player.dy = 0;
    }

    // Ground Collision
    if (player.y + player.height > canvas.height - GROUND_HEIGHT) {
      player.y = canvas.height - GROUND_HEIGHT - player.height;
      player.dy = 0;
      player.grounded = true;
    }

    // Obstacles
    state.frames++;

    const randomSpawnRate =
      SPAWN_RATE_INITIAL -
      Math.min(state.speed * 2, 40) + // Cap reduction to keep it playable
      Math.floor(Math.random() * 20);

    if (state.frames % Math.floor(randomSpawnRate) === 0) {
      const type = Math.random() > 0.7 && state.score > 20 ? "bird" : "cactus";

      if (type === "bird") {
        const heightChoice = Math.random();
        let yPos;
        if (heightChoice < 0.3) {
          yPos = canvas.height - GROUND_HEIGHT - 30; // Low
        } else if (heightChoice < 0.7) {
          yPos = canvas.height - GROUND_HEIGHT - 50; // Mid
        } else {
          yPos = canvas.height - GROUND_HEIGHT - 65; // High (jumpable/duckable)
        }

        obstacles.push({
          x: canvas.width,
          y: yPos,
          width: 40,
          height: 30,
          type: "bird",
          frame: 0,
        });
      } else {
        const big = Math.random() > 0.5;
        obstacles.push({
          x: canvas.width,
          y: canvas.height - GROUND_HEIGHT - (big ? 40 : 30),
          width: big ? 25 : 15,
          height: big ? 40 : 30,
          type: "cactus",
        });
      }
    }

    for (let i = 0; i < obstacles.length; i++) {
      let obs = obstacles[i];
      obs.x -= state.speed;

      const hitboxPadding = 10; // Increased padding to prevent cheap hits

      if (
        player.x + hitboxPadding < obs.x + obs.width - hitboxPadding &&
        player.x + player.width - hitboxPadding > obs.x + hitboxPadding &&
        player.x + player.width - hitboxPadding > obs.x + hitboxPadding &&
        player.y + hitboxPadding < obs.y + obs.height - (obs.type === 'bird' ? 10 : hitboxPadding) && // Reduce top hitbox for birds
        player.y + player.height - hitboxPadding > obs.y + (obs.type === 'bird' ? 10 : hitboxPadding) // Reduce bottom hitbox for birds
      ) {
        if (state.isCrashed) return; // Prevent multiple collision triggers
        state.isCrashed = true;

        // Stop run sound immediately
        if (runSoundRef.current) {
          runSoundRef.current.pause();
          runSoundRef.current.currentTime = 0;
        }

        // Play hit sound
        playSound(audioCtx, "hit");

        // Delay game over slightly to let hit sound play
        setTimeout(() => {
          gameOver();
        }, 100);
      }

      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
        i--;
        state.score++;
        setScore(state.score);
        if (state.score % 5 === 0 && state.speed < 20)
          if (state.score % 50 === 0 && state.score > 0 && state.speed < 25) // Increase every 50 points
            state.speed += 1;
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const state = gameState.current;
    const { player, obstacles } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#535353";
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 1);

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    if (faceImg.current.complete && faceImg.current.naturalWidth > 0) {
      ctx.drawImage(faceImg.current, 0, 0, player.width, player.height);
    } else {
      ctx.fillStyle = "#535353";
      ctx.fillRect(0, 0, player.width, player.height);
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(player.width - 12, 4, 4, 4);
    }
    // Debug hitbox visualization (optional, remove in prod)
    // ctx.strokeStyle = "red";
    // ctx.strokeRect(0, 0, player.width, player.height);
    ctx.restore();

    // Obstacles
    for (let obs of obstacles) {
      if (obs.type === "bird") {
        ctx.fillStyle = "#535353";
        ctx.fillRect(obs.x, obs.y + 10, obs.width, obs.height - 10);
        obs.frame = (obs.frame || 0) + 0.1;
        const wingUp = Math.floor(obs.frame) % 2 === 0;
        ctx.fillRect(obs.x + 10, obs.y + (wingUp ? -10 : 5), 10, 10);
        ctx.fillRect(obs.x - 5, obs.y + 15, 5, 5);
      } else {
        ctx.fillStyle = "#535353";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        if (obs.height > 30) {
          ctx.fillRect(obs.x - 4, obs.y + 10, 4, 10);
          ctx.fillRect(obs.x + obs.width, obs.y + 8, 4, 8);
        }
      }
    }
  };

  const gameOver = () => {
    gameState.current.isPlaying = false;

    // Stop the run sound immediately
    if (runSoundRef.current) {
      runSoundRef.current.pause();
      runSoundRef.current.currentTime = 0;
    }

    // Play hit sound immediately
    if (hitSoundRef.current) {
      hitSoundRef.current.pause(); // ensure it’s not already playing
      hitSoundRef.current.currentTime = 0; // start from beginning
      const playPromise = hitSoundRef.current.play();

      // Some browsers return a promise to handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Hit sound playback failed:", error);
        });
      }
    }

    // Immediately show game over screen
    setIsGameOver(true);

    // Submit high score if necessary
    const finalScore = gameState.current.score;
    if (finalScore > highScore) {
      setIsSaving(true);
      API.post("/users/score", { score: finalScore })
        .then((res) => {
          const newHighScore = res.data.highScore;
          setHighScore(newHighScore);
          updateUser({ highScore: newHighScore });
        })
        .catch((err) => console.error("Error submitting score:", err))
        .finally(() => setIsSaving(false));
    }
  };

  const restartGame = () => {
    gameState.current = {
      isPlaying: false,
      waitingToStart: true,
      isCrashed: false,
      speed: 6,
      score: 0,
      player: {
        x: 50,
        y: 0,
        dy: 0,
        width: 34,
        height: 47,
        originalHeight: 47,
        grounded: true,
        ducking: false,
      },
      obstacles: [],
      frames: 0,
    };
    setScore(0);
    setIsGameOver(false);

    // Stop any playing hit sound
    if (hitSoundRef.current) {
      hitSoundRef.current.pause();
      hitSoundRef.current.currentTime = 0;
    }

    // Don't start loop immediately. Wait for input.
    // Ensure we draw the initial state so the user sees the character.
    draw();
  };

  return (
    <div className="game-container fixed inset-0 font-arcade select-none">
      <div className="absolute top-4 right-4 z-10 flex gap-4 text-[#535353] text-xs md:text-sm select-none font-bold tracking-widest">
        <div
          className={`transition-colors duration-200 ${Math.floor(score) > highScore ? "text-orange-500 animate-pulse" : ""
            }`}
        >
          HI{" "}
          {Math.max(highScore, Math.floor(score)).toString().padStart(5, "0")}
        </div>
        <div>{Math.floor(score).toString().padStart(5, "0")}</div>
      </div>

      <canvas
        ref={canvasRef}
        width={window.innerWidth > 800 ? 800 : window.innerWidth - 32}
        height={400}
        className="bg-transparent border-b-2 border-[#535353] max-w-full"
        onTouchStart={jump}
      />

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl md:text-3xl text-[#535353] mb-8 font-bold tracking-widest">
            GAME OVER
          </h2>

          <div className="mb-4 text-[#535353] flex flex-col items-center">
            <div className="w-16 h-16 mb-2">
              {faceImg.current.src ? (
                <img
                  src={faceImg.current.src}
                  alt="Character"
                  className="w-full h-full object-contain pixelated"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="w-12 h-12 bg-black mx-auto relative">
                  <div className="absolute top-2 -left-2 w-4 h-4 bg-black"></div>
                </div>
              )}
            </div>
            <p className="text-xl font-bold">
              SCORE: {Math.floor(gameState.current.score)}
            </p>
          </div>

          {isSaving ? (
            <div className="text-[#535353] text-sm animate-pulse mb-8 border-b-2 border-[#535353] pb-1">
              SAVING RECORD...
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/character-select")}
                  className="btn-classic text-2xl px-6 py-4"
                  title="Home"
                >
                  🏠
                </button>
                <button
                  onClick={restartGame}
                  className="btn-classic text-2xl px-6 py-4"
                  title="Restart"
                >
                  ↺
                </button>
              </div>
              <div className="mt-8 flex gap-8">
                <button
                  onClick={() => navigate("/character-select")}
                  className="text-xs text-[#535353] hover:underline uppercase tracking-wide"
                >
                  Change Driver
                </button>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="text-xs text-[#535353] hover:underline uppercase tracking-wide"
                >
                  Leaderboard
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {!isGameOver && (
        <div className="absolute bottom-10 text-center w-full pointer-events-none">
          <p className="text-[#535353] text-[10px] md:text-xs animate-pulse md:hidden block">
            TAP TO JUMP
          </p>
        </div>
      )}
    </div>
  );
}
