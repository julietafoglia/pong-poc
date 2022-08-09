const canvas = document.getElementById("pong");
const detectionCanvas = document.getElementById("canvas");
const video = document.getElementById("myvideo");
const context = canvas.getContext("2d");
const detectionContext = detectionCanvas.getContext("2d");
canvas.addEventListener("mousemove", movePaddle);
let computerLevel = 0.1;
let rectX = 0;
const fps = 50;

const constraints = {
  audio: true,
  video: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
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
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  drawNet();
  drawText(user.score, canvas.width / 4, canvas.height / 5, "white");
  drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5, "white");
  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(canvas.width - 10, com.y, com.width, com.height, com.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function movePaddle(evt) {
  let rect = canvas.getBoundingClientRect();
  user.y = evt.clientY - rect.top - user.height / 2;
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

  com.y = ball.y - (com.y + com.height / 2) * computerLevel;

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
    const [x, y, width, height] = detection.bbox;
    const text = detection.class;

    if (text === "cell phone") {
      console.log("cell phone");
      const color = "black";
      detectionContext.strokeStyle = color;
      detectionContext.font = "18px Arial";
      detectionContext.fillStyle = color;

      detectionContext.beginPath();
      detectionContext.fillText(text, x, y);
      detectionContext.rect(x, y, width, height);
      detectionContext.stroke();
    }
  });
}

function detect() {
  cocoSsd.load().then((model) => {
    model.detect(video).then((predictions) => {
      drawDetections(predictions);
    });
  });
}

function game() {
  detect();
  update();
  render();
}

// Access webcam
async function init() {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  window.stream = stream;
  video.srcObject = stream;
}

init();
detect();
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
setInterval(game, 1000 / fps);
