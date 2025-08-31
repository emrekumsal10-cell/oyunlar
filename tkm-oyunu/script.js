document.addEventListener('DOMContentLoaded', () => {
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

    const TILE_SIZE = 20;
    let PACMAN_SPEED = 2;
    let GHOST_SPEED = 1.8;

    const levels = [
        [ // Level 1 Haritası
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,1,1,1,4,4,1,1,1,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,1,4,4,4,4,4,4,1,2,1,1,0,1,1,1,1,1,1],
            [2,2,2,2,2,2,0,2,2,2,1,4,4,4,4,4,4,1,2,2,2,0,2,2,2,2,2,2], // Tünel
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
        ],
        // Buraya 2. level haritası eklenebilir. Şimdilik tek level var.
    ];

    canvas.width = levels[0][0].length * TILE_SIZE;
    canvas.height = levels[0].length * TILE_SIZE;

    let map, player, ghosts, score, lives, currentLevel, dotCount, frightenedTimer, ghostScoreMultiplier;
    let animationFrameId;

    class Entity {
        constructor(x, y, speed) {
            this.x = x; this.y = y; this.speed = speed;
            this.size = TILE_SIZE;
            this.dir = { x: 0, y: 0 };
            this.nextDir = { x: 0, y: 0 };
        }
        
        getTilePos() { return { col: Math.floor(this.x / TILE_SIZE), row: Math.floor(this.y / TILE_SIZE) }; }
        getFutureTilePos(dir) { return { col: Math.floor((this.x + dir.x * this.speed) / TILE_SIZE), row: Math.floor((this.y + dir.y * this.speed) / TILE_SIZE) }; }
        
        isWall(col, row) {
            if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
            return map[row][col] === 1;
        }

        handleTunnel() {
            if (this.x < -this.size) this.x = canvas.width;
            else if (this.x > canvas.width) this.x = -this.size;
        }
    }

    class Player extends Entity {
        constructor(x, y) {
            super(x, y, PACMAN_SPEED);
            this.mouthOpen = 0;
            this.startPos = { x, y };
        }

        draw(ctx) {
            this.mouthOpen = (this.mouthOpen + 0.2) % (Math.PI * 2);
            let angle = this.dir.x === 0 && this.dir.y === 0 ? 0 : Math.atan2(this.dir.y, this.dir.x);
            let mouthAngle = Math.abs(Math.sin(this.mouthOpen)) * (Math.PI / 4);
            
            ctx.save();
            ctx.translate(this.x + this.size/2, this.y + this.size/2);
            ctx.rotate(angle);
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2.2, mouthAngle, Math.PI * 2 - mouthAngle);
            ctx.lineTo(0,0);
            ctx.fill();
            ctx.restore();
        }

        update() {
            // Yön değiştirme
            const onGrid = (this.x % TILE_SIZE === 0) && (this.y % TILE_SIZE === 0);
            if (onGrid) {
                const nextTile = this.getFutureTilePos(this.nextDir);
                if (!this.isWall(nextTile.col, nextTile.row)) {
                    this.dir = { ...this.nextDir };
                }
                const currentTile = this.getFutureTilePos(this.dir);
                if (this.isWall(currentTile.col, currentTile.row)) {
                    this.dir = { x: 0, y: 0 };
                }
            }

            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;

            this.handleTunnel();

            // Yem yeme
            const { col, row } = this.getTilePos();
            if (map[row][col] === 0) {
                map[row][col] = 2; // Boşluk yap
                score += 10;
                dotCount--;
            } else if (map[row][col] === 3) {
                map[row][col] = 2;
                score += 50;
                dotCount--;
                frightenGhosts();
            }
        }
        
        reset() {
            this.x = this.startPos.x;
            this.y = this.startPos.y;
            this.dir = { x: 0, y: 0 };
            this.nextDir = { x: 0, y: 0 };
        }
    }

    class Ghost extends Entity {
        constructor(x, y, color, name) {
            super(x, y, GHOST_SPEED);
            this.color = color; this.name = name;
            this.mode = 'scatter'; // chase, frightened, eaten
            this.startPos = { x, y };
            this.scatterTarget = this.getScatterTarget();
        }

        draw(ctx) {
            let bodyColor = this.color;
            if (this.mode === 'frightened') bodyColor = '#0000FF';
            if (this.mode === 'eaten') {
                 // Sadece gözleri çiz
            } else {
                 // Normal hayalet çizimi
                ctx.fillStyle = bodyColor;
                ctx.beginPath();
                ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, Math.PI, 0);
                ctx.lineTo(this.x + this.size, this.y + this.size);
                ctx.lineTo(this.x, this.y + this.size);
                ctx.fill();
            }
             // Gözler
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x + this.size / 3, this.y + this.size / 2.5, this.size / 5, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 2/3, this.y + this.size / 2.5, this.size / 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        update() {
             if ((this.x % TILE_SIZE === 0) && (this.y % TILE_SIZE === 0)) {
                this.dir = this.getBestMove();
            }
            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;
            this.handleTunnel();

            if (this.mode === 'eaten' && this.x === this.startPos.x && this.y === this.startPos.y) {
                this.mode = 'chase';
            }
        }
        
        getBestMove() {
            let possibleMoves = [
                {x: 0, y: -1}, // up
                {x: 1, y: 0},  // right
                {x: 0, y: 1},  // down
                {x: -1, y: 0}  // left
            ];
            // Geri dönmesini engelle
            possibleMoves = possibleMoves.filter(move => !(move.x === -this.dir.x && move.y === -this.dir.y));

            let validMoves = [];
            for (const move of possibleMoves) {
                const nextTile = this.getFutureTilePos(move);
                if (!this.isWall(nextTile.col, nextTile.row)) {
                    validMoves.push(move);
                }
            }

            if (validMoves.length === 0) return {x: -this.dir.x, y: -this.dir.y}; // Dead end

            let target = this.getTargetTile();
            let bestMove = validMoves[0];
            let minDistance = Infinity;

            for (const move of validMoves) {
                const nextPos = {x: this.x + move.x * TILE_SIZE, y: this.y + move.y * TILE_SIZE };
                const distance = Math.hypot(nextPos.x - target.x, nextPos.y - target.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMove = move;
                }
            }
            return bestMove;
        }

        getTargetTile() {
            if (this.mode === 'chase') return {x: player.x, y: player.y};
            if (this.mode === 'scatter') return this.scatterTarget;
            if (this.mode === 'frightened') return {x: Math.random() * canvas.width, y: Math.random() * canvas.height};
            if (this.mode === 'eaten') return this.startPos;
            return {x: player.x, y: player.y};
        }
        
        getScatterTarget() {
            if (this.name === 'blinky') return {x: canvas.width, y: 0};
            if (this.name === 'pinky') return {x: 0, y: 0};
            if (this.name === 'inky') return {x: canvas.width, y: canvas.height};
            if (this.name === 'clyde') return {x: 0, y: canvas.height};
        }

        reset() {
            this.x = this.startPos.x;
            this.y = this.startPos.y;
            this.mode = 'scatter';
            setTimeout(() => this.mode = 'chase', 5000);
        }
    }

    function init(isNewGame = true) {
        if (isNewGame) {
            score = 0;
            lives = 3;
            currentLevel = 0;
        }
        levelDisplay.textContent = `LEVEL: ${currentLevel + 1}`;
        PACMAN_SPEED = 2 + currentLevel * 0.2;
        GHOST_SPEED = 1.8 + currentLevel * 0.2;
        
        map = levels[currentLevel].map(arr => arr.slice());
        dotCount = map.flat().filter(tile => tile === 0 || tile === 3).length;
        
        player = new Player(13.5 * TILE_SIZE, 17 * TILE_SIZE);
        ghosts = [
            new Ghost(13.5 * TILE_SIZE, 11 * TILE_SIZE, '#FF0000', 'blinky'),
            new Ghost(11.5 * TILE_SIZE, 13 * TILE_SIZE, '#FFB8FF', 'pinky'),
            new Ghost(13.5 * TILE_SIZE, 13 * TILE_SIZE, '#00FFFF', 'inky'),
            new Ghost(15.5 * TILE_SIZE, 13 * TILE_SIZE, '#FFB852', 'clyde')
        ];
        updateLivesDisplay();
    }
    
    function update() {
        player.update();
        ghosts.forEach(ghost => ghost.update());
        checkCollisions();

        if (dotCount === 0) {
            levelComplete();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        player.draw(ctx);
        ghosts.forEach(ghost => ghost.draw(ctx));
    }
    
    function gameLoop() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function drawMap() {
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                if (map[row][col] === 1) { // Duvar
                    ctx.fillStyle = '#0000FF';
                    ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (map[row][col] === 0) { // Yem
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(col * TILE_SIZE + TILE_SIZE/2, row * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/6, 0, Math.PI * 2);
                    ctx.fill();
                } else if (map[row][col] === 3) { // Güç Yemi
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(col * TILE_SIZE + TILE_SIZE/2, row * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    function updateLivesDisplay() {
        livesDisplay.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const lifeDiv = document.createElement('div');
            lifeDiv.className = 'life';
            livesDisplay.appendChild(lifeDiv);
        }
    }

    function checkCollisions() {
        ghosts.forEach(ghost => {
            const dx = player.x - ghost.x;
            const dy = player.y - ghost.y;
            if (Math.hypot(dx, dy) < TILE_SIZE) {
                if (ghost.mode === 'frightened') {
                    ghost.mode = 'eaten';
                    score += 200 * ghostScoreMultiplier;
                    ghostScoreMultiplier *= 2;
                } else if (ghost.mode !== 'eaten') {
                    loseLife();
                }
            }
        });
        scoreDisplay.textContent = `SKOR: ${score}`;
    }

    function loseLife() {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
            gameOver();
        } else {
            player.reset();
            ghosts.forEach(g => g.reset());
        }
    }

    function gameOver() {
        cancelAnimationFrame(animationFrameId);
        gameOverScreen.classList.remove('hidden');
    }
    
    function levelComplete() {
        cancelAnimationFrame(animationFrameId);
        levelCompleteScreen.classList.remove('hidden');
        setTimeout(() => {
            levelCompleteScreen.classList.add('hidden');
            currentLevel++;
            if (currentLevel >= levels.length) currentLevel = 0; // Leveller bitince başa dön
            init(false);
            gameLoop();
        }, 3000);
    }

    function frightenGhosts() {
        clearTimeout(frightenedTimer);
        ghostScoreMultiplier = 1;
        ghosts.forEach(ghost => {
            if(ghost.mode !== 'eaten') ghost.mode = 'frightened';
        });
        frightenedTimer = setTimeout(() => {
            ghosts.forEach(ghost => {
                if (ghost.mode === 'frightened') ghost.mode = 'chase';
            });
        }, 7000);
    }

    window.addEventListener('keydown', e => {
        const keyMap = { 'ArrowUp': {x:0, y:-1}, 'ArrowDown': {x:0, y:1}, 'ArrowLeft': {x:-1, y:0}, 'ArrowRight': {x:1, y:0},
                         'w': {x:0, y:-1}, 's': {x:0, y:1}, 'a': {x:-1, y:0}, 'd': {x:1, y:0} };
        if (keyMap[e.key]) {
            e.preventDefault();
            player.nextDir = keyMap[e.key];
        }
    });

    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        init(true);
        gameLoop();
    });

    restartButton.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        init(true);
        gameLoop();
    });
});
