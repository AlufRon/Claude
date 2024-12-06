class PingPongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.projectionMatrix = createProjectionMatrix(canvas.width / canvas.height);
        this.initializeGame();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    initializeGame() {
        this.paddles = {
            left: {
                x: 0.3,
                y: TABLE.HEIGHT + PADDLE.HEAD_DIAMETER/2,
                z: TABLE.WIDTH/2,
                rotation: -15 * Math.PI/180,
                isRed: true
            },
            right: {
                x: TABLE.LENGTH - 0.3,
                y: TABLE.HEIGHT + PADDLE.HEAD_DIAMETER/2,
                z: TABLE.WIDTH/2,
                rotation: 195 * Math.PI/180,
                isRed: false
            }
        };

        this.ball = {
            x: TABLE.LENGTH/2,
            y: TABLE.HEIGHT + BALL.DIAMETER/2,
            z: TABLE.WIDTH/2,
            dx: BALL.INITIAL_SPEED,
            dy: 0,
            dz: 0
        };
    }

    drawPaddle(paddle) {
        const projected = project3Dto2D(
            {x: paddle.x, y: paddle.y, z: paddle.z},
            this.projectionMatrix
        );
        
        this.ctx.save();
        this.ctx.translate(projected.x, projected.y);
        this.ctx.rotate(paddle.rotation);

        // Draw paddle shadow
        this.ctx.save();
        this.ctx.translate(0, PADDLE.HEAD_DIAMETER * projected.scale * 0.5);
        this.ctx.scale(1, 0.5);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, PADDLE.HEAD_DIAMETER * projected.scale * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fill();
        this.ctx.restore();

        // Draw paddle head and handle
        drawPaddleShape(
            this.ctx,
            0,
            0,
            projected.scale,
            paddle.isRed
        );

        this.ctx.restore();
    }

    drawBall() {
        const projected = project3Dto2D(
            {x: this.ball.x, y: this.ball.y, z: this.ball.z},
            this.projectionMatrix
        );

        // Ball shadow
        this.ctx.beginPath();
        this.ctx.ellipse(
            projected.x,
            projected.y + (BALL.DIAMETER * projected.scale),
            BALL.DIAMETER * projected.scale,
            BALL.DIAMETER * projected.scale * 0.4,
            0, 0, Math.PI * 2
        );
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fill();

        // Ball with highlight
        this.ctx.beginPath();
        this.ctx.arc(
            projected.x,
            projected.y,
            BALL.DIAMETER * projected.scale,
            0, Math.PI * 2
        );
        const gradient = this.ctx.createRadialGradient(
            projected.x - BALL.DIAMETER * projected.scale * 0.3,
            projected.y - BALL.DIAMETER * projected.scale * 0.3,
            0,
            projected.x,
            projected.y,
            BALL.DIAMETER * projected.scale
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Floor gradient
        const floorGradient = this.ctx.createLinearGradient(
            0, this.canvas.height,
            0, this.canvas.height * 0.7
        );
        floorGradient.addColorStop(0, '#1a1a1a');
        floorGradient.addColorStop(1, '#2d2d2d');
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawTable();
        this.drawPaddle(this.paddles.left);
        this.drawPaddle(this.paddles.right);
        this.drawBall();
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}