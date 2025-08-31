document.addEventListener('DOMContentLoaded', () => {

    // HTML Elementlerini Seçme
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const finalScoreElem = document.getElementById('finalScore');
    const finalHighScoreElem = document.getElementById('finalHighScore');

    // Canvas Boyutlandırma
    const canvasWidth = 500;
    const canvasHeight = 888;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Oyun Sabitleri (Ayarları buradan kolayca değiştir)
    const PLAYER_WIDTH = 30;
    const PLAYER_HEIGHT = 30;
    const GRAVITY = 0.25; // Yerçekimini düşürdük, daha yavaş düşecek
    const LIFT = -6.5;    // Zıplama gücünü yerçekimine göre yeniden ayarladık
    const PIPE_WIDTH = 80;
    const PIPE_GAP = 220; // Borular arası boşluk
    const PIPE_SPAWN_INTERVAL = 180; // Kaç karede bir yeni boru geleceği
    const PIPE_SPEED = 2;

    // Oyun Değişkenleri
    let player, pipes, score, highScore, frameCount, isGameOver;

    // En yüksek skoru tarayıcı hafızasından çekme
    highScore = localStorage.getItem('flappyBlockHighScore') || 0;
    highScoreDisplay.textContent = `REKOR: ${highScore}`;

    // Oyuncu nesnesi
    player = {
        x: canvasWidth / 4,
        y: canvasHeight / 2,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        velocity: 0
    };

    // Oyunu başlatan ana fonksiyon
    function startGame() {
        // Değişkenleri sıfırla
        player.y = canvasHeight / 2;
        player.velocity = 0;
        pipes = [];
        score = 0;
        frameCount = 0;
        isGameOver = false;

        // Arayüzü ayarla
        gameOverScreen.style.display = 'none';
        startScreen.style.display = 'none';
        scoreDisplay.style.display = 'block';
        highScoreDisplay.style.display = 'block';
        scoreDisplay.textContent = `SKOR: 0`;

        // Oyun döngüsünü başlat
        gameLoop();
    }

    // Oyun döngüsü
    function gameLoop() {
        if (isGameOver) return;

        // Ekranı temizle
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Güncelleme ve Çizim Fonksiyonları
        updatePlayer();
        drawPlayer();
        updatePipes();
        drawPipes();
        detectCollisions();

        frameCount++;
        requestAnimationFrame(gameLoop);
    }

    // Oyuncuyu güncelle (yerçekimi, hareket)
    function updatePlayer() {
        player.velocity += GRAVITY;
        player.y += player.velocity;
    }

    // Oyuncuyu çiz
    function drawPlayer() {
        ctx.fillStyle = 'var(--player-color)';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Engelleri güncelle (hareket, yeni engel ekleme)
    function updatePipes() {
        // Belirli aralıkla yeni boru ekle
        if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
            const topPipeHeight = Math.random() * (canvasHeight - PIPE_GAP - 150) + 50;
            pipes.push({
                x: canvasWidth,
                y: 0,
                height: topPipeHeight,
                passed: false
            });
            pipes.push({
                x: canvasWidth,
                y: topPipeHeight + PIPE_GAP,
                height: canvasHeight - topPipeHeight - PIPE_GAP,
                passed: true // Alt boruyu skor için sayma
            });
        }
        
        // Boruları sola hareket ettir
        pipes.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
        });

        // Ekran dışına çıkan boruları sil
        pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
    }

    // Engelleri çiz
    function drawPipes() {
        ctx.fillStyle = 'var(--pipe-color)';
        ctx.strokeStyle = 'var(--pipe-border-color)';
        ctx.lineWidth = 4;
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, pipe.y, PIPE_WIDTH, pipe.height);
            ctx.strokeRect(pipe.x, pipe.y, PIPE_WIDTH, pipe.height);
        });
    }

    // Çarpışma kontrolü ve skorlama
    function detectCollisions() {
        // Ekranın üst ve alt sınırlarına çarpma
        if (player.y + player.height > canvasHeight || player.y < 0) {
            endGame();
        }

        // Borulara çarpma
        for (let pipe of pipes) {
            if (
                player.x < pipe.x + PIPE_WIDTH &&
                player.x + player.width > pipe.x &&
                player.y < pipe.y + pipe.height &&
                player.y + player.height > pipe.y
            ) {
                endGame();
                return;
            }

            // Skor artırma
            if (!pipe.passed && pipe.x + PIPE_WIDTH < player.x) {
                score++;
                scoreDisplay.textContent = `SKOR: ${score}`;
                pipe.passed = true;
            }
        }
    }

    // Oyunu bitiren fonksiyon
    function endGame() {
        isGameOver = true;
        
        // Rekor kontrolü ve kaydetme
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBlockHighScore', highScore);
        }

        // Oyun bitti ekranını göster
        finalScoreElem.textContent = score;
        finalHighScoreElem.textContent = highScore;
        highScoreDisplay.textContent = `REKOR: ${highScore}`;
        gameOverScreen.style.display = 'flex';
        scoreDisplay.style.display = 'none';
    }

    // Oyuncu zıplama fonksiyonu
    function jump() {
        if (!isGameOver) {
            player.velocity = LIFT;
        }
    }

    // Olay Dinleyicileri (Event Listeners)
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // PC ve Mobil için kontroller
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') jump();
    });
    
    canvas.addEventListener('mousedown', jump);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Ekranda kaydırmayı engelle
        jump();
    });
});
