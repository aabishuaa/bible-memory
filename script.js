const { useState, useEffect, useCallback, useRef } = React;

// Sound Effects System using Web Audio API
const SoundEffects = {
  context: null,

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  // Play success sound (pleasant chime)
  playSuccess() {
    this.init();
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  },

  // Play error sound (gentle negative tone)
  playError() {
    this.init();
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  },

  // Play button click sound (subtle tick)
  playClick() {
    this.init();
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },

  // Play celebration sound (triumphant fanfare)
  playCelebration() {
    this.init();
    const ctx = this.context;

    // Play multiple notes in sequence
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + i * 0.15 + 0.5
      );

      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  },

  // Play add verse sound (pleasant pop)
  playAdd() {
    this.init();
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },
};

// Text-to-Speech Service using Web Speech API
const TextToSpeech = {
  synthesis: null,
  currentUtterance: null,

  init() {
    if (!this.synthesis && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
    }
  },

  speak(text, reference = "") {
    this.init();

    if (!this.synthesis) {
      console.error("Text-to-speech not supported in this browser");
      return false;
    }

    // Cancel any ongoing speech
    this.stop();

    // Create new utterance with the verse text
    const textToSpeak = reference ? `${reference}. ${text}` : text;
    this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

    // Configure voice settings
    this.currentUtterance.rate = 0.9; // Slightly slower for clarity
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;

    // Try to use a high-quality English voice if available
    const voices = this.synthesis.getVoices();
    const englishVoice =
      voices.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          (voice.name.includes("Google") ||
            voice.name.includes("Microsoft") ||
            voice.name.includes("Natural"))
      ) || voices.find((voice) => voice.lang.startsWith("en"));

    if (englishVoice) {
      this.currentUtterance.voice = englishVoice;
    }

    // Speak the text
    this.synthesis.speak(this.currentUtterance);
    return true;
  },

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  },

  isSpeaking() {
    return this.synthesis && this.synthesis.speaking;
  },
};

// Confetti Animation
const Confetti = {
  create() {
    const canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const numberOfPieces = 100;
    const colors = ["#8b6f47", "#6b8e5f", "#f5f1e8", "#e8dcc8", "#d4c4a8"];

    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        size: Math.random() * 8 + 4,
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach((piece) => {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        ctx.restore();

        piece.x += piece.speedX;
        piece.y += piece.speedY;
        piece.rotation += piece.rotationSpeed;
        piece.speedY += 0.1; // gravity
      });

      if (pieces.every((p) => p.y > canvas.height)) {
        cancelAnimationFrame(animationId);
        document.body.removeChild(canvas);
      } else {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();
  },
};

// Icon components
const Icons = {
  Search: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  ),
  Book: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  BarChart: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  ),
  Brain: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
    </svg>
  ),
  Trash: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 6h18"></path>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Check: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  X: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Eye: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  EyeOff: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
      <line x1="2" y1="2" x2="22" y2="22"></line>
    </svg>
  ),
  BookOpen: () => (
    <svg
      width="60"
      height="60"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  Mic: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  ),
  MicOff: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="2" y1="2" x2="22" y2="22"></line>
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
      <path d="M5 10v2a7 7 0 0 0 12 5"></path>
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  ),
  Shuffle: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 3 21 3 21 8"></polyline>
      <line x1="4" y1="20" x2="21" y2="3"></line>
      <polyline points="21 16 21 21 16 21"></polyline>
      <line x1="15" y1="15" x2="21" y2="21"></line>
      <line x1="4" y1="4" x2="9" y2="9"></line>
    </svg>
  ),
  Type: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="4 7 4 4 20 4 20 7"></polyline>
      <line x1="9" y1="20" x2="15" y2="20"></line>
      <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
  ),
  Edit: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  User: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  LogOut: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  Google: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
  Speaker: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  ),
  Hands: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5.69l5 2.14v6.43c0 3.88-2.69 7.52-5 8.74-2.31-1.22-5-4.86-5-8.74V7.83l5-2.14z"></path>
      <path d="M12 9v6m-3-3h6"></path>
    </svg>
  ),
  Plus: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Tag: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  ),
  CheckCircle: ({ filled }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="9 12 11 14 15 10"></polyline>
    </svg>
  ),
  Save: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  BookMarked: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Highlighter: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 11-6 6v3h9l3-3"></path>
      <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path>
    </svg>
  ),
  StickyNote: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"></path>
      <path d="M15 3v6h6"></path>
    </svg>
  ),
  ArrowLeft: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  Copy: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Trophy: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Star: ({ filled }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Crown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
    </svg>
  ),
  Target: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
};

