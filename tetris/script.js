const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const rotateBtn = document.getElementById('rotate-btn');
const downBtn = document.getElementById('down-btn');
const pauseBtn = document.getElementById('pause-btn');
const newGameBtn = document.getElementById('new-game-btn');
const mainMenu = document.getElementById('main-menu');
const highScoreList = document.getElementById('high-score-list');
const startGameBtn = document.getElementById('start-game-btn');

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
let BLOCK_SIZE;

const COLORS = [
    '#E74C3C', '#2ECC71', '#3498DB', '#F1C40F', '#E67E22', '#9B59B6', '#1ABC9C'
];

const SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: COLORS[0] },
    O: { shape: [[1, 1], [1, 1]], color: COLORS[1] },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: COLORS[2] },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: COLORS[3] },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: COLORS[4] },
    L: { shape: [[1, 0, 0], [1, 1, 1]], color: COLORS[5] },
    J: { shape: [[0, 0, 1], [1, 1, 1]], color: COLORS[6] }
};

let grid = [];
let currentBlock = null;
let score = 0;
let isPaused = true;
let gameInterval;
let gameSpeed = 500;
let isGameOver = false;

let highScores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];

function startNewGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    BLOCK_SIZE = canvas.width / GRID_WIDTH;

    isGameOver = false;
    isPaused = false;
    score = 0;
    scoreEl.textContent = score;
    grid = createGrid();
    currentBlock = createNewBlock();
    mainMenu.classList.add('hidden');
    
    gameSpeed = 500; 
    gameInterval = setInterval(gameLoop, gameSpeed);
    pauseBtn.textContent = 'Duraklat';
    draw();
}

function createGrid() {
    return Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
}

function createNewBlock() {
    const shapeKeys = Object.keys(SHAPES);
    const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const blockData = SHAPES[randomKey];
    return {
        shape: blockData.shape,
        color: blockData.color,
        x: Math.floor(GRID_WIDTH / 2) - Math.floor(blockData.shape[0].length / 2),
        y: 0
    };
}

function drawBlock(block) {
    if (!block) return;
    block.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                ctx.fillStyle = block.color;
                ctx.fillRect((block.x + colIndex) * BLOCK_SIZE, (block.y + rowIndex) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#2c3e50';
                ctx.strokeRect((block.x + colIndex) * BLOCK_SIZE, (block.y + rowIndex) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = grid[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#2c3e50';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function checkCollision(block, offsetX, offsetY) {
    for (let y = 0; y < block.shape.length; y++) {
        for (let x = 0; x < block.shape[y].length; x++) {
            if (block.shape[y][x]) {
                const newX = block.x + x + offsetX;
                const newY = block.y + y + offsetY;
                
                if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                    return true;
                }
                if (newY >= 0 && grid[newY] && grid[newY][newX]) {
                    return true;
                }
            }
        };
    };
    return false;
}

function rotateBlock() {
    if (isPaused || isGameOver || !currentBlock) return;
    const originalShape = currentBlock.shape;
    let newShape = originalShape[0].map((_, colIndex) => originalShape.map(row => row[colIndex]).reverse());
    
    const offsets = [0, 1, -1, 2, -2];
    for (const offset of offsets) {
        if (!checkCollision({ ...currentBlock, shape: newShape, x: currentBlock.x + offset }, 0, 0)) {
            currentBlock.shape = newShape;
            currentBlock.x += offset;
            draw();
            return;
        }
    }
}

function freezeBlock() {
    currentBlock.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                grid[currentBlock.y + rowIndex][currentBlock.x + colIndex] = currentBlock.color;
            }
        });
    });
    checkRows();
    currentBlock = createNewBlock();
    if (checkCollision(currentBlock, 0, 0)) {
        gameOver();
    }
}

function checkRows() {
    let linesCleared = 0;
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== 0)) {
            grid.splice(y, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreEl.textContent = score;
        if (gameSpeed > 100) {
            gameSpeed -= 10 * linesCleared;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
}

function gameLoop() {
    if (isPaused || isGameOver) return;
    
    if (!checkCollision(currentBlock, 0, 1)) {
        currentBlock.y += 1;
    } else {
        freezeBlock();
    }
    
    draw();
}

function draw() {
    drawGrid();
    drawBlock(currentBlock);
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    alert(`Oyun Bitti! Skorunuz: ${score}`);
    updateHighScores(score);
    showMainMenu();
}

function updateHighScores(newScore) {
    highScores.push(newScore);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('tetrisHighScores', JSON.stringify(highScores));
    renderHighScores();
}

function renderHighScores() {
    highScoreList.innerHTML = '';
    if (highScores.length === 0) {
        const li = document.createElement('li');
        li.textContent = "Henüz skor yok.";
        highScoreList.appendChild(li);
        return;
    }
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoreList.appendChild(li);
    });
}

function showMainMenu() {
    mainMenu.classList.remove('hidden');
    renderHighScores();
}

function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameInterval);
        pauseBtn.textContent = 'Devam Et';
    } else {
        gameInterval = setInterval(gameLoop, gameSpeed);
        pauseBtn.textContent = 'Duraklat';
    }
}

// Buton Olay Dinleyicileri
leftBtn.addEventListener('click', () => { 
    if (!isPaused && !isGameOver && currentBlock) { 
        if (!checkCollision(currentBlock, -1, 0)) currentBlock.x -= 1; 
        draw(); 
    } 
});
rightBtn.addEventListener('click', () => { 
    if (!isPaused && !isGameOver && currentBlock) { 
        if (!checkCollision(currentBlock, 1, 0)) currentBlock.x += 1; 
        draw(); 
    } 
});
rotateBtn.addEventListener('click', rotateBlock);
downBtn.addEventListener('click', () => { 
    if (!isPaused && !isGameOver && currentBlock) { 
        if (!checkCollision(currentBlock, 0, 1)) {
            currentBlock.y += 1;
        } else {
            freezeBlock();
        }
        draw();
    }
});

pauseBtn.addEventListener('click', togglePause);
newGameBtn.addEventListener('click', startNewGame);
startGameBtn.addEventListener('click', startNewGame);

// Dokunmatik Kontroller
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener('touchstart', (e) => {
    if (isPaused || isGameOver) return;
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (isPaused || isGameOver) return;
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
    e.preventDefault();
}, { passive: false });

function handleSwipe() {
    if (!currentBlock) return;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const threshold = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
            if (!checkCollision(currentBlock, 1, 0)) currentBlock.x += 1;
        } else {
            if (!checkCollision(currentBlock, -1, 0)) currentBlock.x -= 1;
        }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
            while (!checkCollision(currentBlock, 0, 1)) {
                currentBlock.y += 1;
            }
            freezeBlock();
        } else {
            rotateBlock();
        }
    } else if (Math.abs(deltaX) <= threshold && Math.abs(deltaY) <= threshold) {
        rotateBlock();
    }
    draw();
}

document.addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }

    if (isPaused || isGameOver) return;
    if (e.key === 'ArrowLeft') { if (!checkCollision(currentBlock, -1, 0)) currentBlock.x -= 1; }
    else if (e.key === 'ArrowRight') { if (!checkCollision(currentBlock, 1, 0)) currentBlock.x += 1; }
    else if (e.key === 'ArrowUp') { rotateBlock(); }
    else if (e.key === 'ArrowDown') {
        if (!checkCollision(currentBlock, 0, 1)) {
            currentBlock.y += 1;
        }
    }
    draw();
});

showMainMenu();