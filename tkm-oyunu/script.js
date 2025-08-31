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

    // --- Oyun Ayarları ---
    const TILE_SIZE = 20;
    const PACMAN_SPEED = 2;
    const GHOST_SPEED = 1.8;

    // Harita Sembolleri: 1 = Duvar, 0 = Yem, 2 = Boşluk, 3 = Güç Yemi, 4 = Hayalet Yuvası
    const levels = [
        [ // Level 1
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
            [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,1,1,1,4,4,1,1,1,2,1,1,0,1,1,1,1,1,1],
            [2,2,2,2,2,2,0,2,2,2,1,2,2,4,4,2,2,1,2,2,2,0,2,2,2,2,2,2],
            [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,3,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,3,1],
            [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
_            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ]
        // Buraya daha fazla level haritası eklenebilir
    ];
    
    let map, player, ghosts, score, lives, level, dotCount, frightenedTimer;

    canvas.width = levels[0][0].length * TILE_SIZE;
    canvas.height = levels[0].length * TILE_SIZE;

    class Player {
        constructor(x, y) {
            this.x = x; this.y = y; this.size = TILE_SIZE;
            this.speed = PACMAN_SPEED;
            this.dir = { x: 0, y: 0 };
            this.nextDir = { x: 0, y: 0 };
            this.mouthOpen = 0; // Ağız animasyonu için
        }
        draw(ctx) {
            this.mouthOpen = (this.mouthOpen + 0.2) % (Math.PI * 2);
            let angle = Math.atan2(this.dir.y, this.dir.x);
            let mouthAngle = Math.abs(Math.sin(this.mouthOpen)) * (Math.PI / 4);
            
            ctx.save();
            ctx.translate(this.x + this.size/2, this.y + this.size/2);
            ctx.rotate(angle);
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, mouthAngle, Math.PI * 2 - mouthAngle);
            ctx.lineTo(0,0);
            ctx.fill();
            ctx.restore();
        }
        update() {
             // ... Hareket ve çarpışma mantığı
        }
    }

    class Ghost {
       // ... Hayalet mantığı
    }

    function init() {
        // ... Oyun başlatma mantığı
    }
    
    function gameLoop() {
        // ... Oyun döngüsü
    }

    // --- Başlangıç ---
    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        init();
        gameLoop();
    });

    restartButton.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        init();
        gameLoop();
    });

    // Not: Bu kodun tamamı çok uzun olduğu için burada kısaltılmıştır.
    // Tam çalışan bir versiyon için tüm mantığın (hareket, çarpışma, AI) eklenmesi gerekir.
    // Bu iskelet, dosyaların nasıl ayrılacağını ve oyunun nasıl yapılandırılacağını göstermektedir.
});
