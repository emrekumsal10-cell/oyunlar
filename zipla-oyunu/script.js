const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Karakter
let bird = {
  x: 50,
  y: 300,
  width: 30,
  height: 30,
  velocity: 0
};

const gravity = 0.18;
const jumpStrength = -6.5;

// Borular
let pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
let frame = 0;

// Oyun durumu
let score = 0;
let gameOver = false;

// Kontroller (PC + Mobil)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") bird.velocity = jumpStrength;
});

canvas.addEventListener("touchstart", () => {
  bird.velocity = jumpStrength;
});

// Yeniden Başlatma
const gameOverDiv = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

restartBtn.addEventListener("click", restartGame);

function restartGame() {
  bird.y = 300;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  gameOverDiv.style.display = "none";
  requestAnimationFrame(update);
}

// Boru oluştur
function createPipe() {
  const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - pipeGap
  });
}

// Çizimler
function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
  });
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Skor: " + score, 10, 30);
}

// Ana oyun döngüsü
function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (frame % 90 === 0) createPipe();

  pipes.forEach(pipe => {
    pipe.x -= 2;

    if (bird.x < pipe.x + pipeWidth &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
      endGame();
    }

    if (pipe.x + pipeWidth === bird.x) score++;
  });

  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    endGame();
  }

  drawBird();
  drawPipes();
  drawScore();

  frame++;
  requestAnimationFrame(update);
}

// Oyun bitişi
function endGame() {
  gameOver = true;
  gameOverDiv.style.display = "block";
}

// Başlat
update();
