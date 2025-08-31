// Game elements
const character = document.getElementById("character");
const gameArea = document.getElementById("game"); // Oyun alanı div'i
const scoreDisplay = document.getElementById("score");

// Game state variables
let paused = false;
let score = 0;
let gameSpeed = 3; // Başlangıç oyun hızı (daha düşük değer daha hızlı)
let obstacleGenerationInterval = 2000; // İlk engel oluşum aralığı (ms)
let activeObstacles = []; // Aktif engelleri tutacak dizi
let obstacleTimer; // Engel oluşturma timer'ı
let gameLoopTimer; // Oyun döngüsü timer'ı

// Jump controls
function setupControls(action) {
    document.addEventListener("keydown", e => {
        if ((e.code === "Space" || e.code === "ArrowUp") && !paused) {
            action();
            e.preventDefault(); // Sayfanın kaymasını engelle
        }
    });
    document.addEventListener("click", () => {
        if (!paused) action();
    });
    document.addEventListener("touchstart", () => {
        if (!paused) action();
    });
}

// Toggles game pause state
function togglePause() {
    paused = !paused;
    if (paused) {
        clearInterval(obstacleTimer);
        clearInterval(gameLoopTimer);
        activeObstacles.forEach(obs => obs.element.style.animationPlayState = "paused");
    } else {
        startObstacleGeneration();
        startGameLoop();
        activeObstacles.forEach(obs => obs.element.style.animationPlayState = "running");
    }
}

// Redirects to the home page (örneğin ana menüye döner)
function goHome() {
    // window.location.href = "../index.html"; // Eğer ana menü başka bir sayfadaysa
    alert("Ana menüye dönülüyor...");
    location.reload(); // Şimdilik oyunu yeniden başlatıyor
}

// Makes the character jump
function jump() {
    if (character.classList.contains("jump") || paused) return;
    character.classList.add("jump");
    setTimeout(() => {
        character.classList.remove("jump");
    }, 500); // Zıplama animasyonu süresi
}

// Yeni bir engel oluşturur
function createObstacle() {
    if (paused) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    const obstacleTypes = ["small", "medium", "large"];
    const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    let width, height, bottom;

    if (randomType === "small") {
        obstacle.classList.add("obstacle-small");
        width = 30;
        height = 30;
        bottom = 0; // Zeminde
    } else if (randomType === "medium") {
        obstacle.classList.add("obstacle-medium");
        width = 40;
        height = 60;
        bottom = 0; // Zeminde
    } else { // large
        obstacle.classList.add("obstacle-large");
        width = 50;
        height = 40;
        bottom = 0; // Zeminde
    }

    obstacle.style.width = `${width}px`;
    obstacle.style.height = `${height}px`;
    obstacle.style.bottom = `${bottom}px`;
    obstacle.style.right = `-50px`; // Ekranın sağından başlasın

    gameArea.appendChild(obstacle);
    activeObstacles.push({
        element: obstacle,
        width: width,
        height: height,
        bottom: bottom,
        right: -width // Başlangıçta ekran dışında
    });
}

// Aktif engelleri hareket ettirir ve ekran dışına çıkanları temizler
function moveObstacles() {
    if (paused) return;

    for (let i = 0; i < activeObstacles.length; i++) {
        let obs = activeObstacles[i];
        obs.right += gameSpeed; // Hıza göre sağdan sola hareket
        obs.element.style.right = `${obs.right}px`;

        // Engel ekran dışına çıktıysa temizle ve puanı artır
        if (obs.right > gameArea.offsetWidth + obs.width) {
            gameArea.removeChild(obs.element);
            activeObstacles.splice(i, 1);
            i--; // Dizi elemanı
