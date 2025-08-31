const gameArea = document.getElementById("game");
const character = document.getElementById("character");
const scoreDisplay = document.getElementById("score");
const pauseButton = document.getElementById("pauseButton");
const gameOverModal = document.getElementById("gameOverModal");
const pauseModal = document.getElementById("pauseModal");
const finalScore = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");
const resumeButton = document.getElementById("resumeButton");
const homeButton = document.getElementById("homeButton");

let paused = true;
let gameHasStarted = false;
let score = 0;
let gameSpeed = 2.5;
let lastObstacleTime = 0;
let minObstacleGap = 2000;
let animationFrameId;

let characterBottom;
let velocityY = 0;

// 🎮 Zorluk ayarları
const difficulty = {
    easy: { gravity: 0.15, jump: -6 },
    normal: { gravity: 0.18, jump: -6.5 },
    hard: { gravity: 0.22, jump: -7 }
};

// Varsayılan seviye: orta
let gravity = difficulty.normal.gravity;
let jumpStrength = difficulty.normal.jump;

function startGame() {
    paused = false;
    lastObstacleTime = Date.now();
    document.querySelectorAll(".obstacle").forEach(obs => {
        obs.style.animationPlayState = "running";
    });
    hideModals();
    gameLoop();
}

function restartGame() {
    document.querySelectorAll(".obstacle").forEach(obs => obs.remove());
    score = 0;
    gameSpeed = 2.5;
    minObstacleGap = 2000;
    scoreDisplay.textContent = `Skor: 0`;
    gameHasStarted = false;
    paused = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    initializeCharacter();
    showStartMessage();
}

function togglePause() {
    if (!gameHasStarted || !gameOverModal.classList.contains('hidden')) return;
    paused = !paused;
    const obstacles = document.querySelectorAll(".obstacle");
    if (paused) {
        cancelAnimationFrame(animationFrameId);
        obstacles.forEach(obs => { obs.style.animationPlayState = "paused"; });
        pauseModal.querySelector('h2').textContent = "Duraklatıldı";
        resumeButton.classList.remove('hidden');
        homeButton.classList.remove('hidden');
        pauseModal.classList.remove('hidden');
    } else {
        startGame(); 
    }
}

function hideModals() {
    gameOverModal.classList.add('hidden');
    pauseModal.classList.add('hidden');
}

function gameOver() {
    paused = true;
    cancelAnimationFrame(animationFrameId);
    finalScore.textContent = score;
    gameOverModal.classList.remove('hidden');
}

function jump() {
    if (!gameHasStarted) {
        gameHasStarted = true;
        startGame();
    }
    if (paused) return; 
    velocityY = jumpStrength;
}

function createObstacle() {
    if (paused) return;
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    const openingHeight = 200;
    const gameHeight = gameArea.clientHeight;
    const openingTop = Math.floor(Math.random() * (gameHeight - openingHeight - 100)) + 50;
    const topObstacle = obstacle.cloneNode();
    topObstacle.classList.add("obstacle-top");
    topObstacle.style.height = `${openingTop}px`;
    topObstacle.style.animationDuration = `${gameSpeed}s`;
    const bottomObstacle = obstacle.cloneNode();
    bottomObstacle.classList.add("obstacle-bottom");
    bottomObstacle.style.height = `${gameHeight - openingTop - openingHeight}px`;
    bottomObstacle.style.animationDuration = `${gameSpeed}s`;
    gameArea.appendChild(topObstacle);
    gameArea.appendChild(bottomObstacle);
}

function checkCollisions() {
    const characterRect = character.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    if (characterRect.top <= gameRect.top || characterRect.bottom >= gameRect.bottom) {
         gameOver();
         return;
    }
    const obstacles = document.querySelectorAll(".obstacle");
    obstacles.forEach(obs => {
        if (paused) return;
        const obsRect = obs.getBoundingClientRect();
        if (
            characterRect.right > obsRect.left &&
            characterRect.left < obsRect.right &&
            characterRect.bottom > obsRect.top &&
            characterRect.top < obsRect.bottom
        ) {
            gameOver();
            return;
        }
        if (obs.passed === undefined && obsRect.right < characterRect.left) {
            if(obs.classList.contains('obstacle-top')) {
               score++;
               scoreDisplay.textContent = `Skor: ${score}`;
               if (score > 0 && score % 5 === 0 && gameSpeed > 1.2) {
                   gameSpeed -= 0.1;
               }
            }
            obs.passed = true;
        }
        if (obsRect.right < gameRect.left) {
            obs.remove();
        }
    });
}

function gameLoop() {
    if (paused) return;
    velocityY += gravity;
    characterBottom -= velocityY;
    character.style.bottom = `${characterBottom}px`;
    const now = Date.now();
    if (now - lastObstacleTime > minObstacleGap) {
        createObstacle();
        lastObstacleTime = now;
        minObstacleGap = Math.max(1200, 2000 - score * 50); 
    }
    checkCollisions();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function setupControls(jumpCallback) {
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            if(!gameOverModal.classList.contains('hidden')) {
                restartGame();
            } else if (paused && gameHasStarted) {
                togglePause();
            } else {
                jumpCallback();
            }
        }
    });
    gameArea.addEventListener("click", () => {
        if(!gameOverModal.classList.contains('hidden')) {
        } else if (paused && gameHasStarted) {
        } else {
           jumpCallback();
        }
    });
}

setupControls(jump);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);
homeButton.addEventListener('click', restartGame);
resumeButton.addEventListener('click', togglePause);

function initializeCharacter() {
    characterBottom = gameArea.clientHeight / 2;
    character.style.bottom = `${characterBottom}px`;
    velocityY = 0;
}

function showStartMessage() {
    pauseModal.classList.remove('hidden');
    const pauseTitle = pauseModal.querySelector('h2');
    pauseTitle.textContent = "Başlamak İçin Dokun";
    resumeButton.classList.add('hidden');
    homeButton.classList.add('hidden');
}

window.onload = () => {
     initializeCharacter();
     showStartMessage();
};
