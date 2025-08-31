document.addEventListener('DOMContentLoaded', () => {
    // --- HTML Elementleri ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const levelDisplay = document.getElementById('level-display');
    const livesDisplay = document.getElementById('lives-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');

    const TILE_SIZE = 20;
    // Harita Sembolleri: 1=Duvar, 0=Yem, 2=Boşluk, 3=Güç Yemi, 4=Hayalet Yuvası
    const levels = [
        [ // Level 1 Haritası - HATADAN ARINDIRILDI
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,1,1,4,4,4,4,1,1,2,1,1,0,1,1,1,1,1,1],
            [2,2,2,2,2,2,0,2,2,2,1,4,4,4,4,4,4,1,2,2,2,0,2,2,2,2,2,2],
            [1,1,1,1,1,1,0,1,1,2,1,4,4,4,4,4,4,1,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,3,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,3,1],
            [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
    ];
    canvas.width = levels[0][0].length * TILE_SIZE;
    canvas.height = levels[0].length * TILE_SIZE;

    let map, player, ghosts, score, lives, currentLevel, dotCount, frightenedTimer, ghostScoreMultiplier;
    let animationFrameId, pacmanSpeed, ghostSpeed, gameState;

    class Entity {
        constructor(x, y, speed) { this.x = x; this.y = y; this.speed = speed; this.size = TILE_SIZE; this.dir = { x: 0, y: 0 }; this.nextDir = { x: 0, y: 0 }; }
        isWall(col, row) { return map[row] && map[row][col] === 1; }
        handleTunnel() { if (this.x < -this.size) this.x = canvas.width; else if (this.x > canvas.width) this.x = -this.size; }
    }

    class Player extends Entity {
        constructor(x, y) { super(x, y, 0); this.mouthOpen = 0; this.startPos = { x, y }; }
        draw(ctx) {
            let angle = this.dir.x === 0 && this.dir.y === 0 ? 0 : Math.atan2(this.dir.y, this.dir.x);
            this.mouthOpen = (this.mouthOpen + 1) % 20;
            let mouthAngle = (this.mouthOpen < 10) ? 0.2 : 0;
            ctx.save(); ctx.translate(this.x + this.size/2, this.y + this.size/2); ctx.rotate(angle);
            ctx.fillStyle = '#FFFF00'; ctx.beginPath();
            ctx.arc(0, 0, this.size / 2.2, mouthAngle * Math.PI, (2 - mouthAngle) * Math.PI);
            ctx.lineTo(0, 0); ctx.fill(); ctx.restore();
        }
        update() {
            // DÜZELTİLMİŞ HAREKET MANTIĞI
            const isAlignedX = Math.abs(this.x % TILE_SIZE) < this.speed;
            const isAlignedY = Math.abs(this.y % TILE_SIZE) < this.speed;

            if (isAlignedX && isAlignedY) {
                this.x = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
                this.y = Math.round(this.y / TILE_SIZE) * TILE_SIZE;

                const nextCol = this.x / TILE_SIZE + this.nextDir.x;
                const nextRow = this.y / TILE_SIZE + this.nextDir.y;
                if (!this.isWall(nextCol, nextRow)) { this.dir = { ...this.nextDir }; }
            }
            
            const currentCol = Math.round(this.x / TILE_SIZE) + this.dir.x;
            const currentRow = Math.round(this.y / TILE_SIZE) + this.dir.y;
            if (this.isWall(currentCol, currentRow) && (this.x % TILE_SIZE === 0) && (this.y % TILE_SIZE === 0)) {
                this.dir = { x: 0, y: 0 };
            }
            
            this.x += this.dir.x * this.speed; this.y += this.dir.y * this.speed;
            this.handleTunnel();

            const col = Math.round(this.x / TILE_SIZE), row = Math.round(this.y / TILE_SIZE);
            if (map[row] && map[row][col] === 0) { map[row][col] = 2; score += 10; dotCount--; }
            else if (map[row] && map[row][col] === 3) { map[row][col] = 2; score += 50; dotCount--; frightenGhosts(); }
        }
        reset() { this.x = this.startPos.x; this.y = this.startPos.y; this.dir = { x: 0, y: 0 }; this.nextDir = { x: 0, y: 0 }; }
    }
    
    // Hayalet Sınıfı (Öncekiyle aynı, sorunsuz)
    class Ghost extends Entity {
        constructor(x, y, color) { super(x, y, 0); this.color = color; this.mode = 'scatter'; this.startPos = { x, y }; }
        draw(ctx) {
            let bodyColor = this.mode === 'frightened' ? '#2121DE' : this.color;
            if (this.mode === 'eaten') {
                 ctx.fillStyle = 'white';
                 ctx.beginPath(); ctx.arc(this.x + this.size / 3, this.y + this.size / 2.5, this.size / 5, 0, Math.PI * 2); ctx.fill();
                 ctx.beginPath(); ctx.arc(this.x + this.size * 2/3, this.y + this.size / 2.5, this.size / 5, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = bodyColor;
                ctx.beginPath(); ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, Math.PI, 0);
                ctx.lineTo(this.x + this.size, this.y + this.size); ctx.lineTo(this.x, this.y + this.size); ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.arc(this.x + this.size / 3, this.y + this.size / 2.5, this.size / 5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(this.x + this.size * 2/3, this.y + this.size / 2.5, this.size / 5, 0, Math.PI * 2); ctx.fill();
            }
        }
        update() {
            const onGrid = (Math.abs(this.x % TILE_SIZE) < this.speed) && (Math.abs(this.y % TILE_SIZE) < this.speed);
            if (this.mode === 'eaten') {
                const dx = this.startPos.x - this.x, dy = this.startPos.y - this.y;
                if (Math.hypot(dx, dy) < this.speed) { this.x = this.startPos.x; this.y = this.startPos.y; this.mode = 'chase'; return; }
                const angle = Math.atan2(dy, dx); this.dir = {x: Math.cos(angle), y: Math.sin(angle)};
            } else if (onGrid) { this.dir = this.getBestMove(); }
            this.x += this.dir.x * this.speed; this.y += this.dir.y * this.speed;
            this.handleTunnel();
        }
        getBestMove() {
            let possibleMoves = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
            possibleMoves = possibleMoves.filter(m => !(m.x === -this.dir.x && m.y === -this.dir.y));
            let validMoves = [];
            for (const m of possibleMoves) { if (!this.isWall(Math.round(this.x/TILE_SIZE) + m.x, Math.round(this.y/TILE_SIZE) + m.y)) validMoves.push(m); }
            if (validMoves.length === 0) return {x: -this.dir.x, y: -this.dir.y};
            const target = this.mode === 'chase' ? player : (this.mode === 'frightened' ? {x:Math.random()*canvas.width, y:Math.random()*canvas.height} : this.startPos);
            let bestMove = validMoves[0], minDistance = Infinity;
            for (const m of validMoves) {
                const nextX = this.x + m.x * TILE_SIZE, nextY = this.y + m.y * TILE_SIZE;
                const dist = Math.hypot(nextX - target.x, nextY - target.y);
                if (dist < minDistance) { minDistance = dist; bestMove = m; }
            }
            return bestMove;
        }
        reset() { this.x = this.startPos.x; this.y = this.startPos.y; this.mode = 'chase'; }
    }

    // Oyunun geri kalanı (init, gameLoop, draw vs.)
    function init(isNewGame = true) {
        if (isNewGame) { score = 0; lives = 3; currentLevel = 0; }
        gameState = 'initializing';
        levelDisplay.textContent = `LEVEL: ${currentLevel + 1}`;
        pacmanSpeed = 2 + currentLevel * 0.2; ghostSpeed = 1.8 + currentLevel * 0.2;
        map = levels[currentLevel % levels.length].map(arr => arr.slice());
        dotCount = map.flat().filter(t => t === 0 || t === 3).length;
        player = new Player(13.5 * TILE_SIZE, 17 * TILE_SIZE); player.speed = pacmanSpeed;
        ghosts = [
            new Ghost(13 * TILE_SIZE, 10 * TILE_SIZE, '#FF0000'), new Ghost(15 * TILE_SIZE, 11 * TILE_SIZE, '#FFB8FF'),
            new Ghost(11 * TILE_SIZE, 11 * TILE_SIZE, '#00FFFF'), new Ghost(13 * TILE_SIZE, 12 * TILE_SIZE, '#FFB852')
        ];
        ghosts.forEach(g => g.speed = ghostSpeed);
        updateLivesDisplay(); scoreDisplay.textContent = `SKOR: ${score}`;
        gameState = 'playing';
    }
    function gameLoop() {
        if (gameState !== 'playing') return;
        update(); draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    function update() { player.update(); ghosts.forEach(g => g.update()); checkCollisions(); if (dotCount === 0) levelComplete(); }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(); player.draw(ctx); ghosts.forEach(g => g.draw(ctx));
    }
    function drawMap() {
        for (let r = 0; r < map.length; r++) for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 1) { ctx.fillStyle = '#0000FF'; ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE); }
            else if (map[r][c] === 0) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(c * TILE_SIZE + TILE_SIZE/2, r * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/6, 0, 2 * Math.PI); ctx.fill(); }
            else if (map[r][c] === 3) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(c * TILE_SIZE + TILE_SIZE/2, r * TILE_SIZE + TILE_SIZE/3, 0, 2 * Math.PI); ctx.fill(); }
        }
    }
    function updateLivesDisplay() { livesDisplay.innerHTML = ''; for (let i = 0; i < lives; i++) livesDisplay.innerHTML += `<div class="life"></div>`; }
    function checkCollisions() {
        ghosts.forEach(g => {
            if (Math.hypot(player.x - g.x, player.y - g.y) < TILE_SIZE * 0.8) {
                if (g.mode === 'frightened') { g.mode = 'eaten'; score += 200 * ghostScoreMultiplier; ghostScoreMultiplier *= 2; }
                else if (g.mode !== 'eaten') loseLife();
            }
        });
        scoreDisplay.textContent = `SKOR: ${score}`;
    }
    function loseLife() {
        gameState = 'paused'; lives--; updateLivesDisplay();
        if (lives <= 0) { gameOver(); }
        else { setTimeout(() => { player.reset(); ghosts.forEach(g => g.reset()); gameState = 'playing'; }, 2000); }
    }
    function gameOver() { gameState = 'gameOver'; gameOverScreen.classList.remove('hidden'); }
    function levelComplete() {
        gameState = 'paused'; levelCompleteScreen.classList.remove('hidden');
        setTimeout(() => { levelCompleteScreen.classList.add('hidden'); currentLevel++; init(false); gameState = 'playing'; }, 3000);
    }
    function frightenGhosts() {
        clearTimeout(frightenedTimer); ghostScoreMultiplier = 1;
        ghosts.forEach(g => { if(g.mode !== 'eaten') g.mode = 'frightened'; });
        frightenedTimer = setTimeout(() => { ghosts.forEach(g => { if (g.mode === 'frightened') g.mode = 'chase'; }); }, 7000);
    }
    const keyMap = {'ArrowUp':{x:0,y:-1},'ArrowDown':{x:0,y:1},'ArrowLeft':{x:-1,y:0},'ArrowRight':{x:1,y:0}};
    window.addEventListener('keydown', e => { if (keyMap[e.key] && gameState === 'playing') { e.preventDefault(); player.nextDir = keyMap[e.key]; } });
    btnUp.addEventListener('click', () => { if(gameState === 'playing') player.nextDir = {x:0, y:-1} });
    btnDown.addEventListener('click', () => { if(gameState === 'playing') player.nextDir = {x:0, y:1} });
    btnLeft.addEventListener('click', () => { if(gameState === 'playing') player.nextDir = {x:-1, y:0} });
    btnRight.addEventListener('click', () => { if(gameState === 'playing') player.nextDir = {x:1, y:0} });
    function startGame() {
        startScreen.classList.add('hidden'); gameOverScreen.classList.add('hidden');
        init(true);
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
    }
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
