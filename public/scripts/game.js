class PingPongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.initializeGame();
        this.particles = [];
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }

    initializeGame() {
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            dx: 5,
            dy: 2
        };

        this.paddles = {
            left: { y: this.canvas.height / 2, height: 100, width: 10 },
            right: { y: this.canvas.height / 2, height: 100, width: 10 }
        };
    }

    update() {
        this.updateBall();
        this.updatePaddles();
        this.particles = updateParticles(this.particles);
    }

    updateBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Add gravity effect
        this.ball.dy += 0.15;

        // Bounce off top and bottom
        if (this.ball.y + this.ball.radius > this.canvas.height || 
            this.ball.y - this.ball.radius < 0) {
            this.ball.dy *= -0.8;
        }

        // Paddle collisions
        if (this.checkPaddleCollision()) {
            this.particles = this.particles.concat(
                createParticles(this.ball.x, this.ball.y, 10)
            );
        }

        // Reset if ball goes out
        if (this.ball.x > this.canvas.width || this.ball.x < 0) {
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.dy = 2;
            this.ball.dx *= -1;
        }
    }

    updatePaddles() {
        // AI movement with anticipation
        const anticipationOffset = 20;
        const leftTarget = this.ball.dx < 0 ? 
            this.ball.y + (this.ball.dy * anticipationOffset) : 
            this.canvas.height / 2;
        const rightTarget = this.ball.dx > 0 ? 
            this.ball.y + (this.ball.dy * anticipationOffset) : 
            this.canvas.height / 2;

        this.paddles.left.y += (leftTarget - this.paddles.left.y) * 0.1;
        this.paddles.right.y += (rightTarget - this.paddles.right.y) * 0.1;
    }

    checkPaddleCollision() {
        const leftPaddle = this.paddles.left;
        const rightPaddle = this.paddles.right;

        if (this.ball.x - this.ball.radius < 30 && 
            this.ball.y > leftPaddle.y - leftPaddle.height/2 && 
            this.ball.y < leftPaddle.y + leftPaddle.height/2) {
            this.ball.dx = Math.abs(this.ball.dx) * 1.1;
            return true;
        }

        if (this.ball.x + this.ball.radius > this.canvas.width - 30 && 
            this.ball.y > rightPaddle.y - rightPaddle.height/2 && 
            this.ball.y < rightPaddle.y + rightPaddle.height/2) {
            this.ball.dx = -Math.abs(this.ball.dx) * 1.1;
            return true;
        }

        return false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paddles
        this.ctx.fillStyle = '#fff';
        ['left', 'right'].forEach(side => {
            const paddle = this.paddles[side];
            const x = side === 'left' ? 20 : this.canvas.width - 30;
            this.ctx.fillRect(
                x, 
                paddle.y - paddle.height/2, 
                paddle.width, 
                paddle.height
            );
        });

        // Draw ball with shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw particles
        drawParticles(this.ctx, this.particles);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    new PingPongGame(canvas);
};