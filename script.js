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
};

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

      const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false`;

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

      return {
        reference: data.data.reference,
        text: data.data.content.trim(),
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
      const verseUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verse.id}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`;

      const verseResponse = await fetch(verseUrl, {
        headers: {
          "api-key": this.API_KEY,
        },
      });

      if (!verseResponse.ok) throw new Error("Unable to fetch verse content");

      const verseData = await verseResponse.json();

      return {
        reference: verseData.data.reference,
        text: verseData.data.content.trim(),
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

  // Prayer tab state
  const [prayers, setPrayers] = useState([]);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerCategory, setPrayerCategory] = useState("Request");
  const [prayerVerseRefs, setPrayerVerseRefs] = useState([]);
  const [newVerseRef, setNewVerseRef] = useState("");
  const [prayerFilter, setPrayerFilter] = useState("all"); // all, answered, unanswered

  // Bible Studies state
  const [studies, setStudies] = useState([]);
  const [currentStudy, setCurrentStudy] = useState(null);
  const [studyView, setStudyView] = useState("list"); // list, create, view
  const [studyTitle, setStudyTitle] = useState("");
  const [studyReference, setStudyReference] = useState("");
  const [studyPassages, setStudyPassages] = useState([]);
  const [studyHighlights, setStudyHighlights] = useState([]);
  const [studyNotes, setStudyNotes] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#ffe4e1");
  const [noteText, setNoteText] = useState("");
  const [loadingStudy, setLoadingStudy] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null); // Changed from selectedText to selectedVerse
  const [viewingNotesForVerse, setViewingNotesForVerse] = useState(null); // For showing notes panel
  const [showNoteForm, setShowNoteForm] = useState(false);

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
            const [userVerses, userPrayers, userStudies] = await Promise.all([
              FirestoreService.getVerses(),
              FirestoreService.getPrayers(),
              FirestoreService.getStudies(),
            ]);
            setVerses(userVerses);
            setPrayers(userPrayers);
            setStudies(userStudies);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    SoundEffects.playClick();
    setLoading(true);
    setError("");
    setAddSuccess(false);
    try {
      const verse = await BibleAPI.fetchVerse(searchQuery, "KJV");
      setCurrentVerse(verse);

      // Parse the text into individual verses
      const text = verse.text;
      const reference = verse.reference;

      // Extract verse numbers from the reference (e.g., "John 3:16-21" -> 16 to 21)
      const refMatch = reference.match(/(\d+):(\d+)(?:-(\d+))?/);

      if (refMatch) {
        const startVerse = parseInt(refMatch[2]);
        const endVerse = refMatch[3] ? parseInt(refMatch[3]) : startVerse;

        // Split the text by verse patterns
        // The text might have verse numbers or we split by sentences
        const verses = [];
        const sentences = text.split(/(?<=[.!?])\s+/);
        const versesPerSentence = Math.ceil(sentences.length / (endVerse - startVerse + 1));

        for (let i = startVerse; i <= endVerse; i++) {
          const sentenceIndex = (i - startVerse) * versesPerSentence;
          const verseText = sentences.slice(sentenceIndex, sentenceIndex + versesPerSentence).join(" ");

          if (verseText) {
            verses.push({
              verseNumber: i.toString(),
              text: verseText.trim(),
            });
          }
        }

        // If splitting didn't work well, just put all text in one verse
        if (verses.length === 0 || verses.every(v => !v.text)) {
          verses.push({
            verseNumber: startVerse.toString() + (endVerse > startVerse ? "-" + endVerse : ""),
            text: text,
          });
        }

        setSearchVerses(verses);
      } else {
        // Single verse or couldn't parse - just add as one verse
        setSearchVerses([{
          verseNumber: "1",
          text: text,
        }]);
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
    try {
      const verse = verses.find((v) => v.id === id);
      const updatedVerses = await FirestoreService.toggleMemorized(id);
      setVerses(updatedVerses);

      // If marking as memorized, play celebration
      if (verse && !verse.memorized) {
        SoundEffects.playCelebration();
        Confetti.create();
      } else {
        SoundEffects.playClick();
      }
    } catch (error) {
      console.error("Error toggling memorized status:", error);
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

  const handleToggleAnswered = async (prayerId) => {
    try {
      const prayer = prayers.find((p) => p.id === prayerId);
      const updatedPrayer = {
        ...prayer,
        answered: !prayer.answered,
        dateAnswered: !prayer.answered ? new Date().toISOString() : null,
      };
      await FirestoreService.updatePrayer(prayerId, updatedPrayer);
      const updatedPrayers = await FirestoreService.getPrayers();
      setPrayers(updatedPrayers);

      if (!prayer.answered) {
        SoundEffects.playCelebration();
        Confetti.create();
      } else {
        SoundEffects.playClick();
      }
    } catch (error) {
      console.error("Error toggling answered status:", error);
      setError("Failed to update prayer. Please try again.");
      SoundEffects.playError();
    }
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

    setLoadingStudy(true);
    setError("");

    try {
      // Fetch the passage - this will get a range if specified (e.g., "John 3:16-21")
      const verseData = await BibleAPI.fetchVerse(studyReference, "KJV");

      // Parse the text into individual verses
      // The API returns the full passage text, we need to split it into verses
      const text = verseData.text;
      const reference = verseData.reference;

      // Extract verse numbers from the reference (e.g., "John 3:16-21" -> 16 to 21)
      const refMatch = reference.match(/(\d+):(\d+)(?:-(\d+))?/);

      if (refMatch) {
        const startVerse = parseInt(refMatch[2]);
        const endVerse = refMatch[3] ? parseInt(refMatch[3]) : startVerse;

        // Split the text by verse patterns
        // The text might have verse numbers or we split by sentences
        const verses = [];
        const sentences = text.split(/(?<=[.!?])\s+/);
        const versesPerSentence = Math.ceil(sentences.length / (endVerse - startVerse + 1));

        for (let i = startVerse; i <= endVerse; i++) {
          const sentenceIndex = (i - startVerse) * versesPerSentence;
          const verseText = sentences.slice(sentenceIndex, sentenceIndex + versesPerSentence).join(" ");

          if (verseText) {
            verses.push({
              verseNumber: i.toString(),
              text: verseText.trim(),
            });
          }
        }

        // If splitting didn't work well, just put all text in one verse
        if (verses.length === 0 || verses.every(v => !v.text)) {
          verses.push({
            verseNumber: startVerse.toString() + (endVerse > startVerse ? "-" + endVerse : ""),
            text: text,
          });
        }

        setStudyPassages(verses);
      } else {
        // Single verse or couldn't parse - just add as one verse
        setStudyPassages([{
          verseNumber: "1",
          text: text,
        }]);
      }

      SoundEffects.playSuccess();
    } catch (err) {
      setError(err.message);
      SoundEffects.playError();
    } finally {
      setLoadingStudy(false);
    }
  };

  const handleVerseClick = (verseNumber) => {
    // Toggle selection: if clicking the same verse, deselect it
    if (selectedVerse === verseNumber) {
      setSelectedVerse(null);
    } else {
      setSelectedVerse(verseNumber);
      setViewingNotesForVerse(null); // Close notes panel when selecting a verse
    }
  };

  const applyHighlight = () => {
    if (!selectedVerse) return;

    // Check if this verse already has a highlight
    const existingHighlight = studyHighlights.find(h => h.verseNumber === selectedVerse);

    if (existingHighlight) {
      // Update the color of existing highlight
      setStudyHighlights(studyHighlights.map(h =>
        h.verseNumber === selectedVerse ? { ...h, color: selectedColor } : h
      ));
    } else {
      // Create new highlight for the entire verse
      const newHighlight = {
        id: Date.now().toString(),
        verseNumber: selectedVerse,
        color: selectedColor,
      };
      setStudyHighlights([...studyHighlights, newHighlight]);
    }

    setSelectedVerse(null);
    SoundEffects.playClick();
  };

  const removeHighlight = (verseNumber) => {
    setStudyHighlights(studyHighlights.filter(h => h.verseNumber !== verseNumber));
    SoundEffects.playClick();
  };

  const handleHighlightClick = (verseNumber) => {
    // Toggle notes view for the clicked verse
    if (viewingNotesForVerse === verseNumber) {
      setViewingNotesForVerse(null);
    } else {
      setViewingNotesForVerse(verseNumber);
      setSelectedVerse(null); // Deselect verse when viewing notes
    }
  };

  const addNote = () => {
    if (!noteText.trim()) {
      setError("Please enter note text");
      return;
    }

    // If we're viewing notes for a specific verse, attach the note to that verse
    const verseNumber = viewingNotesForVerse || selectedVerse;

    const newNote = {
      id: Date.now().toString(),
      verseNumber: verseNumber, // Link note to specific verse
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
      setError("Please fetch a scripture passage first");
      return;
    }

    try {
      const studyData = {
        title: studyTitle.trim(),
        reference: studyReference,
        passages: studyPassages,
        highlights: studyHighlights,
        notes: studyNotes,
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
    setStudyReference(study.reference);
    setStudyPassages(study.passages || []);
    setStudyHighlights(study.highlights || []);
    setStudyNotes(study.notes || []);
    setSelectedColor(PASTEL_COLORS[0].value);
    setNoteText("");
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
      const duplicatedStudy = {
        title: study.title + " (Copy)",
        reference: study.reference,
        passages: study.passages,
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

  const getVerseHighlight = (verseNumber) => {
    return studyHighlights.find(h => h.verseNumber === verseNumber);
  };

  const stats = {
    total: verses.length,
    memorized: verses.filter((v) => v.memorized).length,
    inProgress: verses.filter((v) => !v.memorized).length,
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          Loading...
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
              <button className="btn-logout" onClick={handleLogout}>
                <Icons.LogOut />
                Logout
              </button>
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
            className={`tab ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
          >
            <Icons.Brain /> Practice
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
                    {searchVerses.map((verse) => (
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
              <div className="verse-list">
                {verses.map((verse) => (
                  <div
                    key={verse.id}
                    className={`verse-item ${
                      verse.memorized ? "memorized" : ""
                    }`}
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
                          className={`icon-btn ${
                            verse.memorized ? "active" : ""
                          }`}
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
                    <div className="verse-item-text">{verse.text}</div>
                  </div>
                ))}
              </div>
            )}
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
                    <div className="verse-text">{practiceVerse.text}</div>
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
                    <div className="verse-text">{practiceVerse.text}</div>
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
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className={`btn ${
                    prayerFilter === "all" ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setPrayerFilter("all")}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  All
                </button>
                <button
                  className={`btn ${
                    prayerFilter === "unanswered"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() => setPrayerFilter("unanswered")}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  Active
                </button>
                <button
                  className={`btn ${
                    prayerFilter === "answered"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() => setPrayerFilter("answered")}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  Answered
                </button>
              </div>
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
                  .filter((prayer) => {
                    if (prayerFilter === "answered") return prayer.answered;
                    if (prayerFilter === "unanswered") return !prayer.answered;
                    return true;
                  })
                  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                  .map((prayer) => (
                    <div
                      key={prayer.id}
                      className={`prayer-card ${
                        prayer.answered ? "answered" : ""
                      }`}
                    >
                      <div className="prayer-card-header">
                        <div>
                          <h4 className="prayer-title">{prayer.title}</h4>
                          <span
                            className={`prayer-category ${prayer.category.toLowerCase()}`}
                          >
                            {prayer.category}
                          </span>
                        </div>
                        <div className="prayer-card-actions">
                          <button
                            className={`icon-btn ${
                              prayer.answered ? "active" : ""
                            }`}
                            onClick={() => handleToggleAnswered(prayer.id)}
                            title={
                              prayer.answered
                                ? "Mark as unanswered"
                                : "Mark as answered"
                            }
                          >
                            <Icons.CheckCircle filled={prayer.answered} />
                          </button>
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
                        {prayer.answered && prayer.dateAnswered && (
                          <span className="prayer-date-answered">
                            Answered:{" "}
                            {new Date(prayer.dateAnswered).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "studies" && (
          <div>
            {studyView === "list" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px",
                  }}
                >
                  <h2 style={{ color: "#2c2416", fontSize: "1.5rem" }}>
                    Your Bible Studies
                  </h2>
                  <button
                    className="btn btn-success"
                    onClick={startNewStudy}
                  >
                    <Icons.Plus /> New Study
                  </button>
                </div>

                {studies.length === 0 ? (
                  <div className="empty-state">
                    <Icons.BookMarked />
                    <h3>No Studies Yet</h3>
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
                          {study.reference}
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

                  <label className="study-label">Scripture Reference</label>
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
                        {studyReference}
                      </h3>

                      <div className="study-passage">
                        {studyPassages.map((verse) => {
                          const highlight = getVerseHighlight(verse.verseNumber);
                          const isSelected = selectedVerse === verse.verseNumber;
                          const isViewingNotes = viewingNotesForVerse === verse.verseNumber;
                          const verseNotes = studyNotes.filter(n => n.verseNumber === verse.verseNumber);

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
                                    handleHighlightClick(verse.verseNumber);
                                  } else {
                                    handleVerseClick(verse.verseNumber);
                                  }
                                }}
                              >
                                <span className="verse-number">
                                  {verse.verseNumber}
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
                                      onClick={() => removeHighlight(verse.verseNumber)}
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
                                      <Icons.StickyNote style={{ width: "16px", height: "16px" }} /> Notes for Verse {verse.verseNumber}
                                    </h4>
                                    <div style={{ display: "flex", gap: "8px" }}>
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
                                        onClick={() => removeHighlight(verse.verseNumber)}
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
                                      <button
                                        className="btn btn-success btn-sm"
                                        onClick={addNote}
                                        disabled={!noteText.trim()}
                                        style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                                      >
                                        <Icons.Save style={{ width: "14px", height: "14px" }} /> Save Note
                                      </button>
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
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {studyNotes.length > 0 && (
                      <div className="study-notes-section" style={{ marginTop: "30px" }}>
                        <h3 style={{ color: "#2c2416", marginBottom: "15px" }}>
                          <Icons.StickyNote /> All Notes Summary
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {studyPassages.map((verse) => {
                            const verseNotes = studyNotes.filter(n => n.verseNumber === verse.verseNumber);
                            if (verseNotes.length === 0) return null;

                            return (
                              <div
                                key={verse.verseNumber}
                                style={{
                                  padding: "12px",
                                  backgroundColor: "#f9f6f1",
                                  borderRadius: "6px",
                                  border: "1px solid #d4c5a9"
                                }}
                              >
                                <div style={{
                                  fontWeight: "600",
                                  color: "#2c2416",
                                  marginBottom: "8px",
                                  fontSize: "0.95rem"
                                }}>
                                  Verse {verse.verseNumber} ({verseNotes.length} note{verseNotes.length > 1 ? "s" : ""})
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
                      </div>
                    )}
                  </>
                )}
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

            {verses.filter((v) => v.memorized).length > 0 && (
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
                <div className="verse-list">
                  {verses
                    .filter((v) => v.memorized)
                    .map((verse) => (
                      <div key={verse.id} className="verse-item memorized">
                        <div className="verse-item-header">
                          <div className="verse-item-reference">
                            {verse.reference}
                          </div>
                        </div>
                        <div className="verse-item-text">{verse.text}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

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
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
