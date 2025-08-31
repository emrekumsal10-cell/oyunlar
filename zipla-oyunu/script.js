const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let bird, pipes, score, gameOver;
const gravity = 0.18;       // daha yavaş düşüş
const jumpStrength = -5.5;  // daha az zıplama
const pipeWidth = 60;
const pipeGap = 140;

// Kuş
function createBird() {
  return { x: 50, y: 150, width: 30, height: 30, velocity: 0 };
}

// Borular
function createPipe() {
  const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
  return { x: canvas.width, top: topHeight, bottom: topHeight + pipeGap };
}

// Reset
function resetGame() {
  bird = createBird();
  pipes = [];
  score = 0;
  gameOver = false;
  document.getElementById("gameOver").style.display = "none";
  loop();
}

// Çizim
function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Skor: " + score, 10, 30);
}

// Güncelleme
function update() {
  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
  }

  pipes.forEach(pipe => {
    pipe.x -= 2;
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ) {
      gameOver = true;
    }
  });

  if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
    score++;
  }

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
    pipes.push(createPipe());
  }
}

// Döngü
function loop() {
  if (gameOver) {
    document.getElementById("gameOver").style.display = "block";
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawBird();
  drawPipes();
  drawScore();
  requestAnimationFrame(loop);
}

// Zıplama
function jump() {
  if (!gameOver) {
    bird.velocity = jumpStrength;
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

// Mobil dokunma desteği
canvas.addEventListener("touchstart", jump);

// Restart butonu
document.getElementById("restartBtn").addEventListener("click", resetGame);

// Başlat
resetGame();
