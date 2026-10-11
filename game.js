var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var w = 480;
var h = 640;

var shipX = 240;
var shipY = 590;
var shipSpeed = 5;
var shipSize = 22;
var keys = {};
var bullets = [];
var bulletSpeed = 8;
var fireTimer = 0;
var fireEvery = 15;
var score = 0;
var lives = 3;
var started = false;
var gameOver = false;

var enemies = [];
var enemyCount = 6;

// start screen panel and button
var panelW = 360;
var panelX = (w - panelW) / 2;
var panelY = h / 2 - 140;
var btnX = w / 2 - 80;
var btnY = panelY + 190;
var btnW = 160;
var btnH = 50;

function newEnemy() {
  return {
    x: 30 + Math.random() * (w - 60),
    y: -Math.random() * 300,
    speed: 1 + Math.random() * 2.5,
    size: 20 + Math.random() * 10,
    spin: Math.random() * Math.PI * 2,
    color: Math.random() < 0.5 ? "#a8551c" : "#8a4513"
  };
}

for (var i = 0; i < enemyCount; i++) {
  enemies.push(newEnemy());
}

function resetGame() {
  shipX = 240;
  bullets = [];
  fireTimer = 0;
  score = 0;
  lives = 3;
  gameOver = false;
  enemies = [];
  for (var i = 0; i < enemyCount; i++) {
    enemies.push(newEnemy());
  }
}

document.addEventListener("keydown", function (e) {
  keys[e.key] = true;
  if (e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == " ") {
    e.preventDefault();
  }
  if (!started && (e.key == " " || e.key == "Enter")) {
    started = true;
  }
  if (started && gameOver && e.key == " ") {
    resetGame();
  }
});

document.addEventListener("keyup", function (e) {
  keys[e.key] = false;
});

// clicking the start button
canvas.addEventListener("click", function (e) {
  if (started) {
    return;
  }
  var rect = canvas.getBoundingClientRect();
  var mx = e.clientX - rect.left - canvas.clientLeft;
  var my = e.clientY - rect.top - canvas.clientTop;
  if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
    started = true;
  }
});

function update() {
  if (!started || gameOver) {
    return;
  }

  if (keys["ArrowLeft"]) {
    shipX -= shipSpeed;
  }
  if (keys["ArrowRight"]) {
    shipX += shipSpeed;
  }
  if (shipX < 20) {
    shipX = 20;
  }
  if (shipX > 460) {
    shipX = 460;
  }

  // auto-fire
  fireTimer += 1;
  if (fireTimer >= fireEvery) {
    bullets.push({x: shipX, y: shipY - 20});
    fireTimer = 0;
  }

  // move bullets up
  for (var i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }

  // enemies fall, spin a little for looks
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].y += enemies[i].speed;
    enemies[i].spin += 0.02;

    // got past the ship without being shot: lose a life
    if (enemies[i].y > h + 20) {
      enemies[i] = newEnemy();
      loseLife();
      continue;
    }

    // touched the ship: lose a life
    var dx = enemies[i].x - shipX;
    var dy = enemies[i].y - shipY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < enemies[i].size / 2 + shipSize / 2) {
      enemies[i] = newEnemy();
      loseLife();
    }
  }

  // bullet hits an enemy
  for (var b = bullets.length - 1; b >= 0; b--) {
    for (var e = 0; e < enemies.length; e++) {
      var dx = bullets[b].x - enemies[e].x;
      var dy = bullets[b].y - enemies[e].y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < enemies[e].size / 2 + 6) {
        enemies[e] = newEnemy();
        bullets.splice(b, 1);
        score += 10;
        break;
      }
    }
  }
}

function loseLife() {
  lives -= 1;
  if (lives <= 0) {
    lives = 0;
    gameOver = true;
  }
}

function drawShip() {
  ctx.save();
  ctx.translate(shipX, shipY);

  // engine glow
  ctx.fillStyle = "#ff9d3c";
  ctx.beginPath();
  ctx.moveTo(-8, 18);
  ctx.lineTo(0, 32);
  ctx.lineTo(8, 18);
  ctx.fill();

  // wings
  ctx.fillStyle = "#1b6fa8";
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.lineTo(-26, 22);
  ctx.lineTo(-6, 18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, 8);
  ctx.lineTo(26, 22);
  ctx.lineTo(6, 18);
  ctx.fill();

  // body
  ctx.fillStyle = "#3ad1e0";
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-13, 20);
  ctx.lineTo(13, 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0f7a87";
  ctx.lineWidth = 2;
  ctx.stroke();

  // cockpit
  ctx.fillStyle = "#e8faff";
  ctx.beginPath();
  ctx.ellipse(0, -3, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(e.spin);

  // rocky lumpy shape, drawn as a wobbly circle
  ctx.fillStyle = e.color;
  ctx.beginPath();
  var points = 8;
  for (var p = 0; p <= points; p++) {
    var angle = (p / points) * Math.PI * 2;
    var wobble = (p % 2 == 0) ? 1 : 0.8;
    var r = (e.size / 2) * wobble;
    var px = Math.cos(angle) * r;
    var py = Math.sin(angle) * r;
    if (p == 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5c2d0c";
  ctx.lineWidth = 2;
  ctx.stroke();

  // craters
  ctx.fillStyle = "#5c2d0c";
  ctx.beginPath();
  ctx.arc(-e.size * 0.15, -e.size * 0.1, e.size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(e.size * 0.18, e.size * 0.15, e.size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  drawShip();

  // bullets
  ctx.fillStyle = "yellow";
  for (var i = 0; i < bullets.length; i++) {
    ctx.fillRect(bullets[i].x - 2, bullets[i].y - 8, 4, 16);
  }

  // enemies
  for (var i = 0; i < enemies.length; i++) {
    drawEnemy(enemies[i]);
  }

  // score
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 15, 30);

  // hearts
  for (var i = 0; i < lives; i++) {
    var hx = w - 30 - i * 32;
    var hy = 22;
    ctx.fillStyle = "#e62840";
    ctx.beginPath();
    ctx.arc(hx - 5, hy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + 5, hy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 11, hy + 2);
    ctx.lineTo(hx + 11, hy + 2);
    ctx.lineTo(hx, hy + 14);
    ctx.fill();
  }

  if (!started) {
    // start screen
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, 280, 15);
    ctx.fill();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.fillText("SPACE SHOOTER", w / 2, panelY + 50);
    ctx.font = "20px Arial";
    ctx.fillText("Use arrow keys to move", w / 2, panelY + 100);
    ctx.fillText("Your ship fires on its own", w / 2, panelY + 130);

    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 10);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "bold 26px Arial";
    ctx.fillText("START", w / 2, btnY + 33);
    ctx.fillStyle = "#c8c8c8";
    ctx.font = "14px Arial";
    ctx.fillText("or press SPACE", w / 2, btnY + 75);
  } else if (gameOver) {
    var boxW = 360;
    var boxX = (w - boxW) / 2;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.roundRect(boxX, h / 2 - 90, boxW, 180, 15);
    ctx.fill();
    ctx.strokeStyle = "#e62840";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 44px Arial";
    ctx.fillText("GAME OVER", w / 2, h / 2 - 40);
    ctx.font = "22px Arial";
    ctx.fillText("Final score: " + score, w / 2, h / 2 + 10);
    ctx.fillStyle = "#c8c8c8";
    ctx.font = "18px Arial";
    ctx.fillText("Press SPACE to play again", w / 2, h / 2 + 50);
  }
}

setInterval(function () {
  update();
  draw();
}, 16);
