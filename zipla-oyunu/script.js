const gameArea = document.getElementById("game");
const character = document.getElementById("character");
const scoreDisplay = document.getElementById("score");

let paused = false;
let score = 0;
let gameSpeed = 2; // Başlangıç animasyon süresi (saniye)

// Kontrolleri ayarlar
function setupControls(action) {
  document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") action();
  });
  document.addEventListener("click", () => action());
  document.addEventListener("touchstart", () => action());
}

// Oyunu duraklatır/devam ettirir
function togglePause() {
    paused = !paused;
    const obstacles = document.querySelectorAll(".obstacle");
    obstacles.forEach(obs => {
        obs.style.animationPlayState = paused ? "paused" : "running";
    });
}

// Ana menüye döner
function goHome() {
    // window.location.href = "../index.html";
    alert("Ana menüye dönülüyor...");
    location.reload(); // Şimdilik oyunu yeniden başlatır
}

// Karakterin zıplamasını sağlar
function jump() {
    if (character.classList.contains("jump") || paused) return;
    character.classList.add("jump");
    setTimeout(() => {
        character.classList.remove("jump");
    }, 500);
}

// Rastgele bir engel oluşturur ve oyuna ekler
function createObstacle() {
    if (paused) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    const obstacleTypes = ["obstacle-type-1", "obstacle-type-2", "obstacle-type-3"];
    const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obstacle.classList.add(randomType);
    
    // Hızı ayarlar
    obstacle.style.animationDuration = gameSpeed + "s";
    
    gameArea.appendChild(obstacle);
}

// Çarpışma kontrolü yapar ve puanı günceller
function checkGameStatus() {
    if (paused) return;

    const obstacles = document.querySelectorAll(".obstacle");
    const characterRect = character.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

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
        }

        // Engel ekranı geçtiyse puanı artır
        if (obsRect.right < gameRect.left) {
            score++;
            scoreDisplay.textContent = "Skor: " + score;
            obs.remove(); // Engeli temizle

            // Skora göre hızı artır
            if (score % 5 === 0 && gameSpeed > 1) { // 5'in katlarında hızı artır
                gameSpeed -= 0.1; // Hızı artırmak için süreyi azalt
            }
        }
    });
}

// Oyun bittiğinde yapılacaklar
function gameOver() {
    togglePause(); // Oyunu duraklat
    alert("Oyun bitti! Skor: " + score);
    location.reload();
}

// Oyunu başlat
setupControls(jump);
setInterval(createObstacle, 2000); // Her 2 saniyede yeni engel oluştur
setInterval(checkGameStatus, 50); // Her 50ms'de çarpışma ve puan kontrolü yap
