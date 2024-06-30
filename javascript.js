const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas for bug image layer
const bugCanvas = document.createElement("canvas");
const bugCtx = bugCanvas.getContext("2d");

// Dimensions and positions
const wires = [100, 200, 300, 400];
const wireSpacing = 100;
const birdWidth = 60;
const birdHeight = 60;
const bugWidth = 30; // Adjusted width
const bugHeight = 30; // Adjusted height

// Calculate initial bugY position to align center with wire
let bugY = canvas.height - bugHeight - 40; // Adjusted initial y position

// Calculate initial bugX position to center with middle wire
let middleWireIndex = Math.floor(wires.length / 2);
let bugX = wires[middleWireIndex] - bugWidth / 2;

let gameOver = false;
let score = 0;
let isPaused = false; // Variable to track if the game is paused

// Birds array and interval
const birds = [];
const birdInterval = 2000;
let birdSpeed = 3; // Initial bird speed

// Bug and bird images
const bugImage = new Image();
bugImage.src = "bug.png"; 

const birdImage = new Image();
birdImage.src = "bird.png";

// Background music
const backgroundMusic = new Audio("back123.mp3"); 
backgroundMusic.loop = true; // Loop the background music
backgroundMusic.volume = 0.5; 

// Eagle sound effect
const eagleSound = new Audio("eagle.mp3"); 

// Function to play background music
function playBackgroundMusic() {
  backgroundMusic.play().catch((error) => {
    console.error("Error playing background music:", error);
  });
}

// Function to play eagle sound
function playEagleSound() {
  eagleSound.currentTime = 0; // Reset the sound to the beginning to allow rapid replay
  eagleSound.play().catch((error) => {
    console.error("Error playing eagle sound:", error);
  });
}

// Function to draw bug on bug canvas
function drawBug() {
  bugCtx.clearRect(0, 0, bugCanvas.width, bugCanvas.height); // Clear bug canvas
  bugCtx.drawImage(bugImage, 0, 0, bugWidth, bugHeight); // Draw bug image
}

// Function to draw birds
function drawBird(bird) {
  ctx.drawImage(birdImage, bird.x, bird.y, birdWidth, birdHeight);
}

// Function to draw wires
function drawWires() {
  ctx.strokeStyle = "grey";
  ctx.lineWidth = 5;
  wires.forEach((wire) => {
    ctx.beginPath();
    ctx.moveTo(wire, 0);
    ctx.lineTo(wire, canvas.height);
    ctx.stroke();
  });
}

// Function to update bird positions and check proximity
function updateBirds() {
  for (let i = 0; i < birds.length; i++) {
    birds[i].y += birdSpeed;

    // Calculate distance between bug and bird
    const distanceX = Math.abs(birds[i].x - bugX);
    const distanceY = Math.abs(birds[i].y - bugY);

    // Trigger eagle sound if bird is close enough to bug
    if (distanceX < bugWidth && distanceY < 50) {
      playEagleSound();
    }

    if (birds[i].y > canvas.height) {
      birds.splice(i, 1);
      score++;
      updateScore(); // Update the score display
    }
  }

  // Increase bird speed every 10 score
  if (score % 10 === 0 && score !== 0) {
    birdSpeed += 0.005; // Increase bird speed
  }
}

// Function to update score display
function updateScore() {
  document.getElementById("score").textContent = "Score: " + score;
}

// Function to check collision between bug and birds
function checkCollision() {
  for (let i = 0; i < birds.length; i++) {
    if (
      bugX <= birds[i].x + birdWidth &&
      bugX + bugWidth >= birds[i].x &&
      bugY <= birds[i].y + birdHeight - 15 &&
      bugY + bugHeight > birds[i].y
    ) {
      gameOver = true;
      break; // Exit loop on collision
    }
  }
}

// Function to spawn birds randomly
function spawnBird() {
  if (!isPaused) {
    const wireIndex = Math.floor(Math.random() * wires.length);
    birds.push({ x: wires[wireIndex] - birdWidth / 2, y: 0 });
  }
}

// Function for game loop
function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 75, canvas.height / 2 - 30);
    ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2 + 10);

    // Show restart button
    showRestartButton();

    // Pause background music on game over
    backgroundMusic.pause();

    return;
  }

  if (!isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWires();
    drawBug();
    birds.forEach(drawBird);

    updateBirds();
    checkCollision();

    // Draw bug canvas on main canvas
    ctx.drawImage(bugCanvas, bugX, bugY, bugWidth, bugHeight);
  }

  requestAnimationFrame(gameLoop);
}

// Function to show start screen
function showStartScreen() {
  const startButton = document.createElement("button");
  startButton.textContent = "Start Game";
  startButton.style.position = "absolute";
  startButton.style.top = "50%";
  startButton.style.left = "50%";
  startButton.style.transform = "translate(-50%, -50%)";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "16px";
  startButton.style.cursor = "pointer";
  startButton.addEventListener("click", () => {
    startGame();
    startButton.remove();
  });
  canvas.parentNode.appendChild(startButton); // Append to canvas parent to overlay on game
}

// Function to start the game
function startGame() {
  // Set bug canvas size to bug image size
  bugCanvas.width = bugWidth;
  bugCanvas.height = bugHeight;

  // Draw bug initially
  drawBug();

  // Start game loop
  gameLoop();

  // Play background music
  playBackgroundMusic();
}

// Event listener for key presses
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && bugX > wires[0]) {
    bugX -= wireSpacing;
  } else if (e.key === "ArrowRight" && bugX < wires[wires.length - 1]) {
    bugX += wireSpacing;
  } else if (e.key === "p" || e.key === "P") {
    togglePause();
  }

  // Ensure bug stays within the middle wires
  if (bugX < wires[0]) {
    bugX = wires[0] - bugWidth / 2;
  } else if (bugX > wires[wires.length - 1]) {
    bugX = wires[wires.length - 1] - bugWidth / 2;
  }
});

// Function to toggle pause state
function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    backgroundMusic.pause();
  } else {
    playBackgroundMusic();
  }
}

// Interval to spawn birds
setInterval(spawnBird, birdInterval);

// When bug image is loaded, show start screen
bugImage.onload = () => {
  showStartScreen();
};

// Function to show restart button
function showRestartButton() {
  const restartButton = document.createElement("button");
  restartButton.textContent = "Restart Game";
  restartButton.style.position = "absolute";
  restartButton.style.top = "60%";
  restartButton.style.left = "50%";
  restartButton.style.transform = "translate(-50%, -50%)";
  restartButton.style.padding = "10px 20px";
  restartButton.style.fontSize = "16px";
  restartButton.style.cursor = "pointer";
  restartButton.addEventListener("click", () => {
    restartGame();
    restartButton.remove();
  });
  canvas.parentNode.appendChild(restartButton); // Append to canvas parent to overlay on game
}

// Function to restart the game
function restartGame() {
  // Reset game variables
  gameOver = false;
  score = 0;
  birds.length = 0; // Clear birds array
  birdSpeed = 3; // Reset bird speed

  // Remove game over elements
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update score display
  updateScore();

  // Restart game loop and background music
  gameLoop();
  playBackgroundMusic();
}
