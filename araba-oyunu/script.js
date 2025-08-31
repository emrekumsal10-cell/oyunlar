const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('finalScore');
const mainMenu = document.getElementById('main-menu');
const gameOverMenu = document.getElementById('gameOverMenu');
const startGameBtn = document.getElementById('startGameBtn');
const restartGameBtn = document.getElementById('restartGameBtn');
const carOptions = document.querySelectorAll('.car-option');
const difficultyOptions = document.querySelectorAll('.difficulty-option');
const pauseBtn = document.getElementById('pause-btn');
const mobileLeftBtn = document.getElementById('mobile-left-btn');
const mobileRightBtn = document.getElementById('mobile-right-btn');
const mobileControls = document.querySelector('.mobile-controls');

canvas.width = 400;
canvas.height = 600;

let playerCar;
let obstacles = [];
let score = 0;
let gameSpeed = 5;
let laneWidth = canvas.width / 2;
let playerCarWidth = 60;
let playerCarHeight = 100;
let obstacleCarWidth = 60;
let obstacleCarHeight = 100;

let lastTime = 0;
let isPaused = false;
let animationFrameId;
let obstacleSpawnIntervalId;

// Akıcı hareket için
let targetX;
const moveSpeed = 0.4;

// Zorluk Ayarları
const difficultySettings = {
    easy: { initialSpeed: 4, speedIncrease: 0.2, spawnInterval: 1200 },
    normal: { initialSpeed: 6, speedIncrease: 0.3, spawnInterval: 1000 },
    hard: { initialSpeed: 8, speedIncrease: 0.4, spawnInterval: 800 }
};

let currentDifficulty = 'normal';

function initGame() {
    isPaused = false;
    obstacles = [];
    score = 0;
    scoreEl.textContent = score;
    
    // Rastgele bir şeritten başlama
    const startLane = Math.random() > 0.5 ? 'left' : 'right';
    const startX = startLane === 'left' ? (laneWidth / 2) - (playerCarWidth / 2) : (laneWidth / 2) + laneWidth - (playerCarWidth / 2);

    playerCar = {
        x: startX,
        y: canvas.height - playerCarHeight - 20,
        width: playerCarWidth,
        height: playerCarHeight,
        color: 'yellow'
    };

    targetX = startX;
    
    document.querySelector('.car-option[data-car="yellow"]').classList.add('selected');
    document.querySelector(`.difficulty-option[data-difficulty="${currentDifficulty}"]`).classList.add('selected');
    
    mainMenu.classList.remove('hidden');
    gameOverMenu.classList.add('hidden');
    pauseBtn.classList.add('hidden');
    mobileControls.classList.add('hidden');
    draw();
}

function startGame() {
    const settings = difficultySettings[currentDifficulty];
    gameSpeed = settings.initialSpeed;
    
    mainMenu.classList.add('hidden');
    gameOverMenu.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    mobileControls.classList.remove('hidden');
    
    score = 0;
    obstacles = [];
    isPaused = false;
    
    lastTime = performance.now();
    gameLoop();
    
    // Yeni: Obstacle yaratma işini ayrı bir interval ile yönetme
    if (obstacleSpawnIntervalId) clearInterval(obstacleSpawnIntervalId);
    obstacleSpawnIntervalId = setInterval(createObstacle, settings.spawnInterval);
}

function gameLoop(timestamp) {
    if (isPaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update();
    draw();

    if (!checkCollisions()) {
        animationFrameId = requestAnimationFrame(gameLoop);
    } else {
        gameOver();
    }
}

function update() {
    // Arabayı hedef noktaya doğru hareket ettirme
    const dx = targetX - playerCar.x;
    if (Math.abs(dx) > 1) {
        playerCar.x += dx * moveSpeed;
    }

    // Engelleri hareket ettirme ve skorlama
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += gameSpeed;
        
        // Skorlama: Engel araba oyuncuyu geçtiğinde
        if (!obstacles[i].scored && obstacles[i].y > playerCar.y + playerCar.height) {
            score++;
            scoreEl.textContent = score;
            obstacles[i].scored = true;
            // Zorluğa göre hız artışı
            if (score % 5 === 0) {
                const settings = difficultySettings[currentDifficulty];
                gameSpeed += settings.speedIncrease;
            }
        }
    }

    // Ekran dışına çıkan engelleri temizleme
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height + 50);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Yol şeritlerini çizme
    ctx.fillStyle = '#f0f0f0';
    for (let i = 0; i < canvas.height / 50; i++) {
        ctx.fillRect(canvas.width / 2 - 5, (i * 50 - (gameSpeed * Date.now() * 0.01) % 50), 10, 30);
    }

    // Engelleri çizme
    obstacles.forEach(obstacle => {
        drawCar(obstacle.x, obstacle.y, obstacle.color);
    });

    // Oyuncu arabasını çizme
    drawCar(playerCar.x, playerCar.y, playerCar.color);
}

