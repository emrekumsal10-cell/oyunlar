const gameArea = document.getElementById("game");
const character = document.getElementById("character");
const scoreDisplay = document.getElementById("score");

let paused = false;
let score = 0;
let gameSpeed = 2; // Initial obstacle animation speed (seconds)
let lastObstacleTime = 0;
let minObstacleGap = 1500; // Minimum gap between obstacles in milliseconds

// Toggles game pause state
function togglePause() {
    paused = !paused;
    const obstacles = document.querySelectorAll(".obstacle");
    obstacles.forEach(obs => {
        obs.style.animationPlayState = paused ? "paused" : "running";
    });
}

// Redirects to home (for example, a main menu)
function goHome() {
    // window.location.href = "../index.html";
    alert("Ana menüye dönülüyor...");
    location.reload();
}

// Makes the character jump
function jump() {
    if (character.classList.contains("jump") || paused) return;
    character.classList.add("jump");
    setTimeout(() => {
        character.classList.remove("jump");
    }, 500);
}

// Creates an obstacle
function createObstacle() {
    if (paused) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    const isTopObstacle = Math.random() > 0.5;
    const height = Math.floor(Math.random() * 80) + 40; // Random height between 40px and 120px
    obstacle.style.height = `${height}px`;
    obstacle.style.width = `40px`;
    
    if (isTopObstacle) {
        obstacle.classList.add("obstacle-top");
        obstacle.style.bottom = `${gameArea.clientHeight - height}px`;
    } else {
        obstacle.style.bottom = "0px";
    }

    obstacle.style.animationDuration = `${gameSpeed}s`;
    gameArea.appendChild(obstacle);
}

// Checks for collisions and updates score
function checkGameStatus() {
    if (paused) return;
    
    // Create new obstacle if gap is sufficient
    const now = Date.now();
    if (now - lastObstacleTime > minObstacleGap) {
        createObstacle();
        lastObstacleTime = now;
        minObstacleGap = Math.max(700, 1500 - score * 20); // Decrease gap as score increases
    }

    const characterRect = character.getBoundingClientRect();
    const obstacles = document.querySelectorAll(".obstacle");

    obstacles.forEach(obs => {
        const obsRect = obs.getBoundingClientRect();
        
        // Check for collision
        if (
            characterRect.right > obsRect.left &&
            characterRect.left < obsRect.right &&
            characterRect.bottom > obsRect.top &&
            characterRect.top < obsRect.bottom
        ) {
            gameOver();
        }

        // Check if obstacle has passed
        if (obs.passed === undefined && obsRect.right < characterRect.left) {
            score++;
            scoreDisplay.textContent = `Skor: ${score}`;
            obs.passed = true;
            
            // Speed up the game every 5 points
            if (score % 5 === 0 && gameSpeed > 1) {
                gameSpeed -= 0.1;
                document.querySelectorAll(".obstacle").forEach(o => {
                    o.style.animationDuration = `${gameSpeed}s`;
                });
            }
        }
        
        // Remove obstacles that are off-screen
        if (obsRect.right < 0) {
            obs.remove();
        }
    });
}

// Game over logic
function gameOver() {
    togglePause();
    alert(`Oyun bitti! Skor: ${score}`);
    location.reload();
}

// Initialize game
setupControls(jump);
setInterval(checkGameStatus, 50);
