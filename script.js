// 🎵 Background Music Setup
const backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

document.addEventListener('click', () => {
  backgroundMusic.play().catch(() => {});
});

let leftArrowPressed = false;
let rightArrowPressed = false;
const moveSpeed = 4;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let doodler, platforms = [], powerUps = [], obstacles = [];
let isPaused = false, gameStarted = false;
let animationFrameId = null;
let score = 0;

function resetDoodler() {
  doodler = {
    x: 200,
    y: 450,
    width: 40,
    height: 40,
    dy: -8,
    gravity: 0.3,
    jumpPower: -8
  };
}

function createPlatforms() {
  platforms = [];
  for (let i = 0; i < 8; i++) {
    platforms.push({
      x: 100 + Math.random() * 120,
      y: 600 - i * 70,
      width: 80,
      height: 10
    });
  }

  const firstPlatform = platforms[0];
  doodler.x = firstPlatform.x + firstPlatform.width / 2 - doodler.width / 2;
  doodler.y = firstPlatform.y - doodler.height;
}

function drawDoodler() {
  ctx.fillStyle = "green";
  ctx.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);
}

function drawPlatforms() {
  ctx.fillStyle = "brown";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));
}

function drawPowerUps() {
  ctx.fillStyle = "gold";
  powerUps.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawObstacles() {
  ctx.fillStyle = "red";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.width, o.height);
  });
}

function spawnPowerUp(y) {
  if (Math.random() < 0.08) {
    powerUps.push({
      x: Math.random() * (canvas.width - 40),
      y: y,
      radius: 20
    });
  }
}

function spawnObstacle(y) {
  const spawnChance = Math.min(0.1 + score / 200, 0.4);
  if (Math.random() < spawnChance) {
    obstacles.push({
      x: Math.random() * (canvas.width - 40),
      y: y,
      width: 40,
      height: 10
    });
  }
}

function update() {
  if (!gameStarted || isPaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (leftArrowPressed) doodler.x -= moveSpeed;
  if (rightArrowPressed) doodler.x += moveSpeed;

  // Wrap
  if (doodler.x + doodler.width < 0) doodler.x = canvas.width;
  if (doodler.x > canvas.width) doodler.x = -doodler.width;

  // Gravity
  doodler.dy += doodler.gravity;
  doodler.y += doodler.dy;

  // Platform collision
  platforms.forEach(p => {
    if (
      doodler.x + doodler.width > p.x &&
      doodler.x < p.x + p.width &&
      doodler.y + doodler.height > p.y &&
      doodler.y + doodler.height < p.y + p.height &&
      doodler.dy > 0
    ) {
      doodler.dy = doodler.jumpPower;
    }
  });

  // Power-up collision
  powerUps = powerUps.filter(p => {
    const distX = doodler.x + doodler.width / 2 - p.x;
    const distY = doodler.y + doodler.height / 2 - p.y;
    if (Math.sqrt(distX * distX + distY * distY) < doodler.width / 2 + p.radius) {
      doodler.dy = -14;
      return false;
    }
    return true;
  });

  // Obstacle collision
  for (let ob of obstacles) {
    if (
      doodler.x + doodler.width > ob.x &&
      doodler.x < ob.x + ob.width &&
      doodler.y + doodler.height > ob.y &&
      doodler.y < ob.y + ob.height
    ) {
      gameOver();
      return;
    }
  }

  // Scrolling
  if (doodler.y < 300) {
    const dy = Math.abs(doodler.dy);
    doodler.y = 300;
    platforms.forEach(p => p.y += dy);
    powerUps.forEach(p => p.y += dy);
    obstacles.forEach(o => o.y += dy);
    score++;
  }

  // Recycle platforms
  if (platforms[0].y > canvas.height) {
    platforms.shift();
    const newY = platforms[platforms.length - 1].y - 70;
    platforms.push({
      x: 100 + Math.random() * 120,
      y: newY,
      width: 80,
      height: 10
    });
    spawnPowerUp(newY - 40);
    spawnObstacle(newY - 60);
  }

  drawPlatforms();
  drawDoodler();
  drawPowerUps();
  drawObstacles();

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  if (doodler.y > canvas.height) {
    gameOver();
    return;
  }

  animationFrameId = requestAnimationFrame(update);
}

function gameOver() {
  alert("Game Over! Your score: " + score);
  exitGame();
}

function startGame() {
  backgroundMusic.play();
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("mobilePause").style.display = "inline";
  resetDoodler();
  createPlatforms();
  powerUps = [];
  obstacles = [];
  score = 0;
  gameStarted = true;
  isPaused = false;
  update();
}

function togglePause() {
  if (!gameStarted) return;
  isPaused = !isPaused;
  if (!isPaused) update();
}

function exitGame() {
  gameStarted = false;
  isPaused = false;
  cancelAnimationFrame(animationFrameId);
  canvas.style.display = "none";
  document.getElementById("menu").style.display = "block";
  document.getElementById("mobilePause").style.display = "none";
}

// 🎶 Toggle music button function (optional)
function toggleMusic() {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    alert("Music ON 🎵");
  } else {
    backgroundMusic.pause();
    alert("Music OFF 🔇");
  }
}

// Touch controls
let touchX = null;
canvas.addEventListener("touchstart", e => {
  touchX = e.touches[0].clientX;
});
canvas.addEventListener("touchmove", e => {
  if (!gameStarted || isPaused) return;
  const deltaX = e.touches[0].clientX - touchX;
  doodler.x += deltaX;
  touchX = e.touches[0].clientX;
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") leftArrowPressed = true;
  if (e.key === "ArrowRight") rightArrowPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") leftArrowPressed = false;
  if (e.key === "ArrowRight") rightArrowPressed = false;
});
