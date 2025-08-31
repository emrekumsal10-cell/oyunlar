// HTML elemanlarını seçme
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

// Oyun değişkenleri
let paused = true;
let gameHasStarted = false;
let score = 0;
let gameSpeed = 2.5;
let lastObstacleTime = 0;
let minObstacleGap = 2000;
let animationFrameId;

let characterBottom;
let velocityY = 0;

// Zorluk ayarları
const difficulty = {
    normal: { gravity: 0.18, jump: -6.5 }
};
let gravity = difficulty.normal.gravity;
let jumpStrength = difficulty.normal.jump;

// --- Temel Oyun Fonksiyonları ---

function init() {
    // Oyunun tüm ayarlarını başlangıç durumuna getir
    paused = true;
    gameHasStarted = false;
    score = 0;
    gameSpeed = 2.5;
    minObstacleGap = 2000;
    scoreDisplay.textContent = `Skor: 0`;
    
    // Engelleri temizle
    document.querySelectorAll(".obstacle").forEach(obs => obs.remove());
    
    // Karakteri başlangıç pozisyonuna yerleştir
    characterBottom = gameArea.clientHeight / 2;
    character.style.bottom = `${characterBottom}px`;
    velocityY = 0;
    
    // Modalları gizle ve başlangıç mesajını göster
    hideModals();
    showStartMessage();
    
    // Eğer bir animasyon döngüsü varsa durdur
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function startGame() {
    if (gameHasStarted) return;
    
    gameHasStarted = true;
    paused = false;
    hideModals();
    
    lastObstacleTime = Date.now();
    gameLoop();
}

function togglePause() {
    // Oyun başlamadıysa veya oyun bittiyse duraklatma işlemi yapma
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
        gameLoop();
        obstacles.forEach(obs => { obs.style.animationPlayState = "running"; });
    }
}

function jump() {
    if (paused) {
        startGame();
        return;
    }
    velocityY = jumpStrength;
}

function createObstacle() {
    const openingHeight = 200;
    const gameHeight = gameArea.clientHeight;
    const openingTop = Math.floor(Math.random() * (gameHeight - openingHeight - 100)) + 50;

    // Üst ve alt engelleri oluşturma
    const topObstacle = document.createElement("div");
    topObstacle.classList.add("obstacle", "obstacle-top");
    topObstacle.style.height = `${openingTop}px`;
    topObstacle.style.animationDuration = `${gameSpeed}s`;
    
    const bottomObstacle = document.createElement("div");
    bottomObstacle.classList.add("obstacle", "obstacle-bottom");
    bottomObstacle.style.height = `${gameHeight - openingTop - openingHeight}px`;
    bottomObstacle.style.animationDuration = `${gameSpeed}s`;
    
    gameArea.appendChild(topObstacle);
    gameArea.appendChild(bottomObstacle);
}

function checkCollisions() {
    const characterRect = character.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    
    // Duvarlara çarpma kontrolü
    if (characterRect.top <= gameRect.top || characterRect.bottom >= gameRect.bottom) {
        gameOver();
        return;
    }
    
    const obstacles = document.querySelectorAll(".obstacle");
    obstacles.forEach(obs => {
        const obsRect = obs.getBoundingClientRect();
        
        // Çarpışma kontrolü
        if (
            characterRect.right > obsRect.left &&
            characterRect.left < obsRect.right &&
            characterRect.bottom > obsRect.top &&
            characterRect.top < obsRect.bottom
        ) {
            gameOver();
            return;
        }
        
        // Engelden geçiş kontrolü ve skor artırma
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
        
        // Ekran dışına çıkan engeli temizleme
        if (obsRect.right < gameRect.left) {
            obs.remove();
        }
    });
}

function gameOver() {
    paused = true;
    cancelAnimationFrame(animationFrameId);
    finalScore.textContent = score;
    gameOverModal.classList.remove('hidden');
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

function hideModals() {
    gameOverModal.classList.add('hidden');
    pauseModal.classList.add('hidden');
}

function showStartMessage() {
    pauseModal.classList.remove('hidden');
    pauseModal.querySelector('h2').textContent = "Başlamak İçin Dokun";
    resumeButton.classList.add('hidden');
    homeButton.classList.add('hidden');
}

// --- Olay Dinleyicileri ---

// Oyun alanına tıklama ve tuş basma olayları
gameArea.addEventListener("click", () => {
    jump();
});

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        jump();
    }
});

// Buton olayları
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', init);
resumeButton.addEventListener('click', togglePause);
homeButton.addEventListener('click', init);

// Sayfa yüklendiğinde oyunu başlatma
window.onload = init;
