// Oyun elemanları
const character = document.getElementById("character");
const gameArea = document.getElementById("game");
const scoreDisplay = document.getElementById("score");

// Oyun durumu değişkenleri
let paused = false;
let score = 0;
let gameSpeed = 3; 
let obstacleGenerationInterval = 2000;
let activeObstacles = [];
let obstacleTimer;
let gameLoopTimer;

// Zıplama kontrollerini ayarlar
function setupControls(action) {
    document.addEventListener("keydown", e => {
        if ((e.code === "Space" || e.code === "ArrowUp") && !paused) {
            action();
            e.preventDefault();
        }
    });
    document.addEventListener("click", () => {
        if (!paused) action();
    });
    document.addEventListener("touchstart", () => {
        if (!paused) action();
    });
}

// Oyunun duraklatma/devam etme durumunu değiştirir
function togglePause() {
    paused = !paused;
    if (paused) {
        clearInterval(obstacleTimer);
        clearInterval(gameLoopTimer);
    } else {
        startObstacleGeneration();
        startGameLoop();
    }
}

// Ana menüye döner (şimdilik sayfayı yeniliyor)
function goHome() {
    alert("Ana menüye dönülüyor...");
    location.reload();
}

// Karakterin zıplamasını sağlar
function jump() {
    if (character.classList.contains("jump") || paused) return;
    character.classList.add("jump");
    setTimeout(() => {
        character.classList.remove("jump");
    }, 500);
}

// Yeni bir engel oluşturur ve oyuna ekler
function createObstacle() {
    if (paused) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    const obstacleTypes = ["small", "medium", "large"];
    const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    let width, height;

    if (randomType === "small") {
        obstacle.classList.add("obstacle-small");
        width = 30;
        height = 30;
    } else if (randomType === "medium") {
        obstacle.classList.add("obstacle-medium");
        width = 40;
        height = 60;
    } else {
        obstacle.classList.add("obstacle-large");
        width = 50;
        height = 40;
    }

    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    obstacle.style.right = `-50px`;

    gameArea.appendChild(obstacle);
    activeObstacles.push(obstacle);
}

// Aktif engelleri hareket ettirir
function moveObstacles() {
    for (let i = 0; i < activeObstacles.length; i++) {
        let obs = activeObstacles[i];
        let currentRight = parseInt(obs.style.right, 10);
        obs.style.right = `${currentRight + gameSpeed}px`;

        if (currentRight + gameSpeed > gameArea.offsetWidth + 50) {
            gameArea.removeChild(obs);
            activeObstacles.splice(i, 1);
            i--;
            score++;
            scoreDisplay.textContent = "Skor: " + score;

            if (score % 5 === 0) {
                gameSpeed += 0.5;
                obstacleGenerationInterval -= 100;
                if (obstacleGenerationInterval < 500) obstacleGenerationInterval = 500;
                clearInterval(obstacleTimer);
                startObstacleGeneration();
            }
        }
    }
}

// Çarpışmaları kontrol eder
function checkCollision() {
    const characterRect = character.getBoundingClientRect();

    for (const obs of activeObstacles) {
        const obstacleRect = obs.getBoundingClientRect();

        if (
            characterRect.left < obstacleRect.right &&
            characterRect.right > obstacleRect.left &&
            characterRect.top < obstacleRect.bottom &&
            characterRect.bottom > obstacleRect.top
        ) {
            gameOver();
            return;
        }
    }
}

// Oyun bittiğinde çağrılır
function gameOver() {
    alert("Oyun bitti! Skor: " + score);
    location.reload();
}

// Engel oluşturma işlemini başlatır
function startObstacleGeneration() {
    if (obstacleTimer) clearInterval(obstacleTimer);
    obstacleTimer = setInterval(createObstacle, obstacleGenerationInterval);
}

// Ana oyun döngüsünü başlatır
function startGameLoop() {
    if (gameLoopTimer) clearInterval(gameLoopTimer);
    gameLoopTimer = setInterval(() => {
        if (!paused) {
            moveObstacles();
            checkCollision();
        }
    }, 20);
}

// Oyunu başlat
setupControls(jump);
startObstacleGeneration();
startGameLoop();
