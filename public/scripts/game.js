class PingPongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.initializeGame();
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
        this.tableDepth = 200;
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            z: 0,
            radius: 10,
            dx: 7,
            dy: 0,
            dz: 2
        };

        this.paddles = {
            left: {
                x: 60,
                y: this.canvas.height / 2,
                z: 0,
                width: 20,
                height: 100,
                color: '#e74c3c'
            },
            right: {
                x: this.canvas.width - 60,
                y: this.canvas.height / 2,
                z: 0,
                width: 20,
                height: 100,
                color: '#3498db'
            }
        };
    }

    update() {
        this.updateBall();
        this.updatePaddles();
    }

    updateBall() {
        // Update position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        this.ball.z += this.ball.dz;

        // Add gravity
        this.ball.dy += 0.3;

        // Table bounds
        if (this.ball.y > this.canvas.height - this.ball.radius) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.dy *= -0.8;
        }

        // Z-axis bounds
        if (Math.abs(this.ball.z) > this.tableDepth/2) {
            this.ball.z = Math.sign(this.ball.z) * this.tableDepth/2;
            this.ball.dz *= -1;
        }

        // Check for paddle hits
        this.checkPaddleCollisions();

        // Reset if out of bounds
        if (this.ball.x < 0 || this.ball.x > this.canvas.width) {
            this.resetBall();
        }
    }

    checkPaddleCollisions() {
        ['left', 'right'].forEach(side => {
            const paddle = this.paddles[side];
            const ballInXRange = side === 'left' ?
                this.ball.x < paddle.x + paddle.width :
                this.ball.x > paddle.x - paddle.width;

            if (ballInXRange &&
                Math.abs(this.ball.y - paddle.y) < paddle.height/2 &&
                Math.abs(this.ball.z - paddle.z) < 30) {
                
                this.ball.dx *= -1.1;
                this.ball.dz = (Math.random() - 0.5) * 8;
                this.ball.x = side === 'left' ? 
                    paddle.x + paddle.width + this.ball.radius :
                    paddle.x - paddle.width - this.ball.radius;
            }
        });
    }

    updatePaddles() {
        ['left', 'right'].forEach(side => {
            const paddle = this.paddles[side];
            
            // AI movement
            const targetY = this.ball.dx * (side === 'left' ? -1 : 1) > 0 ?
                this.canvas.height / 2 :
                this.ball.y + this.ball.dy * 15;

            paddle.y += (targetY - paddle.y) * 0.1;

            // Z movement
            if (Math.abs(this.ball.x - paddle.x) < 200) {
                paddle.z = Math.sin(Date.now() / 500) * this.tableDepth/4;
            } else {
                paddle.z *= 0.95;
            }
        });
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.z = 0;
        this.ball.dy = 0;
        this.ball.dx *= -1;
        this.ball.dz = (Math.random() - 0.5) * 4;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paddles
        ['left', 'right'].forEach(side => {
            const paddle = this.paddles[side];
            const projected = project3Dto2D(paddle.x, paddle.y, paddle.z);
            
            // Draw shadow
            createShadow(
                this.ctx,
                paddle.x,
                paddle.y + paddle.height/2,
                paddle.width * projected.scale,
                paddle.height * projected.scale
            );

            // Draw paddle
            this.ctx.fillStyle = paddle.color;
            this.ctx.fillRect(
                projected.x - (paddle.width * projected.scale)/2,
                projected.y - (paddle.height * projected.scale)/2,
                paddle.width * projected.scale,
                paddle.height * projected.scale
            );
        });

        // Draw ball
        const ballProjected = project3Dto2D(this.ball.x, this.ball.y, this.ball.z);
        
        // Ball shadow
        createShadow(
            this.ctx,
            this.ball.x,
            this.ball.y + this.ball.radius,
            this.ball.radius * 2 * ballProjected.scale,
            this.ball.radius * 2 * ballProjected.scale
        );

        // Ball
        this.ctx.beginPath();
        this.ctx.arc(
            ballProjected.x,
            ballProjected.y,
            this.ball.radius * ballProjected.scale,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
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