const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 5,
    dy: 5,
    color: '#000'
};

const playerPaddle = {
    width: 10,
    height: 100,
    x: 10,
    y: canvas.height / 2 - 50,
    color: '#0095DD'
};

const aiPaddle = {
    width: 10,
    height: 100,
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    color: '#FF0000'
};

// Drawing functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(paddle) {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

// Movement and game logic
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collisions
    if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y && ball.y < playerPaddle.y + playerPaddle.height) {
        ball.dx = -ball.dx;
    }

    if (ball.x + ball.radius > aiPaddle.x &&
        ball.y > aiPaddle.y && ball.y < aiPaddle.y + aiPaddle.height) {
        ball.dx = -ball.dx;
    }
}

// Player paddle control
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && playerPaddle.y > 0) {
        playerPaddle.y -= 20;
    }
    if (e.key === 'ArrowDown' && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += 20;
    }
});

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawPaddle(playerPaddle);
    drawPaddle(aiPaddle);

    moveBall();

    requestAnimationFrame(gameLoop);
}

gameLoop();