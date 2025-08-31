let paused = false;
let score = 0;
let lives = 3;
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const livesContainer = document.getElementById("lives-container");

function updateLivesDisplay() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.classList.add('heart');
        heart.textContent = '❤️';
        livesContainer.appendChild(heart);
    }
}

function togglePause() {
    paused = !paused;
}

function goHome() {
    window.location.href = "../index.html";
}

function createBalloon() {
    if (paused) return;

    const balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.style.left = Math.random() * (game.offsetWidth - 50) + "px";
    game.appendChild(balloon);

    // Hızı skora göre ayarla
    let speed = 2 + Math.floor(score / 5);

    const move = setInterval(() => {
        if (paused) return;

        let bottom = parseInt(window.getComputedStyle(balloon).getPropertyValue("bottom"));
        
        if (bottom > game.offsetHeight) {
            balloon.remove();
            clearInterval(move);
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                alert(`Game Over! Son Skor: ${score}`);
                window.location.reload();
            }
        } else {
            balloon.style.bottom = bottom + speed + "px";
        }
    }, 20);

    const popBalloon = () => {
        if (paused) return;
        score++;
        scoreDisplay.textContent = "Skor: " + score;
        balloon.remove();
        clearInterval(move);
    };

    balloon.addEventListener("click", popBalloon);
    balloon.addEventListener("touchstart", popBalloon);
}

updateLivesDisplay();
setInterval(createBalloon, 1000);