// Animated Toggle Switch Component
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        onClick={(e) => {
          onChange(!checked);
          SoundEffects.playClick();
        }}
        style={{
          position: "relative",
          width: "56px",
          height: "28px",
          background: checked
            ? "linear-gradient(135deg, #6b8e5f 0%, #8b9b75 100%)"
            : "linear-gradient(135deg, #d4c4a8 0%, #c4b49a 100%)",
          borderRadius: "14px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          boxShadow: checked
            ? "0 0 8px rgba(107, 142, 95, 0.4), inset 0 1px 3px rgba(0,0,0,0.1)"
            : "inset 0 1px 3px rgba(0,0,0,0.2)",
          border: checked
            ? "2px solid #6b8e5f"
            : "2px solid #c4b49a",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "28px" : "2px",
            width: "20px",
            height: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
            borderRadius: "50%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            transform: checked ? "scale(1.1)" : "scale(1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {checked ? (
              <span style={{ color: "#6b8e5f", fontWeight: "bold" }}>✓</span>
            ) : (
              <span style={{ color: "#999", fontWeight: "bold" }}>○</span>
            )}
          </div>
        </div>
        {/* Ripple effect on background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: checked ? "75%" : "25%",
            transform: "translate(-50%, -50%)",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: checked
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(255, 255, 255, 0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      <span
        style={{
          color: "#5a4d37",
          fontSize: "0.9rem",
          fontWeight: "500",
        }}
      >
        {label}
      </span>
    </label>
  );
}

// Alert Modal Component (for notifications)
function AlertModal({ isOpen, onClose, title, message, buttonText = "OK" }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-button modal-button-confirm"
                        onClick={onClose}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Confirmation Modal Component
function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message, confirmText = "Delete", cancelText = "Cancel", isDangerous = true }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-button modal-button-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`modal-button ${isDangerous ? 'modal-button-danger' : 'modal-button-confirm'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Login Component
function Login({ onLogin, error }) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "" });

  const showAlert = (title, message) => {
    setAlertModal({ isOpen: true, title, message });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: "", message: "" });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      if (typeof FirebaseAuth === "undefined") {
        showAlert(
          "Configuration Error",
          "Firebase is not configured. Please add your Firebase credentials to firebase-config.js"
        );
        setIsLoading(false);
        return;
      }

      // signInWithGoogle now uses popup (no redirects, no page reload)
      // The user will be automatically logged in via onAuthStateChanged
      const result = await FirebaseAuth.signInWithGoogle();
      if (!result.success) {
        showAlert("Sign In Error", result.error || "Failed to sign in");
        setIsLoading(false);
      }
      // Note: onAuthStateChanged will handle the successful login
    } catch (error) {
      showAlert("Sign In Error", error.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Icons.BookOpen />
            <h1>Scripture Memory</h1>
            <p>Memorize and meditate on God's Word</p>
          </div>

          <div className="login-content">
            <h2>Welcome</h2>
            <p>Sign in to save your verses and track your progress</p>

            {error && <div className="error">{error}</div>}

            <button
              className="btn btn-google"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Icons.Google />
                  Sign in with Google
                </>
              )}
            </button>

            <div className="login-footer">
              <p>
                Thou wilt keep him in perfect peace, whose mind is stayed on thee.
                Isaiah 26:3
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Bible Version Configuration
const stripHtml = (html) => {
  if (!html) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const BIBLE_VERSIONS = {
  KJV: {
    id: "de4e12af7f28f599-02",
    name: "King James Version",
    abbreviation: "KJV",
  },
};

// Bible API service using API.Bible
const BibleAPI = {
  API_KEY: AppConfig?.bibleApi?.apiKey || "",
  BIBLE_ID: "de4e12af7f28f599-02", // Default: King James Version

  async fetchVerse(reference, versionKey = "KJV") {
    try {
      const version = BIBLE_VERSIONS[versionKey];
      if (!version) {
        throw new Error(`Unknown Bible version: ${versionKey}`);
      }

      const bibleId = version.id;

      // API.Bible expects passages in format like "JHN.3.16" or "PSA.23"
      // Convert user input like "John 3:16" to API format
      const passageId = this.convertReferenceToPassageId(reference);

      const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`;

      const response = await fetch(url, {
        headers: {
          "api-key": this.API_KEY,
        },
      });

      if (!response.ok) {
        // Fallback to search if direct passage lookup fails
        return await this.searchVerse(reference, versionKey);
      }

      const data = await response.json();

      const content = data.data.content || "";

      return {
        reference: data.data.reference,
        text: stripHtml(content).trim(),
        rawContent: content,
        translation: version.abbreviation,
        version: version.abbreviation,
      };
    } catch (error) {
      console.error("API.Bible error:", error);
      throw new Error(
        `Unable to fetch verse. ${
          error.message || "Please check the reference and try again."
        }`
      );
    }
  },

  async searchVerse(reference, versionKey = "KJV") {
    try {
      const version = BIBLE_VERSIONS[versionKey];
      if (!version) {
        throw new Error(`Unknown Bible version: ${versionKey}`);
      }

      const bibleId = version.id;
      const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(
        reference
      )}&limit=1`;

      const response = await fetch(url, {
        headers: {
          "api-key": this.API_KEY,
        },
      });

      if (!response.ok) throw new Error("Verse not found");

      const data = await response.json();

      if (!data.data.verses || data.data.verses.length === 0) {
        throw new Error("Verse not found");
      }

      const verse = data.data.verses[0];

      // Fetch the full verse content
      const verseUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verse.id}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`;

      const verseResponse = await fetch(verseUrl, {
        headers: {
          "api-key": this.API_KEY,
        },
      });

      if (!verseResponse.ok) throw new Error("Unable to fetch verse content");

      const verseData = await verseResponse.json();

      const content = verseData.data.content || "";

      return {
        reference: verseData.data.reference,
        text: stripHtml(content).trim(),
        rawContent: content,
        translation: version.abbreviation,
        version: version.abbreviation,
      };
    } catch (error) {
      console.error("Search error:", error);
      throw new Error(
        "Unable to fetch verse. Please check the reference and try again."
      );
    }
  },

  convertReferenceToPassageId(reference) {
    // Map common book names to API.Bible abbreviations
    const bookMap = {
      genesis: "GEN",
      gen: "GEN",
      exodus: "EXO",
      exo: "EXO",
      exod: "EXO",
      leviticus: "LEV",
      lev: "LEV",
      numbers: "NUM",
      num: "NUM",
      deuteronomy: "DEU",
      deut: "DEU",
      deu: "DEU",
      joshua: "JOS",
      josh: "JOS",
      jos: "JOS",
      judges: "JDG",
      judg: "JDG",
      jdg: "JDG",
      ruth: "RUT",
      rut: "RUT",
      "1 samuel": "1SA",
      "1samuel": "1SA",
      "1sam": "1SA",
      "1 sam": "1SA",
      "2 samuel": "2SA",
      "2samuel": "2SA",
      "2sam": "2SA",
      "2 sam": "2SA",
      "1 kings": "1KI",
      "1kings": "1KI",
      "1ki": "1KI",
      "2 kings": "2KI",
      "2kings": "2KI",
      "2ki": "2KI",
      "1 chronicles": "1CH",
      "1chronicles": "1CH",
      "1chr": "1CH",
      "2 chronicles": "2CH",
      "2chronicles": "2CH",
      "2chr": "2CH",
      ezra: "EZR",
      ezr: "EZR",
      nehemiah: "NEH",
      neh: "NEH",
      esther: "EST",
      est: "EST",
      job: "JOB",
      psalm: "PSA",
      psalms: "PSA",
      psa: "PSA",
      ps: "PSA",
      proverbs: "PRO",
      prov: "PRO",
      pro: "PRO",
      ecclesiastes: "ECC",
      eccl: "ECC",
      ecc: "ECC",
      "song of solomon": "SNG",
      song: "SNG",
      sos: "SNG",
      isaiah: "ISA",
      isa: "ISA",
      jeremiah: "JER",
      jer: "JER",
      lamentations: "LAM",
      lam: "LAM",
      ezekiel: "EZK",
      ezek: "EZK",
      ezk: "EZK",
      daniel: "DAN",
      dan: "DAN",
      hosea: "HOS",
      hos: "HOS",
      joel: "JOL",
      joel: "JOL",
      amos: "AMO",
      amo: "AMO",
      obadiah: "OBA",
      obad: "OBA",
      oba: "OBA",
      jonah: "JON",
      jon: "JON",
      micah: "MIC",
      mic: "MIC",
      nahum: "NAM",
      nah: "NAM",
      nam: "NAM",
      habakkuk: "HAB",
      hab: "HAB",
      zephaniah: "ZEP",
      zeph: "ZEP",
      zep: "ZEP",
      haggai: "HAG",
      hag: "HAG",
      zechariah: "ZEC",
      zech: "ZEC",
      zec: "ZEC",
      malachi: "MAL",
      mal: "MAL",
      matthew: "MAT",
      matt: "MAT",
      mat: "MAT",
      mt: "MAT",
      mark: "MRK",
      mrk: "MRK",
      mk: "MRK",
      luke: "LUK",
      luk: "LUK",
      lk: "LUK",
      john: "JHN",
      jhn: "JHN",
      jn: "JHN",
      acts: "ACT",
      act: "ACT",
      romans: "ROM",
      rom: "ROM",
      "1 corinthians": "1CO",
      "1corinthians": "1CO",
      "1cor": "1CO",
      "1 cor": "1CO",
      "2 corinthians": "2CO",
      "2corinthians": "2CO",
      "2cor": "2CO",
      "2 cor": "2CO",
      galatians: "GAL",
      gal: "GAL",
      ephesians: "EPH",
      eph: "EPH",
      philippians: "PHP",
      phil: "PHP",
      php: "PHP",
      colossians: "COL",
      col: "COL",
      "1 thessalonians": "1TH",
      "1thessalonians": "1TH",
      "1thess": "1TH",
      "1 thess": "1TH",
      "2 thessalonians": "2TH",
      "2thessalonians": "2TH",
      "2thess": "2TH",
      "2 thess": "2TH",
      "1 timothy": "1TI",
      "1timothy": "1TI",
      "1tim": "1TI",
      "1 tim": "1TI",
      "2 timothy": "2TI",
      "2timothy": "2TI",
      "2tim": "2TI",
      "2 tim": "2TI",
      titus: "TIT",
      tit: "TIT",
      philemon: "PHM",
      phlm: "PHM",
      phm: "PHM",
      hebrews: "HEB",
      heb: "HEB",
      james: "JAS",
      jas: "JAS",
      jas: "JAS",
      "1 peter": "1PE",
      "1peter": "1PE",
      "1pet": "1PE",
      "1 pet": "1PE",
      "2 peter": "2PE",
      "2peter": "2PE",
      "2pet": "2PE",
      "2 pet": "2PE",
      "1 john": "1JN",
      "1john": "1JN",
      "1jn": "1JN",
      "2 john": "2JN",
      "2john": "2JN",
      "2jn": "2JN",
      "3 john": "3JN",
      "3john": "3JN",
      "3jn": "3JN",
      jude: "JUD",
      jud: "JUD",
      revelation: "REV",
      rev: "REV",
    };

    // Parse reference like "John 3:16" or "Psalm 23"
    const parts = reference
      .toLowerCase()
      .trim()
      .match(/^([\d\s]*[a-z]+)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/i);

    if (!parts) {
      // If parsing fails, return as-is and let search handle it
      return reference;
    }

    const bookName = parts[1].trim().replace(/\s+/g, " ");
    const chapter = parts[2];
    const verseStart = parts[3];
    const verseEnd = parts[4];

    const bookCode = bookMap[bookName];
    if (!bookCode) {
      return reference; // Return original if book not found
    }

    // Format: BOOK.CHAPTER.VERSE or BOOK.CHAPTER.VERSE-BOOK.CHAPTER.VERSE
    if (verseStart) {
      if (verseEnd) {
        return `${bookCode}.${chapter}.${verseStart}-${bookCode}.${chapter}.${verseEnd}`;
      }
      return `${bookCode}.${chapter}.${verseStart}`;
    }

    // Just chapter
    return `${bookCode}.${chapter}`;
  },
};

// Note: Using FirestoreService from firebase-config.js
// All storage operations are now handled by Firestore

// Bible Books data for whole-book selection
const BIBLE_BOOKS = {
  oldTestament: [
    { name: "Genesis", code: "GEN", chapters: 50 },
    { name: "Exodus", code: "EXO", chapters: 40 },
    { name: "Leviticus", code: "LEV", chapters: 27 },
    { name: "Numbers", code: "NUM", chapters: 36 },
    { name: "Deuteronomy", code: "DEU", chapters: 34 },
    { name: "Joshua", code: "JOS", chapters: 24 },
    { name: "Judges", code: "JDG", chapters: 21 },
    { name: "Ruth", code: "RUT", chapters: 4 },
    { name: "1 Samuel", code: "1SA", chapters: 31 },
    { name: "2 Samuel", code: "2SA", chapters: 24 },
    { name: "1 Kings", code: "1KI", chapters: 22 },
    { name: "2 Kings", code: "2KI", chapters: 25 },
    { name: "1 Chronicles", code: "1CH", chapters: 29 },
    { name: "2 Chronicles", code: "2CH", chapters: 36 },
    { name: "Ezra", code: "EZR", chapters: 10 },
    { name: "Nehemiah", code: "NEH", chapters: 13 },
    { name: "Esther", code: "EST", chapters: 10 },
    { name: "Job", code: "JOB", chapters: 42 },
    { name: "Psalms", code: "PSA", chapters: 150 },
    { name: "Proverbs", code: "PRO", chapters: 31 },
    { name: "Ecclesiastes", code: "ECC", chapters: 12 },
    { name: "Song of Solomon", code: "SNG", chapters: 8 },
    { name: "Isaiah", code: "ISA", chapters: 66 },
    { name: "Jeremiah", code: "JER", chapters: 52 },
    { name: "Lamentations", code: "LAM", chapters: 5 },
    { name: "Ezekiel", code: "EZK", chapters: 48 },
    { name: "Daniel", code: "DAN", chapters: 12 },
    { name: "Hosea", code: "HOS", chapters: 14 },
    { name: "Joel", code: "JOL", chapters: 3 },
    { name: "Amos", code: "AMO", chapters: 9 },
    { name: "Obadiah", code: "OBA", chapters: 1 },
    { name: "Jonah", code: "JON", chapters: 4 },
    { name: "Micah", code: "MIC", chapters: 7 },
    { name: "Nahum", code: "NAM", chapters: 3 },
    { name: "Habakkuk", code: "HAB", chapters: 3 },
    { name: "Zephaniah", code: "ZEP", chapters: 3 },
    { name: "Haggai", code: "HAG", chapters: 2 },
    { name: "Zechariah", code: "ZEC", chapters: 14 },
    { name: "Malachi", code: "MAL", chapters: 4 },
  ],
  newTestament: [
    { name: "Matthew", code: "MAT", chapters: 28 },
    { name: "Mark", code: "MRK", chapters: 16 },
    { name: "Luke", code: "LUK", chapters: 24 },
    { name: "John", code: "JHN", chapters: 21 },
    { name: "Acts", code: "ACT", chapters: 28 },
    { name: "Romans", code: "ROM", chapters: 16 },
    { name: "1 Corinthians", code: "1CO", chapters: 16 },
    { name: "2 Corinthians", code: "2CO", chapters: 13 },
    { name: "Galatians", code: "GAL", chapters: 6 },
    { name: "Ephesians", code: "EPH", chapters: 6 },
    { name: "Philippians", code: "PHP", chapters: 4 },
    { name: "Colossians", code: "COL", chapters: 4 },
    { name: "1 Thessalonians", code: "1TH", chapters: 5 },
    { name: "2 Thessalonians", code: "2TH", chapters: 3 },
    { name: "1 Timothy", code: "1TI", chapters: 6 },
    { name: "2 Timothy", code: "2TI", chapters: 4 },
    { name: "Titus", code: "TIT", chapters: 3 },
    { name: "Philemon", code: "PHM", chapters: 1 },
    { name: "Hebrews", code: "HEB", chapters: 13 },
    { name: "James", code: "JAS", chapters: 5 },
    { name: "1 Peter", code: "1PE", chapters: 5 },
    { name: "2 Peter", code: "2PE", chapters: 3 },
    { name: "1 John", code: "1JN", chapters: 5 },
    { name: "2 John", code: "2JN", chapters: 1 },
    { name: "3 John", code: "3JN", chapters: 1 },
    { name: "Jude", code: "JUD", chapters: 1 },
    { name: "Revelation", code: "REV", chapters: 22 },
  ],
};

// Points system constants
const POINTS = {
  VERSE_MEMORIZED: 10,
  QUIZ_CORRECT: 25,
  QUIZ_FAST_BONUS: 15,   // Answered in < 5 seconds
  QUIZ_STREAK_BONUS: 10, // Each consecutive correct
  QUIZ_PERFECT: 100,     // All questions correct
};

// Quiz question generator
function generateQuizQuestions(verses) {
  if (!verses || verses.length < 2) return [];

  const questions = [];
  const shuffled = [...verses].sort(() => Math.random() - 0.5);

  shuffled.forEach((verse) => {
    if (!verse.text || !verse.reference) return;

    // Question type 1: "Which verse is this?" - show text, pick reference
    if (verses.length >= 4) {
      const wrongAnswers = verses
        .filter((v) => v.id !== verse.id && v.reference)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((v) => v.reference);

      if (wrongAnswers.length >= 3) {
        const options = [...wrongAnswers, verse.reference].sort(() => Math.random() - 0.5);
        questions.push({
          type: "identify",
          question: verse.text.length > 150 ? verse.text.substring(0, 150) + "..." : verse.text,
          questionLabel: "Which verse is this?",
          correctAnswer: verse.reference,
          options,
          verseId: verse.id,
        });
      }
    }

    // Question type 2: "Fill in the blank" - remove key word
    if (verse.text.split(" ").length > 5) {
      const words = verse.text.split(" ");
      const targetIdx = Math.floor(Math.random() * (words.length - 2)) + 1;
      const correctWord = words[targetIdx].replace(/[.,!?;:'"]/g, "");

      if (correctWord.length > 2) {
        const blanked = words.map((w, i) => (i === targetIdx ? "______" : w)).join(" ");

        // Generate wrong options from other verses
        const otherWords = verses
          .filter((v) => v.id !== verse.id)
          .flatMap((v) => v.text.split(" "))
          .map((w) => w.replace(/[.,!?;:'"]/g, ""))
          .filter((w) => w.length > 2 && w.toLowerCase() !== correctWord.toLowerCase());

        const uniqueOthers = [...new Set(otherWords)].sort(() => Math.random() - 0.5).slice(0, 3);

        if (uniqueOthers.length >= 3) {
          const options = [...uniqueOthers, correctWord].sort(() => Math.random() - 0.5);
          questions.push({
            type: "complete",
            question: blanked,
            questionLabel: `Complete the verse (${verse.reference})`,
            correctAnswer: correctWord,
            options,
            verseId: verse.id,
          });
        }
      }
    }
  });

  return questions.sort(() => Math.random() - 0.5).slice(0, 10);
}

// BookSelector component
function BookSelector({ onSelectBook, onClose }) {
  const [selectedTestament, setSelectedTestament] = useState("new");

  const books = selectedTestament === "old" ? BIBLE_BOOKS.oldTestament : BIBLE_BOOKS.newTestament;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          className="btn"
          onClick={() => setSelectedTestament("old")}
          style={{
            flex: 1,
            background: selectedTestament === "old" ? "linear-gradient(135deg, #8b6f47 0%, #6b5537 100%)" : "#f5f1e8",
            color: selectedTestament === "old" ? "white" : "#5a4d37",
            border: "none",
            padding: "10px",
            fontSize: "0.85rem",
          }}
        >
          Old Testament
        </button>
        <button
          className="btn"
          onClick={() => setSelectedTestament("new")}
          style={{
            flex: 1,
            background: selectedTestament === "new" ? "linear-gradient(135deg, #8b6f47 0%, #6b5537 100%)" : "#f5f1e8",
            color: selectedTestament === "new" ? "white" : "#5a4d37",
            border: "none",
            padding: "10px",
            fontSize: "0.85rem",
          }}
        >
          New Testament
        </button>
      </div>
      <div className="book-selector-grid">
        {books.map((book) => (
          <button
            key={book.code}
            className="book-selector-btn"
            onClick={() => onSelectBook(book)}
          >
            {book.name}
            <div style={{ fontSize: "0.65rem", color: "#8b7355", marginTop: "2px" }}>
              {book.chapters} ch.
            </div>
          </button>
        ))}
      </div>
      <button
        className="btn btn-secondary"
        onClick={onClose}
        style={{ marginTop: "10px", width: "100%" }}
      >
        Cancel
      </button>
    </div>
  );
}

// ChapterNavigator component
function ChapterNavigator({ book, currentChapter, onChapterChange, totalChapters }) {
  return (
    <div className="chapter-nav">
      <button
        className="chapter-nav-btn"
        onClick={() => onChapterChange(currentChapter - 1)}
        disabled={currentChapter <= 1}
      >
        <Icons.ChevronLeft />
      </button>
      <div className="chapter-nav-info">
        <div className="chapter-nav-title">{book} {currentChapter}</div>
        <div className="chapter-nav-subtitle">Chapter {currentChapter} of {totalChapters}</div>
      </div>
      <button
        className="chapter-nav-btn"
        onClick={() => onChapterChange(currentChapter + 1)}
        disabled={currentChapter >= totalChapters}
      >
        <Icons.ChevronRight />
      </button>
    </div>
  );
}

// MobileBottomNav component
function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "search", label: "Search", icon: Icons.Search },
    { id: "verses", label: "Verses", icon: Icons.Book },
    { id: "studies", label: "Study", icon: Icons.BookMarked },
    { id: "quiz", label: "Quiz", icon: Icons.Zap },
    { id: "practice", label: "Practice", icon: Icons.Brain },
    { id: "leaderboard", label: "Ranks", icon: Icons.Trophy },
    { id: "prayer", label: "Prayer", icon: Icons.Hands },
    { id: "stats", label: "Progress", icon: Icons.BarChart },
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            className={`mobile-nav-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              SoundEffects.playClick();
            }}
          >
            <IconComponent />
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentVerse, setCurrentVerse] = useState(null);
  const [searchVerses, setSearchVerses] = useState([]); // Parsed verses for search tab
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [practiceMode, setPracticeMode] = useState("recite"); // recite, identify, complete
  const [practiceVerse, setPracticeVerse] = useState(null);
  const [showVerseText, setShowVerseText] = useState(false);
  const [practiceInput, setPracticeInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [blankedVerse, setBlankedVerse] = useState("");
  const [missingWords, setMissingWords] = useState([]);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // My Verses navigation state
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  // Progress section navigation state
  const [currentMemorizedIndex, setCurrentMemorizedIndex] = useState(0);

  // Verse filtering toggle state (shared across Verses and Progress tabs)
  const [showAllVerses, setShowAllVerses] = useState(true);

  // Prayer tab state
  const [prayers, setPrayers] = useState([]);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerCategory, setPrayerCategory] = useState("Request");
  const [prayerVerseRefs, setPrayerVerseRefs] = useState([]);
  const [newVerseRef, setNewVerseRef] = useState("");
  const [collapsedPrayers, setCollapsedPrayers] = useState({}); // Track collapsed state for each prayer

  // Bible Studies state
  const [studies, setStudies] = useState([]);
  const [groupStudies, setGroupStudies] = useState([]);
  const [currentStudy, setCurrentStudy] = useState(null);
  const [studyView, setStudyView] = useState("list"); // list, create, view, createGroup, joinGroup, viewGroup
  const [studyType, setStudyType] = useState("personal"); // personal or group
  const [studyListView, setStudyListView] = useState("personal"); // personal or group (for list view toggle)
  const [studyTitle, setStudyTitle] = useState("");
  const [studyReference, setStudyReference] = useState("");
  const [studyPassages, setStudyPassages] = useState([]); // Now: [{reference, verses: [{verseNumber, text}]}]
  const [studyHighlights, setStudyHighlights] = useState([]); // Now: [{passageReference, verseNumber, color}]
  const [studyNotes, setStudyNotes] = useState([]); // Now: [{passageReference, verseNumber, ...}]
  const [studyAdditionalReferences, setStudyAdditionalReferences] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#ffe4e1");
  const [noteText, setNoteText] = useState("");
  const [loadingStudy, setLoadingStudy] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null); // Changed from selectedText to selectedVerse
  const [viewingNotesForVerse, setViewingNotesForVerse] = useState(null); // For showing notes panel
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [groupStudyCode, setGroupStudyCode] = useState("");
  const [joiningGroupStudy, setJoiningGroupStudy] = useState(false);
  const [groupStudyListener, setGroupStudyListener] = useState(null);
  const [mainPoints, setMainPoints] = useState([]);
  const [newMainPoint, setNewMainPoint] = useState("");
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [editingMainPoint, setEditingMainPoint] = useState(null);
  const [editingThought, setEditingThought] = useState(null);
  const [editingGroupNote, setEditingGroupNote] = useState(null);
  const [additionalReferenceInput, setAdditionalReferenceInput] = useState("");
  const [additionalReferenceLabel, setAdditionalReferenceLabel] = useState("");
  const [loadingAdditionalReference, setLoadingAdditionalReference] = useState(false);
  const [collapsedReferences, setCollapsedReferences] = useState({});
  const [collapsedPassages, setCollapsedPassages] = useState({}); // Track collapsed state for passages

  // Book selector / chapter navigation state
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [bookStudyLoading, setBookStudyLoading] = useState(false);

  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(20);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(null);
  const quizTimerRef = useRef(null);

  // Points & Leaderboard state
  const [userPoints, setUserPoints] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    isDangerous: false,
  });

  const recognitionRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      // Initialize Firebase
      if (typeof initializeFirebase !== "undefined") {
        initializeFirebase();
      }

      if (typeof FirebaseAuth === "undefined") {
        setAuthLoading(false);
        return;
      }

      // Listen for auth state changes (no need to handle redirect result with popup auth)
      const unsubscribe = FirebaseAuth.onAuthStateChanged(async (userData) => {
        setUser(userData || null);
        setAuthLoading(false);

        if (userData && typeof FirestoreService !== "undefined") {
          FirestoreService.setUser(userData.uid);
          try {
            const [userVerses, userPrayers, userStudies, userGroupStudies] = await Promise.all([
              FirestoreService.getVerses(),
              FirestoreService.getPrayers(),
              FirestoreService.getStudies(),
              FirestoreService.getGroupStudies(),
            ]);
            setVerses(userVerses);
            setPrayers(userPrayers);
            setStudies(userStudies);
            setGroupStudies(userGroupStudies);

            // Load user points
            try {
              const pointsDoc = await db.collection('users').doc(userData.uid).get();
              if (pointsDoc.exists && pointsDoc.data().points) {
                setUserPoints(pointsDoc.data().points);
              } else {
                // Calculate points from memorized verses
                const memorizedCount = userVerses.filter(v => v.memorized).length;
                const initialPoints = memorizedCount * POINTS.VERSE_MEMORIZED;
                setUserPoints(initialPoints);
                await db.collection('users').doc(userData.uid).set({
                  points: initialPoints,
                  displayName: userData.displayName,
                  photoURL: userData.photoURL,
                  email: userData.email,
                }, { merge: true });
              }
            } catch (pointsErr) {
              console.error("Points load error:", pointsErr);
            }
          } catch (err) {
            console.error("Data load error:", err);
            setError("Failed to load data. Please refresh the page.");
          }
        }
      });

      return () => unsubscribe();
    };

    init();
  }, []);

  useEffect(() => {
    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setPracticeInput((prev) => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Clamp currentVerseIndex when verses change
  useEffect(() => {
    if (verses.length > 0 && currentVerseIndex >= verses.length) {
      setCurrentVerseIndex(verses.length - 1);
    }
  }, [verses.length, currentVerseIndex]);

  // Clamp currentMemorizedIndex when memorized verses change
  useEffect(() => {
    const memorizedCount = verses.filter((v) => v.memorized).length;
    if (memorizedCount > 0 && currentMemorizedIndex >= memorizedCount) {
      setCurrentMemorizedIndex(memorizedCount - 1);
    }
  }, [verses, currentMemorizedIndex]);

  // Clean verse text by removing verse numbers, brackets, and other artifacts
  const cleanVerseText = (text) => {
    if (!text) return "";
    return text
      // Remove leading verse numbers and whitespace
      .replace(/^[\s\u00A0]*\d+\s*/, "")
      // Remove bracketed numbers like [21] or [32]
      .replace(/\[\d+\]/g, "")
      // Remove bracket fragments like "32]" or "[21"
      .replace(/\d+\]/g, "")
      .replace(/\[\d+/g, "")
      // Remove standalone brackets
      .replace(/\[|\]/g, "")
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim();
  };

  const parseVersesFromContent = (content, reference) => {
    if (!content) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const verseNodes = Array.from(
      doc.querySelectorAll("[data-number], [data-verse-id], [data-usfm], [data-v]")
    );

    const verses = verseNodes
      .map((node) => {
        let verseNumber =
          node.getAttribute("data-number") ||
          node.getAttribute("data-v") ||
          node.getAttribute("data-verse-id");

        if (!verseNumber) {
          const usfm = node.getAttribute("data-usfm");
          const match = usfm ? usfm.match(/\.(\d+)$/) : null;
          verseNumber = match ? match[1] : null;
        }

        const text = cleanVerseText(node.textContent || "");

        if (!verseNumber || !text) return null;
        return { verseNumber: verseNumber.toString(), text };
      })
      .filter(Boolean);

    if (verses.length > 0) {
      return verses;
    }

    // Get plain text for fallback parsing
    const plainText = (doc.body.textContent || content).replace(/\s+/g, " ").trim();

    // FIRST: Try parsing bracket notation like "1[1] text [2] text [3] text"
    // This handles the compressed format where verses are in brackets
    if (plainText.includes("[")) {
      const bracketVerses = [];

      // Remove any leading chapter number (e.g., "7[1]" -> "[1]")
      // Match: optional digits followed by bracket notation
      let cleanedText = plainText.replace(/^\d+\s*(?=\[)/, "");

      // Split on bracket notation: [N] where N is 1-3 digits
      // Pattern: [digit(s)] followed by text until next [digit(s)] or end
      const bracketPattern = /\[(\d{1,3})\]\s*([^\[]*?)(?=\s*\[\d{1,3}\]|$)/g;
      let match;

      while ((match = bracketPattern.exec(cleanedText)) !== null) {
        const verseNumber = match[1];
        const verseText = cleanVerseText(match[2]);

        if (verseNumber && verseText) {
          bracketVerses.push({
            verseNumber: verseNumber,
            text: verseText
          });
        }
      }

      if (bracketVerses.length > 0) {
        return bracketVerses;
      }
    }

    // Fallback: parse plain text with standalone verse numbers
    const refMatch = reference?.match(/(\d+):(\d+)(?:-(\d+))?/);

    if (refMatch) {
      const startVerse = parseInt(refMatch[2]);
      const endVerse = refMatch[3] ? parseInt(refMatch[3]) : startVerse;
      const verseCount = endVerse - startVerse + 1;

      // More robust splitting: split on verse numbers at word boundaries that are likely verse markers
      // Use a lookbehind-like approach by splitting and preserving the verse numbers
      const parts = [];
      let currentVerse = null;
      let currentText = "";

      // Split by potential verse numbers (1-3 digits followed by space at start of text or after period/space)
      const tokens = plainText.split(/\s+/);

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        // Check if this token is a verse number (1-3 digits)
        if (/^\d{1,3}$/.test(token) && i < tokens.length - 1) {
          // Save previous verse if exists
          if (currentVerse !== null && currentText.trim()) {
            parts.push({ verseNumber: currentVerse.toString(), text: currentText.trim() });
          }
          // Start new verse
          currentVerse = parseInt(token);
          currentText = "";
        } else {
          currentText += (currentText ? " " : "") + token;
        }
      }

      // Save last verse
      if (currentVerse !== null && currentText.trim()) {
        parts.push({ verseNumber: currentVerse.toString(), text: currentText.trim() });
      }

      // If we successfully parsed verses, return them
      if (parts.length >= verseCount) {
        return parts.slice(0, verseCount);
      }

      // If parsing failed, try simpler approach: match verse number at start
      const simpleParts = [];
      const lines = plainText.split(/\s*(\d{1,3})\s+/).filter(Boolean);

      for (let i = 0; i < lines.length - 1; i += 2) {
        if (/^\d{1,3}$/.test(lines[i]) && lines[i + 1]) {
          simpleParts.push({
            verseNumber: lines[i],
            text: lines[i + 1].trim()
          });
        }
      }

      if (simpleParts.length >= verseCount) {
        return simpleParts.slice(0, verseCount);
      }
    }

    // Final fallback: try to extract any verses we can find
    const fallbackParts = [];
    const verseMatches = plainText.matchAll(/(\d{1,3})\s+([^0-9]+?)(?=\s*\d{1,3}\s+|$)/g);

    for (const match of verseMatches) {
      if (match[2] && match[2].trim()) {
        fallbackParts.push({
          verseNumber: match[1],
          text: match[2].trim()
        });
      }
    }

    return fallbackParts.length > 0 ? fallbackParts : [];
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    SoundEffects.playClick();
    setLoading(true);
    setError("");
    setAddSuccess(false);
    try {
      const verse = await BibleAPI.fetchVerse(searchQuery, "KJV");
      setCurrentVerse(verse);

      const parsedVerses = parseVersesFromContent(
        verse.rawContent || verse.text,
        verse.reference
      );

      if (parsedVerses.length > 0) {
        setSearchVerses(parsedVerses);
      } else {
        setSearchVerses([
          {
            verseNumber: "1",
            text: verse.text,
          },
        ]);
      }

      SoundEffects.playSuccess();
    } catch (err) {
      setError(err.message);
      setCurrentVerse(null);
      setSearchVerses([]);
      SoundEffects.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleAddVerse = async () => {
    if (currentVerse) {
      try {
        const updatedVerses = await FirestoreService.addVerse(currentVerse);
        setVerses(updatedVerses);
        setError("");
        setAddSuccess(true);
        SoundEffects.playAdd();
        setTimeout(() => setAddSuccess(false), 3000);
      } catch (error) {
        console.error("Error adding verse:", error);
        setError("Failed to add verse. Please try again.");
        SoundEffects.playError();
      }
    }
  };

  const handleSpeakVerse = (verse) => {
    if (isSpeaking && TextToSpeech.isSpeaking()) {
      // Stop speaking if already speaking
      TextToSpeech.stop();
      setIsSpeaking(false);
    } else {
      // Start speaking the verse
      const success = TextToSpeech.speak(verse.text, verse.reference);
      if (success) {
        setIsSpeaking(true);
        // Monitor when speech ends
        if (TextToSpeech.currentUtterance) {
          TextToSpeech.currentUtterance.onend = () => {
            setIsSpeaking(false);
          };
        }
      } else {
        setError("Text-to-speech is not supported in your browser.");
      }
    }
  };

  const handleToggleMemorized = async (id) => {
    const verse = verses.find((v) => v.id === id);
    if (!verse) return;

    const wasMemorized = verse.memorized;

    // Optimistically update the UI immediately
    const optimisticVerses = verses.map((v) =>
      v.id === id ? { ...v, memorized: !v.memorized } : v
    );
    setVerses(optimisticVerses);

    // Play sound/animation immediately for better UX
    if (!wasMemorized) {
      SoundEffects.playCelebration();
      Confetti.create();
    } else {
      SoundEffects.playClick();
    }

    // Update the database in the background
    try {
      const updatedVerses = await FirestoreService.toggleMemorized(id);
      setVerses(updatedVerses);

      // Award/remove points for memorization
      if (!wasMemorized) {
        await addPoints(POINTS.VERSE_MEMORIZED);
      } else {
        await addPoints(-POINTS.VERSE_MEMORIZED);
      }
    } catch (error) {
      console.error("Error toggling memorized status:", error);
      // Rollback on error
      setVerses(verses);
      setError("Failed to update verse. Please try again.");
      SoundEffects.playError();
    }
  };

  const handleDeleteVerse = async (id) => {
    const verse = verses.find((v) => v.id === id);

    setConfirmModal({
      isOpen: true,
      title: "Delete Verse",
      message: `Are you sure you want to delete this verse?\n\n${
        verse?.reference || "Unknown reference"
      }\n\nThis action cannot be undone.`,
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const updatedVerses = await FirestoreService.deleteVerse(id);
          setVerses(updatedVerses);
          if (practiceVerse?.id === id) {
            setPracticeVerse(null);
          }
        } catch (error) {
          console.error("Error deleting verse:", error);
          setError("Failed to delete verse. Please try again.");
        }
      },
    });
  };

  const createBlankedVerse = (text) => {
    const words = text.split(" ");
    const numBlanks = Math.max(3, Math.floor(words.length * 0.3));
    const indices = new Set();

    while (indices.size < numBlanks && indices.size < words.length) {
      indices.add(Math.floor(Math.random() * words.length));
    }

    const missing = [];
    const blanked = words
      .map((word, idx) => {
        if (indices.has(idx)) {
          missing.push(word);
          return "____";
        }
        return word;
      })
      .join(" ");

    return { blanked, missing };
  };

  const startPractice = () => {
    // All verses are available for practice regardless of memorized status
    const availableVerses = verses;

    if (availableVerses.length > 0) {
      const randomVerse =
        availableVerses[Math.floor(Math.random() * availableVerses.length)];
      setPracticeVerse(randomVerse);
      setShowVerseText(false);
      setPracticeInput("");
      setFeedback(null);

      if (practiceMode === "complete") {
        const { blanked, missing } = createBlankedVerse(randomVerse.text);
        setBlankedVerse(blanked);
        setMissingWords(missing);
      }
    }
  };

  const exitPractice = () => {
    setPracticeVerse(null);
    setPracticeInput("");
    setFeedback(null);
    setShowVerseText(false);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setFeedback({
        type: "error",
        message: "Speech recognition not supported in your browser",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const checkAnswer = () => {
    if (!practiceVerse) return;

    const userText = practiceInput.toLowerCase().trim();

    if (practiceMode === "recite") {
      const correctText = practiceVerse.text.toLowerCase().trim();
      const similarity = calculateSimilarity(userText, correctText);

      if (similarity > 0.8) {
        setFeedback({
          type: "success",
          message: "Excellent! You got it right!",
        });
        SoundEffects.playSuccess();
      } else {
        setFeedback({
          type: "error",
          message: "Not quite right. Try again or reveal the verse.",
        });
        SoundEffects.playError();
      }
    } else if (practiceMode === "identify") {
      // Parse scripture reference into components
      const parseReference = (ref) => {
        // Match pattern: "Book Chapter:Verse" or "# Book Chapter:Verse"
        const match = ref.match(/^(\d*\s*[a-z\s]+?)\s+(\d+):(\d+(?:-\d+)?)/i);
        if (match) {
          return {
            book: match[1].trim().toLowerCase(),
            chapter: match[2],
            verse: match[3]
          };
        }
        // Try to at least extract the book name if no match
        const bookMatch = ref.match(/^(\d*\s*[a-z\s]+)/i);
        return {
          book: bookMatch ? bookMatch[1].trim().toLowerCase() : ref.toLowerCase(),
          chapter: null,
          verse: null
        };
      };

      const correctParts = parseReference(practiceVerse.reference);
      const userParts = parseReference(userText);

      // Check if user got the complete reference correct
      const correctRef = practiceVerse.reference.toLowerCase().trim();
      if (
        userText.includes(correctRef.toLowerCase()) ||
        calculateSimilarity(userText, correctRef) > 0.85
      ) {
        setFeedback({
          type: "success",
          message: "Correct! You identified the reference!",
        });
        SoundEffects.playSuccess();
      }
      // Check if user got just the book right
      else if (userParts.book === correctParts.book && !userParts.chapter) {
        setFeedback({
          type: "warning",
          message: `Right book! But which chapter and verse?`,
        });
        SoundEffects.playError();
      }
      // Check if user got book and chapter but not verse
      else if (userParts.book === correctParts.book &&
               userParts.chapter === correctParts.chapter &&
               !userParts.verse) {
        setFeedback({
          type: "warning",
          message: `Right book and chapter! But which verse?`,
        });
        SoundEffects.playError();
      }
      else {
        setFeedback({
          type: "error",
          message: `Not quite. The reference is ${practiceVerse.reference}`,
        });
        SoundEffects.playError();
      }
    } else if (practiceMode === "complete") {
      // In complete mode, user only needs to type the missing words
      const userWords = userText.split(/\s+/).filter(w => w.length > 0);
      const correctWords = missingWords.map(w => w.toLowerCase().replace(/[.,!?;:'"]/g, ''));

      // Check if user provided the right number of words
      if (userWords.length !== correctWords.length) {
        setFeedback({
          type: "error",
          message: `Please provide ${correctWords.length} missing word(s). You provided ${userWords.length}.`,
        });
        SoundEffects.playError();
        return;
      }

      // Compare each word with some tolerance for punctuation
      let correctCount = 0;
      for (let i = 0; i < correctWords.length; i++) {
        const userWord = userWords[i].toLowerCase().replace(/[.,!?;:'"]/g, '');
        const correctWord = correctWords[i];

        if (userWord === correctWord || calculateSimilarity(userWord, correctWord) > 0.8) {
          correctCount++;
        }
      }

      const accuracy = correctCount / correctWords.length;
      if (accuracy >= 0.8) {
        setFeedback({
          type: "success",
          message: `Great job! You got ${correctCount} out of ${correctWords.length} words correct!`,
        });
        SoundEffects.playSuccess();
      } else {
        setFeedback({
          type: "error",
          message: `You got ${correctCount} out of ${correctWords.length} words. Keep trying!`,
        });
        SoundEffects.playError();
      }
    }
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  const editDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    FirestoreService.setUser(userData.uid);
    try {
      const userVerses = await FirestoreService.getVerses();
      setVerses(userVerses);
    } catch (error) {
      console.error("Error loading verses:", error);
      setError("Failed to load verses. Please refresh the page.");
    }
  };

  const handleLogout = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Logout",
      message:
        "Are you sure you want to logout?\n\nYour data is safely stored in the cloud and will be available when you sign in again.",
      confirmText: "Logout",
      isDangerous: false,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        if (typeof FirebaseAuth !== "undefined") {
          await FirebaseAuth.signOut();
          setUser(null);
          FirestoreService.setUser(null);
          setVerses([]);
        }
      },
    });
  };

  // Prayer handlers
  const handleAddPrayer = async () => {
    if (!prayerTitle.trim() || !prayerContent.trim()) {
      setError("Please enter both title and content for your prayer");
      return;
    }

    try {
      const newPrayer = {
        title: prayerTitle.trim(),
        content: prayerContent.trim(),
        category: prayerCategory,
        verseRefs: prayerVerseRefs,
        answered: false,
        dateAdded: new Date().toISOString(),
        dateAnswered: null,
      };

      if (editingPrayer) {
        // Update existing prayer
        await FirestoreService.updatePrayer(editingPrayer.id, newPrayer);
      } else {
        // Add new prayer
        await FirestoreService.addPrayer(newPrayer);
      }

      // Reload prayers
      const updatedPrayers = await FirestoreService.getPrayers();
      setPrayers(updatedPrayers);

      // Reset form
      setPrayerTitle("");
      setPrayerContent("");
      setPrayerCategory("Request");
      setPrayerVerseRefs([]);
      setShowPrayerForm(false);
      setEditingPrayer(null);
      setError("");
      SoundEffects.playAdd();
    } catch (error) {
      console.error("Error saving prayer:", error);
      setError("Failed to save prayer. Please try again.");
      SoundEffects.playError();
    }
  };

  const handleEditPrayer = (prayer) => {
    setEditingPrayer(prayer);
    setPrayerTitle(prayer.title);
    setPrayerContent(prayer.content);
    setPrayerCategory(prayer.category);
    setPrayerVerseRefs(prayer.verseRefs || []);
    setShowPrayerForm(true);
  };

  const handleDeletePrayer = async (prayerId) => {
    const prayer = prayers.find((p) => p.id === prayerId);

    setConfirmModal({
      isOpen: true,
      title: "Delete Prayer",
      message: `Are you sure you want to delete this prayer?\n\n"${
        prayer?.title || "Untitled prayer"
      }"\n\nThis action cannot be undone.`,
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          await FirestoreService.deletePrayer(prayerId);
          const updatedPrayers = await FirestoreService.getPrayers();
          setPrayers(updatedPrayers);
          SoundEffects.playClick();
        } catch (error) {
          console.error("Error deleting prayer:", error);
          setError("Failed to delete prayer. Please try again.");
          SoundEffects.playError();
        }
      },
    });
  };

  const handleAddVerseRef = () => {
    if (newVerseRef.trim() && !prayerVerseRefs.includes(newVerseRef.trim())) {
      setPrayerVerseRefs([...prayerVerseRefs, newVerseRef.trim()]);
      setNewVerseRef("");
    }
  };

  const handleRemoveVerseRef = (ref) => {
    setPrayerVerseRefs(prayerVerseRefs.filter((r) => r !== ref));
  };

  const cancelPrayerForm = () => {
    setPrayerTitle("");
    setPrayerContent("");
    setPrayerCategory("Request");
    setPrayerVerseRefs([]);
    setShowPrayerForm(false);
    setEditingPrayer(null);
    setError("");
  };

  // Bible Studies handlers
  const PASTEL_COLORS = [
    { name: "Pink", value: "#ffe4e1" },
    { name: "Yellow", value: "#fff9e6" },
    { name: "Green", value: "#e8f5e9" },
    { name: "Blue", value: "#e3f2fd" },
    { name: "Purple", value: "#f3e5f5" },
    { name: "Orange", value: "#fff3e0" },
  ];

  const startNewStudy = () => {
    setStudyView("create");
    setStudyTitle("");
    setStudyReference("");
    setStudyPassages([]);
    setStudyHighlights([]);
    setStudyNotes([]);
    setStudyAdditionalReferences([]);
    setSelectedColor(PASTEL_COLORS[0].value);
    setNoteText("");
    setCurrentStudy(null);
    setSelectedVerse(null);
    setViewingNotesForVerse(null);
    setShowNoteForm(false);
  };

  const fetchStudyPassage = async () => {
    if (!studyReference.trim()) {
      setError("Please enter a scripture reference");
      return;
    }

    // Check if this reference already exists
    const existingPassage = studyPassages.find(p => p.reference === studyReference.trim());
    if (existingPassage) {
      setError("This passage reference has already been added");
      return;
    }

    setLoadingStudy(true);
    setError("");

    try {
      // Fetch the passage - this will get a range if specified (e.g., "John 3:16-21")
      const verseData = await BibleAPI.fetchVerse(studyReference, "KJV");

      // Parse the content into individual verses using the proper parser
      const parsedVerses = parseVersesFromContent(
        verseData.rawContent || verseData.text,
        verseData.reference
      );

      let verses = [];
      if (parsedVerses.length > 0) {
        verses = parsedVerses;
      } else {
        // Fallback: if parsing failed, use the whole text as a single verse
        verses = [{
          verseNumber: "1",
          text: verseData.text,
        }];
      }

      // Add the new passage to the passages array
      const newPassage = {
        reference: studyReference.trim(),
        verses: verses.filter(v => v && v.verseNumber && v.text)
      };

      setStudyPassages([...studyPassages, newPassage]);
      setStudyReference(""); // Clear the input for the next passage

      SoundEffects.playSuccess();
    } catch (err) {
      setError(err.message);
      SoundEffects.playError();
    } finally {
      setLoadingStudy(false);
    }
  };

  const removePassage = (passageReference) => {
    // Remove the passage
    setStudyPassages(studyPassages.filter(p => p.reference !== passageReference));

    // Remove all highlights and notes for this passage
    setStudyHighlights(studyHighlights.filter(h => h.passageReference !== passageReference));
    setStudyNotes(studyNotes.filter(n => n.passageReference !== passageReference));

    // Clear selection if it was in the removed passage
    if (selectedVerse && selectedVerse.passageReference === passageReference) {
      setSelectedVerse(null);
    }
    if (viewingNotesForVerse && viewingNotesForVerse.passageReference === passageReference) {
      setViewingNotesForVerse(null);
    }

    SoundEffects.playClick();
  };

  // Helper function to check if two verse references match
  const isSameVerse = (v1, v2) => {
    if (!v1 || !v2) return false;
    return v1.passageReference === v2.passageReference && v1.verseNumber === v2.verseNumber;
  };

  // Helper function to get highlight for a specific verse
  const getVerseHighlight = (passageReference, verseNumber) => {
    return studyHighlights.find(h =>
      h.passageReference === passageReference && h.verseNumber === verseNumber
    );
  };

  const handleVerseClick = (passageReference, verseNumber) => {
    // Toggle selection: if clicking the same verse, deselect it
    const verseRef = { passageReference, verseNumber };
    if (isSameVerse(selectedVerse, verseRef)) {
      setSelectedVerse(null);
    } else {
      setSelectedVerse(verseRef);
      setViewingNotesForVerse(null); // Close notes panel when selecting a verse
    }
  };

  const applyHighlight = () => {
    if (!selectedVerse) return;

    // Check if this verse already has a highlight
    const existingHighlight = getVerseHighlight(selectedVerse.passageReference, selectedVerse.verseNumber);

    if (existingHighlight) {
      // Update the color of existing highlight
      setStudyHighlights(studyHighlights.map(h =>
        h.passageReference === selectedVerse.passageReference && h.verseNumber === selectedVerse.verseNumber
          ? { ...h, color: selectedColor }
          : h
      ));
    } else {
      // Create new highlight for the entire verse
      const newHighlight = {
        id: Date.now().toString(),
        passageReference: selectedVerse.passageReference,
        verseNumber: selectedVerse.verseNumber,
        color: selectedColor,
      };
      setStudyHighlights([...studyHighlights, newHighlight]);
    }

    setSelectedVerse(null);
    SoundEffects.playClick();
  };

  const removeHighlight = (passageReference, verseNumber) => {
    setStudyHighlights(studyHighlights.filter(h =>
      !(h.passageReference === passageReference && h.verseNumber === verseNumber)
    ));
    SoundEffects.playClick();
  };

  const handleHighlightClick = (passageReference, verseNumber) => {
    // Toggle notes view for the clicked verse
    const verseRef = { passageReference, verseNumber };
    if (isSameVerse(viewingNotesForVerse, verseRef)) {
      setViewingNotesForVerse(null);
    } else {
      setViewingNotesForVerse(verseRef);
      setSelectedVerse(null); // Deselect verse when viewing notes
    }
  };

  const addNote = () => {
    if (!noteText.trim()) {
      setError("Please enter note text");
      return;
    }

    if (editingNote) {
      // We're editing an existing note
      saveEditedNote();
      return;
    }

    // If we're viewing notes for a specific verse, attach the note to that verse
    const verseRef = viewingNotesForVerse || selectedVerse;
    if (!verseRef) return;

    const newNote = {
      id: Date.now().toString(),
      passageReference: verseRef.passageReference,
      verseNumber: verseRef.verseNumber, // Link note to specific verse
      color: selectedColor,
      text: noteText.trim(),
      timestamp: new Date().toISOString(),
    };

    setStudyNotes([...studyNotes, newNote]);
    setNoteText("");
    setShowNoteForm(false);
    setError("");
    SoundEffects.playAdd();
  };

  const deleteNote = (noteId) => {
    setStudyNotes(studyNotes.filter(n => n.id !== noteId));
    SoundEffects.playClick();
  };

  const saveStudy = async () => {
    if (!studyTitle.trim()) {
      setError("Please enter a title for your study");
      return;
    }

    if (studyPassages.length === 0) {
      setError("Please add at least one scripture passage");
      return;
    }

    try {
      const studyData = {
        title: studyTitle.trim(),
        passages: studyPassages.map(passage => ({
          reference: passage.reference,
          verses: passage.verses.filter(v => v && v.verseNumber && v.text)
        })),
        highlights: studyHighlights,
        notes: studyNotes,
        thoughts: thoughts,
        additionalReferences: studyAdditionalReferences.map(ref => ({
          ...ref,
          passages: ref.passages ? ref.passages.filter(v => v && v.verseNumber && v.text) : []
        })),
      };

      if (currentStudy) {
        // Update existing study
        await FirestoreService.updateStudy(currentStudy.id, studyData);
      } else {
        // Create new study
        await FirestoreService.addStudy(studyData);
      }

      // Reload studies
      const updatedStudies = await FirestoreService.getStudies();
      setStudies(updatedStudies);

      // Go back to list view
      setStudyView("list");
      setError("");
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error saving study:", err);
      setError("Failed to save study. Please try again.");
      SoundEffects.playError();
    }
  };

  const loadStudy = (study) => {
    setCurrentStudy(study);
    setStudyTitle(study.title);
    setStudyReference("");
    // Handle both old and new data structures
    if (study.passages && study.passages.length > 0) {
      // Check if it's the new format (array of {reference, verses})
      if (study.passages[0].verses) {
        setStudyPassages(study.passages);
      } else {
        // Old format: single passage stored as flat array of verses
        // Migrate to new format
        setStudyPassages([{
          reference: study.reference || "Unknown",
          verses: study.passages
        }]);
      }
    } else {
      setStudyPassages([]);
    }
    setStudyHighlights(study.highlights || []);
    setStudyNotes(study.notes || []);
    setStudyAdditionalReferences(study.additionalReferences || []);
    setThoughts(study.thoughts || []);
    setSelectedColor(PASTEL_COLORS[0].value);
    setNoteText("");
    setNewThought("");
    setEditingThought(null);
    setSelectedVerse(null);
    setViewingNotesForVerse(null);
    setShowNoteForm(false);
    setStudyView("view");
  };

  const deleteStudy = async (studyId) => {
    const study = studies.find((s) => s.id === studyId);

    setConfirmModal({
      isOpen: true,
      title: "Delete Study",
      message: `Are you sure you want to delete this study?\n\n"${
        study?.title || "Untitled study"
      }"\n\nThis action cannot be undone.`,
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const updatedStudies = await FirestoreService.deleteStudy(studyId);
          setStudies(updatedStudies);

          // If we're viewing this study, go back to list
          if (currentStudy && currentStudy.id === studyId) {
            setStudyView("list");
            setCurrentStudy(null);
          }

          SoundEffects.playClick();
        } catch (error) {
          console.error("Error deleting study:", error);
          setError("Failed to delete study. Please try again.");
          SoundEffects.playError();
        }
      },
    });
  };

  const duplicateStudy = async (study) => {
    try {
      // Handle both old and new data structures
      let passages = [];
      if (study.passages && study.passages.length > 0) {
        if (study.passages[0].verses) {
          // New format: [{reference, verses}]
          passages = study.passages.map(p => ({
            reference: p.reference,
            verses: p.verses.filter(v => v && v.verseNumber && v.text)
          }));
        } else {
          // Old format: single passage as flat array of verses
          passages = [{
            reference: study.reference || "Unknown",
            verses: study.passages.filter(v => v && v.verseNumber && v.text)
          }];
        }
      }

      const duplicatedStudy = {
        title: study.title + " (Copy)",
        passages: passages,
        highlights: [],
        notes: [],
      };

      await FirestoreService.addStudy(duplicatedStudy);
      const updatedStudies = await FirestoreService.getStudies();
      setStudies(updatedStudies);
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error duplicating study:", err);
      setError("Failed to duplicate study. Please try again.");
      SoundEffects.playError();
    }
  };

  // Group Bible Study handlers
  const startNewGroupStudy = () => {
    setStudyType("group");
    setStudyView("createGroup");
    setStudyTitle("");
    setStudyReference("");
    setStudyPassages([]);
    setMainPoints([]);
    setThoughts([]);
    setStudyNotes([]);
    setStudyHighlights([]);
    setStudyAdditionalReferences([]);
    setSelectedColor(PASTEL_COLORS[0].value);
    setNoteText("");
    setCurrentStudy(null);
    setSelectedVerse(null);
    setViewingNotesForVerse(null);
    setShowNoteForm(false);
  };

  const startJoinGroupStudy = () => {
    setStudyView("joinGroup");
    setGroupStudyCode("");
    setError("");
  };

  const createGroupStudy = async () => {
    if (!studyTitle.trim()) {
      setError("Please enter a study title");
      return;
    }
    if (studyPassages.length === 0) {
      setError("Please add at least one scripture passage");
      return;
    }

    try {
      setLoadingStudy(true);
      const groupStudyData = {
        title: studyTitle,
        passages: studyPassages.map(passage => ({
          reference: passage.reference,
          verses: passage.verses.filter(v => v && v.verseNumber && v.text)
        })),
        mainPoints: mainPoints,
        leadName: user.displayName || user.email,
        leadPhoto: user.photoURL || null,
      };

      const result = await FirestoreService.createGroupStudy(groupStudyData);
      const updatedGroupStudies = await FirestoreService.getGroupStudies();
      setGroupStudies(updatedGroupStudies);

      // Show the study code to the user
      const createdStudy = updatedGroupStudies.find(s => s.id === result.id);
      if (createdStudy) {
        loadGroupStudy(createdStudy);
      }

      setLoadingStudy(false);
      SoundEffects.playSuccess();
      setError("");
    } catch (err) {
      console.error("Error creating group study:", err);
      setError("Failed to create group study. Please try again.");
      setLoadingStudy(false);
      SoundEffects.playError();
    }
  };

  const joinGroupStudy = async () => {
    if (!groupStudyCode.trim()) {
      setError("Please enter a study code");
      return;
    }

    try {
      setJoiningGroupStudy(true);
      const userData = {
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
      };

      const studyId = await FirestoreService.joinGroupStudy(groupStudyCode.toUpperCase(), userData);
      const updatedGroupStudies = await FirestoreService.getGroupStudies();
      setGroupStudies(updatedGroupStudies);

      const joinedStudy = updatedGroupStudies.find(s => s.id === studyId);
      if (joinedStudy) {
        loadGroupStudy(joinedStudy);
      }

      setJoiningGroupStudy(false);
      SoundEffects.playSuccess();
      setError("");
      setGroupStudyCode("");
    } catch (err) {
      console.error("Error joining group study:", err);
      setError(err.message || "Failed to join group study. Please check the code and try again.");
      setJoiningGroupStudy(false);
      SoundEffects.playError();
    }
  };

  const loadGroupStudy = (study) => {
    setCurrentStudy(study);
    setStudyType("group");
    setStudyTitle(study.title);
    setStudyReference("");

    // Handle both old and new data structures
    if (study.passages && study.passages.length > 0) {
      if (study.passages[0].verses) {
        // New format: [{reference, verses}]
        setStudyPassages(study.passages);
      } else {
        // Old format: single passage as flat array of verses
        setStudyPassages([{
          reference: study.reference || "Unknown",
          verses: study.passages.filter(v => v && v.verseNumber && v.text)
        }]);
      }
    } else {
      setStudyPassages([]);
    }

    setMainPoints(study.mainPoints || []);
    setThoughts(study.thoughts || []);
    setStudyNotes(study.notes || []);
    setStudyHighlights(study.highlights || []);
    setStudyAdditionalReferences(study.additionalReferences || []);
    setStudyView("viewGroup");

    // Set up real-time listener for this group study
    if (groupStudyListener) {
      groupStudyListener(); // Unsubscribe from previous listener
    }

    const unsubscribe = FirestoreService.onGroupStudyChange(study.id, (updatedStudy) => {
      if (updatedStudy) {
        setCurrentStudy(updatedStudy);

        // Handle both old and new data structures for passages in real-time updates
        if (updatedStudy.passages && updatedStudy.passages.length > 0) {
          if (updatedStudy.passages[0].verses) {
            setStudyPassages(updatedStudy.passages);
          } else {
            setStudyPassages([{
              reference: updatedStudy.reference || "Unknown",
              verses: updatedStudy.passages.filter(v => v && v.verseNumber && v.text)
            }]);
          }
        }

        setMainPoints(updatedStudy.mainPoints || []);
        setThoughts(updatedStudy.thoughts || []);
        setStudyNotes(updatedStudy.notes || []);
        setStudyHighlights(updatedStudy.highlights || []);
        setStudyAdditionalReferences(updatedStudy.additionalReferences || []);
      }
    });

    setGroupStudyListener(() => unsubscribe);
  };

  const addMainPoint = async () => {
    if (!newMainPoint.trim()) return;

    try {
      const updatedMainPoints = [...mainPoints, newMainPoint];
      await FirestoreService.updateGroupStudy(currentStudy.id, {
        mainPoints: updatedMainPoints,
      });
      setMainPoints(updatedMainPoints);
      setNewMainPoint("");
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error adding main point:", err);
      setError("Failed to add main point");
      SoundEffects.playError();
    }
  };

  const addThought = async () => {
    if (!newThought.trim()) return;

    try {
      // Check if it's a group study or personal study
      if (currentStudy.isGroupStudy) {
        const userData = {
          displayName: user.displayName || user.email,
          photoURL: user.photoURL || null,
        };
        await FirestoreService.addThoughtToGroupStudy(currentStudy.id, newThought, userData);
      } else {
        // Personal study - add thought locally and save
        const newThoughtObj = {
          id: Date.now().toString() + '_' + user.uid,
          userId: user.uid,
          userName: user.displayName || user.email,
          userPhoto: user.photoURL || null,
          text: newThought,
          timestamp: new Date().toISOString()
        };
        const updatedThoughts = [...thoughts, newThoughtObj];
        setThoughts(updatedThoughts);
        await FirestoreService.updateStudy(currentStudy.id, {
          ...currentStudy,
          thoughts: updatedThoughts
        });
      }
      setNewThought("");
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error adding thought:", err);
      setError("Failed to add thought");
      SoundEffects.playError();
    }
  };

  const leaveGroupStudy = async (studyId) => {
    setConfirmModal({
      isOpen: true,
      title: "Leave Group Study?",
      message: "Are you sure you want to leave this group study? You can rejoin using the study code.",
      confirmText: "Leave",
      isDangerous: true,
      onConfirm: async () => {
        try {
          const userData = {
            displayName: user.displayName || user.email,
            photoURL: user.photoURL || null,
          };
          await FirestoreService.leaveGroupStudy(studyId, userData);
          const updatedGroupStudies = await FirestoreService.getGroupStudies();
          setGroupStudies(updatedGroupStudies);
          setStudyView("list");
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playSuccess();
        } catch (err) {
          console.error("Error leaving group study:", err);
          setError("Failed to leave group study");
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playError();
        }
      },
    });
  };

  const deleteGroupStudy = async (studyId) => {
    const study = groupStudies.find((s) => s.id === studyId);

    setConfirmModal({
      isOpen: true,
      title: "Delete Group Study?",
      message: `Are you sure you want to delete "${study.title}"? This will remove the study for all participants. This action cannot be undone.`,
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        try {
          await FirestoreService.deleteGroupStudy(studyId);
          const updatedGroupStudies = await FirestoreService.getGroupStudies();
          setGroupStudies(updatedGroupStudies);
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playSuccess();
        } catch (err) {
          console.error("Error deleting group study:", err);
          setError(err.message || "Failed to delete group study");
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playError();
        }
      },
    });
  };

  // Edit main point (lead only)
  const editMainPoint = async (pointIndex, newText) => {
    try {
      await FirestoreService.editMainPoint(currentStudy.id, pointIndex, newText);
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error editing main point:", err);
      setError("Failed to edit main point");
      SoundEffects.playError();
    }
  };

  // Delete main point (lead only)
  const deleteMainPoint = async (pointIndex) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Main Point?",
      message: "Are you sure you want to delete this main point?",
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        try {
          await FirestoreService.deleteMainPoint(currentStudy.id, pointIndex);
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playSuccess();
        } catch (err) {
          console.error("Error deleting main point:", err);
          setError("Failed to delete main point");
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playError();
        }
      },
    });
  };

  // Edit thought (own thoughts only)
  const editThought = async (thoughtId, newText) => {
    try {
      if (currentStudy.isGroupStudy) {
        await FirestoreService.editThought(currentStudy.id, thoughtId, newText);
      } else {
        // Personal study - update thought locally and save
        const updatedThoughts = thoughts.map(t =>
          t.id === thoughtId
            ? { ...t, text: newText, edited: true, editedAt: new Date().toISOString() }
            : t
        );
        setThoughts(updatedThoughts);
        await FirestoreService.updateStudy(currentStudy.id, {
          ...currentStudy,
          thoughts: updatedThoughts
        });
      }
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error editing thought:", err);
      setError("Failed to edit thought");
      SoundEffects.playError();
    }
  };

  // Delete thought (own thoughts only)
  const deleteThought = async (thoughtId) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Thought?",
      message: "Are you sure you want to delete this thought?",
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        try {
          if (currentStudy.isGroupStudy) {
            await FirestoreService.deleteThought(currentStudy.id, thoughtId);
          } else {
            // Personal study - remove thought locally and save
            const updatedThoughts = thoughts.filter(t => t.id !== thoughtId);
            setThoughts(updatedThoughts);
            await FirestoreService.updateStudy(currentStudy.id, {
              ...currentStudy,
              thoughts: updatedThoughts
            });
          }
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playSuccess();
        } catch (err) {
          console.error("Error deleting thought:", err);
          setError("Failed to delete thought");
          setConfirmModal({ ...confirmModal, isOpen: false });
          SoundEffects.playError();
        }
      },
    });
  };

  // Add note to group study
  const addNoteToGroupStudy = async () => {
    if (!noteText.trim()) {
      setError("Please enter note text");
      return;
    }

    const verseRef = viewingNotesForVerse || selectedVerse;

    if (!verseRef || !verseRef.passageReference || !verseRef.verseNumber) {
      setError("Invalid verse reference");
      return;
    }

    try {
      const userData = {
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
      };

      const note = {
        passageReference: verseRef.passageReference,
        verseNumber: verseRef.verseNumber,
        color: selectedColor,
        text: noteText.trim(),
      };

      await FirestoreService.addNoteToGroupStudy(currentStudy.id, note, userData);
      setNoteText("");
      setShowNoteForm(false);
      setError("");
      SoundEffects.playAdd();
    } catch (err) {
      console.error("Error adding note:", err);
      setError("Failed to add note");
      SoundEffects.playError();
    }
  };

  // Edit note in group study (own notes only)
  const editNoteInGroupStudy = async (noteId, newText, newColor) => {
    try {
      await FirestoreService.editNoteInGroupStudy(currentStudy.id, noteId, newText, newColor);
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error editing note:", err);
      setError("Failed to edit note");
      SoundEffects.playError();
    }
  };

  // Delete note from group study (own notes only)
  const deleteNoteFromGroupStudy = async (noteId) => {
    try {
      await FirestoreService.deleteNoteFromGroupStudy(currentStudy.id, noteId);
      SoundEffects.playClick();
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Failed to delete note");
      SoundEffects.playError();
    }
  };

  // Add highlight to group study
  const addHighlightToGroupStudy = async (passageReference, verseNumber, color) => {
    try {
      await FirestoreService.addHighlightToGroupStudy(currentStudy.id, passageReference, verseNumber, color);
      SoundEffects.playClick();
    } catch (err) {
      console.error("Error adding highlight:", err);
      setError("Failed to add highlight");
      SoundEffects.playError();
    }
  };

  // Remove highlight from group study
  const removeHighlightFromGroupStudy = async (passageReference, verseNumber) => {
    try {
      await FirestoreService.removeHighlightFromGroupStudy(currentStudy.id, passageReference, verseNumber);
      SoundEffects.playClick();
    } catch (err) {
      console.error("Error removing highlight:", err);
      setError("Failed to remove highlight");
      SoundEffects.playError();
    }
  };

  // Add additional reference to group study
  const addAdditionalReference = async (reference, passages, label = "") => {
    try {
      await FirestoreService.addAdditionalReference(currentStudy.id, reference, passages, label);
      SoundEffects.playSuccess();
    } catch (err) {
      console.error("Error adding reference:", err);
      setError("Failed to add reference");
      SoundEffects.playError();
    }
  };

  // Remove additional reference from group study
  const removeAdditionalReference = async (referenceId) => {
    try {
      await FirestoreService.removeAdditionalReference(currentStudy.id, referenceId);
      SoundEffects.playClick();
    } catch (err) {
      console.error("Error removing reference:", err);
      setError("Failed to remove reference");
      SoundEffects.playError();
    }
  };

  // Edit personal study note
  const editNote = (noteId) => {
    const note = studyNotes.find(n => n.id === noteId);
    if (note) {
      setEditingNote(note);
      setNoteText(note.text);
      setSelectedColor(note.color);
      setShowNoteForm(true);
    }
  };

  // Save edited note
  const saveEditedNote = () => {
    if (!noteText.trim()) {
      setError("Please enter note text");
      return;
    }

    const updatedNotes = studyNotes.map(n =>
      n.id === editingNote.id
        ? { ...n, text: noteText.trim(), color: selectedColor }
        : n
    );

    setStudyNotes(updatedNotes);
    setNoteText("");
    setShowNoteForm(false);
    setEditingNote(null);
    setError("");
    SoundEffects.playSuccess();
  };

  // Cancel editing note
  const cancelEditNote = () => {
    setNoteText("");
    setShowNoteForm(false);
    setEditingNote(null);
    setSelectedColor(PASTEL_COLORS[0].value);
  };

  // Fetch and add additional reference (for group studies)
  const fetchAndAddAdditionalReference = async () => {
    if (!additionalReferenceInput.trim()) {
      setError("Please enter a scripture reference");
      return;
    }

    setLoadingAdditionalReference(true);
    setError("");

    try {
      const verseData = await BibleAPI.fetchVerse(additionalReferenceInput, "KJV");

      // Parse into verses using the proper parser
      const parsedVerses = parseVersesFromContent(
        verseData.rawContent || verseData.text,
        verseData.reference
      );

      const verses = parsedVerses.length > 0 ? parsedVerses : [{
        verseNumber: "1",
        text: verseData.text,
      }];

      // Add to the study (group or personal)
      if (studyType === "group" && currentStudy) {
        await addAdditionalReference(verseData.reference, verses, additionalReferenceLabel);
      } else {
        // For personal studies, add to local state
        const newReference = {
          id: Date.now().toString(),
          reference: verseData.reference,
          passages: verses,
          label: additionalReferenceLabel || "",
          addedAt: new Date().toISOString()
        };
        setStudyAdditionalReferences([...studyAdditionalReferences, newReference]);
        SoundEffects.playSuccess();
      }
      setAdditionalReferenceInput("");
      setAdditionalReferenceLabel("");
      setLoadingAdditionalReference(false);
    } catch (err) {
      console.error("Error fetching additional reference:", err);
      setError("Failed to fetch scripture. Please check the reference and try again.");
      setLoadingAdditionalReference(false);
      SoundEffects.playError();
    }
  };

  // Remove additional reference (for personal studies)
  const removeAdditionalReferenceFromPersonalStudy = (referenceId) => {
    setStudyAdditionalReferences(studyAdditionalReferences.filter(r => r.id !== referenceId));
    SoundEffects.playClick();
  };

  // Toggle collapse/expand for reference cards
  const toggleReferenceCollapse = (referenceId) => {
    setCollapsedReferences(prev => ({
      ...prev,
      [referenceId]: !prev[referenceId]
    }));
    SoundEffects.playClick();
  };

  const copyStudyCode = (code) => {
    navigator.clipboard.writeText(code);
    SoundEffects.playSuccess();
    setError(""); // Clear any existing error
    // Could show a toast notification here
  };

  // ============================
  // POINTS SYSTEM
  // ============================
  const addPoints = async (amount) => {
    const newPoints = Math.max(0, userPoints + amount);
    setUserPoints(newPoints);

    if (user && db) {
      try {
        const memorizedCount = verses.filter(v => v.memorized).length;
        await db.collection('users').doc(user.uid).set({
          points: newPoints,
          memorizedCount: memorizedCount,
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.error("Error updating points:", err);
      }
    }
  };

  // ============================
  // LEADERBOARD
  // ============================
  const loadLeaderboard = async () => {
    if (!db) return;
    setLeaderboardLoading(true);
    try {
      const snapshot = await db.collection('users')
        .orderBy('points', 'desc')
        .limit(50)
        .get();

      const data = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.points > 0 && d.displayName) {
          data.push({
            uid: doc.id,
            displayName: d.displayName || "Anonymous",
            photoURL: d.photoURL || null,
            points: d.points || 0,
            memorizedCount: d.memorizedCount || 0,
          });
        }
      });
      setLeaderboardData(data);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // ============================
  // QUIZ SYSTEM
  // ============================
  const startQuiz = () => {
    if (verses.length < 4) {
      setError("You need at least 4 saved verses to start a quiz. Add more verses from the Search tab!");
      return;
    }

    const questions = generateQuizQuestions(verses);
    if (questions.length === 0) {
      setError("Could not generate quiz questions. Try adding more verses.");
      return;
    }

    setQuizQuestions(questions);
    setQuizCurrentIndex(0);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizCorrectCount(0);
    setQuizAnswered(false);
    setQuizSelectedOption(null);
    setQuizResults(null);
    setQuizTimeLeft(20);
    setQuizActive(true);
    setError("");
    SoundEffects.playClick();

    // Start timer
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    quizTimerRef.current = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto answer wrong
          handleQuizTimeout();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuizTimeout = () => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    setQuizStreak(0);
    SoundEffects.playError();

    setTimeout(() => advanceQuiz(), 1500);
  };

  const handleQuizAnswer = (option) => {
    if (quizAnswered) return;

    const question = quizQuestions[quizCurrentIndex];
    const isCorrect = option === question.correctAnswer;

    setQuizAnswered(true);
    setQuizSelectedOption(option);

    if (isCorrect) {
      let earned = POINTS.QUIZ_CORRECT;
      const newStreak = quizStreak + 1;
      setQuizStreak(newStreak);
      setQuizCorrectCount((prev) => prev + 1);

      // Fast bonus
      if (quizTimeLeft > 15) {
        earned += POINTS.QUIZ_FAST_BONUS;
      }

      // Streak bonus
      if (newStreak > 1) {
        earned += POINTS.QUIZ_STREAK_BONUS * (newStreak - 1);
      }

      setQuizScore((prev) => prev + earned);
      setShowPointsPopup(`+${earned}`);
      setTimeout(() => setShowPointsPopup(null), 1000);
      SoundEffects.playSuccess();
    } else {
      setQuizStreak(0);
      SoundEffects.playError();
    }

    setTimeout(() => advanceQuiz(), 1500);
  };

  const advanceQuiz = () => {
    const nextIndex = quizCurrentIndex + 1;

    if (nextIndex >= quizQuestions.length) {
      // Quiz complete
      finishQuiz();
    } else {
      setQuizCurrentIndex(nextIndex);
      setQuizAnswered(false);
      setQuizSelectedOption(null);
      setQuizTimeLeft(20);
    }
  };

  const finishQuiz = async () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);

    let finalScore = quizScore;

    // Perfect bonus
    if (quizCorrectCount === quizQuestions.length) {
      finalScore += POINTS.QUIZ_PERFECT;
    }

    setQuizResults({
      score: finalScore,
      correct: quizCorrectCount,
      total: quizQuestions.length,
      streak: quizStreak,
    });
    setQuizActive(false);

    // Award points
    if (finalScore > 0) {
      await addPoints(finalScore);
    }

    SoundEffects.playCelebration();
    if (quizCorrectCount === quizQuestions.length) {
      Confetti.create();
    }
  };

  const exitQuiz = () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    setQuizActive(false);
    setQuizResults(null);
    setQuizQuestions([]);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, []);

  // ============================
  // BOOK / CHAPTER NAVIGATION FOR STUDIES
  // ============================
  const handleSelectBook = async (book) => {
    setSelectedBook(book);
    setCurrentChapter(1);
    setShowBookSelector(false);
    setBookStudyLoading(true);
    setError("");

    try {
      const verseData = await BibleAPI.fetchVerse(`${book.name} 1`, "KJV");
      const parsedVerses = parseVersesFromContent(
        verseData.rawContent || verseData.text,
        verseData.reference
      );

      let verses = parsedVerses.length > 0 ? parsedVerses : [{ verseNumber: "1", text: verseData.text }];

      const newPassage = {
        reference: `${book.name} 1`,
        verses: verses.filter(v => v && v.verseNumber && v.text)
      };

      setStudyPassages([newPassage]);
      setStudyTitle(book.name);
      SoundEffects.playSuccess();
    } catch (err) {
      setError(`Could not load ${book.name} chapter 1. ${err.message}`);
      SoundEffects.playError();
    } finally {
      setBookStudyLoading(false);
    }
  };

  const handleChapterChange = async (newChapter) => {
    if (!selectedBook || newChapter < 1 || newChapter > selectedBook.chapters) return;

    setCurrentChapter(newChapter);
    setBookStudyLoading(true);
    setError("");

    try {
      const ref = `${selectedBook.name} ${newChapter}`;
      const verseData = await BibleAPI.fetchVerse(ref, "KJV");
      const parsedVerses = parseVersesFromContent(
        verseData.rawContent || verseData.text,
        verseData.reference
      );

      let verses = parsedVerses.length > 0 ? parsedVerses : [{ verseNumber: "1", text: verseData.text }];

      const newPassage = {
        reference: ref,
        verses: verses.filter(v => v && v.verseNumber && v.text)
      };

      // Replace the current passage with the new chapter
      setStudyPassages([newPassage]);
      SoundEffects.playClick();
    } catch (err) {
      setError(`Could not load chapter ${newChapter}. ${err.message}`);
      SoundEffects.playError();
    } finally {
      setBookStudyLoading(false);
    }
  };

  const stats = {
    total: verses.length,
    memorized: verses.filter((v) => v.memorized).length,
    inProgress: verses.filter((v) => !v.memorized).length,
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-title">Scripture Memory</div>
        <div className="loading-subtitle">
          "Thy word have I hid in mine heart, that I might not sin against thee." — Psalm 119:11
        </div>
      </div>
    );
  }

  // Show login if user is not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  // Main app content
  return (
    <>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
      />
      <div className="container">
        <div className="header">
        <div className="header-content">
          <div>
            <h1>Scripture Memory</h1>
            <p>Memorize and meditate on God's Word</p>
          </div>
          <div className="user-profile">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="user-avatar"
              />
            )}
            <div className="user-info">
              <span className="user-name">
                {user.displayName || user.email}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="points-badge points-badge-small">
                  <Icons.Star filled /> {userPoints}
                </span>
                <button className="btn-logout" onClick={handleLogout}>
                  <Icons.LogOut />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <Icons.Search /> Search
          </button>
          <button
            className={`tab ${activeTab === "verses" ? "active" : ""}`}
            onClick={() => setActiveTab("verses")}
          >
            <Icons.Book /> My Verses
          </button>
          <button
            className={`tab ${activeTab === "studies" ? "active" : ""}`}
            onClick={() => setActiveTab("studies")}
          >
            <Icons.BookMarked /> Bible Studies
          </button>
          <button
            className={`tab ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            <Icons.Zap /> Quiz
          </button>
          <button
            className={`tab ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
          >
            <Icons.Brain /> Practice
          </button>
          <button
            className={`tab ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("leaderboard");
              loadLeaderboard();
            }}
          >
            <Icons.Trophy /> Leaderboard
          </button>
          <button
            className={`tab ${activeTab === "prayer" ? "active" : ""}`}
            onClick={() => setActiveTab("prayer")}
          >
            <Icons.Hands /> Prayer
          </button>
          <button
            className={`tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <Icons.BarChart /> Progress
          </button>
        </div>

        {activeTab === "search" && (
          <div>
            <div className="search-box">
              <input
                type="text"
                className="input"
                placeholder="e.g., John 3:16, Psalm 23, Romans 8:28"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                <Icons.Search /> Search
              </button>
            </div>

            {addSuccess && (
              <div className="feedback success">Verse added successfully!</div>
            )}

            {error && <div className="error">{error}</div>}

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                Searching for verse...
              </div>
            )}

            {currentVerse && !loading && (
              <div>
                <div className="verse-display">
                  <div className="verse-reference" style={{ marginBottom: "16px" }}>
                    <Icons.Book />
                    {currentVerse.reference}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.85rem",
                        background: "#f5f1e8",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        color: "#6b5d42",
                      }}
                    >
                      {currentVerse.version}
                    </span>
                  </div>
                  <div className="verse-text">
                    {searchVerses.filter(v => v && v.verseNumber && v.text).map((verse) => (
                      <div key={verse.verseNumber} style={{ marginBottom: "10px" }}>
                        <span className="verse-number" style={{
                          fontWeight: "bold",
                          color: "#5a4d37",
                          marginRight: "8px",
                          fontSize: "0.9em",
                          verticalAlign: "super",
                        }}>
                          {verse.verseNumber}
                        </span>
                        <span>{verse.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="verse-actions">
                  <button
                    className={`btn ${
                      isSpeaking ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => handleSpeakVerse(currentVerse)}
                    title={isSpeaking ? "Stop reading" : "Read verse aloud"}
                  >
                    <Icons.Speaker />
                    {isSpeaking ? "Stop Reading" : "Read Aloud"}
                  </button>
                  <button className="btn btn-success" onClick={handleAddVerse}>
                    <Icons.Heart filled={false} /> Add to My Verses
                  </button>
                </div>
              </div>
            )}

            {!currentVerse && !loading && !error && (
              <div className="empty-state">
                <Icons.BookOpen />
                <h3>Search for a Bible Verse</h3>
                <p>
                  Enter a reference like "John 3:16" or "Philippians 4:13" to
                  get started
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "verses" && (
          <div>
            {verses.length === 0 ? (
              <div className="empty-state">
                <Icons.BookOpen />
                <h3>No Verses Yet</h3>
                <p>Start by searching and adding verses you want to memorize</p>
              </div>
            ) : (
              (() => {
                const filteredVerses = showAllVerses ? verses : verses.filter((v) => v.memorized);
                const displayIndex = Math.min(currentVerseIndex, Math.max(0, filteredVerses.length - 1));

                return filteredVerses.length === 0 ? (
                  <div className="empty-state">
                    <Icons.BookOpen />
                    <h3>No Memorized Verses Yet</h3>
                    <p>Mark verses as memorized to see them here</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAllVerses(true)}
                      style={{ marginTop: "15px" }}
                    >
                      Show All Verses
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "15px",
                      gap: "10px"
                    }}>
                      <ToggleSwitch
                        checked={showAllVerses}
                        onChange={(newValue) => {
                          setShowAllVerses(newValue);
                          setCurrentVerseIndex(0);
                        }}
                        label="Show all verses at once"
                      />
                    </div>
                    {showAllVerses ? (
                      // Display all verses in a list
                      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {verses.filter(v => v && v.text).map((verse) => (
                          <div
                            key={verse.id}
                            className={`verse-item ${verse.memorized ? "memorized" : ""}`}
                          >
                            <div className="verse-item-header">
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div className="verse-item-reference">
                                  {verse.reference}
                                </div>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    background: verse.memorized ? "#e8f5e9" : "#f5f1e8",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    color: "#6b5d42",
                                    fontWeight: "500",
                                  }}
                                >
                                  {verse.version || "KJV"}
                                </span>
                              </div>
                              <div className="verse-item-actions">
                                <button
                                  className={`icon-btn ${verse.memorized ? "active" : ""}`}
                                  onClick={() => handleToggleMemorized(verse.id)}
                                  title={
                                    verse.memorized
                                      ? "Mark as not memorized"
                                      : "Mark as memorized"
                                  }
                                >
                                  <Icons.Heart filled={verse.memorized} />
                                </button>
                                <button
                                  className="icon-btn"
                                  onClick={() => handleDeleteVerse(verse.id)}
                                  title="Delete verse"
                                >
                                  <Icons.Trash />
                                </button>
                              </div>
                            </div>
                            <div className="verse-item-text">
                              {(() => {
                                const parsedVerses = parseVersesFromContent(
                                  verse.rawContent || verse.text,
                                  verse.reference
                                );

                                if (parsedVerses.length > 0) {
                                  return parsedVerses.filter(v => v && v.verseNumber && v.text).map((v, index) => (
                                    <div key={v.verseNumber} style={{ marginBottom: "10px" }}>
                                      <span className="verse-number" style={{
                                        fontWeight: "bold",
                                        color: "#5a4d37",
                                        marginRight: "8px",
                                        fontSize: "0.9em",
                                        verticalAlign: "super",
                                      }}>
                                        {index + 1}
                                      </span>
                                      <span>{v.text}</span>
                                    </div>
                                  ));
                                } else {
                                  return verse.text;
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Display single verse with navigation
                      <div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "20px"
                        }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentVerseIndex(Math.max(0, displayIndex - 1))}
                            disabled={displayIndex === 0}
                            style={{ padding: "10px 20px" }}
                          >
                            <Icons.ChevronLeft /> Previous
                          </button>
                          <div style={{
                            color: "#5a4d37",
                            fontWeight: "500",
                            fontSize: "0.9rem"
                          }}>
                            {displayIndex + 1} / {filteredVerses.length}
                          </div>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentVerseIndex(Math.min(filteredVerses.length - 1, displayIndex + 1))}
                            disabled={displayIndex === filteredVerses.length - 1}
                            style={{ padding: "10px 20px" }}
                          >
                            Next <Icons.ChevronRight />
                          </button>
                        </div>
                        <div
                          key={filteredVerses[displayIndex].id}
                          className={`verse-item ${
                            filteredVerses[displayIndex].memorized ? "memorized" : ""
                          }`}
                          style={{ marginBottom: "0" }}
                        >
                          <div className="verse-item-header">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div className="verse-item-reference">
                                {filteredVerses[displayIndex].reference}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  background: filteredVerses[displayIndex].memorized ? "#e8f5e9" : "#f5f1e8",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  color: "#6b5d42",
                                  fontWeight: "500",
                                }}
                              >
                                {filteredVerses[displayIndex].version || "KJV"}
                              </span>
                            </div>
                            <div className="verse-item-actions">
                              <button
                                className={`icon-btn ${
                                  filteredVerses[displayIndex].memorized ? "active" : ""
                                }`}
                                onClick={() => handleToggleMemorized(filteredVerses[displayIndex].id)}
                                title={
                                  filteredVerses[displayIndex].memorized
                                    ? "Mark as not memorized"
                                    : "Mark as memorized"
                                }
                              >
                                <Icons.Heart filled={filteredVerses[displayIndex].memorized} />
                              </button>
                              <button
                                className="icon-btn"
                                onClick={() => handleDeleteVerse(filteredVerses[displayIndex].id)}
                                title="Delete verse"
                              >
                                <Icons.Trash />
                              </button>
                            </div>
                          </div>
                          <div className="verse-item-text">
                            {(() => {
                              const verse = filteredVerses[displayIndex];
                              const parsedVerses = parseVersesFromContent(
                                verse.rawContent || verse.text,
                                verse.reference
                              );

                              if (parsedVerses.length > 0) {
                                return parsedVerses.filter(v => v && v.verseNumber && v.text).map((v) => (
                                  <div key={v.verseNumber} style={{ marginBottom: "10px" }}>
                                    <span className="verse-number" style={{
                                      fontWeight: "bold",
                                      color: "#5a4d37",
                                      marginRight: "8px",
                                      fontSize: "0.9em",
                                      verticalAlign: "super",
                                    }}>
                                      {v.verseNumber}
                                    </span>
                                    <span>{v.text}</span>
                                  </div>
                                ));
                              } else {
                                return verse.text;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* =================== QUIZ TAB =================== */}
        {activeTab === "quiz" && (
          <div className="quiz-container">
            {!quizActive && !quizResults && (
              <div>
                <div style={{
                  textAlign: "center",
                  padding: "30px 20px",
                  background: "linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%)",
                  borderRadius: "16px",
                  border: "2px solid #e8dcc8",
                  marginBottom: "20px",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                    <Icons.Zap />
                  </div>
                  <h2 style={{ color: "#2c2416", marginBottom: "8px" }}>Scripture Quiz</h2>
                  <p style={{ color: "#5a4d37", marginBottom: "6px", lineHeight: "1.6" }}>
                    Test your knowledge of the verses you've been memorizing!
                  </p>
                  <p style={{ color: "#8b7355", fontSize: "0.85rem", marginBottom: "20px" }}>
                    Earn points for correct answers. Faster answers and streaks give bonus points!
                  </p>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px",
                    marginBottom: "20px",
                    maxWidth: "360px",
                    margin: "0 auto 20px",
                  }}>
                    <div style={{ padding: "12px", background: "white", borderRadius: "10px", border: "1px solid #e8dcc8" }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#8b6f47" }}>
                        {POINTS.QUIZ_CORRECT}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#8b7355" }}>pts/correct</div>
                    </div>
                    <div style={{ padding: "12px", background: "white", borderRadius: "10px", border: "1px solid #e8dcc8" }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#6b8e5f" }}>
                        +{POINTS.QUIZ_FAST_BONUS}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#8b7355" }}>fast bonus</div>
                    </div>
                    <div style={{ padding: "12px", background: "white", borderRadius: "10px", border: "1px solid #e8dcc8" }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#d97706" }}>
                        +{POINTS.QUIZ_STREAK_BONUS}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#8b7355" }}>streak bonus</div>
                    </div>
                    <div style={{ padding: "12px", background: "white", borderRadius: "10px", border: "1px solid #e8dcc8" }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#c85a54" }}>
                        {POINTS.QUIZ_PERFECT}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#8b7355" }}>perfect bonus</div>
                    </div>
                  </div>

                  {error && <div className="error" style={{ marginBottom: "16px" }}>{error}</div>}

                  <button
                    className="btn btn-primary"
                    onClick={startQuiz}
                    style={{ padding: "14px 32px", fontSize: "1.05rem", minWidth: "200px" }}
                  >
                    <Icons.Zap /> Start Quiz
                  </button>

                  <div style={{ marginTop: "16px", fontSize: "0.8rem", color: "#8b7355" }}>
                    {verses.length < 4
                      ? `You need at least 4 saved verses (you have ${verses.length})`
                      : `${verses.length} verses available • Up to 10 questions`}
                  </div>
                </div>

                {/* Your Points */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "12px",
                  color: "white",
                }}>
                  <Icons.Star filled />
                  <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>{userPoints} Points</span>
                </div>
              </div>
            )}

            {/* Active Quiz */}
            {quizActive && quizQuestions.length > 0 && (
              <div>
                <div className="quiz-header">
                  <div className={`quiz-timer ${quizTimeLeft <= 5 ? "danger" : quizTimeLeft <= 10 ? "warning" : ""}`}>
                    <Icons.Clock /> {quizTimeLeft}s
                  </div>
                  <div className="quiz-progress">
                    {quizCurrentIndex + 1} / {quizQuestions.length}
                  </div>
                  <div className="quiz-score">
                    <Icons.Star filled /> {quizScore}
                  </div>
                </div>

                {quizStreak > 1 && (
                  <div style={{
                    textAlign: "center",
                    padding: "6px",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                  }}>
                    {quizStreak} Streak!
                  </div>
                )}

                <div className="quiz-question-card">
                  <div className="quiz-question-label">
                    {quizQuestions[quizCurrentIndex].questionLabel}
                  </div>
                  <div className="quiz-question-text">
                    "{quizQuestions[quizCurrentIndex].question}"
                  </div>
                </div>

                <div className="quiz-options">
                  {quizQuestions[quizCurrentIndex].options.map((option, idx) => {
                    const letters = ["A", "B", "C", "D"];
                    const isCorrect = option === quizQuestions[quizCurrentIndex].correctAnswer;
                    const isSelected = quizSelectedOption === option;
                    let className = "quiz-option";
                    if (quizAnswered) {
                      if (isCorrect) className += " correct";
                      else if (isSelected && !isCorrect) className += " wrong";
                    } else if (isSelected) {
                      className += " selected";
                    }
                    return (
                      <button
                        key={idx}
                        className={className}
                        onClick={() => handleQuizAnswer(option)}
                        disabled={quizAnswered}
                      >
                        <span className="quiz-option-letter">{letters[idx]}</span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={exitQuiz}
                  style={{ marginTop: "16px", width: "100%" }}
                >
                  Exit Quiz
                </button>
              </div>
            )}

            {/* Points popup */}
            {showPointsPopup && (
              <div className="quiz-points-popup">{showPointsPopup}</div>
            )}

            {/* Quiz Results */}
            {quizResults && (
              <div className="quiz-results">
                <div className="quiz-results-card">
                  <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                    {quizResults.correct === quizResults.total ? "🏆" : quizResults.correct > quizResults.total / 2 ? "⭐" : "📖"}
                  </div>
                  <div className="quiz-results-score">+{quizResults.score}</div>
                  <div className="quiz-results-label">
                    {quizResults.correct === quizResults.total
                      ? "Perfect! Soli Deo Gloria!"
                      : quizResults.correct > quizResults.total / 2
                      ? "Well done, keep memorizing!"
                      : "Keep studying God's Word!"}
                  </div>

                  <div className="quiz-results-stats">
                    <div className="quiz-results-stat">
                      <div className="quiz-results-stat-value">{quizResults.correct}/{quizResults.total}</div>
                      <div className="quiz-results-stat-label">Correct</div>
                    </div>
                    <div className="quiz-results-stat">
                      <div className="quiz-results-stat-value">{quizResults.score}</div>
                      <div className="quiz-results-stat-label">Points Earned</div>
                    </div>
                    <div className="quiz-results-stat">
                      <div className="quiz-results-stat-value">{userPoints}</div>
                      <div className="quiz-results-stat-label">Total Points</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={startQuiz}
                    style={{ flex: 1 }}
                  >
                    <Icons.Zap /> Play Again
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setQuizResults(null);
                    }}
                    style={{ flex: 1 }}
                  >
                    Back
                  </button>
                </div>

                <div className="glory-footer">
                  "Whatever you do, do it all for the glory of God." — 1 Corinthians 10:31
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== LEADERBOARD TAB =================== */}
        {activeTab === "leaderboard" && (
          <div className="leaderboard-container">
            <div className="leaderboard-banner">
              <div className="leaderboard-banner-title">
                <Icons.Crown /> For the Glory of God
              </div>
              <div className="leaderboard-banner-verse">
                "Not to us, LORD, not to us but to your name be the glory, because of your love and faithfulness." — Psalm 115:1
              </div>
            </div>

            {/* Your stats */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              background: "linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 100%)",
              borderRadius: "12px",
              marginBottom: "16px",
              border: "2px solid #8b6f47",
            }}>
              {user?.photoURL && (
                <img src={user.photoURL} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #8b6f47" }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", color: "#2c2416" }}>{user?.displayName || "You"}</div>
                <div style={{ fontSize: "0.8rem", color: "#8b7355" }}>
                  {verses.filter(v => v.memorized).length} verses memorized
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="points-badge">
                  <Icons.Star filled /> {userPoints}
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={loadLeaderboard}
              disabled={leaderboardLoading}
              style={{ width: "100%", marginBottom: "16px" }}
            >
              {leaderboardLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Icons.Trophy /> Refresh Leaderboard
                </>
              )}
            </button>

            {leaderboardData.length > 0 ? (
              <div className="leaderboard-list">
                {leaderboardData.map((entry, index) => {
                  const isCurrentUser = entry.uid === user?.uid;
                  let rowClass = "leaderboard-row";
                  if (index === 0) rowClass += " top-1";
                  else if (index === 1) rowClass += " top-2";
                  else if (index === 2) rowClass += " top-3";
                  if (isCurrentUser) rowClass += " current-user";

                  return (
                    <div key={entry.uid} className={rowClass}>
                      {index < 3 ? (
                        <div className="leaderboard-rank-medal">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </div>
                      ) : (
                        <div className="leaderboard-rank">{index + 1}</div>
                      )}
                      {entry.photoURL ? (
                        <img src={entry.photoURL} alt="" className="leaderboard-avatar" />
                      ) : (
                        <div className="leaderboard-avatar" style={{
                          background: "#e8dcc8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#8b7355",
                          fontWeight: "700",
                          fontSize: "0.9rem",
                        }}>
                          {(entry.displayName || "?")[0]}
                        </div>
                      )}
                      <div className="leaderboard-user-info">
                        <div className="leaderboard-user-name">
                          {entry.displayName} {isCurrentUser && "(You)"}
                        </div>
                      </div>
                      <div className="leaderboard-points">
                        <div className="leaderboard-points-value">{entry.points}</div>
                        <div className="leaderboard-points-label">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !leaderboardLoading ? (
              <div style={{
                textAlign: "center",
                padding: "32px",
                color: "#5a4d37",
                background: "#f9f6f1",
                borderRadius: "12px",
              }}>
                <Icons.Trophy />
                <p style={{ marginTop: "12px" }}>No leaderboard data yet. Start memorizing and take quizzes to earn points!</p>
              </div>
            ) : null}

            <div className="glory-footer">
              "So, whether you eat or drink, or whatever you do, do all to the glory of God." — 1 Corinthians 10:31
            </div>
          </div>
        )}

        {activeTab === "practice" && (
          <div>
            {!practiceVerse ? (
              <div>
                <h3
                  style={{
                    marginBottom: "20px",
                    color: "#2c2416",
                    textAlign: "center",
                  }}
                >
                  Choose Your Practice Mode
                </h3>

                <div className="mode-selector">
                  <div
                    className={`mode-card ${
                      practiceMode === "recite" ? "active" : ""
                    }`}
                    onClick={() => setPracticeMode("recite")}
                  >
                    <h4>Recite Verse</h4>
                    <p>
                      Given the reference, recite the entire verse from memory
                    </p>
                  </div>
                  <div
                    className={`mode-card ${
                      practiceMode === "identify" ? "active" : ""
                    }`}
                    onClick={() => setPracticeMode("identify")}
                  >
                    <h4>Identify Reference</h4>
                    <p>Given the verse, identify which scripture it's from</p>
                  </div>
                  <div
                    className={`mode-card ${
                      practiceMode === "complete" ? "active" : ""
                    }`}
                    onClick={() => setPracticeMode("complete")}
                  >
                    <h4>Complete Verse</h4>
                    <p>Fill in the missing words to complete the verse</p>
                  </div>
                </div>

                <div className="empty-state">
                  <Icons.Brain />
                  <h3>Ready to Practice?</h3>
                  <p>
                    {practiceMode === "recite" &&
                      "Test your memory by reciting verses"}
                    {practiceMode === "identify" &&
                      "Challenge yourself to identify scripture references"}
                    {practiceMode === "complete" &&
                      "Fill in the blanks to complete verses"}
                  </p>
                </div>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={startPractice}
                    disabled={verses.length === 0}
                  >
                    <Icons.Brain /> Start Practice
                  </button>
                  {verses.length === 0 && (
                    <p style={{ marginTop: "15px", color: "#8b7355" }}>
                      Add some verses first to start practicing
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="practice-mode">
                <h3 style={{ marginBottom: "20px", color: "#8b6f47" }}>
                  {practiceMode === "recite" &&
                    `Recite: ${practiceVerse.reference}`}
                  {practiceMode === "identify" && "Identify This Scripture"}
                  {practiceMode === "complete" &&
                    `Complete: ${practiceVerse.reference}`}
                </h3>

                {feedback && (
                  <div className={`feedback ${feedback.type}`}>
                    {feedback.message}
                  </div>
                )}

                {practiceMode === "identify" && (
                  <div
                    className="verse-display"
                    style={{ marginBottom: "20px" }}
                  >
                    <div className="verse-text">
                      {(() => {
                        const parsedVerses = parseVersesFromContent(
                          practiceVerse.rawContent || practiceVerse.text,
                          practiceVerse.reference
                        );

                        if (parsedVerses.length > 0) {
                          return parsedVerses.filter(v => v && v.verseNumber && v.text).map((v) => (
                            <div key={v.verseNumber} style={{ marginBottom: "10px" }}>
                              <span className="verse-number" style={{
                                fontWeight: "bold",
                                color: "#5a4d37",
                                marginRight: "8px",
                                fontSize: "0.9em",
                                verticalAlign: "super",
                              }}>
                                {v.verseNumber}
                              </span>
                              <span>{v.text}</span>
                            </div>
                          ));
                        } else {
                          return practiceVerse.text;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {practiceMode === "complete" && !showVerseText && (
                  <div>
                    <div
                      style={{
                        marginBottom: "10px",
                        padding: "10px",
                        background: "#f5f1e8",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        color: "#5a4d37",
                      }}
                    >
                      Fill in the {missingWords.length} missing word(s) below. Type only the missing words separated by spaces.
                    </div>
                    <div
                      className="verse-display"
                      style={{ marginBottom: "20px" }}
                    >
                      <div className="verse-text">{blankedVerse}</div>
                    </div>
                  </div>
                )}

                {showVerseText && practiceMode !== "identify" && (
                  <div
                    className="verse-display"
                    style={{ marginBottom: "20px" }}
                  >
                    <div className="verse-text">
                      {(() => {
                        const parsedVerses = parseVersesFromContent(
                          practiceVerse.rawContent || practiceVerse.text,
                          practiceVerse.reference
                        );

                        if (parsedVerses.length > 0) {
                          return parsedVerses.filter(v => v && v.verseNumber && v.text).map((v) => (
                            <div key={v.verseNumber} style={{ marginBottom: "10px" }}>
                              <span className="verse-number" style={{
                                fontWeight: "bold",
                                color: "#5a4d37",
                                marginRight: "8px",
                                fontSize: "0.9em",
                                verticalAlign: "super",
                              }}>
                                {v.verseNumber}
                              </span>
                              <span>{v.text}</span>
                            </div>
                          ));
                        } else {
                          return practiceVerse.text;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {!showVerseText && practiceMode === "recite" && (
                  <div className="practice-text">
                    Type or speak the verse from memory...
                  </div>
                )}

                <textarea
                  className="practice-input"
                  rows="5"
                  placeholder={
                    practiceMode === "recite"
                      ? "Type or speak the verse here..."
                      : practiceMode === "identify"
                      ? "Enter the scripture reference (e.g., John 3:16)..."
                      : `Type only the ${missingWords.length} missing word(s) separated by spaces...`
                  }
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                />

                <div className="voice-controls">
                  <button
                    className={`btn ${
                      isRecording ? "recording btn-danger" : "btn-secondary"
                    }`}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <Icons.MicOff /> : <Icons.Mic />}
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </button>
                  {practiceMode !== "identify" && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowVerseText(!showVerseText)}
                    >
                      {showVerseText ? <Icons.EyeOff /> : <Icons.Eye />}
                      {showVerseText ? "Hide" : "Reveal"}
                    </button>
                  )}
                </div>

                <div className="practice-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={checkAnswer}
                    disabled={!practiceInput.trim()}
                  >
                    <Icons.Check /> Check Answer
                  </button>
                  <button
                    className={`btn ${
                      practiceVerse.memorized ? "btn-success" : "btn-secondary"
                    }`}
                    onClick={() => handleToggleMemorized(practiceVerse.id)}
                  >
                    <Icons.Heart filled={practiceVerse.memorized} />
                    {practiceVerse.memorized ? "Memorized" : "Mark Memorized"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setPracticeInput("");
                      setFeedback(null);
                    }}
                  >
                    <Icons.Edit /> Clear
                  </button>
                  <button className="btn btn-secondary" onClick={startPractice}>
                    <Icons.Shuffle /> Next Verse
                  </button>
                  <button className="btn btn-secondary" onClick={exitPractice}>
                    <Icons.X /> Exit Practice
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "prayer" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <button
                className="btn btn-success"
                onClick={() => setShowPrayerForm(!showPrayerForm)}
              >
                <Icons.Plus /> {showPrayerForm ? "Cancel" : "New Prayer"}
              </button>
            </div>

            {showPrayerForm && (
              <div className="prayer-form">
                <h3 style={{ marginBottom: "15px", color: "#2c2416" }}>
                  {editingPrayer ? "Edit Prayer" : "New Prayer"}
                </h3>

                {error && <div className="error">{error}</div>}

                <input
                  type="text"
                  className="input"
                  placeholder="Prayer Title"
                  value={prayerTitle}
                  onChange={(e) => setPrayerTitle(e.target.value)}
                  style={{ marginBottom: "12px" }}
                />

                <textarea
                  className="practice-input"
                  rows="5"
                  placeholder="Write your prayer here..."
                  value={prayerContent}
                  onChange={(e) => setPrayerContent(e.target.value)}
                  style={{ marginBottom: "12px" }}
                />

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#2c2416",
                      fontWeight: "500",
                    }}
                  >
                    Category
                  </label>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {[
                      "Praise",
                      "Request",
                      "Thanksgiving",
                      "Intercession",
                      "Confession",
                    ].map((cat) => (
                      <button
                        key={cat}
                        className={`btn ${
                          prayerCategory === cat
                            ? "btn-primary"
                            : "btn-secondary"
                        }`}
                        onClick={() => setPrayerCategory(cat)}
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#2c2416",
                      fontWeight: "500",
                    }}
                  >
                    Bible Verse References
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., John 3:16"
                      value={newVerseRef}
                      onChange={(e) => setNewVerseRef(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddVerseRef()
                      }
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={handleAddVerseRef}
                      disabled={!newVerseRef.trim()}
                    >
                      <Icons.Plus />
                    </button>
                  </div>
                  {prayerVerseRefs.length > 0 && (
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {prayerVerseRefs.map((ref) => (
                        <div key={ref} className="verse-tag">
                          <Icons.Tag />
                          <span>{ref}</span>
                          <button
                            onClick={() => handleRemoveVerseRef(ref)}
                            className="verse-tag-remove"
                          >
                            <Icons.X />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={cancelPrayerForm}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAddPrayer}>
                    <Icons.Save /> {editingPrayer ? "Update" : "Save"} Prayer
                  </button>
                </div>
              </div>
            )}

            {prayers.length === 0 ? (
              <div className="empty-state">
                <Icons.Hands />
                <h3>No Prayers Yet</h3>
                <p>Create your first prayer to start your prayer journal</p>
              </div>
            ) : (
              <div className="prayer-list">
                {prayers
                  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                  .map((prayer) => {
                    const isCollapsed = collapsedPrayers[prayer.id] || false;
                    return (
                      <div key={prayer.id} className="prayer-card">
                        <div className="prayer-card-header">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                            <button
                              className="icon-btn"
                              onClick={() => setCollapsedPrayers({
                                ...collapsedPrayers,
                                [prayer.id]: !isCollapsed
                              })}
                              title={isCollapsed ? "Expand prayer" : "Collapse prayer"}
                              style={{ padding: "4px" }}
                            >
                              {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                            </button>
                            <div style={{ flex: 1 }}>
                              <h4 className="prayer-title">{prayer.title}</h4>
                              <span
                                className={`prayer-category ${prayer.category.toLowerCase()}`}
                              >
                                {prayer.category}
                              </span>
                            </div>
                          </div>
                          <div className="prayer-card-actions">
                            <button
                              className="icon-btn"
                              onClick={() => handleEditPrayer(prayer)}
                              title="Edit prayer"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => handleDeletePrayer(prayer.id)}
                              title="Delete prayer"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </div>
                        {!isCollapsed && (
                          <>
                            <div className="prayer-content">{prayer.content}</div>
                            {prayer.verseRefs && prayer.verseRefs.length > 0 && (
                              <div className="prayer-verses">
                                {prayer.verseRefs.map((ref) => (
                                  <span key={ref} className="prayer-verse-ref">
                                    <Icons.Book />
                                    {ref}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="prayer-footer">
                              <span className="prayer-date">
                                Added:{" "}
                                {new Date(prayer.dateAdded).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "studies" && (
          <div>
            {studyView === "list" && (
              <>
                {/* Header with Personal/Group Toggle */}
                <div style={{ marginBottom: "25px" }}>
                  <h2 style={{ color: "#2c2416", fontSize: "1.5rem", marginBottom: "20px" }}>
                    Bible Studies
                  </h2>

                  {/* Personal/Group Toggle */}
                  <div style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "20px",
                    borderBottom: "2px solid #e8dcc8",
                    paddingBottom: "8px"
                  }}>
                    <button
                      className="btn"
                      onClick={() => setStudyListView("personal")}
                      style={{
                        flex: 1,
                        background: studyListView === "personal"
                          ? "linear-gradient(135deg, #6b8e5f 0%, #8b9b75 100%)"
                          : "#f5f1e8",
                        color: studyListView === "personal" ? "white" : "#5a4d37",
                        border: "none",
                        transition: "all 0.3s ease",
                        fontWeight: studyListView === "personal" ? "bold" : "normal"
                      }}
                    >
                      <Icons.BookMarked /> My Studies
                    </button>
                    <button
                      className="btn"
                      onClick={() => setStudyListView("group")}
                      style={{
                        flex: 1,
                        background: studyListView === "group"
                          ? "linear-gradient(135deg, #6b8e5f 0%, #8b9b75 100%)"
                          : "#f5f1e8",
                        color: studyListView === "group" ? "white" : "#5a4d37",
                        border: "none",
                        transition: "all 0.3s ease",
                        fontWeight: studyListView === "group" ? "bold" : "normal"
                      }}
                    >
                      <Icons.User /> Group Studies
                    </button>
                  </div>

                  {/* Action Buttons */}
                  {studyListView === "personal" ? (
                    <button
                      className="btn btn-success"
                      onClick={startNewStudy}
                      style={{ width: "100%" }}
                    >
                      <Icons.Plus /> New Personal Study
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="btn btn-success"
                        onClick={startNewGroupStudy}
                        style={{ flex: 1 }}
                      >
                        <Icons.Plus /> Create Group Study
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={startJoinGroupStudy}
                        style={{ flex: 1 }}
                      >
                        <Icons.User /> Join Study
                      </button>
                    </div>
                  )}
                </div>

                {/* Personal Studies List */}
                {studyListView === "personal" && (
                  <>
                    {studies.length === 0 ? (
                      <div className="empty-state">
                        <Icons.BookMarked />
                        <h3>No Personal Studies Yet</h3>
                        <p>
                          Create your first Bible study to highlight passages and
                          take color-coded notes
                        </p>
                      </div>
                    ) : (
                      <div className="study-grid">
                        {studies.map((study) => (
                      <div key={study.id} className="study-card">
                        <div className="study-card-header">
                          <h3 className="study-title">{study.title}</h3>
                          <div className="study-card-actions">
                            <button
                              className="icon-btn"
                              onClick={() => duplicateStudy(study)}
                              title="Duplicate study"
                            >
                              <Icons.Copy />
                            </button>
                            <button
                              className="icon-btn"
                              onClick={() => deleteStudy(study.id)}
                              title="Delete study"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </div>
                        <div className="study-reference">
                          <Icons.Book />
                          {study.passages && study.passages.length > 0
                            ? study.passages.map(p => p.reference || p).join(", ")
                            : study.reference || "No passages"}
                        </div>
                        <div className="study-stats">
                          <span className="study-stat">
                            <Icons.Highlighter />
                            {study.highlights?.length || 0} Highlights
                          </span>
                          <span className="study-stat">
                            <Icons.StickyNote />
                            {study.notes?.length || 0} Notes
                          </span>
                        </div>
                        <div className="study-date">
                          Last modified:{" "}
                          {new Date(study.dateModified).toLocaleDateString()}
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ marginTop: "15px", width: "100%" }}
                          onClick={() => loadStudy(study)}
                        >
                          <Icons.BookOpen /> Open Study
                        </button>
                      </div>
                    ))}
                  </div>
                    )}
                  </>
                )}

                {/* Group Studies List */}
                {studyListView === "group" && (
                  <>
                    {groupStudies.length === 0 ? (
                      <div className="empty-state">
                        <Icons.User />
                        <h3>No Group Studies Yet</h3>
                        <p>
                          Create a group study to collaborate with others, or join an existing one with a study code
                        </p>
                      </div>
                    ) : (
                      <div className="study-grid">
                        {groupStudies.map((study) => (
                          <div key={study.id} className="study-card" style={{
                            background: study.isLead
                              ? "linear-gradient(135deg, #fff9f0 0%, #f5f1e8 100%)"
                              : "linear-gradient(135deg, #f0f9ff 0%, #e8f4f8 100%)",
                            border: study.isLead ? "2px solid #d4a574" : "2px solid #7eb8d4"
                          }}>
                            <div className="study-card-header">
                              <div>
                                <div style={{
                                  display: "inline-block",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  background: study.isLead ? "#d4a574" : "#7eb8d4",
                                  color: "white",
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                  marginBottom: "8px"
                                }}>
                                  {study.isLead ? "LEAD" : "PARTICIPANT"}
                                </div>
                                <h3 className="study-title">{study.title}</h3>
                              </div>
                              <div className="study-card-actions">
                                {study.isLead ? (
                                  <button
                                    className="icon-btn"
                                    onClick={() => deleteGroupStudy(study.id)}
                                    title="Delete group study"
                                  >
                                    <Icons.Trash />
                                  </button>
                                ) : (
                                  <button
                                    className="icon-btn"
                                    onClick={() => leaveGroupStudy(study.id)}
                                    title="Leave group study"
                                  >
                                    <Icons.LogOut />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="study-reference">
                              <Icons.Book />
                              {study.passages && study.passages.length > 0
                                ? study.passages.map(p => p.reference || p).join(", ")
                                : study.reference || "No passages"}
                            </div>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px",
                              background: "rgba(255,255,255,0.7)",
                              borderRadius: "6px",
                              margin: "10px 0",
                              fontSize: "0.9rem"
                            }}>
                              <Icons.User />
                              <div>
                                <div style={{ fontWeight: "600", color: "#2c2416" }}>
                                  Lead: {study.leadName}
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#5a4d37" }}>
                                  {study.participants?.length || 0} participant(s)
                                </div>
                              </div>
                            </div>
                            <div className="study-stats">
                              <span className="study-stat">
                                <Icons.BookMarked />
                                {study.mainPoints?.length || 0} Main Points
                              </span>
                              <span className="study-stat">
                                <Icons.StickyNote />
                                {study.thoughts?.length || 0} Thoughts
                              </span>
                            </div>
                            <div style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                              padding: "8px",
                              background: "rgba(107, 142, 95, 0.1)",
                              borderRadius: "6px",
                              marginTop: "10px"
                            }}>
                              <Icons.Tag />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.75rem", color: "#5a4d37", fontWeight: "600" }}>
                                  Study Code:
                                </div>
                                <div style={{
                                  fontFamily: "monospace",
                                  fontSize: "1.1rem",
                                  fontWeight: "bold",
                                  color: "#2c2416",
                                  letterSpacing: "2px"
                                }}>
                                  {study.code}
                                </div>
                              </div>
                              <button
                                className="icon-btn"
                                onClick={() => copyStudyCode(study.code)}
                                title="Copy study code"
                                style={{
                                  background: "#6b8e5f",
                                  color: "white",
                                  padding: "8px"
                                }}
                              >
                                <Icons.Copy />
                              </button>
                            </div>
                            <button
                              className="btn btn-primary"
                              style={{ marginTop: "15px", width: "100%" }}
                              onClick={() => loadGroupStudy(study)}
                            >
                              <Icons.BookOpen /> Open Study
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {(studyView === "create" || studyView === "view") && (
              <div className="study-editor">
                <div className="study-editor-header">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setStudyView("list");
                      setCurrentStudy(null);
                      setError("");
                    }}
                  >
                    <Icons.ArrowLeft /> Back to Studies
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={saveStudy}
                    disabled={!studyTitle.trim() || studyPassages.length === 0}
                  >
                    <Icons.Save /> Save Study
                  </button>
                </div>

                {error && <div className="error">{error}</div>}

                <div className="study-form-section">
                  <label className="study-label">Study Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter a title for your study..."
                    value={studyTitle}
                    onChange={(e) => setStudyTitle(e.target.value)}
                    style={{ marginBottom: "20px" }}
                  />

                  <label className="study-label">Add Scripture Passages</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowBookSelector(!showBookSelector)}
                      style={{ flex: "0 0 auto" }}
                    >
                      <Icons.Book /> {showBookSelector ? "Hide Books" : "Select Book"}
                    </button>
                  </div>
                  {showBookSelector && (
                    <BookSelector
                      onSelectBook={(book) => {
                        handleSelectBook(book);
                        if (studyView === "create") {
                          setStudyView("create");
                        }
                      }}
                      onClose={() => setShowBookSelector(false)}
                    />
                  )}
                  {selectedBook && (
                    <ChapterNavigator
                      book={selectedBook.name}
                      currentChapter={currentChapter}
                      onChapterChange={handleChapterChange}
                      totalChapters={selectedBook.chapters}
                    />
                  )}
                  {bookStudyLoading && (
                    <div className="loading">
                      <div className="spinner"></div>
                      Loading chapter...
                    </div>
                  )}
                  <div className="search-box" style={{ marginBottom: "25px" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., John 3:16-21, Psalm 23, Romans 8:28-39"
                      value={studyReference}
                      onChange={(e) => setStudyReference(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && fetchStudyPassage()
                      }
                    />
                    <button
                      className="btn btn-primary"
                      onClick={fetchStudyPassage}
                      disabled={loadingStudy}
                    >
                      {loadingStudy ? (
                        <>
                          <div className="spinner-small"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Icons.Plus /> Add Passage
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {studyPassages.length > 0 && (
                  <>
                    <div className="study-tools-section">
                      <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                        Highlighting Tools
                      </h3>

                      <div className="color-picker-section">
                        <label className="study-label">
                          Select Highlight Color
                        </label>
                        <div className="color-picker-grid">
                          {PASTEL_COLORS.map((color) => (
                            <button
                              key={color.value}
                              className={`color-swatch ${
                                selectedColor === color.value ? "active" : ""
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => setSelectedColor(color.value)}
                              title={color.name}
                            >
                              {selectedColor === color.value && (
                                <Icons.Check />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "20px",
                          marginBottom: "10px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#6b5d42",
                            fontStyle: "italic",
                          }}
                        >
                          💡 Tip: Click on any verse to highlight it, or click on a highlight to view/add notes
                        </p>
                      </div>
                    </div>

                    <div className="study-passage-section">
                      <h3
                        style={{
                          color: "#2c2416",
                          marginBottom: "15px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Icons.Book />
                        Passages ({studyPassages.length})
                      </h3>

                      {studyPassages.map((passage, passageIndex) => {
                        const isCollapsed = collapsedPassages[passage.reference];
                        const passageHighlights = studyHighlights.filter(h => h.passageReference === passage.reference);
                        const passageNotes = studyNotes.filter(n => n.passageReference === passage.reference);

                        return (
                          <div key={passage.reference} style={{ marginBottom: "20px" }}>
                            {/* Collapsible passage header */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px",
                                backgroundColor: "#6b8e5f",
                                color: "white",
                                borderRadius: "6px",
                                cursor: "pointer",
                                marginBottom: isCollapsed ? "0" : "10px",
                              }}
                              onClick={() => {
                                setCollapsedPassages({
                                  ...collapsedPassages,
                                  [passage.reference]: !isCollapsed
                                });
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                                {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                                <span style={{ fontWeight: "600", fontSize: "1rem" }}>
                                  {passage.reference}
                                </span>
                                <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                  ({passage.verses.length} verse{passage.verses.length !== 1 ? "s" : ""})
                                </span>
                                {passageHighlights.length > 0 && (
                                  <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                    • {passageHighlights.length} highlight{passageHighlights.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                                {passageNotes.length > 0 && (
                                  <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                    • {passageNotes.length} note{passageNotes.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                              <button
                                className="icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePassage(passage.reference);
                                }}
                                title="Remove passage"
                                style={{
                                  background: "rgba(255,255,255,0.2)",
                                  color: "white",
                                  padding: "6px",
                                }}
                              >
                                <Icons.Trash style={{ width: "16px", height: "16px" }} />
                              </button>
                            </div>

                            {/* Collapsible passage content */}
                            {!isCollapsed && (
                              <div className="study-passage" style={{
                                border: "2px solid #6b8e5f",
                                borderTop: "none",
                                borderRadius: "0 0 6px 6px",
                                padding: "15px"
                              }}>
                                {passage.verses.map((verse, index) => {
                                  const highlight = getVerseHighlight(passage.reference, verse.verseNumber);
                                  const isSelected = isSameVerse(selectedVerse, { passageReference: passage.reference, verseNumber: verse.verseNumber });
                                  const isViewingNotes = isSameVerse(viewingNotesForVerse, { passageReference: passage.reference, verseNumber: verse.verseNumber });
                                  const verseNotes = studyNotes.filter(n => n.passageReference === passage.reference && n.verseNumber === verse.verseNumber);

                          return (
                            <div key={verse.verseNumber} style={{ marginBottom: "10px" }}>
                              <div
                                className={`study-verse ${isSelected ? "selected" : ""} ${highlight ? "highlighted" : ""}`}
                                data-verse-number={verse.verseNumber}
                                style={{
                                  backgroundColor: highlight ? highlight.color : "transparent",
                                  cursor: "pointer",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  border: isSelected ? "2px solid #5a4d37" : "2px solid transparent",
                                  transition: "all 0.2s ease",
                                }}
                                onClick={() => {
                                  if (highlight) {
                                    handleHighlightClick(passage.reference, verse.verseNumber);
                                  } else {
                                    handleVerseClick(passage.reference, verse.verseNumber);
                                  }
                                }}
                              >
                                <span className="verse-number">
                                  {index + 1}
                                </span>
                                <span className="verse-content">
                                  {verse.text}
                                </span>
                                {highlight && verseNotes.length > 0 && (
                                  <span style={{ marginLeft: "8px", fontSize: "0.85rem", color: "#5a4d37" }}>
                                    <Icons.StickyNote style={{ width: "14px", height: "14px" }} /> {verseNotes.length}
                                  </span>
                                )}
                              </div>

                              {/* Inline controls for selected verse */}
                              {isSelected && (
                                <div className="verse-inline-controls" style={{
                                  marginTop: "8px",
                                  display: "flex",
                                  gap: "8px",
                                  paddingLeft: "32px"
                                }}>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={applyHighlight}
                                    style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                  >
                                    <Icons.Highlighter style={{ width: "14px", height: "14px" }} /> {highlight ? "Change Color" : "Highlight"}
                                  </button>
                                  {highlight && (
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => removeHighlight(passage.reference, verse.verseNumber)}
                                      style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                    >
                                      <Icons.X style={{ width: "14px", height: "14px" }} /> Remove Highlight
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Notes panel for highlighted verses */}
                              {isViewingNotes && (
                                <div className="verse-notes-panel" style={{
                                  marginTop: "8px",
                                  marginLeft: "32px",
                                  padding: "12px",
                                  backgroundColor: "#f9f6f1",
                                  borderRadius: "4px",
                                  border: "1px solid #d4c5a9"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <h4 style={{ margin: 0, color: "#2c2416", fontSize: "0.95rem" }}>
                                      <Icons.StickyNote style={{ width: "16px", height: "16px" }} /> Notes for Verse {index + 1}
                                    </h4>
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                          setShowNoteForm(!showNoteForm);
                                        }}
                                        style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                                      >
                                        <Icons.Plus style={{ width: "12px", height: "12px" }} /> Add Note
                                      </button>
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => removeHighlight(passage.reference, verse.verseNumber)}
                                        style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                                      >
                                        <Icons.Trash style={{ width: "12px", height: "12px" }} /> Remove Highlight
                                      </button>
                                    </div>
                                  </div>

                                  {showNoteForm && (
                                    <div style={{ marginBottom: "10px" }}>
                                      <textarea
                                        className="practice-input"
                                        rows="3"
                                        placeholder="Write your note here..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        style={{ marginBottom: "8px", fontSize: "0.9rem" }}
                                      />
                                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        <button
                                          className="btn btn-success btn-sm"
                                          onClick={addNote}
                                          disabled={!noteText.trim()}
                                          style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                        >
                                          <Icons.Save style={{ width: "14px", height: "14px" }} /> {editingNote ? "Update Note" : "Save Note"}
                                        </button>
                                        {editingNote && (
                                          <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={cancelEditNote}
                                            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                          >
                                            Cancel
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {verseNotes.length === 0 ? (
                                    <p style={{ fontSize: "0.85rem", color: "#8b7355", fontStyle: "italic", margin: 0 }}>
                                      No notes yet. Click "Add Note" to create one.
                                    </p>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                      {verseNotes.map((note) => (
                                        <div
                                          key={note.id}
                                          style={{
                                            padding: "8px",
                                            backgroundColor: note.color,
                                            borderRadius: "4px",
                                            fontSize: "0.9rem"
                                          }}
                                        >
                                          <div>{note.text}</div>
                                          <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "6px",
                                            fontSize: "0.75rem",
                                            color: "#5a4d37"
                                          }}>
                                            <span>{new Date(note.timestamp).toLocaleString()}</span>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                              <button
                                                className="icon-btn"
                                                onClick={() => editNote(note.id)}
                                                title="Edit note"
                                                style={{ fontSize: "0.8rem" }}
                                              >
                                                <Icons.Edit style={{ width: "12px", height: "12px" }} />
                                              </button>
                                              <button
                                                className="icon-btn"
                                                onClick={() => deleteNote(note.id)}
                                                title="Delete note"
                                                style={{ fontSize: "0.8rem" }}
                                              >
                                                <Icons.Trash style={{ width: "12px", height: "12px" }} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                                  </div>
                                );
                              })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {studyNotes.length > 0 && (
                      <div className="study-notes-section" style={{ marginTop: "30px" }}>
                        <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                          <Icons.StickyNote /> All Notes Summary
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {studyPassages.map((passage) => {
                            const passageNotes = studyNotes.filter(n => n.passageReference === passage.reference);
                            if (passageNotes.length === 0) return null;

                            return (
                              <div key={passage.reference} style={{ marginBottom: "20px" }}>
                                <div style={{
                                  fontWeight: "700",
                                  color: "#2c2416",
                                  marginBottom: "12px",
                                  fontSize: "1rem",
                                  padding: "8px",
                                  backgroundColor: "#e8f5e9",
                                  borderRadius: "4px"
                                }}>
                                  {passage.reference} ({passageNotes.length} note{passageNotes.length !== 1 ? "s" : ""})
                                </div>
                                {passage.verses.map((verse, verseIndex) => {
                                  const verseNotes = passageNotes.filter(n => n.verseNumber === verse.verseNumber);
                                  if (verseNotes.length === 0) return null;

                                  return (
                                    <div
                                      key={verse.verseNumber}
                                      style={{
                                        padding: "12px",
                                        backgroundColor: "#f9f6f1",
                                        borderRadius: "6px",
                                        border: "1px solid #d4c5a9",
                                        marginBottom: "8px",
                                        marginLeft: "15px"
                                      }}
                                    >
                                      <div style={{
                                        fontWeight: "600",
                                        color: "#2c2416",
                                        marginBottom: "8px",
                                        fontSize: "0.9rem"
                                      }}>
                                        Verse {verseIndex + 1} ({verseNotes.length} note{verseNotes.length > 1 ? "s" : ""})
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {verseNotes.map((note) => (
                                          <div
                                            key={note.id}
                                            style={{
                                              padding: "8px",
                                              backgroundColor: note.color,
                                              borderRadius: "4px",
                                              fontSize: "0.9rem"
                                            }}
                                          >
                                            {note.text}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Additional Scripture References */}
                    <div style={{ marginTop: "30px", overflow: "hidden" }}>
                      <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                        <Icons.Book /> Additional Scripture References
                      </h3>

                      <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <input
                            type="text"
                            className="input"
                            placeholder="Label (e.g., Supporting Context, Chapter 2) - Optional"
                            value={additionalReferenceLabel}
                            onChange={(e) => setAdditionalReferenceLabel(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box" }}
                          />
                          <div className="input-with-button" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="input"
                              placeholder="Scripture reference (e.g., John 3:16, Psalm 23:1-6)"
                              value={additionalReferenceInput}
                              onChange={(e) => setAdditionalReferenceInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && fetchAndAddAdditionalReference()}
                              style={{ flex: 1, minWidth: 0 }}
                            />
                            <button
                              className="btn btn-success"
                              onClick={fetchAndAddAdditionalReference}
                              disabled={!additionalReferenceInput.trim() || loadingAdditionalReference}
                              style={{ flexShrink: 0 }}
                            >
                              {loadingAdditionalReference ? (
                                <>Loading...</>
                              ) : (
                                <><Icons.Plus /> Add</>
                              )}
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#5a4d37", marginTop: "4px" }}>
                          Add related passages, supporting verses, or additional chapters to your study
                        </div>
                      </div>

                      {studyAdditionalReferences.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          {studyAdditionalReferences.map((ref) => {
                            const isCollapsed = collapsedReferences[ref.id];
                            return (
                            <div
                              key={ref.id}
                              style={{
                                padding: "15px",
                                background: "#f9f6f1",
                                borderRadius: "8px",
                                border: "2px solid #d4a574",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                overflow: "hidden"
                              }}
                            >
                              {ref.label && (
                                <div style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "700",
                                  color: "#8b6f47",
                                  marginBottom: "8px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  overflowWrap: "break-word",
                                  wordBreak: "break-word"
                                }}>
                                  {ref.label}
                                </div>
                              )}
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: isCollapsed ? "0" : "10px",
                                minWidth: 0
                              }}>
                                <div
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    color: "#6b8e5f",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    flex: 1,
                                    minWidth: 0,
                                    flexWrap: "wrap"
                                  }}
                                  onClick={() => toggleReferenceCollapse(ref.id)}
                                >
                                  <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>
                                    {isCollapsed ? "▶" : "▼"}
                                  </span>
                                  <span style={{ overflowWrap: "break-word", wordBreak: "break-word", minWidth: 0 }}>
                                    {ref.reference}
                                  </span>
                                  <span style={{ fontSize: "0.75rem", color: "#8b6f47", flexShrink: 0 }}>
                                    ({ref.passages.filter(v => v && v.verseNumber && v.text).length} verse{ref.passages.filter(v => v && v.verseNumber && v.text).length > 1 ? "s" : ""})
                                  </span>
                                </div>
                                <button
                                  className="icon-btn"
                                  onClick={() => removeAdditionalReferenceFromPersonalStudy(ref.id)}
                                  title="Remove reference"
                                  style={{ fontSize: "0.8rem", flexShrink: 0 }}
                                >
                                  <Icons.Trash style={{ width: "14px", height: "14px" }} />
                                </button>
                              </div>
                              {!isCollapsed && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {ref.passages.filter(v => v && v.verseNumber && v.text).map((verse, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      padding: "10px",
                                      background: "white",
                                      borderRadius: "6px",
                                      fontSize: "0.9rem",
                                      lineHeight: "1.6",
                                      color: "#2c2416",
                                      overflowWrap: "break-word",
                                      wordBreak: "break-word"
                                    }}
                                  >
                                    <span style={{
                                      fontSize: "0.75rem",
                                      fontWeight: "600",
                                      color: "#6b8e5f",
                                      marginRight: "8px"
                                    }}>
                                      v{verse.verseNumber}:
                                    </span>
                                    {verse.text}
                                  </div>
                                ))}
                              </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#5a4d37",
                          background: "#f9f6f1",
                          borderRadius: "6px",
                          fontStyle: "italic"
                        }}>
                          No additional references yet. Add scripture passages to complement your study.
                        </div>
                      )}
                    </div>

                    {/* Thoughts & Reflections */}
                    <div style={{ marginTop: "30px" }}>
                      <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                        <Icons.StickyNote /> Thoughts & Reflections
                      </h3>

                      <div style={{ marginBottom: "15px" }}>
                        <div className="input-with-button" style={{ display: "flex", gap: "8px" }}>
                          <textarea
                            className="input"
                            placeholder="Share your thoughts and reflections..."
                            value={newThought}
                            onChange={(e) => setNewThought(e.target.value)}
                            style={{ resize: "vertical", minHeight: "80px", flex: 1 }}
                          />
                          <button
                            className="btn btn-success"
                            onClick={addThought}
                            disabled={!newThought.trim()}
                            style={{ alignSelf: "flex-start" }}
                          >
                            <Icons.Plus /> Add
                          </button>
                        </div>
                      </div>

                      {thoughts.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {thoughts.map((thought) => (
                            <div
                              key={thought.id}
                              style={{
                                padding: "15px",
                                background: "#f9f6f1",
                                borderRadius: "8px",
                                border: "2px solid #d4c5a9",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                <img
                                  src={thought.userPhoto || "/default-avatar.png"}
                                  alt={thought.userName}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    objectFit: "cover"
                                  }}
                                  onError={(e) => {
                                    e.target.src = "/default-avatar.png";
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <div>
                                      <div style={{ fontWeight: "600", color: "#2c2416" }}>
                                        {thought.userName}
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "#8b7355" }}>
                                        {new Date(thought.timestamp).toLocaleString()}
                                        {thought.edited && <span style={{ marginLeft: "6px", fontStyle: "italic" }}>(edited)</span>}
                                      </div>
                                    </div>
                                    {thought.userId === user.uid && editingThought?.id !== thought.id && (
                                      <div style={{ display: "flex", gap: "4px" }}>
                                        <button
                                          className="icon-btn"
                                          onClick={() => setEditingThought({ id: thought.id, text: thought.text })}
                                          title="Edit thought"
                                          style={{ fontSize: "0.8rem" }}
                                        >
                                          <Icons.Edit style={{ width: "14px", height: "14px" }} />
                                        </button>
                                        <button
                                          className="icon-btn"
                                          onClick={() => deleteThought(thought.id)}
                                          title="Delete thought"
                                          style={{ fontSize: "0.8rem" }}
                                        >
                                          <Icons.Trash style={{ width: "14px", height: "14px" }} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {editingThought?.id === thought.id ? (
                                    <div style={{ marginTop: "8px" }}>
                                      <textarea
                                        className="input"
                                        value={editingThought.text}
                                        onChange={(e) => setEditingThought({ ...editingThought, text: e.target.value })}
                                        style={{ resize: "vertical", minHeight: "80px", marginBottom: "8px" }}
                                      />
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                          className="btn btn-success btn-sm"
                                          onClick={() => {
                                            editThought(thought.id, editingThought.text);
                                            setEditingThought(null);
                                          }}
                                          disabled={!editingThought.text.trim()}
                                          style={{ fontSize: "0.85rem", padding: "4px 8px" }}
                                        >
                                          Save
                                        </button>
                                        <button
                                          className="btn btn-secondary btn-sm"
                                          onClick={() => setEditingThought(null)}
                                          style={{ fontSize: "0.85rem", padding: "4px 8px" }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{
                                      color: "#2c2416",
                                      lineHeight: "1.6",
                                      wordWrap: "break-word",
                                      overflowWrap: "break-word",
                                      wordBreak: "break-word"
                                    }}>
                                      {thought.text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#5a4d37",
                          background: "#f9f6f1",
                          borderRadius: "6px",
                          fontStyle: "italic"
                        }}>
                          No thoughts yet. Add your reflections and insights about this study.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Create Group Study Flow */}
            {studyView === "createGroup" && (
              <div className="study-editor">
                <div className="study-editor-header">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setStudyView("list");
                      setCurrentStudy(null);
                      setError("");
                    }}
                  >
                    <Icons.ArrowLeft /> Back to Studies
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={createGroupStudy}
                    disabled={!studyTitle.trim() || studyPassages.length === 0 || loadingStudy}
                  >
                    {loadingStudy ? (
                      <>
                        <div className="spinner-small"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Icons.Plus /> Create Group Study
                      </>
                    )}
                  </button>
                </div>

                {error && <div className="error">{error}</div>}

                <div className="study-form-section">
                  <label className="study-label">Study Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter a title for your group study..."
                    value={studyTitle}
                    onChange={(e) => setStudyTitle(e.target.value)}
                    style={{ marginBottom: "20px" }}
                  />

                  <label className="study-label">Scripture Reference</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowBookSelector(!showBookSelector)}
                      style={{ flex: "0 0 auto" }}
                    >
                      <Icons.Book /> {showBookSelector ? "Hide Books" : "Select Whole Book"}
                    </button>
                  </div>
                  {showBookSelector && (
                    <BookSelector
                      onSelectBook={(book) => {
                        handleSelectBook(book);
                      }}
                      onClose={() => setShowBookSelector(false)}
                    />
                  )}
                  {selectedBook && (
                    <ChapterNavigator
                      book={selectedBook.name}
                      currentChapter={currentChapter}
                      onChapterChange={handleChapterChange}
                      totalChapters={selectedBook.chapters}
                    />
                  )}
                  {bookStudyLoading && (
                    <div className="loading">
                      <div className="spinner"></div>
                      Loading chapter...
                    </div>
                  )}
                  <div className="search-box" style={{ marginBottom: "25px" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., John 3:16-21, Psalm 23, Romans 8:28-39"
                      value={studyReference}
                      onChange={(e) => setStudyReference(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && fetchStudyPassage()
                      }
                    />
                    <button
                      className="btn btn-primary"
                      onClick={fetchStudyPassage}
                      disabled={loadingStudy}
                    >
                      {loadingStudy ? (
                        <>
                          <div className="spinner-small"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Icons.Search /> Fetch Passage
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {studyPassages.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                      Scripture Passage{studyPassages.length > 1 ? "s" : ""}
                    </h3>
                    <div className="study-passage-display">
                      {studyPassages.map((passage, passageIndex) => {
                        const isCollapsed = collapsedPassages[passage.reference];

                        return (
                          <div key={passage.reference || passageIndex} style={{ marginBottom: "20px" }}>
                            {/* Collapsible passage header */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px",
                                backgroundColor: "#6b8e5f",
                                color: "white",
                                borderRadius: "6px",
                                cursor: "pointer",
                                marginBottom: isCollapsed ? "0" : "10px",
                              }}
                              onClick={() => {
                                setCollapsedPassages({
                                  ...collapsedPassages,
                                  [passage.reference]: !isCollapsed
                                });
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                                {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                                <span style={{ fontWeight: "600", fontSize: "1rem" }}>
                                  {passage.reference}
                                </span>
                                <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                  ({passage.verses.length} verse{passage.verses.length !== 1 ? "s" : ""})
                                </span>
                              </div>
                              <button
                                className="icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudyPassages(studyPassages.filter(p => p.reference !== passage.reference));
                                }}
                                title="Remove passage"
                                style={{ color: "white" }}
                              >
                                <Icons.Trash />
                              </button>
                            </div>

                            {/* Collapsible passage content */}
                            {!isCollapsed && (
                              <div style={{
                                border: "2px solid #6b8e5f",
                                borderTop: "none",
                                borderRadius: "0 0 6px 6px",
                                padding: "15px"
                              }}>
                                {passage.verses && passage.verses.filter(v => v && v.verseNumber && v.text).map((verse, verseIndex) => (
                                  <div
                                    key={verse.verseNumber}
                                    style={{
                                      padding: "12px",
                                      marginBottom: "8px",
                                      backgroundColor: "#f9f6f1",
                                      borderRadius: "6px",
                                      border: "1px solid #e8dcc8"
                                    }}
                                  >
                                    <div style={{
                                      fontSize: "0.85rem",
                                      fontWeight: "600",
                                      color: "#6b8e5f",
                                      marginBottom: "6px"
                                    }}>
                                      Verse {verse.verseNumber}
                                    </div>
                                    <div style={{
                                      fontSize: "1rem",
                                      lineHeight: "1.6",
                                      color: "#2c2416"
                                    }}>
                                      {verse.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Join Group Study Flow */}
            {studyView === "joinGroup" && (
              <div className="study-editor">
                <div className="study-editor-header">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setStudyView("list");
                      setError("");
                    }}
                  >
                    <Icons.ArrowLeft /> Back to Studies
                  </button>
                </div>

                <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
                  <Icons.User />
                  <h2 style={{ color: "#2c2416", marginTop: "20px", marginBottom: "10px" }}>
                    Join a Group Study
                  </h2>
                  <p style={{ color: "#5a4d37", marginBottom: "30px" }}>
                    Enter the 6-character study code shared by the study lead
                  </p>

                  {error && <div className="error" style={{ marginBottom: "20px" }}>{error}</div>}

                  <div style={{ marginBottom: "20px" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter study code (e.g., ABC123)"
                      value={groupStudyCode}
                      onChange={(e) => setGroupStudyCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === "Enter" && joinGroupStudy()}
                      maxLength={6}
                      style={{
                        fontSize: "1.5rem",
                        textAlign: "center",
                        letterSpacing: "4px",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        textTransform: "uppercase"
                      }}
                    />
                  </div>

                  <button
                    className="btn btn-success"
                    onClick={joinGroupStudy}
                    disabled={joiningGroupStudy || groupStudyCode.length !== 6}
                    style={{ width: "100%" }}
                  >
                    {joiningGroupStudy ? (
                      <>
                        <div className="spinner-small"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <Icons.User /> Join Study
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* View Group Study */}
            {studyView === "viewGroup" && currentStudy && (
              <div className="study-editor">
                <div className="study-editor-header">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setStudyView("list");
                      setCurrentStudy(null);
                      if (groupStudyListener) {
                        groupStudyListener();
                        setGroupStudyListener(null);
                      }
                    }}
                  >
                    <Icons.ArrowLeft /> Back to Studies
                  </button>
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: currentStudy.isLead ? "#d4a574" : "#7eb8d4",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "bold"
                  }}>
                    {currentStudy.isLead ? "YOU ARE THE LEAD" : "PARTICIPANT"}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ color: "#2c2416", marginBottom: "10px" }}>{currentStudy.title}</h2>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#5a4d37",
                    marginBottom: "10px"
                  }}>
                    <Icons.Book />
                    <span style={{ fontWeight: "600" }}>{currentStudy.reference}</span>
                  </div>

                  {/* Study Code Display */}
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    padding: "12px",
                    background: "rgba(107, 142, 95, 0.1)",
                    borderRadius: "6px",
                    marginBottom: "20px"
                  }}>
                    <Icons.Tag />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.75rem", color: "#5a4d37", fontWeight: "600" }}>
                        Study Code:
                      </div>
                      <div style={{
                        fontFamily: "monospace",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#2c2416",
                        letterSpacing: "3px"
                      }}>
                        {currentStudy.code}
                      </div>
                    </div>
                    <button
                      className="icon-btn"
                      onClick={() => copyStudyCode(currentStudy.code)}
                      title="Copy study code"
                      style={{
                        background: "#6b8e5f",
                        color: "white",
                        padding: "8px"
                      }}
                    >
                      <Icons.Copy />
                    </button>
                  </div>

                  {/* Participants */}
                  <div style={{
                    padding: "15px",
                    background: "#f9f6f1",
                    borderRadius: "8px",
                    marginBottom: "20px"
                  }}>
                    <div style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#2c2416",
                      marginBottom: "10px"
                    }}>
                      Participants ({(currentStudy.participants?.length || 0) + 1})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Lead */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        background: "rgba(212, 165, 116, 0.2)",
                        borderRadius: "6px"
                      }}>
                        {currentStudy.leadPhoto && (
                          <img
                            src={currentStudy.leadPhoto}
                            alt={currentStudy.leadName}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#2c2416" }}>
                            {currentStudy.leadName}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#d4a574", fontWeight: "bold" }}>
                            LEAD
                          </div>
                        </div>
                      </div>
                      {/* Participants */}
                      {currentStudy.participants?.map((participant, idx) => (
                        <div key={idx} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px",
                          background: "white",
                          borderRadius: "6px"
                        }}>
                          {participant.photoURL && (
                            <img
                              src={participant.photoURL}
                              alt={participant.displayName}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%"
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: "600", color: "#2c2416" }}>
                              {participant.displayName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scripture Passage */}
                <div style={{ marginBottom: "30px" }}>
                  <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                    Scripture Passage{studyPassages.length > 1 ? "s" : ""}
                  </h3>
                  <div className="study-passage-display">
                    {studyPassages.map((passage, passageIndex) => {
                      const isCollapsed = collapsedPassages[passage.reference];
                      const passageHighlights = studyHighlights.filter(h => h.passageReference === passage.reference);
                      const passageNotes = studyNotes.filter(n => n.passageReference === passage.reference);

                      return (
                        <div key={passage.reference || passageIndex} style={{ marginBottom: "20px" }}>
                          {/* Collapsible passage header */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px",
                              backgroundColor: "#6b8e5f",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              marginBottom: isCollapsed ? "0" : "10px",
                            }}
                            onClick={() => {
                              setCollapsedPassages({
                                ...collapsedPassages,
                                [passage.reference]: !isCollapsed
                              });
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                              {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
                              <span style={{ fontWeight: "600", fontSize: "1rem" }}>
                                {passage.reference}
                              </span>
                              <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                ({passage.verses?.length || 0} verse{passage.verses?.length !== 1 ? "s" : ""})
                              </span>
                              {passageHighlights.length > 0 && (
                                <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                  • {passageHighlights.length} highlight{passageHighlights.length !== 1 ? "s" : ""}
                                </span>
                              )}
                              {passageNotes.length > 0 && (
                                <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                                  • {passageNotes.length} note{passageNotes.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Collapsible passage content */}
                          {!isCollapsed && (
                            <div style={{
                              border: "2px solid #6b8e5f",
                              borderTop: "none",
                              borderRadius: "0 0 6px 6px",
                              padding: "15px"
                            }}>
                              {passage.verses && passage.verses.filter(v => v && v.verseNumber && v.text).map((verse, verseIndex) => {
                          const highlight = studyHighlights.find(h =>
                            h.passageReference === passage.reference && h.verseNumber === verse.verseNumber
                          );
                          const verseNotes = studyNotes.filter(n =>
                            n.passageReference === passage.reference && n.verseNumber === verse.verseNumber
                          );
                          const isSelected = selectedVerse &&
                            selectedVerse.passageReference === passage.reference &&
                            selectedVerse.verseNumber === verse.verseNumber;
                          const isViewingNotes = viewingNotesForVerse &&
                            viewingNotesForVerse.passageReference === passage.reference &&
                            viewingNotesForVerse.verseNumber === verse.verseNumber;

                          return (
                            <div key={verse.verseNumber}>
                              <div
                                style={{
                                  padding: "12px",
                                  marginBottom: isViewingNotes ? 0 : "8px",
                                  backgroundColor: highlight ? highlight.color : "#f9f6f1",
                                  borderRadius: isViewingNotes ? "6px 6px 0 0" : "6px",
                                  border: "1px solid #e8dcc8",
                                  cursor: isSelected ? "default" : "pointer",
                                  transition: "all 0.2s ease",
                                  borderBottom: isViewingNotes ? "none" : "1px solid #e8dcc8"
                                }}
                                onClick={() => {
                                  if (!isSelected) {
                                    setSelectedVerse({ passageReference: passage.reference, verseNumber: verse.verseNumber });
                                    setViewingNotesForVerse(null);
                                  }
                                }}
                              >
                                <div style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start"
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{
                                      fontSize: "0.9rem",
                                      fontWeight: "700",
                                      color: "#8b6f47",
                                      marginBottom: "6px"
                                    }}>
                                      {verse.verseNumber}
                                      {verseNotes.length > 0 && (
                                        <span style={{
                                          marginLeft: "8px",
                                          fontSize: "0.75rem",
                                          padding: "2px 6px",
                                          background: "#d4a574",
                                          color: "white",
                                          borderRadius: "10px"
                                        }}>
                                          {verseNotes.length} note{verseNotes.length > 1 ? "s" : ""}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{
                                      fontSize: "1rem",
                                      lineHeight: "1.6",
                                      color: "#2c2416"
                                    }}>
                                      {verse.text}
                                    </div>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {PASTEL_COLORS.map((colorOption) => (
                                      <button
                                        key={colorOption.value}
                                        className="icon-btn"
                                        onClick={() => {
                                          setSelectedColor(colorOption.value);
                                          addHighlightToGroupStudy(passage.reference, verse.verseNumber, colorOption.value);
                                        }}
                                        style={{
                                          backgroundColor: colorOption.value,
                                          width: "24px",
                                          height: "24px",
                                          borderRadius: "50%",
                                          border: "2px solid #d4c5a9",
                                          padding: 0
                                        }}
                                        title={`Highlight with ${colorOption.name}`}
                                      />
                                    ))}
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => {
                                        setViewingNotesForVerse({ passageReference: passage.reference, verseNumber: verse.verseNumber });
                                        setSelectedVerse(null);
                                      }}
                                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                    >
                                      <Icons.StickyNote style={{ width: "12px", height: "12px" }} /> View/Add Notes
                                    </button>
                                    {highlight && (
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => removeHighlightFromGroupStudy(passage.reference, verse.verseNumber)}
                                        style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                                      >
                                        <Icons.Trash style={{ width: "12px", height: "12px" }} /> Remove Highlight
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                          {/* Notes panel for highlighted verses */}
                          {isViewingNotes && (
                            <div className="verse-notes-panel" style={{
                              marginTop: 0,
                              marginBottom: "8px",
                              padding: "12px",
                              backgroundColor: "#f9f6f1",
                              borderRadius: "0 0 6px 6px",
                              border: "1px solid #d4c5a9",
                              borderTop: "1px dashed #d4c5a9"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <h4 style={{ margin: 0, color: "#2c2416", fontSize: "0.95rem" }}>
                                  <Icons.StickyNote style={{ width: "16px", height: "16px" }} /> Notes for Verse {verse.verseNumber}
                                </h4>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setShowNoteForm(!showNoteForm);
                                      setEditingGroupNote(null);
                                      setNoteText("");
                                    }}
                                    style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                                  >
                                    <Icons.Plus style={{ width: "12px", height: "12px" }} /> Add Note
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setViewingNotesForVerse(null);
                                      setShowNoteForm(false);
                                      setEditingGroupNote(null);
                                      setNoteText("");
                                    }}
                                    style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>

                              {showNoteForm && (
                                <div style={{ marginBottom: "10px" }}>
                                  <div style={{ marginBottom: "8px" }}>
                                    <div style={{ fontSize: "0.8rem", marginBottom: "4px", color: "#5a4d37" }}>Select color:</div>
                                    <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                                      {PASTEL_COLORS.map((color) => (
                                        <button
                                          key={color.value}
                                          onClick={() => setSelectedColor(color.value)}
                                          style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            backgroundColor: color.value,
                                            border: selectedColor === color.value ? "3px solid #2c2416" : "2px solid #d4c5a9",
                                            cursor: "pointer"
                                          }}
                                          title={color.name}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <textarea
                                    className="practice-input"
                                    rows="3"
                                    placeholder="Write your note here..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    style={{ marginBottom: "8px", fontSize: "0.9rem" }}
                                  />
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => {
                                        if (editingGroupNote) {
                                          editNoteInGroupStudy(editingGroupNote.id, noteText, selectedColor);
                                          setEditingGroupNote(null);
                                          setNoteText("");
                                          setShowNoteForm(false);
                                        } else {
                                          addNoteToGroupStudy();
                                        }
                                      }}
                                      disabled={!noteText.trim()}
                                      style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                    >
                                      <Icons.Save style={{ width: "14px", height: "14px" }} /> {editingGroupNote ? "Update Note" : "Save Note"}
                                    </button>
                                    {editingGroupNote && (
                                      <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                          setEditingGroupNote(null);
                                          setNoteText("");
                                          setShowNoteForm(false);
                                        }}
                                        style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {verseNotes.length === 0 ? (
                                <p style={{ fontSize: "0.85rem", color: "#8b7355", fontStyle: "italic", margin: 0 }}>
                                  No notes yet. Click "Add Note" to create one.
                                </p>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {verseNotes.map((note) => (
                                    <div
                                      key={note.id}
                                      style={{
                                        padding: "8px",
                                        backgroundColor: note.color,
                                        borderRadius: "4px",
                                        fontSize: "0.9rem"
                                      }}
                                    >
                                      <div>{note.text}</div>
                                      <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: "6px",
                                        fontSize: "0.75rem",
                                        color: "#5a4d37"
                                      }}>
                                        <div>
                                          <div style={{ fontWeight: "600" }}>{note.userName}</div>
                                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                                          {note.edited && <span style={{ marginLeft: "4px", fontStyle: "italic" }}>(edited)</span>}
                                        </div>
                                        {note.userId === user?.uid && (
                                          <div style={{ display: "flex", gap: "4px" }}>
                                            <button
                                              className="icon-btn"
                                              onClick={() => {
                                                setEditingGroupNote(note);
                                                setNoteText(note.text);
                                                setSelectedColor(note.color);
                                                setShowNoteForm(true);
                                              }}
                                              title="Edit note"
                                              style={{ fontSize: "0.8rem" }}
                                            >
                                              <Icons.Edit style={{ width: "12px", height: "12px" }} />
                                            </button>
                                            <button
                                              className="icon-btn"
                                              onClick={() => deleteNoteFromGroupStudy(note.id)}
                                              title="Delete note"
                                              style={{ fontSize: "0.8rem" }}
                                            >
                                              <Icons.Trash style={{ width: "12px", height: "12px" }} />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                              </div>
                            );
                          })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Main Points (Lead Only) */}
                <div style={{ marginBottom: "30px" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px"
                  }}>
                    <h3 style={{ color: "#2c2416" }}>
                      <Icons.BookMarked /> Main Points
                    </h3>
                    {currentStudy.isLead && (
                      <span style={{
                        fontSize: "0.85rem",
                        color: "#d4a574",
                        fontWeight: "600"
                      }}>
                        Lead Only
                      </span>
                    )}
                  </div>

                  {currentStudy.isLead && (
                    <div style={{ marginBottom: "15px" }}>
                      <div className="input-with-button" style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Add a main point..."
                          value={newMainPoint}
                          onChange={(e) => setNewMainPoint(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addMainPoint()}
                        />
                        <button
                          className="btn btn-success"
                          onClick={addMainPoint}
                          disabled={!newMainPoint.trim()}
                        >
                          <Icons.Plus />
                        </button>
                      </div>
                    </div>
                  )}

                  {mainPoints.length === 0 ? (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#5a4d37",
                      background: "#f9f6f1",
                      borderRadius: "6px",
                      fontStyle: "italic"
                    }}>
                      {currentStudy.isLead ? "Add your first main point above" : "No main points yet"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {mainPoints.map((point, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "12px",
                            background: "rgba(212, 165, 116, 0.1)",
                            borderLeft: "4px solid #d4a574",
                            borderRadius: "6px"
                          }}
                        >
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start"
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: "#d4a574",
                                marginBottom: "4px"
                              }}>
                                POINT {idx + 1}
                              </div>
                              {editingMainPoint?.index === idx ? (
                                <div>
                                  <input
                                    type="text"
                                    className="input"
                                    value={editingMainPoint.text}
                                    onChange={(e) => setEditingMainPoint({ ...editingMainPoint, text: e.target.value })}
                                    style={{ marginBottom: "8px", fontSize: "0.95rem" }}
                                  />
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => {
                                        editMainPoint(idx, editingMainPoint.text);
                                        setEditingMainPoint(null);
                                      }}
                                      disabled={!editingMainPoint.text.trim()}
                                      style={{ fontSize: "0.85rem", padding: "4px 8px" }}
                                    >
                                      <Icons.Save style={{ width: "12px", height: "12px" }} /> Save
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => setEditingMainPoint(null)}
                                      style={{ fontSize: "0.85rem", padding: "4px 8px" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  color: "#2c2416",
                                  lineHeight: "1.5",
                                  wordWrap: "break-word",
                                  overflowWrap: "break-word",
                                  wordBreak: "break-word"
                                }}>
                                  {point}
                                </div>
                              )}
                            </div>
                            {currentStudy.isLead && editingMainPoint?.index !== idx && (
                              <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
                                <button
                                  className="icon-btn"
                                  onClick={() => setEditingMainPoint({ index: idx, text: point })}
                                  title="Edit main point"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  <Icons.Edit style={{ width: "14px", height: "14px" }} />
                                </button>
                                <button
                                  className="icon-btn"
                                  onClick={() => deleteMainPoint(idx)}
                                  title="Delete main point"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  <Icons.Trash style={{ width: "14px", height: "14px" }} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thoughts (All Participants) */}
                <div style={{ marginBottom: "30px" }}>
                  <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                    <Icons.StickyNote /> Thoughts & Reflections
                  </h3>

                  <div style={{ marginBottom: "15px" }}>
                    <div className="input-with-button" style={{ display: "flex", gap: "8px" }}>
                      <textarea
                        className="input"
                        placeholder="Share your thoughts..."
                        value={newThought}
                        onChange={(e) => setNewThought(e.target.value)}
                        style={{ resize: "vertical", minHeight: "80px" }}
                      />
                      <button
                        className="btn btn-success"
                        onClick={addThought}
                        disabled={!newThought.trim()}
                        style={{ alignSelf: "flex-start" }}
                      >
                        <Icons.Plus />
                      </button>
                    </div>
                  </div>

                  {thoughts.length === 0 ? (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#5a4d37",
                      background: "#f9f6f1",
                      borderRadius: "6px",
                      fontStyle: "italic"
                    }}>
                      No thoughts shared yet. Be the first!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {thoughts.map((thought, idx) => (
                        <div
                          key={thought.id || idx}
                          style={{
                            padding: "12px",
                            background: "#f9f6f1",
                            borderRadius: "6px",
                            border: "1px solid #e8dcc8"
                          }}
                        >
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            marginBottom: "8px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {thought.userPhoto && (
                                <img
                                  src={thought.userPhoto}
                                  alt={thought.userName}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%"
                                  }}
                                />
                              )}
                              <div>
                                <div style={{
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  color: "#2c2416"
                                }}>
                                  {thought.userName}
                                </div>
                                <div style={{
                                  fontSize: "0.75rem",
                                  color: "#5a4d37"
                                }}>
                                  {new Date(thought.timestamp).toLocaleString()}
                                  {thought.edited && <span style={{ marginLeft: "4px", fontStyle: "italic" }}>(edited)</span>}
                                </div>
                              </div>
                            </div>
                            {thought.userId === user?.uid && (
                              <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                  className="icon-btn"
                                  onClick={() => setEditingThought({ id: thought.id, text: thought.text })}
                                  title="Edit thought"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  <Icons.Edit style={{ width: "14px", height: "14px" }} />
                                </button>
                                <button
                                  className="icon-btn"
                                  onClick={() => deleteThought(thought.id)}
                                  title="Delete thought"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  <Icons.Trash style={{ width: "14px", height: "14px" }} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingThought?.id === thought.id ? (
                            <div>
                              <textarea
                                className="input"
                                value={editingThought.text}
                                onChange={(e) => setEditingThought({ ...editingThought, text: e.target.value })}
                                style={{ resize: "vertical", minHeight: "80px", marginBottom: "8px" }}
                              />
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => {
                                    editThought(thought.id, editingThought.text);
                                    setEditingThought(null);
                                  }}
                                  disabled={!editingThought.text.trim()}
                                  style={{ fontSize: "0.85rem", padding: "4px 8px" }}
                                >
                                  <Icons.Save style={{ width: "12px", height: "12px" }} /> Save
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setEditingThought(null)}
                                  style={{ fontSize: "0.85rem", padding: "4px 8px" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              color: "#2c2416",
                              lineHeight: "1.6",
                              wordWrap: "break-word",
                              overflowWrap: "break-word",
                              wordBreak: "break-word"
                            }}>
                              {thought.text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Scripture References */}
                <div style={{ marginBottom: "30px", overflow: "hidden" }}>
                  <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                    <Icons.Book /> Additional Scripture References
                  </h3>

                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Label (e.g., Supporting Context, Chapter 2) - Optional"
                        value={additionalReferenceLabel}
                        onChange={(e) => setAdditionalReferenceLabel(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Scripture reference (e.g., John 3:16, Psalm 23:1-6)"
                          value={additionalReferenceInput}
                          onChange={(e) => setAdditionalReferenceInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && fetchAndAddAdditionalReference()}
                          style={{ flex: 1, minWidth: 0 }}
                        />
                        <button
                          className="btn btn-success"
                          onClick={fetchAndAddAdditionalReference}
                          disabled={!additionalReferenceInput.trim() || loadingAdditionalReference}
                          style={{ flexShrink: 0 }}
                        >
                          {loadingAdditionalReference ? (
                            <>Loading...</>
                          ) : (
                            <><Icons.Plus /> Add</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#5a4d37", marginTop: "4px" }}>
                      Add related passages, supporting verses, or additional chapters to your study
                    </div>
                  </div>

                  {currentStudy.additionalReferences && currentStudy.additionalReferences.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {currentStudy.additionalReferences.map((ref) => {
                        const isCollapsed = collapsedReferences[ref.id];
                        return (
                        <div
                          key={ref.id}
                          style={{
                            padding: "15px",
                            background: "#f9f6f1",
                            borderRadius: "8px",
                            border: "2px solid #d4a574",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            overflow: "hidden"
                          }}
                        >
                          {ref.label && (
                            <div style={{
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              color: "#8b6f47",
                              marginBottom: "8px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              overflowWrap: "break-word",
                              wordBreak: "break-word"
                            }}>
                              {ref.label}
                            </div>
                          )}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: isCollapsed ? "0" : "10px",
                            minWidth: 0
                          }}>
                            <div
                              style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#6b8e5f",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                                minWidth: 0,
                                flexWrap: "wrap"
                              }}
                              onClick={() => toggleReferenceCollapse(ref.id)}
                            >
                              <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>
                                {isCollapsed ? "▶" : "▼"}
                              </span>
                              <span style={{ overflowWrap: "break-word", wordBreak: "break-word", minWidth: 0 }}>
                                {ref.reference}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#8b6f47", flexShrink: 0 }}>
                                ({ref.passages.filter(v => v && v.verseNumber && v.text).length} verse{ref.passages.filter(v => v && v.verseNumber && v.text).length > 1 ? "s" : ""})
                              </span>
                            </div>
                            <button
                              className="icon-btn"
                              onClick={() => removeAdditionalReference(ref.id)}
                              title="Remove reference"
                              style={{ fontSize: "0.8rem", flexShrink: 0 }}
                            >
                              <Icons.Trash style={{ width: "14px", height: "14px" }} />
                            </button>
                          </div>
                          {!isCollapsed && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {ref.passages.filter(v => v && v.verseNumber && v.text).map((verse, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: "10px",
                                  background: "white",
                                  borderRadius: "6px",
                                  fontSize: "0.9rem",
                                  lineHeight: "1.6",
                                  color: "#2c2416",
                                  overflowWrap: "break-word",
                                  wordBreak: "break-word"
                                }}
                              >
                                <span style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "600",
                                  color: "#6b8e5f",
                                  marginRight: "8px"
                                }}>
                                  v{idx + 1}:
                                </span>
                                {verse.text}
                              </div>
                            ))}
                          </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#5a4d37",
                      background: "#f9f6f1",
                      borderRadius: "6px",
                      fontStyle: "italic"
                    }}>
                      No additional references yet. Add scripture passages to complement your study.
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "30px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e8dcc8"
                }}>
                  {currentStudy.isLead ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteGroupStudy(currentStudy.id)}
                      style={{ flex: 1 }}
                    >
                      <Icons.Trash /> Delete Study
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      onClick={() => leaveGroupStudy(currentStudy.id)}
                      style={{ flex: 1 }}
                    >
                      Leave Study
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Verses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.memorized}</div>
                <div className="stat-label">Memorized</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            {stats.total > 0 && (
              <div className="verse-display">
                <h3 style={{ marginBottom: "15px", color: "#2c2416" }}>
                  Progress Overview
                </h3>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(stats.memorized / stats.total) * 100}%`,
                    }}
                  >
                    {stats.memorized > 0 &&
                      `${Math.round((stats.memorized / stats.total) * 100)}%`}
                  </div>
                </div>
                <p style={{ color: "#5a4d37", textAlign: "center" }}>
                  Keep going! You've memorized {stats.memorized} out of{" "}
                  {stats.total} verses.
                </p>
              </div>
            )}

            {(() => {
              const memorizedVerses = verses.filter((v) => v.memorized);
              const displayProgressIndex = Math.min(currentMemorizedIndex, Math.max(0, memorizedVerses.length - 1));

              return memorizedVerses.length > 0 ? (
                <div>
                  <h3
                    style={{
                      marginBottom: "15px",
                      marginTop: "30px",
                      color: "#2c2416",
                    }}
                  >
                    Memorized Verses
                  </h3>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "15px",
                    gap: "10px"
                  }}>
                    <ToggleSwitch
                      checked={showAllVerses}
                      onChange={(newValue) => {
                        setShowAllVerses(newValue);
                        setCurrentMemorizedIndex(0);
                      }}
                      label="Show all verses at once"
                    />
                  </div>
                  {showAllVerses ? (
                    // Display all memorized verses in a list
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {memorizedVerses.filter(v => v && v.text).map((verse) => (
                        <div
                          key={verse.id}
                          className="verse-item memorized"
                        >
                          <div className="verse-item-header">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div className="verse-item-reference">
                                {verse.reference}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  background: "#e8f5e9",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  color: "#6b5d42",
                                  fontWeight: "500",
                                }}
                              >
                                {verse.version || "KJV"}
                              </span>
                            </div>
                          </div>
                          <div className="verse-item-text">
                            {(() => {
                              const parsedVerses = parseVersesFromContent(
                                verse.rawContent || verse.text,
                                verse.reference
                              );

                              if (parsedVerses.length > 0) {
                                return parsedVerses.filter(v => v && v.verseNumber && v.text).map((v) => (
                                  <div key={v.verseNumber} style={{ marginBottom: "10px" }}>
                                    <span className="verse-number" style={{
                                      fontWeight: "bold",
                                      color: "#5a4d37",
                                      marginRight: "8px",
                                      fontSize: "0.9em",
                                      verticalAlign: "super",
                                    }}>
                                      {v.verseNumber}
                                    </span>
                                    <span>{v.text}</span>
                                  </div>
                                ));
                              } else {
                                return verse.text;
                              }
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Display single verse with navigation
                    <div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                      }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setCurrentMemorizedIndex(Math.max(0, displayProgressIndex - 1))}
                          disabled={displayProgressIndex === 0}
                          style={{ padding: "10px 20px" }}
                        >
                          <Icons.ChevronLeft /> Previous
                        </button>
                        <div style={{
                          color: "#5a4d37",
                          fontWeight: "500",
                          fontSize: "0.9rem"
                        }}>
                          {displayProgressIndex + 1} / {memorizedVerses.length}
                        </div>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setCurrentMemorizedIndex(Math.min(memorizedVerses.length - 1, displayProgressIndex + 1))}
                          disabled={displayProgressIndex === memorizedVerses.length - 1}
                          style={{ padding: "10px 20px" }}
                        >
                          Next <Icons.ChevronRight />
                        </button>
                      </div>
                      <div className="verse-item memorized">
                        <div className="verse-item-header">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div className="verse-item-reference">
                              {memorizedVerses[displayProgressIndex].reference}
                            </div>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                background: "#e8f5e9",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                color: "#6b5d42",
                                fontWeight: "500",
                              }}
                            >
                              {memorizedVerses[displayProgressIndex].version || "KJV"}
                            </span>
                          </div>
                        </div>
                        <div className="verse-item-text">
                          {(() => {
                            const verse = memorizedVerses[displayProgressIndex];
                            const parsedVerses = parseVersesFromContent(
                              verse.rawContent || verse.text,
                              verse.reference
                            );

                            if (parsedVerses.length > 0) {
                              return parsedVerses.filter(v => v && v.verseNumber && v.text).map((v) => (
                                <div key={v.verseNumber} style={{ marginBottom: "10px" }}>
                                  <span className="verse-number" style={{
                                    fontWeight: "bold",
                                    color: "#5a4d37",
                                    marginRight: "8px",
                                    fontSize: "0.9em",
                                    verticalAlign: "super",
                                  }}>
                                    {v.verseNumber}
                                  </span>
                                  <span>{v.text}</span>
                                </div>
                              ));
                            } else {
                              return verse.text;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state" style={{ marginTop: "30px" }}>
                  <Icons.BookOpen />
                  <h3>No Memorized Verses Yet</h3>
                  <p>Mark verses as memorized to see them here</p>
                </div>
              );
            })()}

            {verses.length === 0 && (
              <div className="empty-state">
                <Icons.BookOpen />
                <h3>No Statistics Yet</h3>
                <p>Start adding and memorizing verses to track your progress</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <MobileBottomNav activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab === "leaderboard") loadLeaderboard();
    }} />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
