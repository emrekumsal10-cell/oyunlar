// Game elements
const character = document.getElementById("character");
const block = document.getElementById("block");
const scoreDisplay = document.getElementById("score");

// Game state variables
let paused = false;
let score = 0;
let animationSpeed = 2; // Initial animation speed in seconds

// Set up jump controls
function setupControls(action) {
    document.addEventListener("keydown", e => {
        if (e.code === "Space" || e.code === "ArrowUp") action();
    });
    document.addEventListener("click", () => action());
    document.addEventListener("touchstart", () => action());
}

// Toggles game pause state
function togglePause() {
    paused = !paused;
    block.style.animationPlayState = paused ? "paused" : "running";
}

// Redirects to the home page
function goHome() {
    window.location.href = "../index.html";
}

// Makes the character jump
function jump() {
    if (character.classList.contains("jump") || paused) return;
    character.classList.add("jump");
    setTimeout(() => {
        character.classList.remove("jump");
    }, 500);
}

// Check for collisions and update score
function checkGameStatus() {
    if (paused) return;

    let characterBottom = parseInt(window.getComputedStyle(character).getPropertyValue("bottom"));
    let blockRight = parseInt(window.getComputedStyle(block).getPropertyValue("right"));

    // Collision detection
    // The character's left is at 60px, so we check if the block's right side is near it.
    if (blockRight >= 600 && blockRight <= 640 && characterBottom <= 40) {
        gameOver();
    }
    // Score update when the block passes the character
    else if (blockRight > 640) {
        score++;
        scoreDisplay.textContent = "Skor: " + score;

        // Increase speed every 5 points
        if (score % 5 === 0) {
            animationSpeed -= 0.1; // Decrease animation time
            if (animationSpeed < 1) animationSpeed = 1; // Prevent it from getting too fast
            block.style.animationDuration = animationSpeed + "s";
        }
    }
}

// Game over logic
function gameOver() {
    alert("Oyun bitti! Skor: " + score);
    location.reload();
}

// Initialize game
setupControls(jump);
setInterval(checkGameStatus, 50);
