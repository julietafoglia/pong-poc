const canvas = document.getElementById("pong");
const video = document.getElementById("myvideo");
const context = canvas.getContext("2d");

const COMPUTER_LEVEL = 0.1;
const FLIPPED_VIDEO = false;

const constraints = {
  audio: true,
  video: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

const detectionCoords = {
  y: 0,
};

const user = {
  x: 0,
  y: canvas.height / 2 - 50,
  width: 10,
  height: 100,
  color: "white",
  score: 0,
};

const com = {
  x: canvas.width - 10,
  y: canvas.height / 2 - 50,
  width: 10,
  height: 100,
  color: "white",
  score: 0,
};

const net = {
  x: canvas.width / 2 - 1,
  y: 0,
  width: 2,
  height: 10,
  color: "white",
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  color: "white",
  speed: 5,
  velocityX: 5,
  velocityY: 5,
};

function drawRect(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

function drawText(text, x, y, color) {
  context.fillStyle = color;
  context.font = "75px Ubuntu";
  context.fillText(text, x, y);
}

function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    drawRect(canvas.width / 2 - 1, net.y + i, net.width, net.height, net.color);
  }
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawNet();
  drawText(user.score, canvas.width / 4, canvas.height / 5, "white");
  drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5, "white");
  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(canvas.width - 10, com.y, com.width, com.height, com.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function movePaddle() {
  let rect = canvas.getBoundingClientRect();
  user.y = detectionCoords.y - rect.top - user.height / 2;
}

function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return (
    b.right > p.left && b.top < p.bottom && b.left < p.right && b.bottom > p.top
  );
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.velocityX = -ball.velocityX;
}

function update() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  com.y = ball.y - (com.y + com.height / 2) * COMPUTER_LEVEL;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }

  let player = ball.x < canvas.width / 2 ? user : com;
  if (collision(ball, player)) {
    let collidePoint = ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    const angleRad = collidePoint * (Math.PI / 4);
    let direction = ball.x < canvas.width / 2 ? 1 : -1;

    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);
    ball.speed += 0.1;
  }

  if (ball.x - ball.radius < 0) {
    com.score++;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    resetBall();
  }
}

function drawDetections(detections) {
  detections.forEach((detection) => {
    const text = detection.class;
    if (text === "cell phone") {
      const [x, y, width, height] = detection.bbox;
      const color = "black";
      context.strokeStyle = color;
      context.font = "18px Arial";
      context.fillStyle = color;

      context.beginPath();
      context.fillText(text, x, y);
      context.rect(x, y, width, height);
      context.stroke();
      detectionCoords.y = y;
      movePaddle();
    }
  });
}

function detect() {
  window.model.detect(video, undefined, 0.5).then((predictions) => {
    drawDetections(predictions);
  });
}

function game() {
  detect();
  update();
  render();
  requestAnimationFrame(game);
}

// Access webcam
async function init() {
  window.model = await cocoSsd.load();
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  if (FLIPPED_VIDEO) {
    video.style.webkitTransform = "scaleX(-1)";
    video.style.transform = "scaleX(-1)";
  }

  game();
}

init();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