function drawCar(x, y, color) {
    const carWidth = playerCarWidth;
    const carHeight = playerCarHeight;
    
    // Ana gövde
    ctx.fillStyle = color;
    ctx.fillRect(x, y, carWidth, carHeight);

    // Camlar
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x + carWidth * 0.15, y + carHeight * 0.1, carWidth * 0.7, carHeight * 0.3);

    // Tekerlekler
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 5, y + carHeight * 0.2, 10, carHeight * 0.2);
    ctx.fillRect(x - 5, y + carHeight * 0.6, 10, carHeight * 0.2);
    ctx.fillRect(x + carWidth - 5, y + carHeight * 0.2, 10, carHeight * 0.2);
    ctx.fillRect(x + carWidth - 5, y + carHeight * 0.6, 10, carHeight * 0.2);
}

function createObstacle() {
    const lane = Math.random() > 0.5 ? 'left' : 'right';
    const x = lane === 'left' ? (laneWidth / 2) - (obstacleCarWidth / 2) : (laneWidth / 2) + laneWidth - (obstacleCarWidth / 2);
    
    const colors = ['#f39c12', '#2980b9', '#c0392b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    obstacles.push({
        x: x,
        y: -obstacleCarHeight,
        width: obstacleCarWidth,
        height: obstacleCarHeight,
        color: randomColor,
        scored: false
    });
}

function checkCollisions() {
    for (const obstacle of obstacles) {
        if (playerCar.x < obstacle.x + obstacle.width &&
            playerCar.x + playerCar.width > obstacle.x &&
            playerCar.y < obstacle.y + obstacle.height &&
            playerCar.y + playerCar.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    cancelAnimationFrame(animationFrameId);
    clearInterval(obstacleSpawnIntervalId);
    finalScoreEl.textContent = score;
    gameOverMenu.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    mobileControls.classList.add('hidden');
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseBtn.textContent = 'Devam Et';
        clearInterval(obstacleSpawnIntervalId);
    } else {
        pauseBtn.textContent = 'Duraklat';
        lastTime = performance.now();
        const settings = difficultySettings[currentDifficulty];
        obstacleSpawnIntervalId = setInterval(createObstacle, settings.spawnInterval);
        gameLoop();
    }
}

// Klavye ve Dokunmatik Kontrolleri
document.addEventListener('keydown', e => {
    if (gameOverMenu.classList.contains('hidden') && !isPaused) {
        if (e.key === 'ArrowLeft') {
            targetX = (laneWidth / 2) - (playerCarWidth / 2);
        } else if (e.key === 'ArrowRight') {
            targetX = (laneWidth / 2) + laneWidth - (playerCarWidth / 2);
        }
    }
});

// Mobil Dokunmatik ve Tıklama Kontrolü
mobileLeftBtn.addEventListener('click', () => {
    if (gameOverMenu.classList.contains('hidden') && !isPaused) {
        targetX = (laneWidth / 2) - (playerCarWidth / 2);
    }
});
mobileRightBtn.addEventListener('click', () => {
    if (gameOverMenu.classList.contains('hidden') && !isPaused) {
        targetX = (laneWidth / 2) + laneWidth - (playerCarWidth / 2);
    }
});
mobileLeftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOverMenu.classList.contains('hidden') && !isPaused) {
        targetX = (laneWidth / 2) - (playerCarWidth / 2);
    }
});
mobileRightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOverMenu.classList.contains('hidden') && !isPaused) {
        targetX = (laneWidth / 2) + laneWidth - (playerCarWidth / 2);
    }
});

// Araba Seçimi
carOptions.forEach(button => {
    button.addEventListener('click', () => {
        carOptions.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        playerCar.color = button.dataset.car;
    });
});

// Zorluk Seçimi
difficultyOptions.forEach(button => {
    button.addEventListener('click', () => {
        difficultyOptions.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        currentDifficulty = button.dataset.difficulty;
    });
});

startGameBtn.addEventListener('click', startGame);
restartGameBtn.addEventListener('click', () => {
    gameOverMenu.classList.add('hidden');
    initGame();
});
pauseBtn.addEventListener('click', togglePause);

// Oyun başlangıcı
initGame();