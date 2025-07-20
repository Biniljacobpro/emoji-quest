// --- Emoji Quest Script ---

const levels = [
  {
    scene: "assets/images/sad-scene.png",
    answer: "sad",
    signGif: "assets/signs/sad.gif"
  },
  {
    scene: "assets/images/happy-scene.png",
    answer: "happy",
    signGif: "assets/signs/happy.gif"
  },
  {
    scene: "assets/images/angry-scene.png",
    answer: "angry",
    signGif: "assets/signs/angry.gif"
  },
  {
    scene: "assets/images/surprised-scene.png",
    answer: "surprised",
    signGif: "assets/signs/surprised.gif"
  },
  {
    scene: "assets/images/confused-scene.png",
    answer: "confused",
    signGif: "assets/signs/confused.gif"
  },
  {
    scene: "assets/images/shy-scene.png",
    answer: "shy",
    signGif: "assets/signs/shy.gif"
  },
  {
    scene: "assets/images/proud-scene.png",
    answer: "proud",
    signGif: "assets/signs/proud.gif"
  }
];

// 🎲 Shuffle levels at the beginning (Fisher-Yates)
function shuffleLevels(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
shuffleLevels(levels);

let currentLevel = 0;
let inactivityTimer;
let hintLoopTimer;
let hintShownCount = 0;

const sceneImg = document.querySelector(".scene img");
const dropZone = document.querySelector(".drop-zone");
const emojiBank = document.querySelector(".emoji-bank");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const signGif = document.getElementById("sign-gif");
const handCursor = document.getElementById("hand-cursor");

function confettiEffect() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      particleCount,
      angle: randomInRange(55, 125),
      spread: 70,
      origin: {
        x: randomInRange(0.1, 0.9),
        y: Math.random() - 0.2
      },
      colors: ['#00C853', '#FFD600', '#D500F9'],
      ...defaults
    });
  }, 250);
}


// Shuffle emojis
function shuffleEmojis() {
  const emojis = Array.from(emojiBank.children);
  for (let i = emojis.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
  }
  emojiBank.innerHTML = "";
  emojis.forEach(e => emojiBank.appendChild(e));
}

function animateHandCursor() {
  const emoji = document.querySelector(".emoji-bank .emoji");
  const drop = document.querySelector(".drop-zone");

  if (!emoji || !drop) return;

  const emojiRect = emoji.getBoundingClientRect();
  const dropRect = drop.getBoundingClientRect();

  handCursor.classList.remove("hidden");
  handCursor.style.left = emojiRect.left + 10 + "px";
  handCursor.style.top = emojiRect.top + 10 + "px";

  setTimeout(() => {
    handCursor.style.transition = "all 1s ease-in-out";
    handCursor.style.left = dropRect.left + 10 + "px";
    handCursor.style.top = dropRect.top + 10 + "px";
  }, 100);

  setTimeout(() => {
    handCursor.classList.add("hidden");
    handCursor.style.transition = "none";
  }, 3000);
}

function scheduleHintLoop() {
  clearInterval(hintLoopTimer);
  hintShownCount = 0;

  function runHints() {
    if (hintShownCount < 2) {
      animateHandCursor();
      hintShownCount++;
    } else {
      clearInterval(hintLoopTimer);
      setTimeout(scheduleHintLoop, 60000);
    }
  }

  runHints();
  hintLoopTimer = setInterval(runHints, 5000);
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(scheduleHintLoop, 30000);
}

function loadLevel(levelIndex) {
  const level = levels[levelIndex];
  sceneImg.src = level.scene;
  dropZone.dataset.accept = level.answer;
  signGif.src = level.signGif;
  feedback.classList.add("hidden");
  nextBtn.classList.add("hidden");
  shuffleEmojis();
  resetInactivityTimer();
  scheduleHintLoop();
}

emojiBank.addEventListener("dragstart", e => {
  if (e.target.closest(".emoji")) {
    e.dataTransfer.setData("text/plain", e.target.closest(".emoji").dataset.emotion);
  }
});

dropZone.addEventListener("dragover", e => e.preventDefault());

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  const dropped = e.dataTransfer.getData("text/plain");
  const expected = dropZone.dataset.accept;

  if (dropped === expected) {
    feedback.textContent = "✅ Great job! That's correct!";
    feedback.style.color = "green";
    feedback.classList.remove("hidden");
    confettiEffect();

    setTimeout(() => {
      currentLevel++;
      if (currentLevel < levels.length) {
        loadLevel(currentLevel);
      } else {
        feedback.textContent = "🎉 You've completed all levels!";
        nextBtn.classList.add("hidden");
      }
    }, 1500);
  } else {
    feedback.textContent = "❌ Try again!";
    feedback.style.color = "red";
    feedback.classList.remove("hidden");
    dropZone.classList.add("shake");
    sadConfettiEffect();
    setTimeout(() => dropZone.classList.remove("shake"), 400);
  }

  resetInactivityTimer();
});

nextBtn.addEventListener("click", () => {
  currentLevel++;
  if (currentLevel < levels.length) {
    loadLevel(currentLevel);
  } else {
    feedback.textContent = "🎉 You've completed all levels!";
    nextBtn.classList.add("hidden");
  }
  resetInactivityTimer();
});

loadLevel(currentLevel);
